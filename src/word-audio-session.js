import{resolveReaderEvidence}from './reader-evidence.js';
// A session is tied to one exact audio URL and reciter. No default timings are shipped.
export function createWordAudioSession({verse,arabic,edition,reciter,recordingSha256,audioUrl,words,timings,reviewed}={}){
 if(reviewed!==true||!Number.isInteger(verse)||verse<1||!audioUrl||typeof audioUrl!=='string'||!audioUrl.startsWith('https://')||!arabic||!edition||!reciter||!recordingSha256)return null;
 const id={reciter,recordingSha256,edition};
 const state=resolveReaderEvidence({arabic,words,timings,audioIdentity:id,expectedAudioIdentity:id,currentTimeMs:0});
 if(state.audioStatus!=='word-timing-verified')return null;
 return Object.freeze({verse,audioUrl,reciter,recordingSha256,edition,words:Object.freeze([...words]),timings:Object.freeze(timings.map(t=>Object.freeze([...t])))});
}
export function wordFromAudioEvent(session,{verse,audioUrl,reciter,timeSeconds}={}){
 if(!session||session.verse!==verse||session.audioUrl!==audioUrl||session.reciter!==reciter||!Number.isFinite(timeSeconds)||timeSeconds<0)return null;
 const evidence=resolveReaderEvidence({arabic:session.words.join(' '),words:session.words,timings:session.timings,audioIdentity:{reciter:session.reciter,recordingSha256:session.recordingSha256,edition:session.edition},expectedAudioIdentity:{reciter:session.reciter,recordingSha256:session.recordingSha256,edition:session.edition},currentTimeMs:timeSeconds*1000});
 return evidence.activeWord;
}
