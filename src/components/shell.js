import { icon } from './ui.js';
export function shell(page, content, count) {
  const links = [['home','首页','01'],['create','互动创作','02'],['archive','苗绣档案','03'],['collection','我的绣谱','04']];
  return `<header class="site-header"><a class="brand" href="#/home" aria-label="生命绣谱首页"><img src="/assets/mark.svg" width="38" height="38" alt=""><span>生命绣谱<small>LIVING EMBROIDERY</small></span></a><nav aria-label="主导航">${links.map(([id,label,no])=>`<a href="#/${id}" ${page===id?'aria-current="page"':''}><span class="nav-no">${no}</span>${label}${id==='collection'?`<span class="nav-count">${count}</span>`:''}</a>`).join('')}</nav><a class="header-action" href="#/create">开启一段生长 ${icon('arrow',16)}</a></header><main id="main" tabindex="-1">${content}</main><footer class="site-footer"><a href="#/home" class="footer-brand">生命绣谱 <span>LIVING EMBROIDERY</span></a><p>以自然为起点，让手艺在数字中延续。</p><span class="footer-note"><i></i> 植物交互 × 苗绣文化 × 数字艺术</span></footer>`;
}
