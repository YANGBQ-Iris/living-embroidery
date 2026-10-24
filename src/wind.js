export class GardenWind {
 constructor(){this.plants=[...document.querySelectorAll('.plant img')];this.photos=[...document.querySelectorAll('.hanging-photo')];this.rope=document.querySelector('.garland-rope');this.last=0;}
 draw(t,reduced){if(document.body.dataset.scene!=='garden'&&!document.body.classList.contains('returning'))return;const dt=Math.min(.05,t-this.last||.016);this.last=t;const wind=Math.sin(t*.52)*.65+Math.sin(t*.21)*.26+Math.sin(t*1.03)*.09;
  this.plants.forEach((el,i)=>{const button=el.closest('.plant'),target=button.matches(':hover')?.18:button.classList.contains('selected')?.38:1;el.windWeight=(el.windWeight??1)+(target-(el.windWeight??1))*(1-Math.exp(-dt*8));const angle=reduced?0:(wind*2.1+Math.sin(t*.64-i*.7)*.55)*el.windWeight;el.style.transform=`rotate(${angle.toFixed(3)}deg) skewX(${(angle*.15).toFixed(3)}deg)`;});
  if(!document.body.classList.contains('photos-open'))return;
  if(this.rope)this.rope.style.transform=`scaleY(${reduced?1:1+wind*.025})`;
  this.photos.forEach((el,i)=>{const hover=el.matches(':hover,:focus-visible');el.style.scale=hover?'1.06':'1';if(hover)return;const swing=reduced?0:(Math.sin(t*.52-.32-i*.13)*3.4+wind*.7)*(hover?.22:1),y=reduced?0:wind*8*Math.sin((i+1)/5*Math.PI);el.style.transform=`translateX(-50%) translateY(${y.toFixed(2)}px) rotate(${(Number.parseFloat(el.style.getPropertyValue('--angle'))+swing).toFixed(3)}deg) scale(${hover?1.06:1})`;});
 }
}
