import test from 'node:test';
import assert from 'node:assert/strict';
import {getOfflineJuzStart,getJuzStart} from '../src/api.js';

test('getOfflineJuzStart rejects invalid juz numbers',async()=>{
 for(const n of [0,31,'1',1.5,null])await assert.rejects(getOfflineJuzStart(n),/Invalid Juz/);
});

test('getOfflineJuzStart derives the first ayah of a juz from a verified offline corpus',async()=>{
 // Minimal corpus that passes verifyOfflineCorpus(): 114 surahs, 6236 ayahs,
 // Arabic containing U+0600..U+06FF, nonempty Malay, sequential global IDs.
 const counts=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
 // Canonical juz starts (Hafs): first (surah, ayah) of each of the 30 juz.
 const starts=[[1,1],[2,142],[2,253],[3,93],[4,24],[4,148],[5,77],[6,111],[7,88],[8,41],[9,93],[11,6],[12,53],[15,1],[16,92],[17,1],[18,75],[21,1],[23,1],[25,21],[27,56],[29,46],[33,31],[36,28],[39,32],[41,47],[46,1],[51,31],[58,1],[67,1]];
 const juzOf=new Array(6237).fill(0);
 let g=0;
 for(let si=0;si<114;si++)for(let ai=0;ai<counts[si];ai++){
  g++;
  const hit=starts.findIndex(([s,a])=>s===si+1&&a===ai+1);
  juzOf[g]=hit===-1?juzOf[g-1]:hit+1;
 }
 const surahs=counts.map((c,si)=>({
  number:si+1,name:'سُورَة',englishName:'Surah '+(si+1),englishNameTranslation:'Test',revelationType:si===0?'Meccan':'Medinan',
  ayahs:Array.from({length:c},(_,ai)=>({number:counts.slice(0,si).reduce((x,y)=>x+y,0)+ai+1,numberInSurah:ai+1,juz:juzOf[counts.slice(0,si).reduce((x,y)=>x+y,0)+ai+1],arabic:'بِسْمِ',malay:'Melayu'}))
 }));
 const corpus={surahs};
 const corpusBytes=new TextEncoder().encode(JSON.stringify(corpus));
 const sha=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',corpusBytes)),b=>b.toString(16).padStart(2,'0')).join('');
 const fetchImpl=async url=>{
  if(url==='/offline/corpus-manifest.json')return {ok:true,json:async()=>({schema:1,arabicEdition:'quran-uthmani',translationEdition:'ms.basmeih',sha256:sha,sourceReviewed:true,licenseReference:'x',sourceUrl:'https://tanzil.net/'})};
  if(url==='/offline/corpus.json')return {ok:true,arrayBuffer:async()=>corpusBytes.buffer};
  throw new Error('unexpected fetch '+url);
 };
 // Juz 1 starts at 1:1; juz 30 starts at 67:1; a mid-juz must be impossible.
 assert.deepEqual(await getOfflineJuzStart(1,{fetchImpl}),{surah:1,ayah:1});
 assert.deepEqual(await getOfflineJuzStart(30,{fetchImpl}),{surah:67,ayah:1});
 assert.deepEqual(await getOfflineJuzStart(2,{fetchImpl}),{surah:2,ayah:142});
 assert.deepEqual(await getOfflineJuzStart(3,{fetchImpl}),{surah:2,ayah:253});
});

test('getJuzStart falls back to the API only on a clean offline 404',async()=>{
 const online={ayahs:[{number:1,numberInSurah:253,juz:3,surah:{number:2},text:'x'}]};
 let api=0;
 const result=await getJuzStart(3,{fetchImpl:async(url)=>{
  if(url==='/offline/corpus-manifest.json')return {ok:false,status:404};
  if(typeof url==='string'&&url.includes('/juz/')){api++;return {ok:true,json:async()=>({code:200,status:'OK',data:online})}}
  throw new Error('unexpected '+url);
 }});
 assert.deepEqual(result,{surah:2,ayah:253});
 assert.equal(api,1);
});

test('getJuzStart surfaces offline verification errors (no silent online fallback)',async()=>{
 await assert.rejects(getJuzStart(1,{offline:true,fetchImpl:async(url)=>{
  if(url==='/offline/corpus-manifest.json')return {ok:false,status:500};
  throw new Error('unexpected '+url);
 }}),/Offline (asset|manifest) unavailable: 500/);
});

test('getJuzStart offline:false goes straight to the API and rejects malformed boundaries',async()=>{
 await assert.rejects(getJuzStart(4,{offline:false,fetchImpl:async(url)=>{
  if(typeof url==='string'&&url.includes('/juz/'))return {ok:true,json:async()=>({code:200,status:'OK',data:{ayahs:[{number:1,numberInSurah:24,juz:4}]}})}
  throw new Error('unexpected '+url);
 }}),/Juz payload boundary missing/);
});
