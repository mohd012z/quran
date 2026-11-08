import test from 'node:test';
import assert from 'node:assert/strict';
import {audioUrl,validateQari,QARIS} from '../src/qari.js';
import {renderSegments,verifyTajweedEdition} from '../src/tajweed.js';
import {webcrypto} from 'node:crypto';
test('Qari allowlist has unique IDs',()=>{assert.equal(new Set(QARIS.map(q=>q.id)).size,QARIS.length);for(const q of QARIS)assert.equal(validateQari(q.id),q.id)});
test('Audio URL cannot inject external hosts or invalid verse',()=>{
 assert.equal(audioUrl(1,'ar.alafasy'),'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3');
 assert.throws(()=>audioUrl(1,'https://evil.test'),/Unsupported/);
 assert.throws(()=>audioUrl(6237,'ar.alafasy'),/Invalid/);
});
test('Tajweed renderer rejects overlaps, unsupported rules, and bad spans',()=>{
 assert.deepEqual(renderSegments('abcdef',[{start:1,end:3,rule:'madd'}]),[{text:'a',rule:null},{text:'bc',rule:'madd'},{text:'def',rule:null}]);
 assert.throws(()=>renderSegments('abcdef',[{start:1,end:4,rule:'madd'},{start:3,end:5,rule:'ikhfa'}]),/Invalid/);
 assert.throws(()=>renderSegments('abc',[{start:0,end:2,rule:'unknown'}]),/Invalid/);
});
test('Tajweed annotations require a reviewed matching edition',async()=>{
 globalThis.crypto??=webcrypto;
 const text='بِسْمِ';
 const hash=Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),n=>n.toString(16).padStart(2,'0')).join('');
 await assert.doesNotReject(verifyTajweedEdition(text,{reviewed:true,edition:'quran-uthmani',sha256:hash}));
 await assert.rejects(verifyTajweedEdition(text,{reviewed:false,edition:'quran-uthmani',sha256:hash}),/Unreviewed/);
 await assert.rejects(verifyTajweedEdition(text+'X',{reviewed:true,edition:'quran-uthmani',sha256:hash}),/checksum/);
});
