import{test,expect}from '@playwright/test';
// Optional read-only diagnostic, not a release gate. Run explicitly with QURAN_API_HEALTH=1.
test('read-only public Quran API availability (opt-in, no text logged)',async({request})=>{
 test.skip(process.env.QURAN_API_HEALTH!=='1','External API health is intentionally excluded from deterministic CI');
 const endpoints=[['arabic-uthmani','https://api.alquran.cloud/v1/surah/2/quran-uthmani'],['malay-basmeih','https://api.alquran.cloud/v1/surah/2/ms.basmeih']];
 for(const [label,url]of endpoints){
  const started=Date.now();let status=null,kind='UNKNOWN';
  try{const response=await request.get(url,{timeout:10000,maxRetries:0});status=response.status();kind=response.ok()?'OK':'HTTP'}
  catch(error){kind=error?.name==='TimeoutError'?'TIMEOUT':'NETWORK_UNDETERMINED'}
  const record={endpoint:label,kind,status,elapsedMs:Date.now()-started};
  console.log('QURAN_API_HEALTH '+JSON.stringify(record));
  expect(kind,JSON.stringify(record)).toBe('OK');
 }
});
