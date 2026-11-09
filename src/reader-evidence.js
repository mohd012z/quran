// A reader integration boundary: unverified or missing external datasets never color Quran text.
import{validateTajweedSpans,validateWordTimings,activeWordAt}from './verified-quran-data.js';
export function resolveReaderEvidence({arabic,edition,annotations,annotationEdition,reviewed,words,timings,audioIdentity,expectedAudioIdentity,currentTimeMs}={}){
 const state={tajweed:[],activeWord:null,tajweedStatus:'unavailable',audioStatus:'ayah-only'};
 if(typeof arabic!=='string'||!arabic)return state;
 if(reviewed===true&&edition&&edition===annotationEdition&&Array.isArray(annotations)){
  try{state.tajweed=validateTajweedSpans(arabic,annotations);state.tajweedStatus='verified'}catch{state.tajweedStatus='rejected'}
 }
 if(Array.isArray(words)&&Array.isArray(timings)&&audioIdentity&&expectedAudioIdentity){
  try{const valid=validateWordTimings(words,timings,{...audioIdentity,expectedReciter:expectedAudioIdentity.reciter,expectedRecordingSha256:expectedAudioIdentity.recordingSha256,expectedEdition:expectedAudioIdentity.edition});state.activeWord=activeWordAt(valid,currentTimeMs);state.audioStatus='word-timing-verified'}catch{state.audioStatus='ayah-only'}
 }
 return state;
}
