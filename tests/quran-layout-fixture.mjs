// Synthetic layout fixtures only: NEVER use as Quran source or ship in application.
const API='https://api.alquran.cloud';
const rows=Array.from({length:7},(_,i)=>({number:i+1,numberInSurah:i+1,juz:1,text:'LAYOUT_FIXTURE_'+(i+1),audio:'https://example.invalid/audio/'+(i+1)}));
export function layoutQuranPayload(url){
 let u;try{u=new URL(url)}catch{return null}if(u.origin!==API||u.username||u.password||u.hash)return null;
 const isMetadata=u.pathname==='/v1/edition';if(!isMetadata&&u.search)return null;
 const p=u.pathname;
 const ok=data=>({code:200,status:'OK',data});
 if(p==='/v1/surah')return ok([{number:1,name:'TEST_FIXTURE',englishName:'Fixture',numberOfAyahs:7}]);
 if(p==='/v1/edition'&&u.searchParams.get('language')==='ms'&&u.searchParams.get('format')==='text'&&u.searchParams.get('type')==='translation'&&u.searchParams.size===3)return ok([{identifier:'ms.basmeih',language:'ms',type:'translation',format:'text',name:'Synthetic Malay fixture'}]);
 if(p==='/v1/surah/1/ms.basmeih')return ok({number:1,edition:{identifier:'ms.basmeih',type:'translation'},ayahs:rows.map(r=>({number:r.number,numberInSurah:r.numberInSurah,text:'MALAY_FIXTURE_'+r.number}))});
 const match=/^\/v1\/surah\/1\/(quran-uthmani|en\.sahih|ar\.muyassar|ar\.alafasy)$/.exec(p);
 if(match){const edition=match[1];return ok({number:1,edition:{identifier:edition},ayahs:rows.map(r=>({...r,text:edition==='quran-uthmani'?r.text:'SUPPORT_FIXTURE_'+r.number}))})}
 return null;
}
export async function installLayoutQuranMocks(page){
 // The Vite SPA fallback can return index.html (HTTP 200) for absent offline files.
 // Model a genuinely missing local package with 404 so offline-first loaders
 // correctly use the synthetic API fixtures, never a fabricated corpus.
 await page.route('**/offline/**',route=>route.fulfill({status:404,body:'Offline fixture not installed'}));
 const seen=[];await page.route('https://api.alquran.cloud/**',async route=>{
  const url=route.request().url(),payload=layoutQuranPayload(url);
  seen.push({endpoint:payload?'allowed':'rejected',handled:!!payload});
  if(!payload)return route.abort('blockedbyclient');
  await route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},json:payload});
 });
 return seen;
}
