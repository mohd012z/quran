// Annotations must be independently reviewed and match the exact edition text.
// Offsets are UTF-16 code units, matching JavaScript slice() and the current renderer.
const RULES=new Set(['madd','ikhfa','qalqala']);
export function renderSegments(text,annotations=[]){
  if(typeof text!=='string'||!text)throw new Error('Missing Arabic text');
  if(!Array.isArray(annotations))throw new Error('Invalid Tajweed annotation collection');
  const marks=[...annotations].sort((a,b)=>a.start-b.start);
  let cursor=0;const segments=[];
  for(const a of marks){
    if(!a||!Number.isInteger(a.start)||!Number.isInteger(a.end)||a.start<cursor||a.end>text.length||a.end<=a.start||!RULES.has(a.rule))throw new Error('Invalid Tajweed annotation');
    if(cursor<a.start)segments.push({text:text.slice(cursor,a.start),rule:null});
    segments.push({text:text.slice(a.start,a.end),rule:a.rule});cursor=a.end;
  }
  if(cursor<text.length)segments.push({text:text.slice(cursor),rule:null});
  return segments;
}
export async function verifyTajweedEdition(text,manifest){
  if(typeof text!=='string'||!manifest||manifest.reviewed!==true||manifest.edition!=='quran-uthmani'||!/^([a-f0-9]{64})$/.test(manifest.sha256||''))throw new Error('Unreviewed Tajweed edition');
  const bytes=new TextEncoder().encode(text);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const actual=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
  if(actual!==manifest.sha256)throw new Error('Tajweed edition checksum mismatch');
  return true;
}
