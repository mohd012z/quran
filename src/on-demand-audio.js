// On-demand Alafasy audio, per verse.
//
// The APK ships NO audio: only alafasy-manifest.json (per-verse SHA-256) and
// the verified text corpus. When a verse is played with the Alafasy qari,
// loadVerifiedAlafasyAudio() resolves the MP3 bytes from, in order:
//   1. the local byte cache (IndexedDB in production, in-memory in tests),
//   2. a fresh download from the pinned audio-pack URL, verified against the
//      manifest before being cached and returned.
// Any failure returns null and the caller falls back to CDN streaming, so a
// slow/missing download never blocks playback. The cache is always re-verified
// on read: it is a convenience, never a trust anchor.
import {validateOfflineAlafasyManifest, verifyOfflineAlafasyRecording} from './qari.js';
import {memoryAudioCache, idbAudioCache} from './audio-cache.js';

const LOCAL='/offline/';
// Our own GitHub Pages audio-pack site (mohd012z.github.io sends
// Access-Control-Allow-Origin: *; release assets do not, hence Pages).
export const AUDIO_PACK_BASE='https://mohd012z.github.io/quran/audio-pack/';

export async function loadVerifiedOfflineAlafasyManifest({fetchImpl=globalThis.fetch}={}){
  const response=await fetchImpl(LOCAL+'alafasy-manifest.json',{cache:'no-store'});
  if(!response.ok)throw new Error('Offline audio manifest unavailable: '+response.status);
  return validateOfflineAlafasyManifest(await response.json());
}

export async function loadVerifiedAlafasyAudio(verse,{cache=memoryAudioCache(),manifest,fetchImpl=globalThis.fetch,digest=globalThis.crypto?.subtle?.digest?.bind(globalThis.crypto.subtle),timeoutMs=8000}={}){
  if(!Number.isInteger(verse)||verse<1||verse>6236)return null;
  const m=manifest??await loadVerifiedOfflineAlafasyManifest({fetchImpl}).catch(()=>null);
  if(!m)return null;
  const entry=m.files.find(f=>f.verse===verse);
  if(!entry)return null;
  try{
    if(await cache.has(verse)){
      const bytes=await cache.get(verse);
      if(bytes){
        try{return await verifyOfflineAlafasyRecording(bytes,entry,{digest})}
        catch{/* cached bytes no longer match the manifest: discard and re-download */}
      }
    }
    const response=await Promise.race([
      fetchImpl(AUDIO_PACK_BASE+verse+'.mp3',{cache:'no-store'}),
      new Promise((_,reject)=>setTimeout(()=>reject(new Error('Audio download timed out')),timeoutMs))
    ]);
    if(!response.ok)throw new Error('Audio pack HTTP '+response.status);
    const bytes=new Uint8Array(await response.arrayBuffer());
    const verified=await verifyOfflineAlafasyRecording(bytes,entry,{digest});
    try{await cache.put(verse,verified)}catch{/* cache is best-effort */}
    return verified;
  }catch{return null}
}

export function alafasyAudioCache(){
  return typeof indexedDB!=='undefined'?idbAudioCache():memoryAudioCache();
}
