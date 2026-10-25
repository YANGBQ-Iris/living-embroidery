import {embroiderySprite} from './embroidery.js';
// A bounded canvas trail: only runs while marks are alive, never over controls.
export class WelcomeGarden {
 constructor(host){
  this.sprites=[embroiderySprite(),embroiderySprite("four"),embroiderySprite("silver")];this.host=host;this.active=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.ambient=Array.from({length:innerWidth<600?40:68},(_,i)=>({x:Math.random(),y:Math.random(),phase:Math.random()*6.28,speed:.006+Math.random()*.008,size:.6+Math.random()*1.8,petal:i%3===0}));this.marks=[];this.pointer=null;this.lastPoint=null;
  this.canvas=document.createElement('canvas');this.canvas.className='welcome-growth';this.canvas.setAttribute('aria-hidden','true');host.prepend(this.canvas);this.ctx=this.canvas.getContext('2d');
  this.resize=()=>{const r=host.getBoundingClientRect();this.width=r.width;this.height=r.height;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(d,0,0,d,0,0);};
  window.addEventListener('resize',this.resize);this.resize();
  host.addEventListener('pointerdown',e=>{if(!this.active||e.button!==0||e.target.closest('button,a,dialog'))return;this.pointer=e.pointerId;this.lastPoint=null;host.setPointerCapture(e.pointerId);this.plant(e);});
  host.addEventListener('pointermove',e=>{if(e.pointerId===this.pointer&&e.buttons)this.plant(e);});
  const release=()=>{this.pointer=null;this.lastPoint=null;};host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);host.addEventListener('lostpointercapture',release);window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();this.marks=[];cancelAnimationFrame(this.raf);this.raf=null;}else if(this.active&&!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));});
  this.reduced.addEventListener('change',()=>{if(this.active&&!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));});
  if(!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
 setActive(active){this.active=active;if(!active){this.pointer=null;this.marks=[];cancelAnimationFrame(this.raf);this.raf=null;this.ctx.clearRect(0,0,this.width,this.height);}else{this.resize();if(!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));}}
 plant(e){
  if(document.elementFromPoint(e.clientX,e.clientY)?.closest('button,a,dialog'))return;
  const r=this.host.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,now=performance.now();
  if(this.lastPoint&&(Math.hypot(x-this.lastPoint.x,y-this.lastPoint.y)<28||now-this.lastPoint.time<28))return;
  this.lastPoint={x,y,time:now};this.marks.push({x:x+(Math.random()-.5)*16,y:y+(Math.random()-.5)*24,born:now,seed:Math.random()*6.28,size:15+Math.random()*23});this.marks=this.marks.slice(-95);
  if(!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
 drawAmbient(c,now){
  const still=this.reduced.matches||document.body.classList.contains('low-motion'),t=still?0:now*.001;c.save();
  for(const p of this.ambient){const x=(p.x+Math.sin(t*.11+p.phase)*.028)*this.width,y=((p.y+t*p.speed)%1)*this.height;
   const nearTitle=Math.abs(x/this.width-.5)<.3&&y/this.height>.26&&y/this.height<.76;
   c.save();c.translate(x,y);c.rotate(p.phase+t*.08);c.globalAlpha=(.22+(Math.sin(t*.32+p.phase)+1)*.12)*(nearTitle?.3:1);
   if(p.petal){c.fillStyle=p.phase>3?'#e8afcb':'#b2cfc1';c.beginPath();c.moveTo(-p.size*3,0);c.bezierCurveTo(-p.size,-p.size*2.7,p.size*3,-p.size*2.7,p.size*3,0);c.bezierCurveTo(p.size,p.size*2,-p.size,p.size*2,-p.size*3,0);c.fill();}
   else{c.fillStyle=p.phase>3?'#dbd9ef':'#f1dfc5';c.beginPath();c.arc(0,0,p.size*.65,0,Math.PI*2);c.fill();}
   c.restore();
  }c.restore();
 }
 draw(now){
  this.raf=null;if(!this.active||document.hidden)return;
  if(now-(this.lastDraw||0)<1000/30){this.raf=requestAnimationFrame(t=>this.draw(t));return;}this.lastDraw=now;
  const c=this.ctx;c.clearRect(0,0,this.width,this.height);this.marks=this.marks.filter(p=>now-p.born<5600);this.drawAmbient(c,now);
  for(const p of this.marks){const age=(now-p.born)/1000,grow=Math.max(0,Math.min(1,age/0.75)),fade=Math.max(0,Math.min(1,(5.6-age)/2.1));c.save();c.translate(p.x,p.y);c.globalAlpha=fade*grow;
   const unfurl=1-Math.pow(1-grow,3),turn=p.seed+Math.sin(age*.45+p.seed)*.035;
   c.rotate(turn);const radius=p.size*1.3*unfurl;const sprite=this.sprites[Math.floor(p.seed)%3];c.drawImage(sprite,-radius,-radius,radius*2,radius*2);
   // A loose halo of tiny fragments drifts radially, with no upward bias.
   for(let i=0;i<9;i++){
    const a=turn+i*2.399,reach=p.size*(.85+.28*Math.sin(i*3+p.seed))*unfurl+Math.max(0,age-.7)*(1.8+i%3);
    c.save();c.translate(Math.cos(a)*reach,Math.sin(a)*reach);c.rotate(a+age*.12);c.globalAlpha=fade*grow*(i%3===0?.68:.85);c.fillStyle=i%2?'#c9afe8a0':'#b5cfaf88';
    c.beginPath();if(i%3===0)c.ellipse(0,0,2.3,1.1,0,0,Math.PI*2);else c.arc(0,0,.6+i%2*.3,0,Math.PI*2);c.fill();c.restore();
   }
   c.restore();
  }
  if(this.marks.length||(!this.reduced.matches&&!document.body.classList.contains("low-motion")))this.raf=requestAnimationFrame(t=>this.draw(t));
 }
}

