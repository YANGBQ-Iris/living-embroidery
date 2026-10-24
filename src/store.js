import {validateRecord} from './state.js';
const requestPromise=req=>new Promise((res,rej)=>{req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error);});
const transactionPromise=tx=>new Promise((res,rej)=>{tx.oncomplete=res;tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||Error('保存已取消'));});
export class GardenStore {
 async open(){this.db=await new Promise((res,rej)=>{const r=indexedDB.open('symbiotic-interlude-v4',1);r.onupgradeneeded=()=>{r.result.createObjectStore('records',{keyPath:'id'});r.result.createObjectStore('settings',{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);r.onblocked=()=>rej(Error('请关闭旧的花园标签后重试'));});this.db.onversionchange=()=>this.db.close();return this;}
 async records(){const tx=this.db.transaction('records');return (await requestPromise(tx.objectStore('records').getAll())).sort((a,b)=>b.timestamp-a.timestamp);}
 async add(r){validateRecord(r);const tx=this.db.transaction('records','readwrite');const done=transactionPromise(tx);tx.objectStore('records').put(r);await done;return r;}
 async remove(id){const tx=this.db.transaction('records','readwrite');const done=transactionPromise(tx);tx.objectStore('records').delete(id);await done;}
 async setting(id,value){const tx=this.db.transaction('settings',value===undefined?'readonly':'readwrite');if(value===undefined)return (await requestPromise(tx.objectStore('settings').get(id)))?.value;const done=transactionPromise(tx);tx.objectStore('settings').put({id,value});await done;}
}
