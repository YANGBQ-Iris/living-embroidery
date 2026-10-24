// Body artwork points toward local -Y. Rotate that axis onto the path tangent.
export function butterflyPose(t,i,w,h){
 const p=(t/(39000+i*4300)+i*.251)%1;
 const dx=(i%2?-1:1)*1.4*w;
 const dy=h*(Math.cos(p*Math.PI*2+i)*Math.PI*2*.08+Math.cos(p*Math.PI*4)*Math.PI*4*.025);
 return {x:(i%2?1.2-p*1.4:p*1.4-.2)*w,y:h*(.23+i*.095+Math.sin(p*Math.PI*2+i)*.08+Math.sin(p*Math.PI*4)*.025),heading:Math.atan2(dy,dx)+Math.PI/2,depth:.45+Math.sin(p*Math.PI)**2*.75,alpha:Math.min(.78,Math.sin(p*Math.PI)*1.7)};
}
