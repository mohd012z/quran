// Offline research manifest: metadata only; no copyrighted corpus is bundled.
const SHA=/^[a-f0-9]{64}$/;
export function validateOfflineManifest(manifest){
 if(!manifest||manifest.schema!==1||!Array.isArray(manifest.datasets))throw Error('Invalid offline manifest');
 const seen=new Set();
 return Object.freeze(manifest.datasets.map(d=>{
  if(!d||typeof d.id!=='string'||!/^[-a-z0-9_.]+$/.test(d.id)||seen.has(d.id)||!['arabic','tajweed','translation','audio-timing'].includes(d.kind)||!SHA.test(d.sha256||'')||!d.source||!d.version||!d.license||d.reviewed!==true||!d.edition||!Number.isInteger(d.ayahCount)||d.ayahCount<1||d.ayahCount>6236||!d.provenanceUrl||!/^https:\/\//.test(d.provenanceUrl))throw Error('Unverified offline dataset');
  if(d.kind==='audio-timing'&&(!d.reciter||!SHA.test(d.recordingSha256||'')))throw Error('Audio recording identity missing');
  seen.add(d.id);return Object.freeze({...d});
 }));
}
export function offlineFeatureState(manifest,kind,edition){
 try{const entries=validateOfflineManifest(manifest);return entries.some(x=>x.kind===kind&&x.edition===edition)?'manifest-verified':'unavailable'}catch{return 'unavailable'}
}
