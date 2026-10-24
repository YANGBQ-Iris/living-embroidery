import { drawArtwork } from '../lib/artwork.js';
/** Local visual adapter implementing the same lifecycle reserved for TouchDesigner. */
export class VisualStage {
  mount(container, params) { this.canvas = document.createElement('canvas'); this.canvas.width = this.canvas.height = 1000; this.canvas.setAttribute('role', 'img'); this.canvas.setAttribute('aria-label', '由当前参数绘制的原创植物绣线数字纹样'); container.replaceChildren(this.canvas); this.update(params); }
  update(params) {
    cancelAnimationFrame(this.frame);
    if (!this.canvas) return;
    const previous=this.params; this.params={...params};
    if (!previous || matchMedia('(prefers-reduced-motion: reduce)').matches) {drawArtwork(this.canvas,params);return;}
    const started=performance.now();
    const animate=now=>{if(!this.canvas)return;const t=Math.min(1,(now-started)/650),ease=1-(1-t)**3;drawArtwork(this.canvas,{...params,density:previous.density+(params.density-previous.density)*ease,spread:previous.spread+(params.spread-previous.spread)*ease});if(t<1)this.frame=requestAnimationFrame(animate);};
    this.frame=requestAnimationFrame(animate);
  }
  destroy() { cancelAnimationFrame(this.frame);this.canvas?.remove(); this.canvas = null; }
}
