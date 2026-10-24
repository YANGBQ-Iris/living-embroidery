export const PALETTES = [
  { id: 'moss', name: '苔色入林', colors: ['#7fa896', '#bec793', '#cfad71'], paper: '#101713' },
  { id: 'indigo', name: '靛蓝染梦', colors: ['#79a8b5', '#a7b8ce', '#d2ba7c'], paper: '#10151c' },
  { id: 'vermilion', name: '朱砂映叶', colors: ['#cd8e7a', '#d7b18a', '#87a08d'], paper: '#191310' }
];
export const DEFAULT_PARAMS = { palette: 'moss', density: 58, spread: 60, seed: 17, touches: 0, waters: 0 };
export function normalizedParams(p = {}) {
  const clamp = (v, min, max, fallback) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : fallback;
  return { palette: PALETTES.some(x => x.id === p.palette) ? p.palette : 'moss', density: clamp(p.density, 15, 100, 58), spread: clamp(p.spread, 20, 100, 60), seed: clamp(p.seed, 1, 999999, 17), touches: clamp(p.touches, 0, 9999, 0), waters: clamp(p.waters, 0, 9999, 0) };
}
export function drawArtwork(canvas, input, options = {}) {
  const p = normalizedParams(input), pal = PALETTES.find(x => x.id === p.palette);
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h); if (!options.transparent) { ctx.fillStyle = options.background || pal.paper; ctx.fillRect(0, 0, w, h); }
  ctx.save(); ctx.translate(w / 2, h / 2); const scale = Math.min(w, h) / 600; ctx.scale(scale, scale);
  // Seeded curves and short individual strokes suggest thread, never a traditional motif replica.
  let seed = p.seed; const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  ctx.strokeStyle = pal.colors[0]; ctx.lineWidth = 0.8;
  const petals = 8 + Math.min(4, Math.floor(p.waters / 2)), radius = 103 + p.spread * 1.03;
  const phase = p.seed * 0.037;
  for (let ring = 0; ring < 3; ring++) {
    const r = radius * (1 - ring * 0.24);
    for (let n = 0; n < petals; n++) {
      ctx.save(); ctx.rotate(n * Math.PI * 2 / petals + phase * 0.1 + ring * 0.22);
      ctx.strokeStyle = pal.colors[ring % 3];
      for (let strand = 0; strand < Math.round(p.density / 3); strand++) {
        const bend = 0.24 + strand / (p.density / 3) * 0.75;
        ctx.beginPath(); ctx.setLineDash([2.5 + random() * 2, 2 + random() * 1.8]);
        ctx.moveTo(0, -18); ctx.bezierCurveTo(-r * bend, -r * 0.4, -r * 0.36, -r * 0.95, 0, -r);
        ctx.bezierCurveTo(r * 0.36, -r * 0.95, r * bend, -r * 0.4, 0, -18); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, -r); ctx.stroke();
      for (let j = 0; j < 7; j++) { const y = -40 - j * (r - 45) / 7; ctx.beginPath(); ctx.moveTo(-9 - j * 0.6, y + 10); ctx.lineTo(0, y); ctx.lineTo(9 + j * 0.6, y + 10); ctx.stroke(); }
      ctx.restore();
    }
  }
  ctx.setLineDash([]);
  for (let i = 0; i < 32 + Math.min(p.touches, 20); i++) { const a = i * 2 * Math.PI / (32 + Math.min(p.touches, 20)) + phase; const r = radius + 14 + Math.sin(i * 2.4) * 8; ctx.save(); ctx.rotate(a); ctx.strokeStyle = pal.colors[i % 3]; ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(r + 8, -3); ctx.lineTo(r + 14, 0); ctx.lineTo(r + 8, 3); ctx.closePath(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle = pal.colors[2]; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = pal.colors[2]; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
export function makeArtwork(params, index = 1) {
  return { id: globalThis.crypto.randomUUID(), pattern_id:'botanical-radial-v1', status:'completed', name: `叶间生长 · ${String(index).padStart(2, '0')}`, createdAt: new Date().toISOString(), version: 1, origin: 'original-digital', params: normalizedParams(params) };
}
