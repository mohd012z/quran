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
