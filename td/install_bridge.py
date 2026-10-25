"""Run inside the existing TD project. Only add IO; preserve its visual network."""
from pathlib import Path
import json, shutil

site=Path(r'D:/web-UI')
root=op('/project1')
sources=[n for n in root.children if str(n.OPType)=='moviefileinTOP']
assert len(sources)==1, 'Expected exactly one existing image source'
source=sources[0]
assert root.op('null1') is not None
folder=site/'td'
folder.mkdir(exist_ok=True)
(site/'.runtime').mkdir(exist_ok=True)
original=Path(source.par.file.eval())
assert original.is_file(), str(original)
asset=site/'assets'/'td-original-plant.jpg'
if not asset.exists():
    shutil.copy2(original,asset)
# Store the exact original live graph, before adding the bridge.
if not (folder/'original-live.tox').exists():
    root.save(str(folder/'original-live.tox'))
source.par.file=str(asset).replace('\\','/')
bridge=root.op('webBridge')
if bridge is None:
    bridge=root.create(baseCOMP,'webBridge')
    bridge.nodeX=-800
    bridge.nodeY=-600
    page=bridge.appendCustomPage('Website')
    p=page.appendToggle('Enabled',label='Website Bridge Enabled')[0]
    p.default=True
    bridge.par.Enabled=True
    p=page.appendFloat('Fps',label='Website Preview FPS')[0]
    p.default=8;p.min=1;p.max=15;p.clampMin=True;p.clampMax=True
    bridge.par.Fps=8
    black=bridge.create(constantTOP,'blackBackgroundTOP')
    black.par.colorr=0;black.par.colorg=0;black.par.colorb=0;black.par.alpha=1
    black.par.resolutionw=1280;black.par.resolutionh=720
    black.nodeX=0;black.nodeY=150
    select=bridge.create(selectTOP,'originalEffectTOP')
    select.par.top='/project1/null1'
    select.nodeX=0;select.nodeY=0
    over=bridge.create(overTOP,'webOutputTOP')
    over.inputConnectors[0].connect(select)
    over.inputConnectors[1].connect(black)
    over.nodeX=250;over.nodeY=0
else:
    assert bridge.op('originalEffectTOP').par.top.eval()==root.op('null1') or str(bridge.op('originalEffectTOP').par.top)=='/project1/null1'
execute=bridge.op('webExecuteDAT') or bridge.create(executeDAT,'webExecuteDAT')
callback=(site/'td'/'web_frame_callbacks.py').read_text(encoding='utf-8').replace('__SOURCE_PATH__',source.path)
execute.text=callback
execute.par.frameend=True
execute.nodeX=500;execute.nodeY=0
project.save(str(folder/'plant-web.toe'))
(site/'.runtime'/'td-install.json').write_text(json.dumps({'source':source.path,'output':root.op('null1').path,'project':str(folder/'plant-web.toe'),'coreEffectUnchanged':True},indent=2),encoding='utf-8')
print('Website bridge installed; saved D:/web-UI/td/plant-web.toe')
