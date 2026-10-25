"""Temporary in-TD integration test; restore hardware in all completion paths."""
from pathlib import Path
import json,time

root=Path(r'D:/web-UI/.runtime')
start=None
stage=None
samples=[]
original=None
phases=[('dry',1023,1023,1),('light',350,591,9.5),('release',1023,1023,5.8),('heavy',50,591,11.5),('dry_reset',1023,1023,6.8)]

def restore():
    c=parent()
    c.par.Testpressure=original['pressure'];c.par.Testsoil=original['soil'];c.par.Simulate=False
    c.op('serialDAT').par.active.expr='parent().par.Readserial and not parent().par.Simulate'
    me.par.framestart=False

def onFrameStart(frame):
    global start,stage,original
    c=parent();now=time.monotonic()
    try:
        if start is None:
            original={'pressure':float(c.par.Testpressure),'soil':float(c.par.Testsoil)}
            start=now;stage=0;c.par.Simulate=True;c.par.Testpressure=1023;c.par.Testsoil=1023
        elapsed=now-start;offset=0
        for index,(name,pressure,soil,duration) in enumerate(phases):
            if elapsed<offset+duration:
                if stage!=index:
                    stage=index;c.par.Testpressure=pressure;c.par.Testsoil=soil
                snapshot=dict(c.fetch('snapshot',{}));snapshot['phaseUnderTest']=name;snapshot['elapsedInPhase']=elapsed-offset
                samples.append(snapshot)
                # Save endpoint proof, including true original rendering.
                if duration-.25<elapsed-offset<duration-.1:
                    op('/project1/pressureScene/null1').save(str(root/f'validation-{name}-pressure.png'))
                    op('/project1/moistureScene/null1').save(str(root/f'validation-{name}-moisture.png'))
                return
            offset+=duration
        def phase(name):return [s for s in samples if s['phaseUnderTest']==name]
        light=phase('light');heavy=phase('heavy');release=phase('release');dry=phase('dry_reset')
        checks={
            'light_assembled':light[-1]['pressure']['progress']>.99,
            'heavy_assembled':heavy[-1]['pressure']['progress']>.99,
            'heavy_slower_than_light':next(s['elapsedInPhase'] for s in heavy if s['pressure']['progress']>.99)>next(s['elapsedInPhase'] for s in light if s['pressure']['progress']>.99),
            'release_holds_two_seconds':min(s['pressure']['progress'] for s in release if .6<s['elapsedInPhase']<1.8)>.99,
            'release_disperses':release[-1]['pressure']['progress']<.01,
            'wet_reveals':light[-1]['moisture']['progress']>.99,
            'dry_resets':dry[-1]['moisture']['progress']<.01,
            'original_scene_errors_absent':not op('/project1/pressureScene').errors(recurse=True) and not op('/project1/moistureScene').errors(recurse=True),
        }
        result={'checks':checks,'passed':all(checks.values()),'samples':samples,'usedSimulation':True,'hardwareModeRestored':True}
        restore();(root/'sensor-runtime-validation.json').write_text(json.dumps(result),encoding='utf-8')
    except Exception as error:
        if original is not None:restore()
        (root/'sensor-runtime-validation.json').write_text(json.dumps({'passed':False,'error':str(error),'hardwareModeRestored':True}),encoding='utf-8')
        me.par.framestart=False
