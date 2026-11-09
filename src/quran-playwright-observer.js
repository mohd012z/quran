import{classifyQuranNetworkFailure}from './quran-network-diagnostics.js';
export function quranEndpoint(url){
 let u;try{u=new URL(url)}catch{return null}
 if(u.origin!=='https://api.alquran.cloud'||u.username||u.password||u.searchParams.has('token'))return null;
 if(u.pathname==='/v1/edition'&&u.searchParams.get('language')==='ms')return 'malay-edition-metadata';
 if(/^\/v1\/surah\/\d+\/ms\.basmeih$/.test(u.pathname))return 'malay-basmeih';
 if(/^\/v1\/surah\/\d+\/quran-uthmani$/.test(u.pathname))return 'arabic-uthmani';
 if(/^\/v1\/surah\/\d+\/(en\.sahih|ar\.muyassar|ar\.alafasy)$/.test(u.pathname))return 'supporting-edition';
 return null;
}
export function observeQuranRequests(page){
 const records=[];const pending=new WeakMap();
 const record=(request,kind,status)=>{const endpoint=quranEndpoint(request.url());if(!endpoint)return;const start=pending.get(request);const elapsedMs=Number.isFinite(start)?Math.max(0,Math.round(Date.now()-start)):null;records.push({endpoint,kind,...(Number.isInteger(status)?{status}:{}),...(elapsedMs!==null?{elapsedMs}:{})});};
 const onRequest=request=>{if(quranEndpoint(request.url()))pending.set(request,Date.now())};
 const onResponse=response=>{if(response.status()>=400)record(response.request(),'HTTP',response.status());else record(response.request(),'OK',response.status())};
 const onFailed=request=>{const kind=classifyQuranNetworkFailure(new Error(request.failure()?.errorText||'')).kind;record(request,kind)};
 page.on('request',onRequest);page.on('response',onResponse);page.on('requestfailed',onFailed);
 return {records,stop(){page.off('request',onRequest);page.off('response',onResponse);page.off('requestfailed',onFailed)}};
}
