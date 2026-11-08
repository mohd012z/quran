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
