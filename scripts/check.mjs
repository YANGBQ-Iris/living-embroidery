import {readdir,readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
for(const folder of ['src','scripts','tests'])for(const name of await readdir(path.join(root,folder))){if(/\.(m?js)$/.test(name))execFileSync(process.execPath,['--check',path.join(root,folder,name)],{stdio:'pipe'});}
for(const asset of ['intro.mp4','sky-background.jpg','poster-start.jpg','garland.png','plant-orchid.png','plant-white.png','plant-round.png','plant-violet.png','audio/garden-interlude.mp3',...Array.from({length:4},(_,i)=>`photo-${i+1}.png`)]){const s=await stat(path.join(root,'assets',asset));if(s.size<50)throw Error('Empty asset: '+asset);}
const html=await readFile(path.join(root,'index.html'),'utf8');for(const [,file] of html.matchAll(/(?:src|href)="([^"#]+)"/g))await stat(path.join(root,file));
for(const name of ['启动共生间隙.cmd','start.cmd']){const text=await readFile(path.join(root,name),'utf8');if(/[^\x00-\x7f]/.test(text)||/(^|[^\r])\n/.test(text))throw Error('CMD launcher must be ASCII with CRLF: '+name);}
console.log('JS syntax and referenced assets: OK');
