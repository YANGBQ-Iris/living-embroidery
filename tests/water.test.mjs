import test from 'node:test';import assert from 'node:assert/strict';
import {absorptionOpacity,waterDropState} from '../src/water.js';
test('water stays visible above soil and continuously fades after contact',()=>{
 for(const radius of [12,35,55]){assert.equal(absorptionOpacity(550,600,radius),1);assert.equal(absorptionOpacity(600,600,radius),1);let last=1;for(let y=600;y<850;y+=.5){const a=absorptionOpacity(y,600,radius);assert.ok(a<=last&&a>=0);assert.ok(last-a<.03);last=a;}assert.equal(last,0);}
});
test('falling drops reach the soil, then vanish before the next cycle',()=>{
 let above=false,contact=false,absorbed=false;
 for(let t=0;t<15;t+=.01){const d=waterDropState(t,0,.5);if(d.y<d.surface&&d.opacity===1)above=true;if(d.y>d.surface&&d.opacity>0&&d.opacity<1)contact=true;if(d.y>d.surface&&d.opacity===0)absorbed=true;assert.ok(d.scale>0&&d.scale<=1);}
 assert.ok(above&&contact&&absorbed);
});
