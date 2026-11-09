import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';

export const AYAH_COUNTS=Object.freeze([7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]);
const sha256=s=>createHash('sha256').update(s).digest('hex');
const REQUIRED_NOTICE=['Tanzil Quran Text','Copyright (C)','Tanzil Project','Creative Commons Attribution 3.0','CHANGING IT IS NOT ALLOWED','tanzil.net'];
const fail=s=>{throw new Error(s)};
export function validateCanonical(input){
 if(!input||input.edition!=='tanzil-uthmani-v1.1'||!Array.isArray(input.surahs))fail('Unsupported canonical edition');
 if(input.surahs.length!==114)fail('Expected 114 Surahs');
 if(input.source!=='https://tanzil.net/'||input.license!=='CC-BY-3.0'||typeof input.notice!=='string'||!REQUIRED_NOTICE.every(part=>input.notice.includes(part)))fail('Missing Tanzil provenance or notice');
 if(!/^[a-f0-9]{64}$/.test(input.sourceSha256||''))fail('Missing source SHA-256');
 let count=0;const lines=[];
 for(let i=0;i<114;i++){
  const s=input.surahs[i];
  if(s?.number!==i+1||!Array.isArray(s.ayahs)||s.ayahs.length!==AYAH_COUNTS[i])fail('Surah structure mismatch at '+(i+1));
  for(let j=0;j<s.ayahs.length;j++){
   const a=s.ayahs[j];count++;
   if(a?.number!==j+1||typeof a.text!=='string'||!a.text.trim()||/[\u0000-\u001f]/u.test(a.text)||!/[\u0621-\u064a]/u.test(a.text))fail('Invalid Arabic verse '+(i+1)+':'+(j+1));
   if(!/^[a-f0-9]{64}$/.test(a.sha256||'')||sha256(a.text)!==a.sha256)fail('Verse SHA-256 mismatch '+(i+1)+':'+(j+1));
   lines.push(i+1+'|'+(j+1)+'|'+a.text);
  }
 }
 if(count!==6236)fail('Expected 6236 Ayahs');
 const digest=sha256(lines.join('\n'));
 if(digest!==input.contentSha256)fail('Canonical content SHA-256 mismatch');
 return {surahs:114,ayahs:count,contentSha256:digest,edition:input.edition};
}
export function parseTanzilLines(text){
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));
 const surahs=AYAH_COUNTS.map((_,i)=>({number:i+1,ayahs:[]}));
 for(const line of lines){
  const m=/^(\d+)\|(\d+)\|(.+)$/.exec(line);
  if(!m)fail('Invalid Tanzil line');
  const s=Number(m[1]),a=Number(m[2]),arabic=m[3];
  if(!Number.isInteger(s)||s<1||s>114||!Number.isInteger(a)||a!==surahs[s-1].ayahs.length+1)fail('Duplicate or out-of-order verse');
  surahs[s-1].ayahs.push({number:a,text:arabic,sha256:sha256(arabic)});
 }
 return surahs;
}
export function buildCanonical(text,{sourceSha256,notice,sourceBytes}){
 if(sourceBytes!==undefined&&(!Buffer.isBuffer(sourceBytes)||sourceBytes.toString('utf8')!==text))fail('Invalid original source bytes');
 if(sha256(sourceBytes??Buffer.from(text,'utf8'))!==sourceSha256)fail('Source download checksum mismatch');
 const surahs=parseTanzilLines(text);
 const contentSha256=sha256(surahs.flatMap(s=>s.ayahs.map(a=>s.number+'|'+a.number+'|'+a.text)).join('\n'));
 const data={edition:'tanzil-uthmani-v1.1',source:'https://tanzil.net/',license:'CC-BY-3.0',notice,sourceSha256,contentSha256,surahs};
 validateCanonical(data);return data;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)){
 const [input,hash,noticeFile,output]=process.argv.slice(2);
 if(!input||!hash||!noticeFile||!output)fail('Usage: node scripts/canonical-quran.js INPUT_TXT SOURCE_SHA256 NOTICE_TXT OUTPUT_JSON');
 const sourceBytes=await readFile(input);
 const data=buildCanonical(sourceBytes.toString('utf8'),{sourceSha256:hash,notice:await readFile(noticeFile,'utf8'),sourceBytes});
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(data),'utf8');
 console.log(JSON.stringify(validateCanonical(data)));
}
