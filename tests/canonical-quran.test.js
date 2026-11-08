import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AYAH_COUNTS,parseTanzilLines,buildCanonical,validateCanonical} from '../scripts/canonical-quran.js';
const notice='Tanzil Quran Text\nCopyright (C) 2007-2021 Tanzil Project\nLicense: Creative Commons Attribution 3.0\nCHANGING IT IS NOT ALLOWED\nhttps://tanzil.net';
const hash=s=>createHash('sha256').update(s).digest('hex');
test('canonical Surah and Ayah totals',()=>{assert.equal(AYAH_COUNTS.length,114);assert.equal(AYAH_COUNTS.reduce((a,b)=>a+b,0),6236)});
test('reject missing Surahs and unsupported edition',()=>{assert.throws(()=>validateCanonical({edition:'tanzil-uthmani-v1.1',surahs:[]}),/114/);assert.throws(()=>validateCanonical({edition:'other',surahs:[]}),/edition/)});
test('reject duplicate, skipped, reordered and malformed lines',()=>{
 assert.throws(()=>parseTanzilLines('1|1|بِسْمِ\n1|1|بِسْمِ'),/Duplicate/);
 assert.throws(()=>parseTanzilLines('1|2|بِسْمِ'),/Duplicate/);
 assert.throws(()=>parseTanzilLines('1|1'),/Invalid/);
 assert.throws(()=>parseTanzilLines('115|1|بِسْمِ'),/Duplicate/);
});
test('reject tampered input and incomplete Quran',()=>{
 const text='1|1|بِسْمِ';
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash('other'),notice}),/checksum/);
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash(text),notice}),/structure/);
});
test('reject invalid attribution and hash fields',()=>{
 const data={edition:'tanzil-uthmani-v1.1',surahs:Array.from({length:114},(_,i)=>({number:i+1,ayahs:[]})),source:'https://tanzil.net/',license:'CC-BY-3.0',notice,sourceSha256:'0'.repeat(64)};
 assert.throws(()=>validateCanonical({...data,notice:''}),/provenance/);
 assert.throws(()=>validateCanonical({...data,sourceSha256:'bad'}),/SHA-256/);
});

test('source hash uses raw UTF-8 bytes including BOM and line endings',()=>{
 const text='1|1|بِسْمِ';
 const bytes=Buffer.from('\uFEFF'+text+'\r\n','utf8');
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash(bytes),notice,sourceBytes:bytes}),/original source bytes/);
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash(bytes),notice}),/checksum/);
});
test('reject incomplete Tanzil notice before importing',()=>{
 const text='1|1|بِسْمِ';
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash(text),notice:'Tanzil Project'}),/provenance/);
});

const syntheticLines=()=>AYAH_COUNTS.flatMap((n,i)=>Array.from({length:n},(_,j)=>`${i+1}|${j+1}|بِسْمِ ${i+1} ${j+1}`));
const makeSynthetic=(eol='\n',bom='')=>bom+syntheticLines().join(eol)+eol;
test('complete synthetic 6236-verse round trip is deterministic',()=>{
 const source=makeSynthetic();
 const options={sourceSha256:hash(Buffer.from(source,'utf8')),notice,sourceBytes:Buffer.from(source,'utf8')};
 const a=buildCanonical(source,options),b=buildCanonical(source,options);
 assert.equal(a.surahs.length,114);
 assert.equal(a.surahs.reduce((n,s)=>n+s.ayahs.length,0),6236);
 assert.deepEqual(a,b);
 assert.equal(validateCanonical(a).contentSha256,a.contentSha256);
 assert.equal(a.surahs[0].ayahs[0].text,'بِسْمِ 1 1');
 assert.equal(a.surahs[113].ayahs[5].text,'بِسْمِ 114 6');
});
test('raw source checksum distinguishes LF CRLF BOM and trailing newline',()=>{
 const lf=makeSynthetic(),crlf=makeSynthetic('\r\n'),bom=makeSynthetic('\n','\uFEFF'),withoutFinal=lf.slice(0,-1);
 const variants=[lf,crlf,bom,withoutFinal];
 const hashes=variants.map(v=>hash(Buffer.from(v,'utf8')));
 assert.equal(new Set(hashes).size,4);
 for(let i=0;i<variants.length;i++){
  const sourceBytes=Buffer.from(variants[i],'utf8');
  const data=buildCanonical(variants[i],{sourceSha256:hashes[i],notice,sourceBytes});
  assert.equal(data.sourceSha256,hashes[i]);
  assert.equal(data.surahs.length,114);
 }
 assert.throws(()=>buildCanonical(crlf,{sourceSha256:hashes[0],notice}),/checksum/);
});
test('Unicode NFC differences remain distinct without rewriting source',()=>{
 const source=makeSynthetic();
 const decomposed='ا\u0654';
 const composed='\u0623';
 const a=source.replace('بِسْمِ 1 1',`بِسْمِ ${decomposed} 1 1`);
 const b=source.replace('بِسْمِ 1 1',`بِسْمِ ${composed} 1 1`);
 assert.notEqual(hash(a),hash(b));
 const aa=buildCanonical(a,{sourceSha256:hash(a),notice});
 const bb=buildCanonical(b,{sourceSha256:hash(b),notice});
 assert.notEqual(aa.surahs[0].ayahs[0].sha256,bb.surahs[0].ayahs[0].sha256);
 assert.ok(aa.surahs[0].ayahs[0].text.includes(decomposed));
 assert.ok(bb.surahs[0].ayahs[0].text.includes(composed));
});
test('reject altered synthetic verse and changed source bytes',()=>{
 const source=makeSynthetic();
 const sourceSha256=hash(source);
 const changed=source.replace('1|1|بِسْمِ 1 1','1|1|بِسْمِ 1 2');
 assert.throws(()=>buildCanonical(changed,{sourceSha256,notice}),/checksum/);
 const valid=buildCanonical(source,{sourceSha256,notice});
 valid.surahs[0].ayahs[0].text+='!';
 assert.throws(()=>validateCanonical(valid),/Verse SHA-256 mismatch/);
});
