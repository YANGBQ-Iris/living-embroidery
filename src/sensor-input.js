const $=s=>document.querySelector(s);
export function connectHardware({type,slot,study}){
 const pressure=type==='pressure',host=$('#prototype-frame'),controls=$('.sensor-controls'),generate=$('[data-action="generate"]'),demo=$('[data-action="demo"]');
 const canvas=document.createElement('canvas');canvas.className='sensor-live-canvas';canvas.setAttribute('role','img');canvas.setAttribute('aria-label',pressure?'压力传感器控制的 TD 植物聚合画面':'土壤湿度控制的 TD 纹样粒子画面');canvas.width=1280;canvas.height=720;canvas.style.background=pressure?'#000':'#fff';
 const context=canvas.getContext('2d');let mode='hardware',destroyed=false,timer,data=null,frameAt=0,frozen=false,polling=false;
 const controller=new AbortController();
 const hardwareButton=document.createElement('button');hardwareButton.className='secondary';hardwareButton.dataset.action='sensor-live';hardwareButton.textContent='使用真实传感器';hardwareButton.hidden=true;demo.after(hardwareButton);
 const readings=document.createElement('details');readings.className='hardware-readings';readings.innerHTML='<summary>传感器读数</summary><dl><div><dt>压力原始值</dt><dd data-pressure-raw>—</dd></div><div><dt>土壤原始值</dt><dd data-soil-raw>—</dd></div><div><dt data-level-label></dt><dd data-level>—</dd></div></dl>';controls.append(readings);readings.querySelector('[data-level-label]').textContent=pressure?'植物聚合程度':'湿润程度（相对）';
 const intro=document.querySelector('.module-title p'),originalIntro=intro?.textContent;
 const note=controls.querySelector('.small-print'),feedback=$('#interaction-feedback'),status=$('#demo-status'),manual=$('#intensity').closest('label'),hint=host.parentElement.querySelector('.subtle-note');
 const rules=pressure?'轻触约 8 秒聚合，重按约 10 秒。松手保留 2 秒，再逐渐散开。':'干燥时纹样静止；湿润后粒子开始运动，纹样上下跳跃。';
 controls.querySelector('.sensor-identity span').innerHTML=pressure?'蝴蝶兰<br>按压 → 植物聚合':'圆叶<br>湿度 → 纹样苏醒';
 function ready(){return mode==='hardware'&&data?.tdConnected&&(data.connected||data.source==='simulation')&&Date.now()-frameAt<2500&&!frozen;}
 function update(){if(mode!=='hardware'||destroyed||frozen)return;
  const simulated=data?.source==='simulation'&&data.tdConnected,connected=Boolean(data?.connected),td=Boolean(data?.tdConnected);
  status.textContent=connected?'真实传感器已连接 · TD 实际画面':simulated?'离线模拟传感器 · TD 实际画面':td?'等待 Arduino 传感器连接':'等待 TD 传感器工程';status.classList.toggle('active',connected);status.dataset.source=connected?'serial':simulated?'simulation':'disconnected';
  readings.querySelector('[data-pressure-raw]').textContent=(connected||simulated)&&data?.pressure?Math.round(data.pressure.raw):'—';readings.querySelector('[data-soil-raw]').textContent=(connected||simulated)&&data?.moisture?Math.round(data.moisture.raw):'—';
  const value=pressure?data?.pressure?.progress:data?.moisture?.progress;readings.querySelector('[data-level]').textContent=(connected||simulated)&&Number.isFinite(value)?Math.round(value*100)+'%':'—';
  if(!td)feedback.textContent='请打开网站配套 TD 传感器工程，并保持播放。';
  else if(!connected&&!simulated)feedback.textContent='尚未收到有效 Arduino 数据。请检查 USB 连接。';
  else if(pressure){const p=data.pressure;feedback.textContent=({scattered:'植物正在等待你的触碰。',assembling:`正在聚合 · ${Math.round(p.progress*100)}% · 当前完整聚合约 ${p.assemblySeconds.toFixed(1)} 秒`,assembled:'植物已聚合，保持触碰即可保留。',holding:'已松手，停留 2 秒后开始散开。',dispersing:`植物正在散开 · ${Math.round(p.progress*100)}%`})[p.phase]||rules;}
  else feedback.textContent=data.moisture.active?`纹样已苏醒 · 湿润程度 ${Math.round(data.moisture.progress*100)}% · 粒子运动与上下跳跃`:'土壤较干，纹样静止，等待下一次浇水。';
  if(generate.dataset.action==='generate')generate.disabled=!ready();
  note.textContent=simulated?'当前为 TD 离线测试数值，尚未代表真实硬件读数。':connected?'画面来自 TD，使用 Arduino 实时读数；收藏时保存当前实际画面。':'连接恢复后会自动接入。网页演示可单独切换，不会被标记为真实传感器。';
 }
 async function fetchFrame(){
  const response=await fetch(`/api/sensor-frame?scene=${type}&t=${Date.now()}`,{signal:controller.signal});if(!response.ok)throw Error('frame');
  const url=URL.createObjectURL(await response.blob());try{const image=new Image();image.src=url;await image.decode();if(destroyed||mode!=='hardware'||frozen)return;canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;context.drawImage(image,0,0);frameAt=Date.now();canvas.dataset.frameReceived='true';}finally{URL.revokeObjectURL(url);}
 }
 async function poll(){if(destroyed||polling)return;polling=true;try{const response=await fetch('/api/sensors',{signal:controller.signal});if(!response.ok)throw Error('status');data=await response.json();if(mode==='hardware'&&!frozen&&data.tdConnected&&!document.hidden)await fetchFrame().catch(()=>{});update();}catch{if(!destroyed){data=null;update();}}finally{polling=false;if(!destroyed)timer=setTimeout(poll,200);}}
 function useHardware(){study.canvas.hidden=true;study.canvas.inert=true;if(intro)intro.textContent=pressure?'轻触植物，让散开的光影慢慢聚拢':'湿润土壤，唤醒跳跃的纹样';mode='hardware';frozen=false;slot.mountElement(canvas);manual.hidden=true;readings.hidden=false;hardwareButton.hidden=true;demo.textContent='切换为网页演示';hint.textContent=rules;generate.disabled=true;update();}
 function useDemo(){study.canvas.hidden=false;study.canvas.inert=false;if(intro)intro.textContent=originalIntro;mode='demo';frozen=false;manual.hidden=false;readings.hidden=true;hardwareButton.hidden=false;demo.textContent=pressure?'试一次轻触':'浇下一滴雨';hint.textContent=pressure?'当前为鼠标与触屏演示，未使用传感器控制。':'当前为虚拟浇水演示，未使用土壤湿度控制。';note.textContent='网页演示作品会单独标记，不计作真实传感器画面。';status.dataset.source='demo';generate.disabled=false;slot.showDemo();}
 async function snapshot(label){if(!ready())throw Error('真实画面尚未准备好，请等待传感器和 TD 连接');
  const out=document.createElement('canvas');out.width=1600;out.height=1120;const c=out.getContext('2d');c.fillStyle='#fcf9f3';c.fillRect(0,0,1600,1120);const scale=Math.min(1490/canvas.width,931/canvas.height),width=canvas.width*scale,height=canvas.height*scale;c.drawImage(canvas,55+(1490-width)/2,55+(931-height)/2,width,height);c.fillStyle='#52615e';c.font='30px Georgia';c.fillText('Living Embroidery · '+label,60,1040);c.font='18px sans-serif';c.textAlign='right';c.fillText((data.source==='simulation'?'TD 离线模拟':'Arduino 实时互动')+' · '+new Date().toLocaleString('zh-CN'),1540,1080);return out.toDataURL('image/jpeg',.9);}
 useHardware();poll();
 return {get mode(){return mode;},get recordSource(){return data?.source==='simulation'?'simulation':'sensor';},useHardware,useDemo,snapshot,freeze(){frozen=true;},destroy(){destroyed=true;clearTimeout(timer);controller.abort();}};
}
