import { drawArtwork } from './artwork.js';
export async function exportWork(work, poster = false) {
  const canvas = document.createElement('canvas'); canvas.width = poster ? 1200 : 1600; canvas.height = 1600;
  if (poster) {
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#101713'; ctx.fillRect(0, 0, 1200, 1600);
    const art = document.createElement('canvas'); art.width = art.height = 1100; drawArtwork(art, work.params, { background: '#101713' }); ctx.drawImage(art, 50, 140);
    ctx.fillStyle = '#dfd1ae'; ctx.font = '26px serif'; ctx.fillText('生命绣谱  /  LIVING EMBROIDERY', 80, 100);
    ctx.font = '46px serif'; ctx.fillText(work.name, 80, 1330, 1040);
    ctx.font = '22px sans-serif'; ctx.fillText('植物交互 × 数字工艺 · 原创数字纹样', 80, 1390);
    ctx.strokeStyle = '#b9bead'; ctx.beginPath(); ctx.moveTo(80, 1450); ctx.lineTo(1120, 1450); ctx.stroke();
    ctx.font = '19px sans-serif'; ctx.fillText(new Date(work.createdAt).toLocaleDateString('zh-CN'), 80, 1500); ctx.fillText(`触摸 ${work.params.touches} 次 · 浇水 ${work.params.waters} 次`, 820, 1500);
  } else drawArtwork(canvas, work.params);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); if (!blob) throw Error('图片生成失败，请重试。');
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${work.name.replace(/[\\/:*?"<>|]/g, '-')}${poster ? '-海报' : ''}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
}
