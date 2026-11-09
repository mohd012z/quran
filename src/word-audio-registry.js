import{loadVerifiedWordAudioSession}from './verified-word-audio-loader.js';
// Only explicitly reviewed, bundled records may be registered here.
// No third-party audio timing is enabled until its exact edition and recording pass review.
export const VERIFIED_WORD_AUDIO=Object.freeze({});
export async function resolveBundledWordAudio({verse,arabic,audioUrl,reciter,edition,recordingSha256,registry=VERIFIED_WORD_AUDIO}={}){
 const record=registry?.[String(verse)];
 if(!record||typeof record.document!=='string'||!record.manifest)return null;
 return loadVerifiedWordAudioSession({document:record.document,manifest:record.manifest,verse,arabic,audioUrl,reciter,edition,recordingSha256});
}
