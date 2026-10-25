from pathlib import Path
import json,time,os

runtime=Path(r'D:/web-UI/.runtime')
pending={}
frames={}
last_export=0.0
last_status=0.0

def onFrameEnd(frame):
    global last_export,last_status
    c=parent();now=time.monotonic()
    for mode,save in list(pending.items()):
        if save.isCompleted():
            try:
                os.replace(runtime/f'{mode}-pending.jpg',runtime/f'sensor-{mode}.jpg')
            except PermissionError:
                continue
            frames[mode]={'timestamp':int(time.time()*1000)}
            del pending[mode]
    # Reuse the original TD effects. Only this preview transport is rate-limited.
    if now-last_export>=1/float(c.par.Fps):
        last_export=now
        for mode,output in (('pressure','pressureScene/null1'),('moisture','moistureScene/null1')):
            if mode not in pending:
                pending[mode]=op('/project1/'+output).save(str(runtime/f'{mode}-pending.jpg'),asynchronous=True,quality=.87)
    if now-last_status>=.15:
        last_status=now
        data=dict(c.fetch('snapshot',{}));data['frames']=dict(frames)
        data['tdErrors']=op('/project1/pressureScene').errors(recurse=True)+op('/project1/moistureScene').errors(recurse=True)
        data['serialError']=c.op('serialDAT').errors()
        temp=runtime/'sensors.tmp.json';temp.write_text(json.dumps(data),encoding='utf-8')
        try:
            os.replace(temp,runtime/'sensors.json')
        except PermissionError:
            pass
