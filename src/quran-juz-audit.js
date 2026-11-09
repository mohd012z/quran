import{EXPECTED_COUNTS,TOTAL_AYAHS}from './quran-corpus-audit.js';
// Boundaries must be supplied from an independently reviewed source; this module never invents them.
export function auditJuzCoverage(corpus,boundaries){
 const issues=[];const add=(code,surah=null,ayah=null)=>issues.push({code,surah,ayah});
 if(!Array.isArray(corpus)||corpus.length!==114){add('SURAH_COUNT');return {passed:false,checked:0,issues}}
 if(!Array.isArray(boundaries)||boundaries.length!==30){add('JUZ_BOUNDARY_COUNT');return {passed:false,checked:0,issues}}
 const offsets=[0];for(const n of EXPECTED_COUNTS)offsets.push(offsets.at(-1)+n);
 const starts=[];
 for(let i=0;i<30;i++){
  const b=boundaries[i],s=b?.surah,a=b?.ayah;
  if(!Number.isInteger(s)||s<1||s>114||!Number.isInteger(a)||a<1||a>EXPECTED_COUNTS[s-1]||b.juz!==i+1){add('JUZ_BOUNDARY_INVALID',s??null,a??null);continue}
  starts.push(offsets[s-1]+a);
 }
 if(starts.length!==30)return {passed:false,checked:0,issues};
 if(starts[0]!==1)add('JUZ_FIRST_BOUNDARY');
 for(let i=1;i<30;i++)if(starts[i]<=starts[i-1])add('JUZ_BOUNDARY_ORDER');
 if(issues.length)return {passed:false,checked:0,issues};
 let checked=0;
 for(let s=1;s<=114;s++){
  const rows=corpus[s-1]?.ayahs;
  if(corpus[s-1]?.number!==s||!Array.isArray(rows)||rows.length!==EXPECTED_COUNTS[s-1]){add('SURAH_STRUCTURE',s);continue}
  for(let a=1;a<=rows.length;a++){
   const global=offsets[s-1]+a;
   let expected=1;while(expected<30&&global>=starts[expected])expected++;
   const v=rows[a-1];
   if(v?.number!==global||v?.numberInSurah!==a)add('VERSE_ID',s,a);
   if(!Number.isInteger(v?.juz)||v.juz!==expected)add('JUZ_MISMATCH',s,a);
   checked++;
  }
 }
 return {passed:issues.length===0&&checked===TOTAL_AYAHS,checked,issues};
}
