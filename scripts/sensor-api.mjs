import path from 'node:path';
import {readFile} from 'node:fs/promises';
export function parseSensorSnapshot(text){
 // TD/Python can emit non-JSON numeric tokens; preserve quoted text verbatim.
 return JSON.parse(text.replace(/("(?:\\.|[^"\\])*")|\b(?:NaN|Infinity)\b|-Infinity/g,(token,quoted)=>quoted||'null'));
}
export function sensorStatus(data,now=Date.now()){
 const alive=Boolean(data&&Number.isFinite(data.timestamp)&&now-data.timestamp>=-1000&&now-data.timestamp<2500);
 if(!alive)return {connected:false,tdConnected:false,source:'disconnected',pressure:null,moisture:null,frames:{}};
 const rawValid=[data.pressure?.raw,data.moisture?.raw].every(n=>Number.isFinite(n)&&n>=0&&n<=1023);
 const simulated=data.source==='simulation';
 return {...data,tdConnected:true,connected:Boolean(!simulated&&data.connected&&rawValid&&Number.isFinite(data.packetAgeMs)&&data.packetAgeMs<1500),source:simulated?'simulation':'serial'};
}
export function createSensorApi(root){
 const runtime=path.join(root,'.runtime');let latest=null;
 const send=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 return async(req,res)=>{
  const url=new URL(req.url,'http://localhost');if(!['/api/sensors','/api/sensor-frame'].includes(url.pathname))return false;
  if(req.method!=='GET'){send(res,405,{error:'仅支持读取传感器状态'});return true;}
  try{latest=parseSensorSnapshot(await readFile(path.join(runtime,'sensors.json'),'utf8'));}catch{}
  const data=sensorStatus(latest);
  if(url.pathname==='/api/sensors'){send(res,200,data);return true;}
  const scene=url.searchParams.get('scene');
  if(!['pressure','moisture'].includes(scene)){send(res,400,{error:'未知的传感器画面'});return true;}
  const stamp=data.frames?.[scene]?.timestamp;
  if(!data.tdConnected||!Number.isFinite(stamp)||Date.now()-stamp>2500){send(res,503,{error:'TD 画面尚未连接'});return true;}
  try{const frame=await readFile(path.join(runtime,`sensor-${scene}.jpg`));res.writeHead(200,{'Content-Type':'image/jpeg','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(frame);}catch{send(res,503,{error:'正在准备 TD 画面'});}
  return true;
 };
}
