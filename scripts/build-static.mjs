import {cp,mkdir,readFile,writeFile,stat,lstat,rm} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
// Only the fixed generated directory may be replaced; never follow a link.
if(path.dirname(out)!==root)throw Error('Invalid build directory');
const previous=await lstat(out).catch(e=>{if(e.code!=='ENOENT')throw e;return null;});
if(previous?.isSymbolicLink())throw Error('Build directory must not be a symlink');
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
for(const file of ['index.html','project.html','llms.txt','project.json','robots.txt','sitemap.xml','DEPLOYMENT.md']){
 await stat(path.join(root,file));await cp(path.join(root,file),path.join(out,file));
}
for(const folder of ['src','assets'])await cp(path.join(root,folder),path.join(out,folder),{recursive:true,filter:file=>path.basename(file)!=='metadata.json'});
await writeFile(path.join(out,'.nojekyll'),'');
const config=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
await writeFile(path.join(out,'release.json'),JSON.stringify({name:config.name,version:config.version,kind:'static',entry:'index.html',overview:'project.html'},null,2)+'\n');
console.log('Static website ready: '+out);
