import test from 'node:test';
import assert from 'node:assert/strict';
import{DEFAULT_READER_SETTINGS,TAJWEED_RULES,sanitizeReaderSettings,loadReaderSettings,saveReaderSettings,filterVerses}from '../src/reader.js';
test('Malay translation is enabled by default; unreviewed Tajweed colors are off',()=>{assert.equal(DEFAULT_READER_SETTINGS.translation,true);assert.equal(DEFAULT_READER_SETTINGS.tajweed,false)});
test('reader settings clamp size and reject invalid Qari and theme',()=>{assert.deepEqual(sanitizeReaderSettings({size:999,qari:'evil',theme:'unknown'}),{translation:true,translationLanguage:'ms',tajweed:false,size:52,theme:'light',qari:'ar.alafasy'})});
test('reader preferences roundtrip with safe storage',()=>{const m=new Map();const store={getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)};assert.equal(saveReaderSettings({translation:false,translationLanguage:'ms',tajweed:true,qari:'ar.husary',size:38,theme:'dark'},store),true);assert.deepEqual(loadReaderSettings(store),{translation:false,translationLanguage:'ms',tajweed:true,qari:'ar.husary',size:38,theme:'dark'})});
test('reader settings survive blocked storage',()=>{const denied={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};assert.deepEqual(loadReaderSettings(denied),DEFAULT_READER_SETTINGS);assert.equal(saveReaderSettings({},denied),false)});
test('Arabic search, verse-number search and bookmarks are deterministic',()=>{const verses=[{number:1,numberInSurah:1,arabic:'بِسْمِ'},{number:2,numberInSurah:2,arabic:'الْحَمْدُ'}];assert.deepEqual(filterVerses(verses,'بِسْمِ').map(v=>v.number),[1]);assert.deepEqual(filterVerses(verses,'2').map(v=>v.number),[2]);assert.deepEqual(filterVerses(verses,'','bookmarks',[2]).map(v=>v.number),[2]);assert.throws(()=>filterVerses(verses,'','unknown'),/filter/)});
test('Tajweed legend declares only supported reviewed annotation rule identifiers',()=>{assert.deepEqual(TAJWEED_RULES.map(x=>x.id),['madd','ikhfa','qalqala'])});

test('translation language accepts supported values and rejects invalid persisted choices',()=>{for(const language of ['ms','id','en'])assert.equal(sanitizeReaderSettings({translationLanguage:language}).translationLanguage,language);assert.equal(sanitizeReaderSettings({translationLanguage:'unknown'}).translationLanguage,'ms')});

test('offline Quran corpus rejects unreviewed manifest and mismatched SHA-256',async()=>{
 const {verifyOfflineCorpus}=await import('../src/api.js');
 const bytes=new TextEncoder().encode('{"surahs":[]}');
 const digest=async()=>new Uint8Array(32).buffer;
 await assert.rejects(verifyOfflineCorpus(bytes,{schema:1,arabicEdition:'quran-uthmani',translationEdition:'ms.basmeih',sha256:'f'.repeat(64)},{digest}),/SHA-256 mismatch/);
 await assert.rejects(verifyOfflineCorpus(bytes,{schema:1,arabicEdition:'quran-uthmani',translationEdition:'ms.other',sha256:'0'.repeat(64)},{digest}),/Unreviewed/);
 await assert.rejects(verifyOfflineCorpus(bytes,{schema:1,arabicEdition:'quran-uthmani',translationEdition:'ms.basmeih',sha256:'0'.repeat(64)},{digest}),/114 Surahs/);
});

test('offline Alafasy manifest fails closed on missing license and corrupt entries',async()=>{
 const {validateOfflineAlafasyManifest}=await import('../src/qari.js');
 const base={schema:1,qari:'ar.alafasy',licenseReviewed:true,licenseReference:'reviewed-license-record',files:[{verse:1,path:'/offline/alafasy/1.mp3',sha256:'a'.repeat(64)}]};
 assert.equal(validateOfflineAlafasyManifest(base),base);
 assert.throws(()=>validateOfflineAlafasyManifest({...base,licenseReviewed:false}),/Unreviewed/);
 assert.throws(()=>validateOfflineAlafasyManifest({...base,files:[{...base.files[0],path:'https://example.org/1.mp3'}]}),/Invalid/);
 assert.throws(()=>validateOfflineAlafasyManifest({...base,files:[base.files[0],base.files[0]]}),/Invalid/);
});

test('offline Alafasy MP3 requires correct digest and recognizable frame',async()=>{
 const {verifyOfflineAlafasyRecording}=await import('../src/qari.js');
 const bytes=Uint8Array.from([0x49,0x44,0x33,0x04,0x00]);
 const digest=async()=>new Uint8Array(32).buffer;
 assert.deepEqual(await verifyOfflineAlafasyRecording(bytes,{sha256:'0'.repeat(64)},{digest}),bytes);
 await assert.rejects(verifyOfflineAlafasyRecording(bytes,{sha256:'1'.repeat(64)},{digest}),/SHA-256 mismatch/);
 await assert.rejects(verifyOfflineAlafasyRecording(Uint8Array.from([1,2,3,4]),{sha256:'0'.repeat(64)},{digest}),/not recognized MP3/);
});

