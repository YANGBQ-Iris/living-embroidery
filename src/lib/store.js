import { normalizedParams } from './artwork.js';
export const STORAGE_KEY = 'life-embroidery:works:v1';
export function validateWorks(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  return input.filter(x => x && typeof x.id === 'string' && !seen.has(x.id) && seen.add(x.id) && typeof x.name === 'string' && Number.isFinite(Date.parse(x.createdAt)) && x.version === 1).map(x => ({ id: x.id, pattern_id:'botanical-radial-v1', status:'completed', name: x.name.slice(0, 40), createdAt: x.createdAt, version: 1, origin: 'original-digital', params: normalizedParams(x.params) }));
}
export function createStore(storage) {
  let works = [], error = null;
  try { works = validateWorks(JSON.parse(storage.getItem(STORAGE_KEY) || '[]')); } catch { error = '本地作品数据无法读取；新作品保存成功后将恢复存储。'; }
  const persist = next => { try { storage.setItem(STORAGE_KEY, JSON.stringify(next)); works = next; error = null; return true; } catch { error = '浏览器存储不可用或已满，作品未保存。请先导出 PNG。'; return false; } };
  return {
    get works() { return [...works]; }, get error() { return error; },
    save(work) { return persist([work, ...works.filter(x => x.id !== work.id)]); },
    rename(id, name) { const value = name.trim().slice(0, 40); if (!value || !works.some(x => x.id === id)) return false; return persist(works.map(x => x.id === id ? { ...x, name: value } : x)); },
    remove(id) { return persist(works.filter(x => x.id !== id)); },
    find(id) { return works.find(x => x.id === id); }
  };
}
let storage;
try { storage = globalThis.localStorage; } catch { storage = { getItem() { throw Error('storage blocked'); }, setItem() { throw Error('storage blocked'); } }; }
export const store = createStore(storage || { getItem: () => null, setItem() {} });
