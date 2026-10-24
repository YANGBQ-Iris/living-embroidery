import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PARAMS, normalizedParams, makeArtwork, drawArtwork } from '../src/lib/artwork.js';
import { createStore, validateWorks, STORAGE_KEY } from '../src/lib/store.js';
import { applyInteraction } from '../src/integrations/ports.js';
test('touch and water cause distinct parameter changes and respect bounds',()=>{
  const touch=applyInteraction(DEFAULT_PARAMS,{type:'touch',intensity:1});const water=applyInteraction(DEFAULT_PARAMS,{type:'water',intensity:1});
  assert.equal(touch.density,63);assert.equal(touch.spread,60);assert.equal(touch.touches,1);
  assert.equal(water.spread,70);assert.equal(water.density,58);assert.equal(water.waters,1);
  assert.equal(applyInteraction({...DEFAULT_PARAMS,spread:99},{type:'water',intensity:1}).spread,100);
  assert.deepEqual(applyInteraction(DEFAULT_PARAMS,{type:'invalid'}),DEFAULT_PARAMS);
});
test('saved artwork survives reload and rename without losing visual parameters',()=>{
  const memory=new Map();const storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};let store=createStore(storage);
  const work=makeArtwork({...DEFAULT_PARAMS,palette:'indigo',touches:3});assert.ok(store.save(work));assert.ok(store.rename(work.id,'  叶脉之序  '));
  store=createStore(storage);assert.equal(store.find(work.id).name,'叶脉之序');assert.deepEqual(store.find(work.id).params,work.params);
  assert.equal(store.rename(work.id,'  '),false);assert.ok(store.remove(work.id));assert.equal(createStore(storage).works.length,0);
});
test('failed persistence never reports success or mutates saved state',()=>{
  const store=createStore({getItem:()=>null,setItem(){throw Error('quota');}});assert.equal(store.save(makeArtwork(DEFAULT_PARAMS)),false);assert.equal(store.works.length,0);assert.match(store.error,/未保存/);
});
test('malformed storage is handled and invalid records are rejected',()=>{
  assert.ok(createStore({getItem:()=>'{',setItem(){}}).error);assert.deepEqual(validateWorks([null,{}, {id:'x',name:'x',createdAt:'bad',version:1}]),[]);
  assert.deepEqual(normalizedParams({density:200,spread:-1,palette:'bad',seed:NaN}),{...DEFAULT_PARAMS,density:100,spread:20});
  assert.equal(STORAGE_KEY,'life-embroidery:works:v1');
});
test('identical saved parameters replay identical drawing commands',()=>{
  function recordingCanvas(){const log=[];const ctx=new Proxy({}, {get:(_,key)=>(...args)=>log.push([key,...args]),set:(_,key,value)=>{log.push([key,value]);return true;}});return {width:1000,height:1000,getContext:()=>ctx,log};}
  const a=recordingCanvas(),b=recordingCanvas(),c=recordingCanvas();drawArtwork(a,DEFAULT_PARAMS);drawArtwork(b,DEFAULT_PARAMS);drawArtwork(c,{...DEFAULT_PARAMS,seed:92});assert.deepEqual(a.log,b.log);assert.notDeepEqual(a.log,c.log);
});
