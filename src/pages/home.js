import { icon } from '../components/ui.js';
import { drawArtwork } from '../lib/artwork.js';
export function homePage() {
 return `<section class="immersive-hero"><div class="hero-text"><p class="eyebrow">NATURE IS THE NEEDLE. YOU ARE THE THREAD.</p><p class="hero-prelude">一叶一世界 · 一针一生命</p><h1>生命<span>绣</span>谱</h1><p class="hero-english">Living Embroidery</p><div class="hero-rule"></div><p class="hero-poem">以触碰唤醒绣线，以水滴延续生长。<br>让植物的生命节律，织入你的数字绣谱。</p><a class="enter-experience" href="#/create"><span>开启一段生长</span><i>${icon('arrow',23)}</i></a></div><span class="hero-side">AN INTERACTIVE EXPLORATION OF NATURE & EMBROIDERY</span><span class="hero-edition">数字工艺实验<br><b>VOL. 001 / 2026</b></span><a class="scroll-cue" href="#journey"><span>向下探索</span><i>↓</i></a><span class="hero-corner">植物交互 × 苗绣数字艺术</span></section>
 <section class="exhibition-intro" id="journey"><div class="intro-top"><p class="eyebrow">01 — THE LANGUAGE OF GROWTH</p><span>自然起针，万物成绣。</span></div><div class="intro-layout"><div><h2>一片叶的呼吸，<br>一根线的<span>新生。</span></h2><p>当指尖靠近叶片，静默的植物成为创作的起点。<br>我们从苗绣的线迹、重复与秩序中学习，<br>用数字针脚，回应每一次温柔的照料。</p><a href="#/archive" class="text-link">走进苗绣档案 ${icon('arrow')}</a></div><div class="intro-art"><canvas id="intro-pattern" width="800" height="800" role="img" aria-label="原创数字针脚构图"></canvas><span>FIG. 01 / 原创数字纹样研究</span></div></div></section>
 <section class="experience-path"><div class="intro-top"><p class="eyebrow">02 — A THREAD OF YOUR OWN</p><span>你的每个动作，都有回响。</span></div><div class="path-heading"><h2>从一次触碰，<br>到一幅<span>属于你的绣谱。</span></h2><a class="text-link" href="#/create">进入互动创作 ${icon('arrow')}</a></div><div class="ritual-grid">${[['01','触摸起针','TOUCH','轻触叶片触摸区，让局部针脚逐渐细密。','touch'],['02','浇水铺绣','NURTURE','一滴水，唤起纹样向外延展的生命力。','drop'],['03','数字成谱','COMPOSE','选择配色，定格只属于此刻的数字构图。','grid'],['04','试戴珍藏','KEEP','化作一枚数字发饰，或将绣谱保存带走。','save']].map(([n,title,en,desc,ico])=>`<a class="ritual" href="#/create"><span class="ritual-number">${n}</span><div class="ritual-symbol">${icon(ico,42)}</div><p class="eyebrow">${en}</p><h3>${title}</h3><p>${desc}</p><span class="ritual-arrow">↗</span></a>`).join('')}</div></section>
 <section class="closing-scene"><p class="eyebrow">EVERY TOUCH LEAVES A TRACE</p><h2>让生命，被温柔地<span>记住。</span></h2><p>你与植物的相遇，将在一针一线之间继续生长。</p><a class="button primary" href="#/create">开始我的第一幅绣谱 ${icon('arrow')}</a><small>无需连接硬件 · 可完整体验模拟创作</small></section>`;
}
export function mountHome() {
 drawArtwork(document.querySelector('#intro-pattern'),{palette:'vermilion',density:85,spread:86,seed:52,touches:9,waters:6});
 const hero=document.querySelector('.immersive-hero');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const move=e=>{if(!reduced){hero.style.setProperty('--mx',`${(e.clientX/innerWidth-.5)*12}px`);hero.style.setProperty('--my',`${(e.clientY/innerHeight-.5)*12}px`);}};
 hero.addEventListener('pointermove',move);
 document.querySelector('.scroll-cue').onclick=e=>{e.preventDefault();document.querySelector('#journey').scrollIntoView({behavior:reduced?'instant':'smooth'});};
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('revealed');}),{threshold:.12});
 document.querySelectorAll('.exhibition-intro,.experience-path,.closing-scene').forEach(el=>observer.observe(el));
 return ()=>{hero.removeEventListener('pointermove',move);observer.disconnect();};
}
