// IndexedDB byte cache for on-demand Alafasy audio.
// Verse numbers are keys; raw MP3 bytes are stored and RE-VERIFIED against
// alafasy-manifest.json on every read, so the cache is a convenience, never
// a trust anchor. A test harness can inject an in-memory store.
const DB_NAME='quran-alafasy-on-demand';
const DB_VERSION=1;
const STORE='verses';

export function memoryAudioCache(){
  return _sharedMemoryCache;
}
const _sharedMemoryCache=(()=>{
  const map=new Map();
  return {
    async has(verse){return map.has(verse)},
    async get(verse){const r=map.get(verse);return r?new Uint8Array(r):null},
    async put(verse,bytes){map.set(verse,new Uint8Array(bytes))}
  };
})();

export function idbAudioCache(){
  const open=()=>new Promise((resolve,reject)=>{
    if(typeof indexedDB==='undefined')return reject(new Error('IndexedDB unavailable'));
    const request=indexedDB.open(DB_NAME,DB_VERSION);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'verse'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(new Error('IndexedDB open failed'));
  });
  return {
    async has(verse){
      const db=await open();
      try{
        return await new Promise((resolve,reject)=>{
          const req=db.transaction(STORE,'readonly').objectStore(STORE).count(verse);
          req.onsuccess=()=>resolve(req.result>0);
          req.onerror=()=>reject(new Error('IndexedDB count failed'));
        });
      }finally{db.close()}
    },
    async get(verse){
      const db=await open();
      try{
        const record=await new Promise((resolve,reject)=>{
          const req=db.transaction(STORE,'readonly').objectStore(STORE).get(verse);
          req.onsuccess=()=>resolve(req.result??null);
          req.onerror=()=>reject(new Error('IndexedDB read failed'));
        });
        if(!record)return null;
        if(!(record.bytes instanceof Uint8Array))return null;
        return record.bytes;
      }finally{db.close()}
    },
    async put(verse,bytes){
      const db=await open();
      try{
        await new Promise((resolve,reject)=>{
          const tx=db.transaction(STORE,'readwrite');
          tx.objectStore(STORE).put({verse,bytes,storedAt:Date.now()});
          tx.oncomplete=resolve;
          tx.onerror=()=>reject(new Error('IndexedDB write failed'));
        });
      }finally{db.close()}
    }
  };
}
