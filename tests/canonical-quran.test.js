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
