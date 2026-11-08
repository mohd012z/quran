// Synthetic layout fixtures only: NEVER use as Quran source or ship in application.
const API='https://api.alquran.cloud';
const editions=['quran-uthmani','en.sahih','ar.muyassar','ar.alafasy'];
const rows=Array.from({length:7},(_,i)=>({number:i+1,numberInSurah:i+1,juz:1,text:'LAYOUT_FIXTURE_'+(i+1),audio:'https://example.invalid/audio/'+(i+1)}));
export function layoutQuranPayload(url){
 const u=new URL(url);if(u.origin!==API)return null;
 const p=u.pathname;
 const ok=data=>({code:200,status:'OK',data});
 if(p==='/v1/surah')return ok([{number:1,name:'TEST_FIXTURE',englishName:'Fixture',numberOfAyahs:7}]);
 if(p==='/v1/edition'&&u.searchParams.get('language')==='ms')return ok([{identifier:'ms.basmeih',language:'ms',type:'translation',format:'text',name:'Synthetic Malay fixture'}]);
 if(p==='/v1/surah/1/ms.basmeih')return ok({number:1,edition:{identifier:'ms.basmeih',type:'translation'},ayahs:rows.map(r=>({number:r.number,numberInSurah:r.numberInSurah,text:'MALAY_FIXTURE_'+r.number}))});
 const match=/^\/v1\/surah\/1\/(quran-uthmani|en\.sahih|ar\.muyassar|ar\.alafasy)$/.exec(p);
 if(match){const edition=match[1];return ok({number:1,edition:{identifier:edition},ayahs:rows.map(r=>({...r,text:edition==='quran-uthmani'?r.text:'SUPPORT_FIXTURE_'+r.number}))})}
 return null;
}
export async function installLayoutQuranMocks(page){
 const seen=[];await page.route('https://api.alquran.cloud/**',async route=>{
  const url=route.request().url(),payload=layoutQuranPayload(url);
  seen.push({endpoint:new URL(url).pathname,handled:!!payload});
  if(!payload)return route.abort('blockedbyclient');
  await route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},json:payload});
 });
 return seen;
}
