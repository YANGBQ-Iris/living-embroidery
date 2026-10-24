export function addTitleGlow(root=document){
 for(const title of root.querySelectorAll('.garden-heading>p,.welcome h1,.arrival h1>span,.arrival h1>em,.closing h2')){
  if(title.classList.contains('title-glow'))continue;
  const glow=document.createElement('span');glow.className='title-aura';glow.setAttribute('aria-hidden','true');glow.textContent=title.textContent;
  title.classList.add('title-glow');title.append(glow);
 }
}
