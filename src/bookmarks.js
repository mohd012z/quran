const KEY='quran-bookmarks-v1';
export function normalizeBookmarks(input){
  if(!Array.isArray(input))return [];
  return [...new Set(input.filter(n=>Number.isInteger(n)&&n>=1&&n<=6236))].sort((a,b)=>a-b);
}
export function readBookmarks(storage=globalThis.localStorage){
  try{return normalizeBookmarks(JSON.parse(storage.getItem(KEY)||'[]'))}catch{return []}
}
export function toggleBookmark(current,verseNumber,storage=globalThis.localStorage){
  if(!Number.isInteger(verseNumber)||verseNumber<1||verseNumber>6236)throw new Error('Invalid verse number');
  const items=normalizeBookmarks(current);
  const next=normalizeBookmarks(items.includes(verseNumber)?items.filter(n=>n!==verseNumber):[...items,verseNumber]);
  try{storage.setItem(KEY,JSON.stringify(next))}catch{}
  return next;
}
