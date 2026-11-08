// Only a strict allowlist of endpoint labels is retained; no full URLs or payloads.
export function endpointLabel(raw){
 try{const u=new URL(raw);if(u.origin!=='https://api.alquran.cloud')return null;
 const p=u.pathname;
 if(p==='/v1/edition')return 'edition-metadata';
 if(p==='/v1/surah/2/quran-uthmani')return 'arabic-2';
 if(p==='/v1/surah/2/ms.basmeih')return 'malay-2';
 if(/^\/v1\/surah\/2\/(en\.sahih|ar\.muyassar|ar\.alafasy)$/.test(p))return 'supporting-edition-2';
 return null;
 }catch{return null}
}
export function safeNetworkEvent({url,event,status,failure}){
 const endpoint=endpointLabel(url);if(!endpoint)return null;
 if(event==='response')return {endpoint,event,status:Number.isInteger(status)?status:null,kind:status>=400?'HTTP':'OK'};
 if(event==='requestfailed'){
  const f=String(failure||'');
  const kind=/ERR_NAME_NOT_RESOLVED|DNS_PROBE_FINISHED|ENOTFOUND/i.test(f)?'DNS':/TIMED_OUT|TIMEOUT|ERR_ABORTED/i.test(f)?'TIMEOUT':/ERR_BLOCKED_BY_CLIENT/i.test(f)?'CLIENT_BLOCK':'NETWORK_UNDETERMINED';
  return {endpoint,event,kind};
 }
 return null;
}
export function attachQuranNetworkDiagnostics(page,records){
 const failed=request=>{const record=safeNetworkEvent({url:request.url(),event:'requestfailed',failure:request.failure()?.errorText});if(record)records.push(record)};
 const responded=response=>{const record=safeNetworkEvent({url:response.url(),event:'response',status:response.status()});if(record)records.push(record)};
 page.on('requestfailed',failed);page.on('response',responded);
 return ()=>{page.off('requestfailed',failed);page.off('response',responded)};
}
