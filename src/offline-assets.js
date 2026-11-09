import {verifyOfflineCorpus} from './api.js';
import {validateOfflineAlafasyManifest,verifyOfflineAlafasyRecording} from './qari.js';

const LOCAL='/offline/';
async function localBytes(path,fetchImpl){
 const response=await fetchImpl(path,{cache:'no-store'});
 if(!response.ok)throw Error('Offline asset unavailable: '+response.status);
 return new Uint8Array(await response.arrayBuffer());
}
async function localManifest(path,fetchImpl){
 const response=await fetchImpl(path,{cache:'no-store'});
 if(!response.ok)throw Error('Offline manifest unavailable: '+response.status);
 return response.json();
}
export async function loadVerifiedOfflineCorpus({fetchImpl=globalThis.fetch,digest}={}){
 const manifest=await localManifest(LOCAL+'corpus-manifest.json',fetchImpl);
 if(manifest?.sourceReviewed!==true||!manifest?.licenseReference?.trim()||!manifest?.sourceUrl?.startsWith('https://'))throw Error('Offline corpus provenance not approved');
 const bytes=await localBytes(LOCAL+'corpus.json',fetchImpl);
 return verifyOfflineCorpus(bytes,manifest,digest?{digest}:{});
}
export async function loadVerifiedOfflineSurah(number,options={}){
 if(!Number.isInteger(number)||number<1||number>114)throw Error('Invalid offline Surah');
 const corpus=await loadVerifiedOfflineCorpus(options);
 return corpus.surahs[number-1];
}
export async function loadVerifiedOfflineAlafasy(verse,{fetchImpl=globalThis.fetch,digest}={}){
 if(!Number.isInteger(verse)||verse<1||verse>6236)throw Error('Invalid offline ayah');
 const manifest=validateOfflineAlafasyManifest(await localManifest(LOCAL+'alafasy-manifest.json',fetchImpl));
 const entry=manifest.files.find(f=>f.verse===verse);
 if(!entry)throw Error('Offline recording not packaged');
 const bytes=await localBytes(entry.path,fetchImpl);
 return verifyOfflineAlafasyRecording(bytes,entry,digest?{digest}:{});
}
