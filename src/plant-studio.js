const $=s=>document.querySelector(s);
export function installPlantStudio(){
 const stage=document.createElement('section');stage.id='plant-studio';stage.setAttribute('aria-label','植物光影实验室');stage.inert=true;
 stage.innerHTML=`<img id="studio-preview" src="assets/plant-orchid.png" alt="植物图片预览"><img id="studio-live" alt="TouchDesigner 实时视觉画面" hidden><div class="studio-header"><div class="studio-wordmark">Living Embroidery<small>生命绣谱 · 一叶一纹</small></div><button class="studio-back" id="studio-back">↑ 返回花园</button></div><p class="studio-caption">A LIVING PORTRAIT / 一片叶的光影与纹样</p><div class="studio-upload"><div class="eyebrow">YOUR PLANT, ANOTHER LIFE</div><h2>让一片叶，<br>展开生命的纹样。</h2><p>留下一张植物照片。褪去背景，<br>让枝叶成为生命绣谱的一部分。</p><label class="studio-upload-button">上传植物照片 <span>＋</span><input class="sr-only" id="studio-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="上传植物照片"></label><p id="studio-upload-status" role="status" aria-live="polite">支持拍摄或选择照片 · JPG / PNG / WebP</p></div><div id="studio-link-state" class="studio-link-state" role="status">植物预览 · 等待 TD 画面</div>`;
 document.body.append(stage);
 const canvas=document.createElement('canvas');canvas.id='studio-particles';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const enter=document.createElement('button');enter.className='studio-enter';enter.id='studio-enter';enter.innerHTML='向下滑动，走进一叶一纹的光影 <span>↓</span>';document.body.append(enter);
 const dialog=document.createElement('dialog');dialog.id='plant-preview-dialog';dialog.setAttribute('aria-labelledby','plant-preview-title');dialog.innerHTML=`<button id="plant-preview-close" aria-label="关闭植物预览">×</button><h2 class="plant-preview-heading" id="plant-preview-title">留住这一株植物</h2><p class="plant-preview-note">看看细叶、花瓣与盆栽是否完整。确认后，它会进入光影画面。</p><div class="plant-preview-pair"><figure><img id="plant-before" alt="上传的原始照片"><figcaption>原始照片</figcaption></figure><figure><img id="plant-after" alt="抠图后的黑色背景植物"><figcaption>去除背景 · 统一构图</figcaption></figure></div><div class="plant-preview-actions"><button id="plant-reselect">重新选图</button><button id="plant-confirm">使用这株植物 ↗</button></div>`;document.body.append(dialog);
 const ctx=canvas.getContext('2d'),motion=matchMedia('(prefers-reduced-motion: reduce)'),state={progress:0};let enabled=false,trigger,animation,raf,points=[],ambient=[],lastTime=0,pending=null,originalUrl=null,pollTimer,blobUrl,liveRequest=false,link=false;
 const pointer={x:.5,y:.5};let w=innerWidth,h=innerHeight;
 function reduced(){return motion.matches||document.body.classList.contains('low-motion');}
 function resize(){w=innerWidth;h=innerHeight;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);ambient=Array.from({length:innerWidth<650?90:180},()=>({x:Math.random(),y:Math.random(),seed:Math.random()*6.28,r:.4+Math.random()*1.1}));capture();}
 function capture(){
  const sample=document.createElement('canvas'),sw=150,sh=Math.max(1,Math.round(sw*h/w));sample.width=sw;sample.height=sh;const c=sample.getContext('2d');
  const sky=new Image();sky.src='assets/sky-background.jpg';if(sky.complete&&sky.naturalWidth){const scale=Math.max(sw/sky.naturalWidth,sh/sky.naturalHeight);c.drawImage(sky,(sw-sky.naturalWidth*scale)/2,(sh-sky.naturalHeight*scale)/2,sky.naturalWidth*scale,sky.naturalHeight*scale);}else{c.fillStyle='#9fbde8';c.fillRect(0,0,sw,sh);}
  for(const img of document.querySelectorAll('#plants img')){if(!img.complete||!img.naturalWidth)continue;const r=img.getBoundingClientRect(),scale=Math.min(r.width/img.naturalWidth,r.height/img.naturalHeight);c.drawImage(img,(r.left+(r.width-img.naturalWidth*scale)/2)/w*sw,(r.bottom-img.naturalHeight*scale)/h*sh,img.naturalWidth*scale/w*sw,img.naturalHeight*scale/h*sh);}
  const rgba=c.getImageData(0,0,sw,sh).data;points=[];for(let y=0;y<sh;y+=3)for(let x=0;x<sw;x+=3){const i=(y*sw+x)*4;points.push({x:x/sw,y:y/sh,color:`rgb(${rgba[i]},${rgba[i+1]},${rgba[i+2]})`,seed:Math.random()*6.28,travel:.25+Math.random()*.85});}
 }
 function render(now){raf=null;if(!enabled||document.hidden)return;const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;ctx.clearRect(0,0,w,h);const p=state.progress;
  if(!reduced()&&p>.015){
   if(p<.96){const spread=Math.max(0,(p-.08)/.86),alpha=Math.sin(Math.min(1,p/.92)*Math.PI)*.8;for(const q of points){const vx=(q.x-.5),vy=(q.y-.5);ctx.globalAlpha=alpha*(.45+.55*Math.sin(q.seed)**2);ctx.fillStyle=q.color;const x=q.x*w+vx*w*spread*q.travel+Math.sin(q.seed+spread*3)*spread*160,y=q.y*h+vy*h*spread*q.travel-spread*spread*h*.5;ctx.beginPath();ctx.arc(x,y,1+spread*2.2,0,6.28);ctx.fill();}}
   ctx.globalCompositeOperation='screen';for(const q of ambient){q.y-=dt*(.007+.003*Math.sin(q.seed));if(q.y<-.02)q.y=1.02;const x=q.x*w+Math.sin(now*.00015+q.seed)*18+(pointer.x-.5)*8,y=q.y*h;ctx.globalAlpha=Math.max(0,p-.2)*(.2+.35*(1+Math.sin(now*.0007+q.seed))*.5);ctx.fillStyle=q.seed>3.14?'#c5a4ed':'#96c7e8';ctx.beginPath();ctx.arc(x,y,q.r,0,6.28);ctx.fill();}ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  }
  raf=requestAnimationFrame(render);
 }
 function update(){const p=state.progress,active=p>.72;stage.classList.toggle('interactive',active);stage.inert=!active;$('#experience').inert=active;$('#chrome').inert=active;document.body.classList.toggle('studio-active',active);document.body.classList.toggle('studio-transitioning',p>.12);if($('#garden-guide'))$('#garden-guide').inert=p>.12;enter.inert=p>.15;canvas.style.visibility=p>.005?'visible':'hidden';}
 function setup(){
  if(!enabled)return;animation?.revert();trigger?.kill();
  if(!window.gsap||!window.ScrollTrigger){$('#studio-upload-status').textContent='动效资源未加载，请刷新页面';return;}
  gsap.registerPlugin(ScrollTrigger);const span=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
  animation=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{id:'plant-studio',start:0,end:span,scrub:reduced()?true:.65,invalidateOnRefresh:true,onScrubComplete:()=>{if(window.scrollY<=1)resetGarden();}}});
  animation.to(state,{progress:1,duration:1,onUpdate:update},0).to('#experience',{autoAlpha:0,duration:.62},.08).to('#chrome',{autoAlpha:0,duration:.35},.08).to(enter,{autoAlpha:0,y:-25,duration:.22},0).to(stage,{autoAlpha:1,duration:.66},.25).fromTo('.studio-header,.studio-caption,.studio-upload,.studio-link-state',{autoAlpha:0,y:reduced()?0:24},{autoAlpha:1,y:0,stagger:.025,duration:.28,immediateRender:false},.7);
  trigger=animation.scrollTrigger;ScrollTrigger.refresh();
 }
 function sync(){const next=document.body.dataset.scene==='garden';if(enabled===next)return;enabled=next;document.documentElement.classList.toggle('studio-scroll-enabled',enabled);document.body.classList.toggle('studio-scroll-enabled',enabled);
  if(enabled){resize();setup();if(!raf)raf=requestAnimationFrame(render);poll();}else{returnTween?.kill();returnTween=null;animation?.revert();trigger?.kill();animation=null;trigger=null;state.progress=0;scrollTo(0,0);stage.inert=true;$('#experience').inert=false;$('#chrome').inert=false;document.body.classList.remove('studio-active','studio-transitioning');window.gsap?.set(stage,{autoAlpha:0});ctx.clearRect(0,0,w,h);cancelAnimationFrame(raf);raf=null;clearTimeout(pollTimer);}
 }
 // Returning is a complete transition: settle ScrollTrigger and remove every studio layer.
 let returnTween=null;
 function resetGarden(){
  trigger?.getTween()?.pause();animation?.totalProgress(0,true);state.progress=0;update();
  window.gsap?.set('#experience,#chrome',{autoAlpha:1});
  window.gsap?.set(stage,{autoAlpha:0});window.gsap?.set(enter,{autoAlpha:1,y:0});
  canvas.style.visibility='hidden';ctx.clearRect(0,0,w,h);
 }
 function returnToGarden(){
  returnTween?.kill();const position={y:window.scrollY};
  returnTween=gsap.to(position,{y:0,duration:reduced()?0:.85,ease:'power2.inOut',
   onUpdate:()=>window.scrollTo({top:position.y,behavior:'instant'}),
   onComplete:()=>{window.scrollTo({top:0,behavior:'instant'});ScrollTrigger.update();resetGarden();returnTween=null;}});
 }
 const toStudio=()=>{returnTween?.kill();returnTween=null;window.scrollTo({top:document.documentElement.scrollHeight-innerHeight,behavior:reduced()?'instant':'smooth'});};
 enter.onclick=toStudio;$('#studio-back').onclick=returnToGarden;
 addEventListener('scroll',()=>{if(enabled&&window.scrollY<=1)resetGarden();},{passive:true});
 const interruptReturn=()=>{returnTween?.kill();returnTween=null;};
 addEventListener('wheel',interruptReturn,{passive:true});addEventListener('touchstart',interruptReturn,{passive:true});
 addEventListener('keydown',e=>{if(enabled&&state.progress>.72&&e.key==='Escape'&&!document.querySelector('dialog[open]')){e.stopImmediatePropagation();$('#studio-back').click();}},true);
 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['data-scene']});
 let previousReduced=reduced();new MutationObserver(()=>{const next=reduced();if(next!==previousReduced){previousReduced=next;if(enabled)setup();}}).observe(document.body,{attributes:true,attributeFilter:['class']});
 // Only rebuild for an actual motion preference change, not studio-active toggles.
 addEventListener('resize',()=>{resize();trigger?.refresh();});motion.addEventListener('change',setup);
 addEventListener('pointermove',e=>{pointer.x=e.clientX/w;pointer.y=e.clientY/h;},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=null;}else if(enabled){trigger?.update();if(window.scrollY<=1)resetGarden();if(!raf)raf=requestAnimationFrame(render);}});
 async function request(url,options){const response=await fetch(url,options);const data=await response.json();if(!response.ok)throw Error(data.error||'处理失败');return data;}
 function status(text){$('#studio-upload-status').textContent=text;}
 $('#studio-file').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>12*1024*1024){status('请使用小于 12 MB 的图片');e.target.value='';return;}const input=e.target;input.disabled=true;status('正在抠出植物，保留枝叶的轮廓…');try{pending=await request('/api/plants',{method:'POST',headers:{'Content-Type':file.type},body:file});if(originalUrl)URL.revokeObjectURL(originalUrl);originalUrl=URL.createObjectURL(file);$('#plant-before').src=originalUrl;$('#plant-after').src=pending.preview;dialog.showModal();status('抠图完成，请预览并确认');}catch(error){status(error.message);}finally{input.disabled=false;input.value='';}};
 $('#plant-preview-close').onclick=()=>dialog.close();$('#plant-reselect').onclick=()=>{dialog.close();$('#studio-file').click();};
 $('#plant-confirm').onclick=async()=>{if(!pending)return;const button=$('#plant-confirm');button.disabled=true;try{const current=await request('/api/plant-confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:pending.id})});$('#studio-preview').src=current.url;dialog.close();status('已确认植物，正在等待 TD 载入…');await poll();}catch(error){status(error.message);}finally{button.disabled=false;}};
 async function liveFrame(){if(liveRequest||!link||!enabled||state.progress<.2||document.hidden)return;liveRequest=true;try{const response=await fetch('/api/td-frame?t='+Date.now());if(!response.ok)throw Error();const next=URL.createObjectURL(await response.blob()),img=$('#studio-live');await new Promise((resolve,reject)=>{const test=new Image();test.onload=resolve;test.onerror=reject;test.src=next;});img.src=next;img.hidden=false;$('#studio-preview').hidden=true;if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=next;}catch{$('#studio-live').hidden=true;$('#studio-preview').hidden=false;}finally{liveRequest=false;}}
 async function poll(){clearTimeout(pollTimer);if(!enabled)return;try{const data=await request('/api/studio-status');link=data.td.connected&&!data.td.error;$('#studio-link-state').classList.toggle('connected',link);$('#studio-link-state').textContent=link?'TD 实际画面 · 网页粒子层':'植物图片预览 · TD 未连接';if(!link){$('#studio-live').hidden=true;$('#studio-preview').hidden=false;}if(pending&&data.td.plantId===pending.id&&!data.td.error)status('这株植物已进入 TD 光影画面');if(data.td.error)status('画面暂时未能更新，已保留植物预览，请稍后重试。');}catch{link=false;$('#studio-link-state').textContent='本地服务未连接，请重新启动网站';}finally{if(enabled)pollTimer=setTimeout(poll,1800);}}
 request('/api/plant-current').then(current=>{if(current)$('#studio-preview').src=current.url;}).catch(()=>{});
 setInterval(liveFrame,160);resize();sync();
}
