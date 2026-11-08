import test from 'node:test';import assert from 'node:assert/strict';import{selectTranslationEdition,validateTranslationSurah,loadTranslationSurah}from '../src/translations.js';
const arabic=[{numberInSurah:1,arabic:'بسم الله'},{numberInSurah:2,arabic:'الحمد لله'}];
const editions=[{identifier:'ms.basmeih',name:'Abdullah Muhammad Basmeih',language:'ms',type:'translation',format:'text'},{identifier:'id.indonesian',name:'Indonesian',language:'id',type:'translation',format:'text'},{identifier:'en.sahih',name:'Saheeh International',language:'en',type:'translation',format:'text'}];
const response=(edition)=>({status:'OK',data:{number:1,edition:{identifier:edition,type:'translation'},ayahs:[{numberInSurah:1,text:'First translation'},{numberInSurah:2,text:'Second translation'}]}});
test('language editions are explicit and attributed',()=>{for(const lang of ['ms','id','en'])assert.equal(selectTranslationEdition(editions,lang).language,lang);assert.throws(()=>selectTranslationEdition(editions,'ar'))});
test('translation preserves exact ayah indexing and rejects mismatches',()=>{const map=validateTranslationSurah(response('ms.basmeih'),1,editions[0],arabic);assert.equal(map.get(2),'Second translation');assert.throws(()=>validateTranslationSurah(response('ms.basmeih'),2,editions[0],arabic));assert.throws(()=>validateTranslationSurah({...response('ms.basmeih'),data:{...response('ms.basmeih').data,ayahs:[{numberInSurah:2,text:'wrong'},{numberInSurah:1,text:'wrong'}]}},1,editions[0],arabic))});
test('loader verifies metadata and surah response, never fabricates text',async()=>{const calls=[];const fetchImpl=async url=>{calls.push(url);return {ok:true,json:async()=>calls.length===1?{status:'OK',data:editions}:response('ms.basmeih')}};const result=await loadTranslationSurah(1,'ms',arabic,{fetchImpl});assert.equal(result.edition.identifier,'ms.basmeih');assert.equal(result.verses.size,2);assert.match(calls[1],/\/surah\/1\/ms.basmeih$/)});
test('missing edition, bad HTTP and invalid inputs fail closed',async()=>{await assert.rejects(loadTranslationSurah(1,'ms',arabic,{fetchImpl:async()=>({ok:false,status:503})}));await assert.rejects(loadTranslationSurah(115,'ms',arabic));await assert.rejects(loadTranslationSurah(1,'ms',arabic,{fetchImpl:async()=>({ok:true,json:async()=>({status:'OK',data:[]})})}))});

test('reject globally shifted Malay ayat even if local index matches',()=>{const verses=[{number:8,numberInSurah:1},{number:9,numberInSurah:2}];const payload=response('ms.basmeih');payload.data.ayahs=[{number:9,numberInSurah:1,text:'shifted'},{number:10,numberInSurah:2,text:'shifted'}];assert.throws(()=>validateTranslationSurah(payload,1,editions[0],verses),/Translation ayah mismatch/)});
test('reject translation from wrong surah even with matching local ayah',()=>{const payload=response('ms.basmeih');payload.data.ayahs[0].surah={number:2};assert.throws(()=>validateTranslationSurah(payload,1,editions[0],arabic),/Translation ayah mismatch/)});

test('network failure is explicit and cannot fabricate Malay translation',async()=>{await assert.rejects(loadTranslationSurah(2,'ms',[{number:8,numberInSurah:1}],{fetchImpl:async()=>{throw new TypeError('Failed to fetch')}}),/Failed to fetch/)});
test('Al-Baqarah 2:1 and 2:2 remain bound to their own global ayah IDs',async()=>{
 const arabicVerses=[{number:8,numberInSurah:1,arabic:'الٓمٓ'},{number:9,numberInSurah:2,arabic:'ذَٰلِكَ الْكِتَابُ'}];
 const payload={status:'OK',data:{number:2,edition:{identifier:'ms.basmeih',type:'translation'},ayahs:[{number:8,numberInSurah:1,text:'Alif, Laam, Miim.'},{number:9,numberInSurah:2,text:'Kitab Al-Quran ini, tidak ada sebarang syak padanya.'}]}};
 const fetchImpl=async url=>({ok:true,json:async()=>url.includes('/edition?')?{status:'OK',data:editions}:structuredClone(payload)});
 const result=await loadTranslationSurah(2,'ms',arabicVerses,{fetchImpl});
 assert.equal(result.verses.get(1),'Alif, Laam, Miim.');
 assert.match(result.verses.get(2),/^Kitab Al-Quran/);
 const swapped=structuredClone(payload);[swapped.data.ayahs[0].number,swapped.data.ayahs[1].number]=[9,8];
 assert.throws(()=>validateTranslationSurah(swapped,2,editions[0],arabicVerses),/Translation ayah mismatch/);
});
