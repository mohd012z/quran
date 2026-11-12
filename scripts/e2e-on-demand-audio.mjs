// E2E on-demand audio test against the live audio-pack (GitHub Pages).
// Run with the dev server up: node scripts/e2e-on-demand-audio.mjs http://localhost:5199
import {loadVerifiedOfflineAlafasyManifest, loadVerifiedAlafasyAudio, AUDIO_PACK_BASE} from '../src/on-demand-audio.js';
import {memoryAudioCache} from '../src/audio-cache.js';

const BASE=process.argv[2]||'http://localhost:5199';
const fetchImpl=async(url,opts)=>fetch(url.startsWith('http')?url:BASE+url,opts);
const cache=memoryAudioCache();

const manifest=await loadVerifiedOfflineAlafasyManifest({fetchImpl});
console.log('manifest ok:', manifest.qari, manifest.files.length, 'entries');

let fail=0;
for(const verse of [1,288,2860,6236]){
  const t=Date.now();
  const bytes=await loadVerifiedAlafasyAudio(verse,{cache,fetchImpl});
  const ms=Date.now()-t;
  const cached=await cache.has(verse);
  console.log(`verse ${verse}: ${bytes?bytes.length+' bytes (SHA verified)':'NULL'} in ${ms}ms, cached=${cached}`);
  if(!bytes||!cached)fail++;
  // second call must hit cache
  const t2=Date.now();
  const again=await loadVerifiedAlafasyAudio(verse,{cache,fetchImpl});
  if(!again)fail++;
  console.log(`  cache re-verify: ${again?again.length+' bytes':'NULL'} in ${Date.now()-t2}ms`);
}
console.log(fail===0?'E2E ON-DEMAND PASS':'E2E ON-DEMAND FAIL ('+fail+')');
process.exit(fail===0?0:1);
