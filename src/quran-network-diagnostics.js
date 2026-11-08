// Diagnostic classification only. Never include URLs with credentials or response bodies.
export function classifyQuranNetworkFailure(error,{status,elapsedMs,timeoutMs=12000}={}){
 if(Number.isInteger(status)&&status>=400)return {kind:'HTTP',status};
 if(error?.name==='AbortError'||(Number.isFinite(elapsedMs)&&elapsedMs>=timeoutMs))return {kind:'TIMEOUT'};
 const message=String(error?.message||error||'');
 if(/ERR_NAME_NOT_RESOLVED|ENOTFOUND|EAI_AGAIN|DNS_PROBE_FINISHED/i.test(message))return {kind:'DNS'};
 if(/ERR_BLOCKED_BY_CLIENT|ERR_BLOCKED_BY_RESPONSE|CORS|Access-Control-Allow-Origin/i.test(message))return {kind:'CORS_OR_CLIENT_BLOCK',certainty:'UNVERIFIED'};
 if(/Failed to fetch|NetworkError|ERR_FAILED|Load failed/i.test(message))return {kind:'NETWORK_UNDETERMINED',possible:['CORS','DNS','offline','blocked','connection']};
 return {kind:'UNKNOWN'};
}
export function summarizeQuranRequest({edition,kind,status,elapsedMs}){
 const approved=new Set(['quran-uthmani','ms.basmeih','en.sahih','ar.muyassar','ar.alafasy']);
 if(!approved.has(edition))throw Error('Unapproved edition identifier');
 const known=new Set(['HTTP','TIMEOUT','DNS','CORS_OR_CLIENT_BLOCK','NETWORK_UNDETERMINED','UNKNOWN','OK']);
 if(!known.has(kind))throw Error('Unknown diagnostic category');
 return Object.freeze({edition,kind,...(Number.isInteger(status)?{status}:{}),...(Number.isFinite(elapsedMs)?{elapsedMs:Math.round(elapsedMs)}:{})});
}
