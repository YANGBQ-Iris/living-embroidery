export const PLANTS = [
 {id:'orchid',name:'蝴蝶兰',en:'A gentle touch',file:'plant-orchid.png',module:'pressure',hint:'触碰 · 压力互动'},
 {id:'white',name:'花间手记',en:'Little observations',file:'plant-white.png',module:'journal',hint:'写下 · 生长记录'},
 {id:'round',name:'一滴雨',en:'A little rain',file:'plant-round.png',module:'moisture',hint:'浇灌 · 土壤湿度互动'},
 {id:'violet',name:'紫叶的心事',en:'Quiet feelings',file:'plant-violet.png',module:'mood',hint:'看看 · 互动心情'}
];
export const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function selectPlant(selected,id){return {selected:id,enter:selected===id};}
export function classifyGesture(dx,dy,scene){if(Math.hypot(dx,dy)<90)return null;if(scene==='garden'&&dy>100&&Math.abs(dy)>Math.abs(dx)*1.25)return 'photos';if(scene!=='garden'&&scene!=='intro'&&scene!=='arrival'&&scene!=='passage'&&Math.abs(dx)>Math.abs(dy)*1.3&&Math.abs(dx)>110)return 'back';return null;}
export const localDate=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function plantMood(records,now=Date.now()){
 const water=records.filter(r=>r.kind==='art'&&r.mode==='moisture'&&now-r.timestamp<6*3600e3&&now>=r.timestamp);
 const last=records.filter(r=>['art','note','growth'].includes(r.kind)).sort((a,b)=>b.timestamp-a.timestamp)[0];
 if(water.length>=3)return {face:'☂',title:'让我歇一会儿吧',copy:'刚刚收到好多滴虚拟的雨。慢一点，也很好。',type:'rain'};
 if(last&&now-last.timestamp<24*3600e3)return {face:'✿',title:'今天，见到你真好',copy:'这一小段相伴，已经被好好收藏。',type:'happy'};
 return {face:'☘',title:'安静地，等你靠近',copy:'不必每天打卡，有空来坐一会儿就好。',type:'calm'};
}
export function validateRecord(r){if(!r||typeof r.id!=='string'||!Number.isFinite(r.timestamp)||!['art','growth','note'].includes(r.kind))throw Error('记录格式无效');if(r.image&&!/^data:image\/(png|jpeg|webp);base64,/.test(r.image))throw Error('图片格式无效');return r;}
