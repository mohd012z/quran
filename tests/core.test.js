import test from 'node:test';import assert from 'node:assert/strict';import{renderSegments}from '../src/tajweed.js';import{alignEditions,getJuz,json}from '../src/api.js';
test('plain Arabic preserved',()=>assert.deepEqual(renderSegments('بِسْمِ'),[{text:'بِسْمِ',rule:null}]));
test('exact Tajweed offsets',()=>assert.deepEqual(renderSegments('abcd',[{start:1,end:3,rule:'madd'}]),[{text:'a',rule:null},{text:'bc',rule:'madd'},{text:'d',rule:null}]));
test('overlap rejected',()=>assert.throws(()=>renderSegments('abcd',[{start:0,end:3,rule:'madd'},{start:2,end:4,rule:'ikhfa'}])));
test('unknown Tajweed rejected',()=>assert.throws(()=>renderSegments('abc',[{start:0,end:1,rule:'x'}])));
test('missing Arabic rejected',()=>assert.throws(()=>renderSegments(null)));
const edition=(number,text,audio)=>({ayahs:[{number,numberInSurah:1,text,audio}]});
test('valid editions align',()=>assert.equal(alignEditions([edition(1,'بِسْمِ'),edition(1,'In the name'),edition(1,'تفسير'),edition(1,'','https://example.org/1.mp3')])[0].number,1));
test('mismatched global verse IDs rejected',()=>assert.throws(()=>alignEditions([edition(1,'بِسْمِ'),edition(2,'wrong'),edition(1,'تفسير'),edition(1,'','https://example.org/1.mp3')])));
test('missing translation rejected',()=>assert.throws(()=>alignEditions([edition(1,'بِسْمِ'),edition(1,''),edition(1,'تفسير'),edition(1,'')])));
test('non-HTTPS audio unavailable',()=>assert.equal(alignEditions([edition(1,'بِسْمِ'),edition(1,'In the name'),edition(1,'تفسير'),edition(1,'','http://example.org/1.mp3')])[0].audio,null));
test('invalid Juz rejected',()=>assert.throws(()=>getJuz(31),/Invalid Juz/));

test('API rejects malformed JSON payload',async()=>{const original=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({code:200,status:'OK'})});try{await assert.rejects(json('/surah/1'),/Invalid Quran API response/)}finally{globalThis.fetch=original}});
test('API rejects HTTP errors',async()=>{const original=globalThis.fetch;globalThis.fetch=async()=>({ok:false,status:503});try{await assert.rejects(json('/surah/1'),/HTTP 503/)}finally{globalThis.fetch=original}});
test('Juz 1 uses supported endpoint',async()=>{const original=globalThis.fetch;let path='';globalThis.fetch=async url=>{path=url;return {ok:true,json:async()=>({code:200,status:'OK',data:{ayahs:[{number:1,surah:{number:1}}]}})}};try{const data=await getJuz(1);assert.equal(data.ayahs[0].number,1);assert.match(path,/\/juz\/1\/quran-uthmani$/)}finally{globalThis.fetch=original}});
