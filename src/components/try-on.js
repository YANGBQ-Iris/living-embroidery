import { openModal, toast } from './ui.js';
import { drawArtwork } from '../lib/artwork.js';
const portrait=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><defs><radialGradient id="bg"><stop stop-color="#6b705b"/><stop offset="1" stop-color="#1a261e"/></radialGradient><linearGradient id="skin" x2="1" y2="1"><stop stop-color="#bd9a7c"/><stop offset="1" stop-color="#8b6e55"/></linearGradient></defs><rect width="800" height="1000" fill="url(#bg)"/><circle cx="400" cy="345" r="240" fill="none" stroke="#a3a079" stroke-opacity=".25"/><path d="M128 1000 Q130 760 305 730 L310 626 490 626 495 730 Q670 760 685 1000" fill="#263c36"/><path d="M310 626 L310 735 Q400 840 490 735 L490 626" fill="url(#skin)"/><path d="M225 367 Q210 145 397 151 Q593 142 580 376 L567 597 Q530 724 400 739 Q270 717 234 591Z" fill="#17201c"/><ellipse cx="400" cy="446" rx="143" ry="205" fill="url(#skin)"/><path d="M250 418 Q216 180 393 173 Q574 167 565 427 Q488 359 423 247 Q373 347 250 418" fill="#17201c"/><path d="M302 449q34-13 57 0m83 0q29-13 57 0" fill="none" stroke="#463d31" stroke-width="5" stroke-linecap="round"/><path d="M399 463l-15 65 29 4" fill="none" stroke="#896b51" stroke-width="4"/><path d="M355 577q45 23 90-1" fill="none" stroke="#765047" stroke-width="6" stroke-linecap="round"/><path d="M200 1000L270 778 400 868 531 778 608 1000" fill="#304c43"/><path d="M270 778l130 90 131-90" fill="none" stroke="#a69d72" stroke-width="4"/><text x="400" y="955" text-anchor="middle" fill="#b5b59b" font-size="16" letter-spacing="5" font-family="sans-serif">原创人像示意 · 静态试戴</text></svg>`;
export function showTryOnPlaceholder(work) {
 openModal(`<p class="eyebrow">WEAR YOUR OWN GROWTH</p><h2>把一幅绣谱，戴在发间。</h2><div class="tryon-layout"><div class="tryon-stage"><img id="portrait" alt="原创静态人像试戴示意"><video id="camera" autoplay playsinline muted hidden></video><canvas id="hairpiece" width="700" height="700" role="img" aria-label="当前作品生成的数字发饰"></canvas></div><div class="tryon-controls"><p>由「<span id="tryon-name"></span>」生成。当前为静态人像试戴，可手动调整发饰位置。</p>${[['x','水平位置',58,10,90],['y','垂直位置',24,5,85],['size','发饰大小',35,12,65],['rotation','旋转角度',-20,-180,180]].map(([id,label,val,min,max])=>`<div class="slider-field"><label for="try-${id}">${label}<output id="out-${id}">${val}</output></label><input id="try-${id}" type="range" min="${min}" max="${max}" value="${val}"></div>`).join('')}<p class="detail-note">摄像头仅在本机预览，不上传或自动保存。当前为手动定位叠加，尚无人脸追踪；也可选择 OBS 虚拟摄像头。</p><button class="button secondary" id="start-camera">开启摄像头</button><button class="button secondary" id="stop-camera">停止并返回人像</button><button class="button primary full" id="save-tryon">保存当前试戴 PNG</button><p class="tryon-status" role="status">静态人像模式 · 无需摄像头</p></div></div>`,dialog=>{
  dialog.querySelector('#tryon-name').textContent=work.name;
  const image=dialog.querySelector('#portrait'),video=dialog.querySelector('#camera'),art=dialog.querySelector('#hairpiece'),stage=dialog.querySelector('.tryon-stage'),status=dialog.querySelector('.tryon-status');
  const portraitUrl=URL.createObjectURL(new Blob([portrait],{type:'image/svg+xml'}));image.src=portraitUrl;
  drawArtwork(art,work.params,{transparent:true});
  const values={x:58,y:24,size:35,rotation:-20};let stream=null,request=0,closed=false;
  function update(){Object.entries(values).forEach(([key,value])=>{stage.style.setProperty(`--${key}`,`${value}${key==='rotation'?'deg':'%'}`);dialog.querySelector(`#out-${key}`).textContent=value;});}
  Object.keys(values).forEach(key=>dialog.querySelector(`#try-${key}`).oninput=e=>{values[key]=Number(e.target.value);update();});update();
  function stop(){request++;stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;video.hidden=true;image.hidden=false;status.textContent='静态人像模式 · 摄像头已停止';}
  dialog.querySelector('#stop-camera').onclick=stop;
  dialog.querySelector('#start-camera').onclick=async()=>{
   stop();const ticket=++request;
   if(!navigator.mediaDevices?.getUserMedia){status.textContent='当前浏览器不支持摄像头，静态人像仍可试戴和导出。';return;}
   status.textContent='正在等待摄像头权限…';
   try{const next=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});if(closed||ticket!==request){next.getTracks().forEach(t=>t.stop());return;}stream=next;video.srcObject=stream;await video.play();if(closed||ticket!==request)return;video.hidden=false;image.hidden=true;status.textContent='摄像头已开启 · 请手动调整发饰位置';}
   catch{if(!closed&&ticket===request){stop();status.textContent='摄像头不可用或权限被拒绝，已保留静态人像试戴。';}}
  };
  dialog.addEventListener('close',()=>{closed=true;stop();URL.revokeObjectURL(portraitUrl);},{once:true});
  dialog.querySelector('#save-tryon').onclick=async()=>{
   try{
    const output=document.createElement('canvas');output.width=800;output.height=1000;const ctx=output.getContext('2d');
    const source=stream&&!video.hidden?video:image;
    const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
    if(!sw||!sh)throw Error('画面还未准备好，请稍后再保存。');
    const scale=Math.max(800/sw,1000/sh),width=sw*scale,height=sh*scale;
    ctx.save();if(source===video){ctx.translate(800,0);ctx.scale(-1,1);}ctx.drawImage(source,(800-width)/2,(1000-height)/2,width,height);ctx.restore();
    ctx.save();ctx.translate(values.x*8,values.y*10);ctx.rotate(values.rotation*Math.PI/180);const size=values.size*8;ctx.drawImage(art,-size/2,-size/2,size,size);ctx.restore();
    const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw Error('导出失败，请重试。');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`生命绣谱-试戴-${work.id.slice(0,8)}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('试戴图片已生成，已发起下载。');
   }catch(e){toast(e.message);}
  };
 });
}
