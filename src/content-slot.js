// Future media adapter. Loading an external video does not claim device connectivity.
export function createContentSlot(host,study,onState){
 let external=null,dispose=null;
 const clear=()=>{external?.pause?.();external?.remove();external=null;dispose?.();dispose=null;};
 return {
  showDemo(){clear();study.start();onState('当前为网页演示');},
  mountVideo(source){const url=new URL(source,location.href);if(!['http:','https:','blob:'].includes(url.protocol))throw Error('Unsupported media URL');clear();study.stop();external=document.createElement('video');external.className='external-content';external.src=url.href;external.controls=true;external.playsInline=true;external.muted=true;external.loop=true;external.addEventListener('error',()=>onState('外部媒体加载失败，可返回网页演示'));external.addEventListener('playing',()=>onState('外部媒体播放中 · 不代表设备已连接'));host.append(external);onState('正在加载外部媒体');external.play().catch(()=>onState('外部媒体待播放'));return external;},
  mountElement(element,{dispose:cleanup}={}){if(!(element instanceof HTMLElement))throw Error('Expected a trusted DOM element');clear();study.stop();external=element;dispose=cleanup;external.classList.add('external-content');host.append(external);onState('外部互动内容 · 设备状态由接入方确认');return external;},
  destroy(){clear();study.destroy();}
 };
}
