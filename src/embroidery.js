// Reusable offscreen embroidery sprites. Rendered once, reused by existing loops.
export function embroiderySprite(kind='petal',size=384){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const c=canvas.getContext('2d');c.translate(size/2,size/2);c.scale(size/180,size/180);c.lineCap='round';c.lineJoin='round';
 if(kind==='silver'){
  for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.strokeStyle='#eef3ef';c.lineWidth=1.25;c.beginPath();c.moveTo(0,-5);c.bezierCurveTo(-33,-20,-21,-58,0,-68);c.bezierCurveTo(-13,-47,19,-37,8,-19);c.bezierCurveTo(-2,-5,-18,-19,-8,-25);c.bezierCurveTo(-2,-29,2,-20,-3,-19);c.stroke();c.strokeStyle='#bdd9d1';c.lineWidth=.9;for(let j=0;j<4;j++){c.beginPath();c.moveTo(-12+j,-32-j*5);c.quadraticCurveTo(-30,-30-j*6,-40+j*5,-44-j*7);c.stroke();}c.restore();}
 }else{
  const n=kind==='four'?4:8;
  for(let i=0;i<n;i++){c.save();c.rotate(i*Math.PI*2/n);c.fillStyle=i%2?'#77a69a':'#ee9fb8';c.strokeStyle='#f9ecdf';c.lineWidth=1;c.beginPath();c.moveTo(0,-10);c.bezierCurveTo(-10,-21,-25,-40,-16,-53);c.bezierCurveTo(-7,-67,3,-60,0,-49);c.bezierCurveTo(13,-68,30,-53,20,-38);c.bezierCurveTo(12,-25,3,-22,0,-10);c.fill();c.stroke();c.beginPath();c.moveTo(23,-26);c.bezierCurveTo(36,-53,57,-47,58,-61);c.bezierCurveTo(68,-37,53,-22,23,-26);c.fillStyle=i%2?'#f3b1c1':'#7baaa0';c.fill();c.stroke();c.beginPath();c.moveTo(5,-32);c.bezierCurveTo(36,-45,55,-23,43,-7);c.bezierCurveTo(32,7,18,-2,25,-12);c.bezierCurveTo(30,-18,36,-12,31,-8);c.strokeStyle='#f8cfb6';c.lineWidth=2.8;c.stroke();c.setLineDash([1,2]);c.strokeStyle='#fff3e9';c.lineWidth=.65;c.beginPath();c.moveTo(0,-19);c.quadraticCurveTo(-6,-38,0,-49);c.stroke();c.restore();}
  for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);c.beginPath();c.ellipse(0,-12,5.5,13,0,0,Math.PI*2);c.fillStyle=i%2?'#f6c9ae':'#ec99b4';c.fill();c.strokeStyle='#ffeddf';c.lineWidth=.8;c.stroke();c.restore();}c.beginPath();c.arc(0,0,7,0,Math.PI*2);c.fillStyle='#74a499';c.fill();c.strokeStyle='#f6e3cc';c.lineWidth=2;c.stroke();
 }
 return canvas;
}
