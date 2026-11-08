const KEY='quran-mushaf-v1';
export const DEFAULT_MUSHAF=Object.freeze({surah:1,ayah:1,repeat:1,guide:true,mode:'cards'});
export function normalizeMushaf(input){
 const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
 return {surah:Number.isInteger(s.surah)&&s.surah>=1&&s.surah<=114?s.surah:1,ayah:Number.isInteger(s.ayah)&&s.ayah>=1&&s.ayah<=286?s.ayah:1,repeat:[1,2,3].includes(s.repeat)?s.repeat:1,guide:typeof s.guide==='boolean'?s.guide:true,mode:['cards','flow'].includes(s.mode)?s.mode:'cards'};
}
export function readMushaf(storage=globalThis.localStorage){try{return normalizeMushaf(JSON.parse(storage?.getItem(KEY)||'null'))}catch{return {...DEFAULT_MUSHAF}}}
export function saveMushaf(state,storage=globalThis.localStorage){try{storage?.setItem(KEY,JSON.stringify(normalizeMushaf(state)));return true}catch{return false}}
export function swipeDirection(start,end,{minimumX=72,ratio=1.5}={}){
 if(!start||!end)return 0;
 const dx=end.x-start.x,dy=end.y-start.y;
 return Math.abs(dx)>=minimumX&&Math.abs(dx)>Math.abs(dy)*ratio?(dx<0?1:-1):0;
}
export function nextRepeatCount(repeat,played){if(![1,2,3].includes(repeat)||!Number.isInteger(played)||played<0)throw new Error('Invalid repeat state');return played+1<repeat}
