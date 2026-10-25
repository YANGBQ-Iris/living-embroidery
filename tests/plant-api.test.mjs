import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createPlantApi} from '../scripts/plant-api.mjs';
test('plant API protects uploads and keeps unconfirmed files out of TD',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'plant-api-'));
 const api=createPlantApi(root),server=http.createServer(async(req,res)=>{if(!await api(req,res)){res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 try{
  assert.equal((await fetch(base+'/api/studio-status').then(r=>r.json())).modelReady,false);
  assert.equal(await fetch(base+'/api/plant-current').then(r=>r.json()),null);
  assert.equal((await fetch(base+'/api/plants',{method:'POST',headers:{Origin:'https://other.example','Content-Type':'image/png'},body:'bad'})).status,403);
  assert.equal((await fetch(base+'/api/plants',{method:'POST',headers:{'Content-Type':'text/plain'},body:'bad'})).status,415);
  assert.equal((await fetch(base+'/api/plant-confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'../../secret'})})).status,400);
  assert.equal((await fetch(base+'/api/plant-confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'00000000-0000-4000-8000-000000000000'})})).status,400);
  assert.equal(await fetch(base+'/api/plant-current').then(r=>r.json()),null);
  assert.equal((await fetch(base+'/api/td-frame')).status,503);
 }finally{await new Promise(resolve=>server.close(resolve));await rm(root,{recursive:true,force:true});}
});
