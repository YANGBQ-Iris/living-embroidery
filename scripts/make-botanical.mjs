import { writeFile } from 'node:fs/promises';
const leaves = [ [314,491,-64,.91], [323,446,31,.92], [300,396,-70,1.04], [324,345,33,.99], [310,292,-65,.91], [328,238,35,.8], [327,197,-35,.79] ];
let parts = '';
for (const [x,y,a,s] of leaves) {
  let veins = '';
  for (let j=0;j<16;j++) { const v = 13+j*10; const breadth = Math.sin((v/190)*Math.PI)*48; veins += `<path d="M0 ${-v} Q${-breadth*.5} ${-v-9} ${-breadth} ${-v-23}M0 ${-v} Q${breadth*.5} ${-v-9} ${breadth} ${-v-23}"/>`; }
  parts += `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 8C-8-12-65-42-53-105S-13-158 0-202C16-172 70-140 57-91S15-8 0 8Z" fill="url(#leaf)" stroke="#365d39" stroke-width=".65"/><path d="M0 8Q7-75 0-202" fill="none" stroke="#b2ba77" stroke-width="1.4"/><g fill="none" stroke="#a1ad6d" stroke-opacity=".51" stroke-width=".65">${veins}</g><path d="M0 8C-8-12-65-42-53-105S-13-158 0-202" fill="none" stroke="#d0c99c" stroke-width="1"/></g>`;
}
await writeFile('assets/botanical.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="650" height="650" viewBox="0 0 650 650"><defs><linearGradient id="leaf" x1="0" x2="1" y2=".35"><stop stop-color="#233f29"/><stop offset=".45" stop-color="#41643e"/><stop offset=".5" stop-color="#708449"/><stop offset="1" stop-color="#9aab67"/></linearGradient><filter id="shadow"><feDropShadow dx="12" dy="16" stdDeviation="10" flood-color="#35462a" flood-opacity=".13"/></filter></defs><g filter="url(#shadow)"><path d="M299 622Q344 514 307 391T331 172" fill="none" stroke="#4b6239" stroke-width="5"/><path d="M299 622Q344 514 307 391T331 172" fill="none" stroke="#9a9c68" stroke-width="1.3"/>${parts}</g></svg>`);
console.log('Original botanical illustration generated.');
