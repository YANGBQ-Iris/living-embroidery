"""Embedded TD Execute DAT. Local folder bridge; no network in the render loop."""
from pathlib import Path
import json, time, os

runtime=Path(r'D:/web-UI/.runtime')
last_check=0.0
last_export=0.0
last_status=0.0
current_id=None
save_status=None
error=''

def onFrameEnd(frame):
    global last_check,last_export,last_status,current_id,save_status,error
    if not parent().par.Enabled:
        return
    now=time.monotonic()
    try:
        error=''
        source=op('__SOURCE_PATH__')
        if now-last_check>.3:
            last_check=now
            current_file=runtime/'current.json'
            if current_file.exists():
                current=json.loads(current_file.read_text(encoding='utf-8'))
                if current['id']!=current_id:
                    image=Path(current['file']).resolve()
                    assert image.parent==(runtime/'plants').resolve() and image.suffix=='.png'
                    assert image.is_file()
                    source.par.file=str(image).replace('\\','/')
                    source.par.reloadpulse.pulse()
                    for feedback in op('/project1').findChildren(type=feedbackTOP):
                        feedback.par.resetpulse.pulse()
                    current_id=current['id']
                    error=''
        if save_status is not None and save_status.isCompleted():
            try:
                os.replace(runtime/'td-pending.jpg',runtime/'td-frame.jpg')
            except PermissionError:
                return  # A Windows reader can briefly hold the previous JPEG open.
            save_status=None
        # shortcut: local JPEG preview at 8 fps; use WebRTC for a public/high-frame-rate deployment.
        if save_status is None and now-last_export>=1/max(1,float(parent().par.Fps)):
            last_export=now
            save_status=op('webOutputTOP').save(str(runtime/'td-pending.jpg'),asynchronous=True,quality=.87)
        if now-last_status>.5:
            last_status=now
            status={'timestamp':int(time.time()*1000),'plantId':current_id,'source':source.path,'output':'/project1/null1','error':error,'fps':float(parent().par.Fps)}
            (runtime/'td-status.tmp.json').write_text(json.dumps(status),encoding='utf-8')
            try:
                os.replace(runtime/'td-status.tmp.json',runtime/'td-status.json')
            except PermissionError:
                pass  # Retry next tick; keep the previous complete heartbeat.
    except Exception as exc:
        error=str(exc)
        if now-last_status>1:
            last_status=now
            (runtime/'td-status.json').write_text(json.dumps({'timestamp':int(time.time()*1000),'plantId':current_id,'error':error}),encoding='utf-8')