test('offline-first loader fails closed when corpus package is missing',async()=>{
 const {loadVerifiedOfflineCorpus}=await import('../src/offline-assets.js');
 const fetchImpl=async()=>({ok:false,status:404});
 await assert.rejects(loadVerifiedOfflineCorpus({fetchImpl}),/Offline manifest unavailable: 404/);
});
test('offline-first loader rejects unreviewed provenance without fetching corpus',async()=>{
 const {loadVerifiedOfflineCorpus}=await import('../src/offline-assets.js');
 const requested=[];
 const fetchImpl=async(path)=>{requested.push(path);return {ok:true,json:async()=>({schema:1,sourceReviewed:false,licenseReference:'unknown',sourceUrl:'https://example.org'})}};
 await assert.rejects(loadVerifiedOfflineCorpus({fetchImpl}),/provenance not approved/);
 assert.deepEqual(requested,['/offline/corpus-manifest.json']);
});
test('offline Alafasy loader rejects missing licensed recording without requesting audio',async()=>{
 const {loadVerifiedOfflineAlafasy}=await import('../src/offline-assets.js');
 const requested=[];
 const fetchImpl=async(path)=>{requested.push(path);return {ok:true,json:async()=>({schema:1,qari:'ar.alafasy',licenseReviewed:true,licenseReference:'reviewed-license',files:[]})}};
 await assert.rejects(loadVerifiedOfflineAlafasy(1,{fetchImpl}),/recording not packaged/);
 assert.deepEqual(requested,['/offline/alafasy-manifest.json']);
});

test('offline Quran and Alafasy fail explicitly with network disabled',async()=>{
 const {loadVerifiedOfflineCorpus,loadVerifiedOfflineAlafasy}=await import('../src/offline-assets.js');
 const requested=[];
 const fetchImpl=async url=>{requested.push(url);throw new TypeError('Network disabled')};
 await assert.rejects(loadVerifiedOfflineCorpus({fetchImpl}),/Network disabled/);
 await assert.rejects(loadVerifiedOfflineAlafasy(1,{fetchImpl}),/Network disabled/);
 assert.deepEqual(requested,['/offline/corpus-manifest.json','/offline/alafasy-manifest.json']);
});
test('offline corpus refuses false reviewed provenance without reading sacred text',async()=>{
 const {loadVerifiedOfflineCorpus}=await import('../src/offline-assets.js');
 const requested=[];
 const fetchImpl=async url=>{requested.push(url);return {ok:true,json:async()=>({schema:1,sourceReviewed:true,licenseReference:'',sourceUrl:'https://tanzil.net'})}};
 await assert.rejects(loadVerifiedOfflineCorpus({fetchImpl}),/provenance not approved/);
 assert.deepEqual(requested,['/offline/corpus-manifest.json']);
});

test('verified synthetic 114-Surah package loads with external network blocked',async()=>{
 const {createHash}=await import('node:crypto');
 const {loadVerifiedOfflineCorpus,loadVerifiedOfflineSurah}=await import('../src/offline-assets.js');
 let globalNumber=0;
 const surahs=Array.from({length:114},(_,index)=>{
  const number=index+1;
  const count=number===1?7:number===9?129:index<54?55:54;
  return {number,name:'Synthetic '+number,englishName:'Synthetic '+number,englishNameTranslation:'Test only',revelationType:'Meccan',ayahs:Array.from({length:count},(_,i)=>({number:++globalNumber,numberInSurah:i+1,arabic:'تجربة',malay:'Ujian sintetik '+(i+1)}))};
 });
 // Keep exactly 6236 synthetic ayahs; no religious source text is copied.
 const difference=6236-globalNumber;
 const last=surahs[113].ayahs;
 if(difference<0)last.splice(last.length+difference);
 else for(let i=0;i<difference;i++)last.push({number:0,numberInSurah:0,arabic:'تجربة',malay:'Ujian sintetik'});
 let id=0;for(const s of surahs)for(let i=0;i<s.ayahs.length;i++){s.ayahs[i].number=++id;s.ayahs[i].numberInSurah=i+1}
 assert.equal(id,6236);
 const bytes=new TextEncoder().encode(JSON.stringify({surahs}));
 const sha256=createHash('sha256').update(bytes).digest('hex');
 const manifest={schema:1,arabicEdition:'quran-uthmani',translationEdition:'ms.basmeih',sha256,sourceReviewed:true,sourceUrl:'https://example.org/fixture',licenseReference:'SYNTHETIC TEST ONLY'};
 const requested=[];
 const fetchImpl=async path=>{
  requested.push(path);
  if(path==='/offline/corpus-manifest.json')return {ok:true,json:async()=>manifest};
  if(path==='/offline/corpus.json')return {ok:true,arrayBuffer:async()=>bytes.buffer};
  throw Error('External network prohibited: '+path);
 };
 const digest=async(_,input)=>createHash('sha256').update(new Uint8Array(input)).digest();
 const corpus=await loadVerifiedOfflineCorpus({fetchImpl,digest});
 assert.equal(corpus.surahs.length,114);
 const surah=await loadVerifiedOfflineSurah(9,{fetchImpl,digest});
 assert.equal(surah.ayahs.length,129);
 assert(requested.every(x=>x.startsWith('/offline/')));
});
