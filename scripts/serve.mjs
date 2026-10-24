import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stat,readFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
const server=http.createServer(async(req,res)=>{try{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)||/(^|[\\/])\./.test(pathname))throw Error('Not found');const info=await stat(file);if(!info.isFile())throw Error('Not found');const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};const range=req.headers.range;if(range){const match=/^bytes=(\d*)-(\d*)$/.exec(range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}const start=match[1]?Number(match[1]):Math.max(0,info.size-Number(match[2]));const end=match[1]?(match[2]?Math.min(Number(match[2]),info.size-1):info.size-1):info.size-1;if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1});if(req.method==='HEAD')res.end();else createReadStream(file,{start,end}).pipe(res);return;}res.writeHead(200,{...headers,'Content-Length':info.size});if(req.method==='HEAD')res.end();else if(path.extname(file)==='.mp4')createReadStream(file).pipe(res);else res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}});
const port=Number(process.env.PORT||5190);
function openBrowser(url){if(process.argv.includes('--open')&&process.platform==='win32'){const browser=spawn('explorer.exe',[url],{windowsHide:true,stdio:'ignore'});browser.on('error',()=>console.log('Open the Local URL in your browser.'));browser.unref();}}
server.on('error',async e=>{
 if(e.code==='EADDRINUSE'){
  const url=`http://127.0.0.1:${port}`;
  try{const response=await fetch(url,{signal:AbortSignal.timeout(3000)});const html=await response.text();if(response.ok&&html.includes('<title>Symbiotic Interlude')&&html.includes('src/app.js')){console.log(`Already running. Opening: ${url}`);openBrowser(url);process.exitCode=0;return;}}catch{}
  console.error(`Port ${port} is used by another application. Close that application or use a different PORT.`);
 }else console.error(e.message);
 process.exitCode=1;
});
server.listen(port,'127.0.0.1',()=>{const url=`http://127.0.0.1:${server.address().port}`;console.log(`Local: ${url}`);console.log('Press Ctrl+C to stop.');openBrowser(url);});
