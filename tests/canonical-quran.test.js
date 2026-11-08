import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {AYAH_COUNTS,parseTanzilLines,buildCanonical,validateCanonical} from '../scripts/canonical-quran.js';
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
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash('other'),notice:'Tanzil Project'}),/checksum/);
 assert.throws(()=>buildCanonical(text,{sourceSha256:hash(text),notice:'Tanzil Project'}),/structure/);
});
test('reject invalid attribution and hash fields',()=>{
 const data={edition:'tanzil-uthmani-v1.1',surahs:Array.from({length:114},(_,i)=>({number:i+1,ayahs:[]})),source:'https://tanzil.net/',license:'CC-BY-3.0',notice:'Tanzil Project',sourceSha256:'0'.repeat(64)};
 assert.throws(()=>validateCanonical({...data,notice:''}),/provenance/);
 assert.throws(()=>validateCanonical({...data,sourceSha256:'bad'}),/SHA-256/);
});
