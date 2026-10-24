import { shell } from './components/shell.js';
import { homePage, mountHome } from './pages/home.js';
import { createPage, mountCreate } from './pages/create.js';
import { archivePage, mountArchive } from './pages/archive.js';
import { collectionPage, mountCollection } from './pages/collection.js';
import { store } from './lib/store.js';
import { toast } from './components/ui.js';
let cleanup;
function render(scroll=true) {
  cleanup?.();cleanup=null;
  const [route, query='']=(location.hash.slice(2)||'home').split('?');
  const page=['home','create','archive','collection'].includes(route)?route:'home';
  const filter=new URLSearchParams(query).get('filter')||'all';
  const content={ home:homePage,create:createPage,archive:()=>archivePage(filter),collection:()=>collectionPage(filter) }[page]();
  document.querySelector('#app').innerHTML=shell(page,content,store.works.length);
  document.title=`${{home:'让每一次触碰，生长成纹样',create:'互动创作',archive:'苗绣档案',collection:'我的绣谱'}[page]} · 生命绣谱`;
  const mounts={home:mountHome,create:mountCreate,archive:mountArchive,collection:()=>mountCollection(()=>render(false))};cleanup=mounts[page]();
  if(scroll) {window.scrollTo(0,0);document.querySelector('#main').focus({preventScroll:true});}
}
window.addEventListener('hashchange',()=>{if(location.hash==='#main'){document.querySelector('#main').focus();return;}document.querySelector('dialog')?.close();render();});
render(false);
if(store.error)toast(store.error);
