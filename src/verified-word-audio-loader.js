import{createWordAudioSession}from './word-audio-session.js';
const SHA=/^[a-f0-9]{64}$/;
async function sha256(value){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')}
/** Loads one explicitly reviewed per-ayah alignment from an already supplied JSON document.
 * This never fetches arbitrary URLs or assumes that Qari IDs identify the exact recording. */
export async function loadVerifiedWordAudioSession({document,manifest,verse,arabic,audioUrl,reciter,recordingSha256,edition}={}){
 if(!manifest||manifest.reviewed!==true||!SHA.test(manifest.sha256||'')||!SHA.test(recordingSha256||'')||manifest.recordingSha256!==recordingSha256||manifest.reciter!==reciter||manifest.audioUrl!==audioUrl||manifest.edition!==edition||manifest.verse!==verse||typeof document!=='string'||!document||typeof arabic!=='string'||!arabic)return null;
 try{
  if(await sha256(document)!==manifest.sha256)return null;
  const payload=JSON.parse(document);
  if(!payload||payload.verse!==verse||payload.edition!==edition||payload.reciter!==reciter||payload.recordingSha256!==recordingSha256||payload.audioUrl!==audioUrl||payload.arabic!==arabic||!Array.isArray(payload.words)||payload.words.join(' ')!==arabic.trim().split(/\s+/u).join(' ')||!Array.isArray(payload.timings))return null;
  return createWordAudioSession({verse,arabic,edition,reciter,recordingSha256,audioUrl,words:payload.words,timings:payload.timings,reviewed:true});
 }catch{return null}
}
