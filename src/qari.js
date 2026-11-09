// Only allow published AlQuran Cloud edition identifiers; no arbitrary audio URLs.
export const QARIS=Object.freeze([
  {id:'ar.alafasy',name:'Mishary Rashid Alafasy'},
  {id:'ar.husary',name:'Mahmoud Khalil Al-Husary'},
  {id:'ar.minshawi',name:'Mohamed Siddiq al-Minshawi'}
]);
export function validateQari(id){
  if(!QARIS.some(q=>q.id===id))throw new Error('Unsupported Qari edition');
  return id;
}
export function audioUrl(verseNumber,qari){
  validateQari(qari);
  if(!Number.isInteger(verseNumber)||verseNumber<1||verseNumber>6236)throw new Error('Invalid Ayah identifier');
  return 'https://cdn.islamic.network/quran/audio/128/'+qari+'/'+verseNumber+'.mp3';
}

export function validateOfflineAlafasyManifest(manifest){
 if(manifest?.schema!==1||manifest.qari!=='ar.alafasy'||manifest.licenseReviewed!==true||!manifest.licenseReference?.trim()||!Array.isArray(manifest.files))throw Error('Unreviewed Alafasy audio manifest');
 const seen=new Set();
 for(const file of manifest.files){
  if(!Number.isInteger(file?.verse)||file.verse<1||file.verse>6236||seen.has(file.verse)||file.path!==('/offline/alafasy/'+file.verse+'.mp3')||!(/^[a-f0-9]{64}$/.test(file.sha256||'')))throw Error('Invalid offline audio entry');
  seen.add(file.verse);
 }
 return manifest;
}

export async function verifyOfflineAlafasyRecording(bytes,entry,{digest=globalThis.crypto?.subtle?.digest?.bind(globalThis.crypto.subtle)}={}){
 if(!(bytes instanceof Uint8Array)||bytes.byteLength<4||typeof digest!=='function'||!entry||!(/^[a-f0-9]{64}$/.test(entry.sha256||'')))throw Error('Unverified offline audio recording');
 const hash=Array.from(new Uint8Array(await digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==entry.sha256)throw Error('Offline audio SHA-256 mismatch');
 if(bytes[0]!==0x49||bytes[1]!==0x44||bytes[2]!==0x33) {
  if(bytes[0]!==0xff||(bytes[1]&0xe0)!==0xe0)throw Error('Offline recording is not recognized MP3');
 }
 return bytes;
}
