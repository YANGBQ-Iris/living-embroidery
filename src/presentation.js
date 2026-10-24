export class Presentation {
 constructor({skip}){
  this.skip=skip;this.scene=document.body.dataset.scene;this.seen=false;this.timer=null;this.waiting=null;this.mediaChecks=[];
  const nav=document.querySelector('#chrome nav');
  nav.insertAdjacentHTML('beforeend','<button id="help-toggle" aria-label="查看操作指引" title="操作指引">?</button><button id="fullscreen-toggle" aria-label="进入全屏展示" title="全屏展示" aria-pressed="false">⛶</button>');
  document.body.insertAdjacentHTML('beforeend',`<aside id="media-status" class="media-status" role="status" hidden><i aria-hidden="true"></i><span></span><button id="continue-garden" hidden>直接进入花园</button></aside><aside id="garden-guide" class="garden-guide" aria-label="初次游园指引" hidden><div><span id="guide-step"></span><button id="guide-close" aria-label="关闭操作指引">×</button></div><p id="guide-copy"></p><button id="guide-next"></button></aside>`);
  this.status=document.querySelector('#media-status');this.guide=document.querySelector('#garden-guide');
  document.querySelector('#continue-garden').onclick=()=>{this.hideStatus();this.skip();};
  document.querySelector('#guide-close').onclick=()=>this.dismiss();
  document.querySelector('#guide-next').onclick=()=>{if(this.step===0)this.showStep(1);else this.dismiss();};
  document.querySelector('#help-toggle').onclick=()=>this.showGuide();
  const full=document.querySelector('#fullscreen-toggle');
  full.hidden=!document.fullscreenEnabled||!document.documentElement.requestFullscreen;
  full.onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{this.notify('当前浏览器未能进入全屏，可使用 F11 展示。');}};
  document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;full.setAttribute('aria-pressed',String(active));full.setAttribute('aria-label',active?'退出全屏展示':'进入全屏展示');full.title=active?'退出全屏展示':'全屏展示';});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.fullscreenElement&&!document.querySelector('dialog[open]')){e.stopImmediatePropagation();document.exitFullscreen().catch(()=>{});}},true);
  this.watch(document.querySelector('#scene-video'),['intro','passage']);this.watch(document.querySelector('#ambient-video'),['pressure','moisture']);
 }
 notify(text){document.dispatchEvent(new CustomEvent('garden-notify',{detail:text}));}
 changeScene(scene){this.scene=scene;this.hideStatus();for(const check of this.mediaChecks)check();clearTimeout(this.timer);if(scene!=='garden'){this.guide.hidden=true;return;}let done=false;try{done=localStorage.getItem('symbiotic-guide-v1')==='done';}catch{}if(!done&&!this.seen)this.timer=setTimeout(()=>this.showGuide(),1100);}
 showGuide(){if(this.scene!=='garden'){this.notify('轻触植物预览，再次轻触进入；返回花园后可查看完整指引。');return;}this.seen=true;this.guide.hidden=false;this.showStep(0);}
 showStep(step){this.step=step;document.querySelector('#guide-step').textContent=step===0?'游园指引 · 1 / 2':'游园指引 · 2 / 2';document.querySelector('#guide-copy').textContent=step===0?'先轻触一株植物，看看它。再次轻触，就能走进它的互动世界。':'向下滑动空白天空，或点击“展开花笺”，收藏的作品、照片和日记就在这里。';document.querySelector('#guide-next').textContent=step===0?'下一步':'知道了，开始探索';clearTimeout(this.timer);this.timer=setTimeout(()=>this.dismiss(),18000);}
 dismiss(){clearTimeout(this.timer);this.guide.hidden=true;this.seen=true;try{localStorage.setItem('symbiotic-guide-v1','done');}catch{}}
 photosOpened(){if(!this.guide.hidden)this.dismiss();}
 hideStatus(){clearTimeout(this.waiting);clearTimeout(this.slow);this.status.hidden=true;document.body.dataset.mediaState='ready';}
 watch(video,scenes){
  const active=()=>scenes.includes(this.scene);
  const show=(failed=false)=>{if(!active())return;this.status.hidden=false;document.body.dataset.mediaState=failed?'fallback':'loading';const state=document.querySelector('.interlude-state');if(state)state.textContent=failed?'影片暂不可用 · 临时动态画面可用':'资源加载中 · 临时动态画面';this.status.classList.toggle('failed',failed);this.status.querySelector('span').textContent=failed?(scenes.includes('intro')?'画面暂时未能加载，可继续探索花园。':'背景暂时未能加载，仍可继续互动。'):scenes.includes('intro')?'画面正在轻轻展开…':'背景正在缓冲，仍可继续互动。';document.querySelector('#continue-garden').hidden=!scenes.includes('intro')||!failed;};
  const wait=()=>{if(!active())return;clearTimeout(this.waiting);clearTimeout(this.slow);this.waiting=setTimeout(()=>show(),550);this.slow=setTimeout(()=>{if(video.paused||video.readyState<3)show(true);},6500);};
  for(const event of ['waiting','stalled','loadstart'])video.addEventListener(event,wait);
  for(const event of ['playing','canplay','ended'])video.addEventListener(event,()=>{if(active())this.hideStatus();});
  video.addEventListener('error',()=>{if(active()){this.hideStatus();show(true);}});
  this.mediaChecks.push(()=>{if(!active())return;if(video.error)show(true);else if(video.readyState<3)wait();});
 }
}
