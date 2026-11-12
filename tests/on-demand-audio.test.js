import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
globalThis.crypto??=webcrypto;

const sha=b=>createHash('sha256').update(b).digest('hex');
const MP3=Uint8Array.from([0x49,0x44,0x33,0x04,0x00,0x00,0x00,0x00,0x66,0x00]); // ID3 + payload
const MP3_OTHER=Uint8Array.from([0x49,0x44,0x33,0x04,0x00,0x00,0x00,0x00,0x77,0x00]);
const entry=(verse,bytes)=>({verse,path:'/offline/alafasy/'+verse+'.mp3',sha256:sha(bytes)});
const manifestFor=entries=>({schema:1,qari:'ar.alafasy',reciter:'Mishary Rashid Alafasy',bitrateKbps:128,licenseReviewed:true,licenseReference:'reviewed-license',files:entries});
const audioResp=(bytes)=>({ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});
const manifestResp=entries=>({ok:true,json:async()=>manifestFor(entries)});

test('on-demand Alafasy verifies the downloaded verse against the manifest and caches it',async()=>{
 const {loadVerifiedAlafasyAudio,AUDIO_PACK_BASE}=await import('../src/on-demand-audio.js');
 const {memoryAudioCache}=await import('../src/audio-cache.js');
 const requested=[];
 const fetchImpl=async url=>{
  requested.push(url);
  if(url==='/offline/alafasy-manifest.json')return manifestResp([entry(1,MP3)]);
  if(url===AUDIO_PACK_BASE+'1.mp3')return audioResp(MP3);
  throw new Error('unexpected url '+url);
 };
 const cache=memoryAudioCache();
 const first=await loadVerifiedAlafasyAudio(1,{cache,fetchImpl});
 assert.ok(first instanceof Uint8Array);
 assert.deepEqual(Array.from(first),Array.from(MP3));
 assert.deepEqual(requested,['/offline/alafasy-manifest.json',AUDIO_PACK_BASE+'1.mp3']);
 const before=requested.length;
 const second=await loadVerifiedAlafasyAudio(1,{cache,fetchImpl});
 assert.ok(second instanceof Uint8Array);
 // The manifest may be re-read (it is small and we keep it fresh), but the
 // audio bytes must come from cache — never fetched a second time.
 assert.equal(requested.filter(u=>u.startsWith(AUDIO_PACK_BASE)).length,1,'audio must be fetched exactly once');
 assert.equal(requested[requested.length-1],'/offline/alafasy-manifest.json','cache hit ends at the manifest');
 void before;
});

test('on-demand Alafasy rejects a tampered download (SHA mismatch) and does not cache it',async()=>{
 const {loadVerifiedAlafasyAudio,AUDIO_PACK_BASE}=await import('../src/on-demand-audio.js');
 const {memoryAudioCache}=await import('../src/audio-cache.js');
 const fetchImpl=async url=>{
  if(url==='/offline/alafasy-manifest.json')return manifestResp([entry(2,MP3)]);
  if(url===AUDIO_PACK_BASE+'2.mp3')return audioResp(MP3_OTHER);
  throw new Error('unexpected url '+url);
 };
 const cache=memoryAudioCache();
 const bytes=await loadVerifiedAlafasyAudio(2,{cache,fetchImpl});
 assert.equal(bytes,null);
 assert.equal(await cache.has(2),false,'tampered bytes must not be cached');
});

test('on-demand Alafasy re-verifies cached bytes and discards them if they no longer match',async()=>{
 const {loadVerifiedAlafasyAudio,AUDIO_PACK_BASE}=await import('../src/on-demand-audio.js');
 const {memoryAudioCache}=await import('../src/audio-cache.js');
 const cache=memoryAudioCache();
 await cache.put(3,MP3);
 const fetchImpl=async url=>{
  if(url==='/offline/alafasy-manifest.json')return manifestResp([entry(3,MP3_OTHER)]);
  if(url===AUDIO_PACK_BASE+'3.mp3')return audioResp(MP3_OTHER);
  throw new Error('unexpected url '+url);
 };
 const bytes=await loadVerifiedAlafasyAudio(3,{cache,fetchImpl});
 assert.ok(bytes instanceof Uint8Array);
 assert.deepEqual(Array.from(bytes),Array.from(MP3_OTHER));
});

test('on-demand Alafasy returns null for out-of-range verses without touching the network',async()=>{
 const {loadVerifiedAlafasyAudio}=await import('../src/on-demand-audio.js');
 const {memoryAudioCache}=await import('../src/audio-cache.js');
 const fetchImpl=async()=>{throw new Error('network must not be used')};
 for(const verse of [0,-1,6237,1.5,NaN]){
  assert.equal(await loadVerifiedAlafasyAudio(verse,{cache:memoryAudioCache(),fetchImpl}),null);
 }
});
