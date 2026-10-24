// A bounded canvas trail: only runs while marks are alive, never over controls.
export class WelcomeGarden {
 constructor(host){
  this.host=host;this.active=true;this.marks=[];this.pointer=null;this.lastPoint=null;
  this.canvas=document.createElement('canvas');this.canvas.className='welcome-growth';this.canvas.setAttribute('aria-hidden','true');host.prepend(this.canvas);this.ctx=this.canvas.getContext('2d');
  this.resize=()=>{const r=host.getBoundingClientRect();this.width=r.width;this.height=r.height;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(d,0,0,d,0,0);};
  window.addEventListener('resize',this.resize);this.resize();
  host.addEventListener('pointerdown',e=>{if(!this.active||e.button!==0||e.target.closest('button,a,dialog'))return;this.pointer=e.pointerId;this.lastPoint=null;host.setPointerCapture(e.pointerId);this.plant(e);});
  host.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer&&e.buttons)this.plant(e);});
  const release=()=>{this.pointer=null;this.lastPoint=null;};host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);host.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();this.marks=[];}});
 }
 setActive(active){this.active=active;if(!active){this.pointer=null;this.marks=[];cancelAnimationFrame(this.raf);this.raf=null;this.ctx.clearRect(0,0,this.width,this.height);}else this.resize();}
 plant(e){
  if(document.elementFromPoint(e.clientX,e.clientY)?.closest('button,a,dialog'))return;
  const r=this.host.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,now=performance.now();
  if(this.lastPoint&&(Math.hypot(x-this.lastPoint.x,y-this.lastPoint.y)<28||now-this.lastPoint.time<28))return;
  this.lastPoint={x,y,time:now};this.marks.push({x:x+(Math.random()-.5)*16,y:y+(Math.random()-.5)*24,born:now,seed:Math.random()*6.28,size:15+Math.random()*23});this.marks=this.marks.slice(-95);
  if(!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
 draw(now){
  this.raf=null;if(!this.active)return;const c=this.ctx;c.clearRect(0,0,this.width,this.height);this.marks=this.marks.filter(p=>now-p.born<5600);
  for(const p of this.marks){const age=(now-p.born)/1000,grow=Math.max(0,Math.min(1,age/0.75)),fade=Math.max(0,Math.min(1,(5.6-age)/2.1));c.save();c.translate(p.x,p.y);c.globalAlpha=fade*grow;
   // Overhead rosette: every blade, leaf and petal grows out from this centre.
   const unfurl=1-Math.pow(1-grow,3),turn=p.seed+Math.sin(age*.45+p.seed)*.035;
   c.lineCap='round';
   for(let i=0;i<9;i++){
    const a=turn+i*Math.PI*2/9+Math.sin(p.seed*3+i)*.18;
    const reach=p.size*(.68+.2*Math.sin(i*2.7+p.seed))*unfurl;
    c.save();c.rotate(a);c.beginPath();c.moveTo(1,0);c.bezierCurveTo(reach*.35,-3.5,reach*.8,-6,reach,0);c.bezierCurveTo(reach*.7,4,reach*.3,3,1,0);c.fillStyle=i%2?'#8dbba46b':'#b1ce9b61';c.fill();
    c.beginPath();c.moveTo(2,0);c.quadraticCurveTo(reach*.55,-1,reach,0);c.strokeStyle='#b7d5b077';c.lineWidth=.65;c.stroke();c.restore();
   }
   for(let i=0;i<7;i++){
    const a=turn+(i+.45)*Math.PI*2/7,reach=p.size*(.9+.16*Math.sin(i+p.seed))*unfurl;
    c.save();c.rotate(a);c.beginPath();c.moveTo(1,0);c.quadraticCurveTo(reach*.6,Math.sin(i+p.seed)*6,reach,2);c.strokeStyle='#a5c6ac80';c.lineWidth=.8;c.stroke();c.restore();
   }
   const count=5+Math.floor(p.seed%2);
   for(let i=0;i<count;i++){
    const a=turn+i*Math.PI*2/count,reach=p.size*(.47+.06*Math.sin(p.seed+i))*unfurl;
    c.save();c.rotate(a);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(reach*.25,-reach*.48,reach*1.12,-reach*.48,reach,0);c.bezierCurveTo(reach*1.12,reach*.48,reach*.25,reach*.48,0,0);c.fillStyle=['#b99bdda8','#d4b7e5b8','#a98acead'][i%3];c.fill();
    c.beginPath();c.moveTo(2,0);c.lineTo(reach*.75,0);c.strokeStyle='#e7d5f23b';c.lineWidth=.6;c.stroke();c.restore();
   }
   c.beginPath();c.arc(0,0,1.8*unfurl,0,Math.PI*2);c.fillStyle='#e4d9c5bc';c.fill();
   // A loose halo of tiny fragments drifts radially, with no upward bias.
   for(let i=0;i<9;i++){
    const a=turn+i*2.399,reach=p.size*(.85+.28*Math.sin(i*3+p.seed))*unfurl+Math.max(0,age-.7)*(1.8+i%3);
    c.save();c.translate(Math.cos(a)*reach,Math.sin(a)*reach);c.rotate(a+age*.12);c.globalAlpha=fade*grow*(i%3===0?.68:.85);c.fillStyle=i%2?'#c9afe8a0':'#b5cfaf88';
    c.beginPath();if(i%3===0)c.ellipse(0,0,2.3,1.1,0,0,Math.PI*2);else c.arc(0,0,.6+i%2*.3,0,Math.PI*2);c.fill();c.restore();
   }
   c.restore();
  }
  if(this.marks.length)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
}

