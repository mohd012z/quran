const SHA=/^[a-f0-9]{64}$/;
export async function sha256Bytes(bytes){if(!(bytes instanceof Uint8Array))throw Error('Expected bytes');const h=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(h),x=>x.toString(16).padStart(2,'0')).join('')}
export async function verifyRecordingBytes(bytes,expected){if(!SHA.test(expected||''))return false;return await sha256Bytes(bytes)===expected}
export async function verifyCanonicalTajweedEdition(ayahs,expectedDigest){
 if(!ayahs||typeof ayahs!=='object'||Array.isArray(ayahs)||!SHA.test(expectedDigest||''))throw Error('Invalid Tajweed edition');
 const keys=Object.keys(ayahs);
 if(keys.length!==6236||keys.some(k=>!/^([1-9]\d*):([1-9]\d*)$/.test(k)||typeof ayahs[k]!=='string'||!ayahs[k]))throw Error('Incomplete Tajweed edition');
 const refs=keys.sort((a,b)=>{const [sa,aa]=a.split(':').map(Number),[sb,ab]=b.split(':').map(Number);return sa-sb||aa-ab});
 const canonical=refs.map(ref=>ref+'\u0000'+ayahs[ref]).join('\u0001');
 const actual=await sha256Bytes(new TextEncoder().encode(canonical));
 if(actual!==expectedDigest)throw Error('Tajweed edition digest mismatch');
 return true;
}
export function audioWordPresentation({session,verse,reciter,audioUrl,timeSeconds,words}={}){
 if(!session||!Array.isArray(words)||words.length!==session.words.length||words.some((w,i)=>w!==session.words[i]))return {word:null,status:'ayah-only'};
 if(session.verse!==verse||session.reciter!==reciter||session.audioUrl!==audioUrl)return {word:null,status:'ayah-only'};
 if(!Number.isFinite(timeSeconds)||timeSeconds<0)return {word:null,status:'ayah-only'};
 const ms=timeSeconds*1000;
 const segment=session.timings.find(s=>ms>=s[2]&&ms<s[3]);
 if(!segment||segment[1]!==segment[0]+1)return {word:null,status:'ayah-only'};
 return {word:segment[0],status:'word-verified'};
}
