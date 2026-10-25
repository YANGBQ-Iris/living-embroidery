from pathlib import Path
import json,shutil

site=Path(r'D:/web-UI');code=site/'td'/'sensors';root=op('/project1')
assert not root.op('sensorHub'),'Sensor hub already installed'
# The current user-edited black-background picture effect stays at the root.
root.save(str(site/'.runtime'/'before-sensors-install.tox'))

def make(parent,kind,name,x,y):
    n=parent.create(kind,name);n.nodeX=x;n.nodeY=y;return n

c=make(root,baseCOMP,'sensorHub',-700,-1000)
page=c.appendCustomPage('Sensors')
def custom(kind,name,label,value,low=None,high=None):
    p=getattr(page,'append'+kind)(name,label=label)[0];p.default=value
    if low is not None:p.min=low;p.normMin=low;p.clampMin=True
    if high is not None:p.max=high;p.normMax=high;p.clampMax=True
    getattr(c.par,name).val=value
for spec in [('Str','Port','Arduino Port','COM15'),('Toggle','Readserial','Read Arduino',True),('Toggle','Simulate','Offline Test',False),('Float','Testpressure','Test Pressure ADC',1023,0,1023),('Float','Testsoil','Test Soil ADC',1023,0,1023),('Float','Dry','Dry Soil ADC',1023,1,1023),('Float','Wet','Wet Soil ADC',591,0,1022),('Float','Lightseconds','Light Touch Assembly Seconds',8,6,30),('Float','Heavyseconds','Heavy Press Assembly Seconds',10,6,60),('Float','Releasedelay','Release Wait Seconds',2,0,10),('Float','Disperseseconds','Pressure Dispersal Seconds',3,.1,30),('Float','Riseseconds','Moisture Reveal Seconds',6,.1,30),('Float','Fallseconds','Moisture Dissolve Seconds',6,.1,30),('Float','Presson','Touch Starts Below',800,0,899),('Float','Pressoff','Release Above',900,900,1023),('Float','Timeout','Serial Timeout Seconds',1.5,.5,10),('Float','Fps','Website Preview FPS',8,1,15)]:custom(*spec)
for name,file in [('pressureLogicDAT','pressure_logic.py'),('moistureLogicDAT','moisture_logic.py'),('serialCallbacksDAT','serial_callbacks.py')]:
    n=make(c,textDAT,name,0,-200-100*len(c.children));n.text=(code/file).read_text(encoding='utf-8')
serial=make(c,serialDAT,'serialDAT',0,200);serial.par.active=False;serial.par.port.expr='parent().par.Port';serial.par.baudrate=115200;serial.par.format='perline';serial.par.maxlines=5;serial.par.callbacks=c.op('serialCallbacksDAT').path
make(c,textDAT,'latestPacketDAT',200,200).text='Waiting for soil_raw and pressure_raw'
for prefix,channel,expression,width,y in [('pressure','pressure_raw',"float(parent().par.Testpressure) if parent().par.Simulate else parent().fetch('rawPressure',1023.0)",.18,200),('humidity','soil_raw',"float(parent().par.Testsoil) if parent().par.Simulate else parent().fetch('rawSoil',1023.0)",.3,0)]:
    raw=make(c,constantCHOP,prefix+'RawCHOP',420,y);raw.par.name0=channel;raw.par.value0.expr=expression
    filt=make(c,filterCHOP,prefix+'FilterCHOP',650,y);filt.inputConnectors[0].connect(raw);filt.par.type='halfgauss';filt.par.width=width;filt.par.widthunit='seconds';filt.par.timeslice=True
status=make(c,constantCHOP,'statusCHOP',900,200)
for i,name in enumerate(('k1','wetness','wetness_target','pressure_raw','soil_raw','touching','link_ok','assembly_seconds')):
    getattr(status.par,'name'+str(i)).val=name;getattr(status.par,'value'+str(i)).val=0
tick=make(c,executeDAT,'sensorFrameDAT',900,-100);tick.text=(code/'frame_callbacks.py').read_text(encoding='utf-8');tick.par.start=True;tick.par.framestart=True;tick.module.onStart()

# Import actual existing networks, not recreated visual effects.
pressure=root.loadTox(str(code/'pressure-original.tox'));pressure.name='pressureScene';pressure.nodeX=-1000;pressure.nodeY=-1000
pressure.op('pointfilein1').par.file=str(site/'assets'/'pressure-orchid.ply').replace('\\','/')
select=make(pressure,selectCHOP,'hardwareAssemblyCHOP',-100,1400);select.par.chop=c.op('statusCHOP').path;select.par.channames='k1';pressure.op('null2').inputConnectors[0].connect(select)
pressure.par.top=pressure.op('null1').path
soil=root.loadTox(str(code/'moisture-original.tox'));soil.name='moistureScene';soil.nodeX=-1400;soil.nodeY=-1000
source=soil.op('bloom_purple_flowers_SBV_323424455_4K1');assert source is not None
source.par.file=str(site/'assets'/'moisture-original.jpg').replace('\\','/')
blank=make(soil,constantTOP,'soilBlankTOP',-1800,0);blank.par.colorr=1;blank.par.colorg=1;blank.par.colorb=1;blank.par.alpha=1;blank.par.outputresolution='custom';blank.par.resolutionw=1280;blank.par.resolutionh=720
paper=make(soil,overTOP,'soilOriginalOnPaperTOP',-1600,225);paper.inputConnectors[0].connect(soil.op('comp2'));paper.inputConnectors[1].connect(blank)
display=make(soil,crossTOP,'soilDisplayTOP',-1400,225);display.inputConnectors[0].connect(blank);display.inputConnectors[1].connect(paper);display.par.cross.expr="op('/project1/sensorHub/statusCHOP')['wetness'][0]";soil.op('null1').inputConnectors[0].connect(display);soil.par.top=soil.op('null1').path
export=make(c,executeDAT,'sensorExportDAT',1100,-100);export.text=(code/'export_callbacks.py').read_text(encoding='utf-8');export.par.frameend=True
serial.par.active.expr='parent().par.Readserial and not parent().par.Simulate'
project.save(str(site/'td'/'plant-sensors.toe'))
(site/'.runtime'/'sensor-install.json').write_text(json.dumps({'project':str(site/'td'/'plant-sensors.toe'),'hub':c.path,'pressure':pressure.path,'moisture':soil.path,'blackEffectPreserved':True},indent=2),encoding='utf-8')
print('Original pressure and moisture effects connected to one Arduino hub')
