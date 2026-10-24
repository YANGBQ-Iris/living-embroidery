import { normalizedParams } from '../lib/artwork.js';
/** Future adapter contract: mount(container, params), update(params), destroy().
 * Replace the local renderer only when an explicitly connected source exists.
 * Sensor event contract: { type: 'touch'|'water', intensity: 0..1, timestamp: number }.
 * No remote sockets, hardware permissions or camera access are made in phase 1.
 */
export function applyInteraction(params, event) {
  if (!event || !['touch', 'water'].includes(event.type)) return normalizedParams(params);
  const p = normalizedParams(params);
  const intensity = Math.max(0, Math.min(1, Number(event.intensity) || 0.5));
  return normalizedParams({ ...p, seed: p.seed + 1, touches: p.touches + (event.type === 'touch' ? 1 : 0), waters: p.waters + (event.type === 'water' ? 1 : 0), density: p.density + (event.type === 'touch' ? 5 * intensity : 0), spread: p.spread + (event.type === 'water' ? 10 * intensity : 0) });
}
export const integrationStatus = { visual: 'local-canvas', sensor: 'simulation', tryOn: 'manual-overlay' };

