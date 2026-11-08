// Research-only adapters. No third-party corpus is bundled or trusted by default.
const SHA=/^[a-f0-9]{64}$/;
const RULES=new Set(['madd','madd_2','madd_246','madd_muttasil','madd_munfasil','madd_6','ghunnah','ikhfa','ikhfa_shafawi','idghaam_ghunnah','idghaam_no_ghunnah','idghaam_mutajaanisain','idghaam_mutaqaaribain','idghaam_shafawi','iqlab','qalqala','qalqalah']);
export const RESEARCH_SOURCES=Object.freeze([
 {id:'quran-ws/quran-tajweed',role:'tajweed',license:'CC BY 4.0',status:'candidate'},
 {id:'cpfair/quran-tajweed',role:'tajweed',license:'verify exact dataset notice',status:'candidate'},
 {id:'cpfair/quran-align',role:'audio-timing',license:'CC BY 4.0',status:'candidate'}
]);
async function digest(text){const bytes=new TextEncoder().encode(text);const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')}
export async function verifyDataset(text,manifest){
 if(typeof text!=='string'||!text||!manifest||manifest.reviewed!==true||!SHA.test(manifest.sha256||'')||typeof manifest.source!=='string'||!manifest.source||typeof manifest.license!=='string'||!manifest.license||typeof manifest.edition!=='string'||!manifest.edition||!Number.isInteger(manifest.surah)||manifest.surah<1||manifest.surah>114||!Number.isInteger(manifest.ayah)||manifest.ayah<1||!manifest.version)throw Error('Unverified Quran dataset');
 if(await digest(text)!==manifest.sha256)throw Error('Quran dataset checksum mismatch');
 return Object.freeze({...manifest});
}
export function validateTajweedSpans(text,spans){
 if(typeof text!=='string'||!text||!Array.isArray(spans))throw Error('Invalid Tajweed text or spans');
 let cursor=0;
 return spans.map(s=>{if(!s||!RULES.has(s.rule)||!Number.isInteger(s.start)||!Number.isInteger(s.end)||s.start<cursor||s.end>text.length||s.end<=s.start||!s.text||text.slice(s.start,s.end)!==s.text)throw Error('Tajweed span does not match exact edition');cursor=s.end;return Object.freeze({...s})});
}
export function validateWordTimings(words,segments,{reciter,recordingSha256,edition,expectedReciter,expectedRecordingSha256,expectedEdition}={}){
 if(!reciter||reciter!==expectedReciter||!SHA.test(recordingSha256||'')||recordingSha256!==expectedRecordingSha256||!edition||edition!==expectedEdition||!Array.isArray(words)||!words.length||!words.every(w=>typeof w==='string'&&w.length)||!Array.isArray(segments)||!segments.length)throw Error('Audio alignment provenance mismatch');
 let prevEnd=0,prevWord=0;
 return segments.map(s=>{if(!Array.isArray(s)||s.length!==4||!s.every(Number.isInteger))throw Error('Invalid audio segment');const [from,to,start,end]=s;if(from!==prevWord||to<=from||to>words.length||start<prevEnd||end<=start)throw Error('Incomplete or overlapping word alignment');prevWord=to;prevEnd=end;return Object.freeze({from,to,startMs:start,endMs:end})}).filter(Boolean).map(s=>s);
}
export function activeWordAt(timing,timeMs){if(!Number.isFinite(timeMs)||timeMs<0)return null;const hit=timing.find(s=>timeMs>=s.startMs&&timeMs<s.endMs);return hit&&hit.to===hit.from+1?hit.from:null}
