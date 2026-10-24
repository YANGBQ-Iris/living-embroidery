import test from 'node:test';
import assert from 'node:assert/strict';
import {butterflyPose} from '../src/butterfly.js';
test('butterfly head follows actual path tangent in both directions and portrait views',()=>{
 for(const [w,h] of [[1440,900],[390,844]])for(let i=0;i<4;i++)for(let t=500;t<30000;t+=937){
  const a=butterflyPose(t-1,i,w,h),b=butterflyPose(t+1,i,w,h),p=butterflyPose(t,i,w,h);
  if(Math.abs(b.x-a.x)>w*.1)continue;
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
  const dot=(Math.sin(p.heading)*dx-Math.cos(p.heading)*dy)/length;
  assert.ok(dot>.99999,`head/velocity mismatch at ${t}, butterfly ${i}`);
  assert.ok(p.depth>0&&p.alpha>=0);
 }
});
