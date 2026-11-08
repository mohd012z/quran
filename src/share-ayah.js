const BASE='https://quran.com/';
export function verseReference(surah,ayah){
 if(!Number.isInteger(surah)||surah<1||surah>114||!Number.isInteger(ayah)||ayah<1||ayah>286)throw new RangeError('Invalid Quran verse reference');
 return surah+':'+ayah;
}
export function verseUrl(surah,ayah){return BASE+verseReference(surah,ayah)}
export function verseShareText({surah,ayah,arabic}){
 const reference=verseReference(surah,ayah);
 if(typeof arabic!=='string'||!arabic.trim()||arabic.length>5000)throw new TypeError('Verified Arabic verse text required');
 return arabic.trim()+'\n\nAl-Quran '+reference+'\n'+verseUrl(surah,ayah);
}
export function shareDestination(provider,verse){
 const url=verseUrl(verse.surah,verse.ayah),text=verseShareText(verse);
 if(provider==='whatsapp')return 'https://api.whatsapp.com/send?text='+encodeURIComponent(text);
 if(provider==='telegram')return 'https://t.me/share/url?url='+encodeURIComponent(url)+'&text='+encodeURIComponent(verse.arabic.trim()+'\nAl-Quran '+verseReference(verse.surah,verse.ayah));
 if(provider==='facebook')return 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url);
 throw new RangeError('Unsupported share destination');
}
export async function shareVerseNative(verse,{navigatorObject=globalThis.navigator}={}){
 const text=verseShareText(verse),url=verseUrl(verse.surah,verse.ayah);
 if(typeof navigatorObject?.share!=='function')return 'unavailable';
 try{await navigatorObject.share({title:'Al-Quran '+verseReference(verse.surah,verse.ayah),text,url});return 'shared'}catch(e){if(e?.name==='AbortError')return 'cancelled';throw e}
}
