// Offline corpus audit. Inputs must be independently acquired and provenance-reviewed.
// No Quran text is altered, fetched or inferred by this tool.
export const EXPECTED_COUNTS=Object.freeze([7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6]);
export const TOTAL_AYAHS=EXPECTED_COUNTS.reduce((a,b)=>a+b,0);
const validId=x=>Number.isInteger(x)&&x>0;
export function auditCorpus(primary,reference,{translation}={}){
 const issues=[];const fail=(code,surah,ayah)=>issues.push({code,surah,ayah});
 if(!Array.isArray(primary)||!Array.isArray(reference)||primary.length!==114||reference.length!==114)return {passed:false,checked:0,issues:[{code:'SURAH_COUNT',surah:null,ayah:null}]};
 let checked=0,global=0;
 for(let s=1;s<=114;s++){
  const a=primary[s-1],b=reference[s-1],expected=EXPECTED_COUNTS[s-1];
  if(a?.number!==s||b?.number!==s){fail('SURAH_ID',s,null);global+=expected;continue}
  if(!Array.isArray(a.ayahs)||!Array.isArray(b.ayahs)||a.ayahs.length!==expected||b.ayahs.length!==expected){fail('AYAH_COUNT',s,null);global+=expected;continue}
  for(let i=0;i<expected;i++){
   global++;const x=a.ayahs[i],y=b.ayahs[i],n=i+1;
   if(x?.numberInSurah!==n||y?.numberInSurah!==n||!validId(x?.number)||!validId(y?.number)||x.number!==y.number||x.number!==global){fail('VERSE_ID',s,n);continue}
   if(typeof x.text!=='string'||typeof y.text!=='string'||x.text!==y.text)fail('ARABIC_TEXT',s,n);
   if(x.juz!==undefined&&y.juz!==undefined&&x.juz!==y.juz)fail('JUZ_BOUNDARY',s,n);
   if(x.surah?.number!==undefined&&x.surah.number!==s)fail('EMBEDDED_SURAH_ID',s,n);
   if(translation){const t=translation[s-1]?.ayahs?.[i];if(translation[s-1]?.number!==s||t?.numberInSurah!==n||t?.number!==global||typeof t.text!=='string'||!t.text.trim())fail('TRANSLATION_ALIGNMENT',s,n)}
   checked++;
  }
 }
 if(global!==6236)fail('GLOBAL_TOTAL',null,null);
 return {passed:issues.length===0&&checked===6236,checked,issues};
}

/** Structural provenance checks; supplied metadata is not proof of editorial authenticity. */
export function auditSourceManifest(manifest){
 const issues=[];const add=(code,source)=>issues.push({code,source});
 if(!manifest||!Array.isArray(manifest.sources))return {passed:false,issues:[{code:'SOURCES_MISSING',source:null}]};
 const ids=['arabic-primary','arabic-reference','malay-translation'];
 for(const id of ids){
  const entries=manifest.sources.filter(x=>x?.role===id);
  if(entries.length!==1){add('SOURCE_ROLE',id);continue}
  const s=entries[0];
  if(typeof s.origin!=='string'||!/^https:\/\//.test(s.origin))add('ORIGIN',id);
  if(typeof s.edition!=='string'||s.edition!==(id==='malay-translation'?'ms.basmeih':'quran-uthmani'))add('EDITION',id);
  if(typeof s.sha256!=='string'||!/^[a-f0-9]{64}$/.test(s.sha256))add('HASH',id);
  if(typeof s.license!=='string'||!s.license.trim()||s.license==='unknown')add('LICENSE_UNVERIFIED',id);
  if(typeof s.retrievedAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(s.retrievedAt)||!Number.isFinite(Date.parse(s.retrievedAt)))add('RETRIEVAL_DATE',id);
 }
 return {passed:issues.length===0,issues};
}
