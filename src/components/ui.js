export const escapeHTML = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function icon(name, size = 18) {
  const paths = { arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', leaf: '<path d="M20 4C7 2 2 8 5 15c4 8 16 3 15-11Z"/><path d="m5 20 11-12M9 16v-5m4 1h4"/>', drop: '<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M9 17c0 1 1 2 3 2"/>', plus: '<path d="M12 5v14M5 12h14"/>', save: '<path d="M5 3h12l4 4v14H3V3Zm2 0v6h10V3M7 21v-8h10v8"/>', download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', grid: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>', touch: '<path d="M9 12V5a2 2 0 0 1 4 0v7l2-2c2-2 5 0 3 3l-3 7H9l-5-7c-1-2 1-4 3-2l2 2"/>', refresh: '<path d="M20 9a8 8 0 1 0 0 6M20 3v6h-6"/>', chevron: '<path d="m9 5 7 7-7 7"/>', edit: '<path d="m4 16 12-12 4 4L8 20H4Zm10-10 4 4"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>' };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;
}
let toastTimer;
export function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3500); }
export function openModal(content, onReady) {
  const root = document.querySelector('#modal-root'); const previous = document.activeElement;
  root.innerHTML = `<dialog class="modal"><button class="icon-button modal-close" aria-label="关闭详情">${icon('close')}</button>${content}</dialog>`;
  const dialog = root.querySelector('dialog');
  const heading = dialog.querySelector('h2');
  if (heading) { heading.id = 'modal-title'; dialog.setAttribute('aria-labelledby', 'modal-title'); }
  dialog.querySelector('.modal-close').onclick = () => dialog.close();
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { dialog.remove(); if (!root.querySelector('dialog[open]')) previous?.focus(); }, { once: true });
  dialog.showModal(); onReady?.(dialog);
}
