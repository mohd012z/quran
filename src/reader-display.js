export const DEFAULT_DISPLAY=Object.freeze({latin:false,latinSize:16,translationSize:16,readerPrompt:true});
export function sanitizeDisplay(input){
 const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
 const size=(v,d)=>Number.isInteger(v)?Math.min(30,Math.max(12,v)):d;
 return {latin:typeof s.latin==='boolean'?s.latin:false,latinSize:size(s.latinSize,16),translationSize:size(s.translationSize,16),readerPrompt:typeof s.readerPrompt==='boolean'?s.readerPrompt:true};
}
export function readDisplay(storage=globalThis.localStorage){try{return sanitizeDisplay(JSON.parse(storage?.getItem('quran-display-v1')||'null'))}catch{return {...DEFAULT_DISPLAY}}}
export function saveDisplay(value,storage=globalThis.localStorage){try{storage?.setItem('quran-display-v1',JSON.stringify(sanitizeDisplay(value)));return true}catch{return false}}
export function validateJuzPayload(payload,juz){if(!Number.isInteger(juz)||juz<1||juz>30||!Array.isArray(payload?.ayahs)||!payload.ayahs.length)throw Error('Invalid Juz response');const a=payload.ayahs[0];if(!Number.isInteger(a?.surah?.number)||a.surah.number<1||a.surah.number>114||!Number.isInteger(a.numberInSurah)||a.numberInSurah<1||a.juz!==juz)throw Error('Juz boundary not verified');return {surah:a.surah.number,ayah:a.numberInSurah}}
export function groupBookmarks(bookmarks,surahs){const byNumber=new Map((surahs||[]).map(s=>[s.number,s]));return (bookmarks||[]).filter(Number.isInteger).map(number=>({number,surah:byNumber.get(number)}))}
