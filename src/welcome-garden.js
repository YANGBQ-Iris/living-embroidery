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
  if(this.lastPoint&&(Math.hypot(x-this.lastPoint.x,y-this.lastPoint.y)<17||now-this.lastPoint.time<28))return;
  this.lastPoint={x,y,time:now};this.marks.push({x:x+(Math.random()-.5)*16,y:y+(Math.random()-.5)*24,born:now,seed:Math.random()*6.28,size:15+Math.random()*23});this.marks=this.marks.slice(-95);
  if(!this.raf)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
 draw(now){
  this.raf=null;if(!this.active)return;const c=this.ctx;c.clearRect(0,0,this.width,this.height);this.marks=this.marks.filter(p=>now-p.born<5600);
  for(const p of this.marks){const age=(now-p.born)/1000,grow=Math.min(1,age/0.75),fade=Math.max(0,Math.min(1,(5.6-age)/2.1));c.save();c.translate(p.x,p.y);c.globalAlpha=fade*grow;
   // Thin curved blades unfurl around the cursor rather than a solid green brush.
   c.lineCap='round';for(let i=0;i<4;i++){const side=i%2?1:-1,h=p.size*(.55+i*.17)*grow,sway=Math.sin(age*.7+p.seed+i)*3;c.beginPath();c.moveTo(side*i*2,7);c.quadraticCurveTo(side*(8+i*2)+sway,-h*.4,side*(5+i*3)+sway,-h);c.strokeStyle=i%2?'#8fbda9a8':'#b4d4a787';c.lineWidth=1.1;c.stroke();}
   for(let i=0;i<3;i++){const a=p.seed+i*2.1,drift=Math.max(0,age-.8),px=Math.cos(a)*(8+i*5)+Math.sin(age+p.seed)*drift*3,py=-9-Math.sin(a)*10-drift*(3+i);c.save();c.translate(px,py);c.rotate(a+age*.2);c.scale(grow,grow);c.beginPath();c.moveTo(-6,0);c.bezierCurveTo(-1,-8,8,-5,6,1);c.bezierCurveTo(2,6,-4,4,-6,0);c.fillStyle=['#b69addaf','#d4b7e7b0','#9674c6a0'][i];c.fill();c.restore();}
   for(let i=0;i<4;i++){const a=p.seed+i*1.7;c.beginPath();c.arc(Math.cos(a)*(12+age*4),Math.sin(a)*10-age*5,0.7+(i%2)*.5,0,Math.PI*2);c.fillStyle='#e3d5f5a8';c.fill();}c.restore();
  }
  if(this.marks.length)this.raf=requestAnimationFrame(t=>this.draw(t));
 }
}
