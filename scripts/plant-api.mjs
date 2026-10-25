import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,stat,unlink} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const MAX=12*1024*1024;
export function createPlantApi(root,{python=process.env.PLANT_PYTHON||'python'}={}){
 const runtime=path.join(root,'.runtime'),uploads=path.join(runtime,'plants');let processing=false;
 const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 const load=async name=>JSON.parse(await readFile(path.join(runtime,name),'utf8'));
 async function bytes(req){let count=0,chunks=[];for await(const chunk of req){count+=chunk.length;if(count>MAX){const e=Error('图片不能超过 12 MB');e.status=413;throw e;}chunks.push(chunk);}return Buffer.concat(chunks);}
 async function file(res,name,type){try{const data=await readFile(name);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(data);}catch{json(res,404,{error:'画面暂未准备好'});}}
 return async(req,res)=>{
  const url=new URL(req.url,'http://localhost'),route=url.pathname;if(!route.startsWith('/api/'))return false;
  try{
   if(req.method==='POST'){
    // Local-only service: reject requests from other websites, including DNS rebinding.
    if(!/^127\.0\.0\.1:\d+$/.test(req.headers.host||'')&&!/^localhost:\d+$/.test(req.headers.host||''))return json(res,403,{error:'仅限本机使用'}),true;
    const origin=req.headers.origin;if(origin&&origin!==`http://${req.headers.host}`)return json(res,403,{error:'不接受跨站请求'}),true;
   }
   if(route==='/api/studio-status'&&req.method==='GET'){
    let td={connected:false};try{td=await load('td-status.json');td.connected=Date.now()-td.timestamp<4000;}catch{}
    json(res,200,{td,processing,modelReady:await stat(path.join(runtime,'models/u2netp.onnx')).then(()=>true,()=>false)});
   }else if(route==='/api/plants'&&req.method==='POST'){
    if(processing){json(res,409,{error:'上一张植物照片仍在处理中，请稍候'});return true;}
    if(!['image/jpeg','image/png','image/webp'].includes(req.headers['content-type']?.split(';')[0])){json(res,415,{error:'请上传 JPG、PNG 或 WebP 图片'});return true;}
    processing=true;let input;
    try{
     const data=await bytes(req);if(!data.length){json(res,400,{error:'图片为空'});return true;}
     await mkdir(uploads,{recursive:true});const id=randomUUID();input=path.join(uploads,id+'.upload');const output=path.join(uploads,id+'.png');await writeFile(input,data);
     await new Promise((resolve,reject)=>{
      const child=spawn(python,[path.join(root,'scripts/remove-background.py'),input,output,path.join(runtime,'models/u2netp.onnx')],{windowsHide:true,stdio:['ignore','pipe','pipe']});let err='',settled=false;
      const timer=setTimeout(()=>{child.kill();finish(Error('抠图超时，请缩小图片后重试'));},90000);
      function finish(error){if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve();}
      child.stderr.on('data',chunk=>{err=(err+chunk).slice(-2000);});child.on('error',finish);child.on('close',code=>finish(code===0?null:Error('未能完成抠图，请换一张主体清晰的植物照片重试')));
     });
     json(res,200,{id,preview:`/api/plant-image/${id}.black.png`,transparent:`/api/plant-image/${id}.png`});
    }finally{processing=false;if(input)await unlink(input).catch(()=>{});}
   }else if(route==='/api/plant-confirm'&&req.method==='POST'){
    const {id}=JSON.parse((await bytes(req)).toString('utf8'));if(!/^[0-9a-f-]{36}$/.test(id||'')){json(res,400,{error:'图片编号无效'});return true;}
    const filename=id+'.black.png';await stat(path.join(uploads,filename));
    const current={id,file:path.join(uploads,filename).replaceAll('\\','/'),url:`/api/plant-image/${filename}`,timestamp:Date.now()};
    const temp=path.join(runtime,'current.tmp.json');await writeFile(temp,JSON.stringify(current));await rename(temp,path.join(runtime,'current.json'));json(res,200,current);
   }else if(route==='/api/plant-current'&&req.method==='GET'){
    json(res,200,await load('current.json').catch(()=>null));
   }else if(route.startsWith('/api/plant-image/')&&req.method==='GET'){
    const name=route.slice('/api/plant-image/'.length);if(!/^[0-9a-f-]{36}(\.black)?\.png$/.test(name)){json(res,400,{error:'图片路径无效'});return true;}await file(res,path.join(uploads,name),'image/png');
   }else if(route==='/api/td-frame'&&req.method==='GET'){
    const status=await load('td-status.json').catch(()=>null);if(!status||Date.now()-status.timestamp>4000){json(res,503,{error:'TD 尚未连接'});return true;}
    await file(res,path.join(runtime,'td-frame.jpg'),'image/jpeg');
   }else json(res,404,{error:'接口不存在'});
  }catch(error){json(res,error.status||400,{error:error.message||'处理失败，请重试'});}
  return true;
 };
}
