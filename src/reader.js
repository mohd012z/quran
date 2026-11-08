export const DEFAULT_READER_SETTINGS=Object.freeze({translation:true,tajweed:false,size:30,theme:'light',qari:'ar.alafasy'});
export const TAJWEED_RULES=Object.freeze([
 {id:'madd',name:'Mad',description:'Panjang bacaan'},
 {id:'ikhfa',name:'Ikhfa',description:'Bunyi samar'},
 {id:'qalqala',name:'Qalqalah',description:'Lantunan'}
]);
const STORAGE_KEY='quran-reader-v1';
export function sanitizeReaderSettings(input){
 const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
 return {
 translation:typeof s.translation==='boolean'?s.translation:true,
 tajweed:typeof s.tajweed==='boolean'?s.tajweed:false,
 size:Number.isInteger(s.size)?Math.min(52,Math.max(22,s.size)):30,
 theme:['light','dark'].includes(s.theme)?s.theme:'light',
 qari:['ar.alafasy','ar.husary','ar.minshawi'].includes(s.qari)?s.qari:'ar.alafasy'
 };
}
export function loadReaderSettings(storage=globalThis.localStorage){
 try{return sanitizeReaderSettings(JSON.parse(storage?.getItem(STORAGE_KEY)||'null'))}catch{return {...DEFAULT_READER_SETTINGS}}
}
export function saveReaderSettings(settings,storage=globalThis.localStorage){
 try{storage?.setItem(STORAGE_KEY,JSON.stringify(sanitizeReaderSettings(settings)));return true}catch{return false}
}
export function filterVerses(verses,query='',scope='all',bookmarks=[]){
 if(!Array.isArray(verses))throw new TypeError('Invalid verse list');
 if(!['all','bookmarks'].includes(scope))throw new Error('Invalid filter');
 const q=String(query).trim().toLocaleLowerCase();
 const saved=new Set(bookmarks);
 return verses.filter(v=>(scope!=='bookmarks'||saved.has(v.number))&&(!q||String(v.numberInSurah)===q||String(v.arabic||'').toLocaleLowerCase().includes(q)));
}
