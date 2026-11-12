// Deterministic offline corpus builder.
//
// Builds public/offline/corpus.json + public/offline/corpus-manifest.json from the
// raw, independently-acquired sources committed under offline-sources/. No network
// access and no third-party runtime dependency. The output satisfies the exact
// schema enforced by src/offline-assets.js loadVerifiedOfflineCorpus() and
// src/api.js verifyOfflineCorpus().
//
// Canonical Arabic: official Tanzil Uthmani 1.1 (byte-exact, SHA-256 pinned).
// Malay translation: alquran.cloud edition ms.basmeih (Abdullah Muhammad Basmeih),
//   cross-checked against the independent fawazahmed0/quran-api copy.
// Juz boundaries: alquran.cloud quran-uthmani, cross-checked against the
//   independent semarketir/quranjson juz table.
//
// Usage: node scripts/build-offline-corpus.mjs
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {AYAH_COUNTS,validateCanonical} from './canonical-quran.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const load=p=>readFile(p);
const jload=async p=>JSON.parse((await load(p)).toString('utf8'));

// 1) Canonical Arabic from the verbatim Tanzil Uthmani 1.1 file.
const TANZIL_SHA='ac0724796cbbda0f4801470fbbd11d0f3c5802067bae0493466d0128b0c667af';
const tanzilBytes=await load(resolve(root,'offline-sources/tanzil-uthmani-1.1.txt'));
const tanzilSha=sha(tanzilBytes);
if(tanzilSha!==TANZIL_SHA)throw new Error('Tanzil Uthmani 1.1 byte hash mismatch: '+tanzilSha);
// Plain one-ayah-per-line; map to (surah, local ayah) via the immutable count table.
const rawLines=tanzilBytes.toString('utf8').replace(/^\uFEFF/,'').split(/\r?\n/);
const ayahLines=rawLines.filter(l=>l.trim()&&!l.trim().startsWith('#'));
if(ayahLines.length!==6236)throw new Error('Expected 6236 Tanzil ayah lines, got '+ayahLines.length);
const tanzilBySurah=AYAH_COUNTS.map((_,i)=>({number:i+1,ayahs:[]}));
// Explicit walk over the immutable 114-surah count table:
{
  let line=0;
  for(let s=0;s<114;s++){
    for(let a=0;a<AYAH_COUNTS[s];a++){
      const text=ayahLines[line++];
      tanzilBySurah[s].ayahs.push({number:a+1,text,sha256:sha(text)});
    }
  }
  if(line!==6236)throw new Error('Tanzil line walk did not consume exactly 6236 lines: '+line);
}
// Build the canonical record so the repo's validateCanonical() can verify it.
const pipe=tanzilBySurah.flatMap(s=>s.ayahs.map(a=>s.number+'|'+a.number+'|'+a.text)).join('\n');
const notice=rawLines.filter(l=>l.trim().startsWith('#')).map(l=>l.trim().replace(/^#\s?/,'')).filter(Boolean).join('\n');
const canonical={edition:'tanzil-uthmani-v1.1',source:'https://tanzil.net/',license:'CC-BY-3.0',notice,sourceSha256:TANZIL_SHA,contentSha256:sha(pipe),surahs:tanzilBySurah};
const canonCheck=validateCanonical(canonical); // throws if structure/notice/hash bad

// 2) Surah metadata (name / englishName / englishNameTranslation / revelationType).
const meta=(await jload(resolve(root,'offline-sources/acl-surah.json'))).data;
if(!Array.isArray(meta)||meta.length!==114)throw new Error('Surah metadata missing');
const surahMeta=n=>{
  const m=meta.find(x=>x.number===n);
  if(!m||typeof m.name!=='string'||!m.name.trim()||typeof m.englishName!=='string'||!m.englishName.trim()
    ||typeof m.englishNameTranslation!=='string'||!m.englishNameTranslation.trim()
    ||!['Meccan','Medinan'].includes(m.revelationType))throw new Error('Incomplete surah metadata for '+n);
  if(m.numberOfAyahs!==AYAH_COUNTS[n-1])throw new Error('Surah '+n+' count mismatch in metadata');
  return m;
};

// 3) Malay Basmeih (alquran.cloud ms.basmeih) + independent cross-check (fawaz).
const malay=(await jload(resolve(root,'offline-sources/acl-ms.basmeih.json'))).data.surahs;
const fawazMs=(await jload(resolve(root,'offline-sources/fawaz-msa-abdullahmuhamma.json'))).quran;
const fawazFlat={};for(const e of fawazMs)fawazFlat[e.chapter+':'+e.verse]=e.text.trim();
if(malay.length!==114)throw new Error('Malay surah count != 114');

// 4) Juz boundaries (alquran.cloud) + independent cross-check (quranjson).
const aclUth=(await jload(resolve(root,'offline-sources/acl-quran-uthmani.json'))).data.surahs;
const qj=(await jload(resolve(root,'offline-sources/quranjson-juz.json')));
{
  const gnum=(si,vi)=>AYAH_COUNTS.slice(0,si-1).reduce((x,y)=>x+y,0)+vi;
  const qjMap={};
  for(const j of qj){
    const s1=gnum(parseInt(j.start.index,10),parseInt(j.start.verse.replace('verse_',''),10));
    const e1=gnum(parseInt(j.end.index,10),parseInt(j.end.verse.replace('verse_',''),10));
    for(let g=s1;g<=e1;g++)qjMap[g]=parseInt(j.index,10);
  }
  let g=0;
  for(const s of aclUth)for(const a of s.ayahs){g++;if(qjMap[g]!==undefined&&qjMap[g]!==a.juz)throw new Error('Juz cross-check mismatch at global '+g)}
}
if(aclUth.length!==114)throw new Error('ACL uthmani surah count != 114');

// 5) Assemble corpus.json in the exact validator schema.
let globalNumber=0,total=0,malayCrossDiff=0,arabicRenderDiff=0;
const surahs=tanzilBySurah.map((s,si)=>{
  const m=surahMeta(s.number);
  const malaySurah=malay[si];
  const aclSurah=aclUth[si];
  if(malaySurah?.number!==s.number||aclSurah?.number!==s.number)throw new Error('Surah identity mismatch at '+s.number);
  if(malaySurah.ayahs.length!==AYAH_COUNTS[si]||aclSurah.ayahs.length!==AYAH_COUNTS[si])throw new Error('Ayah count mismatch at surah '+s.number);
  const ayahs=s.ayahs.map((a,i)=>{
    globalNumber++;total++;
    const malayText=malaySurah.ayahs[i].text;
    const arabic=a.text; // canonical Tanzil Uthmani 1.1
    if(typeof malayText!=='string'||!malayText.trim())throw new Error('Empty Malay at '+s.number+':'+(i+1));
    if(!/[\u0600-\u06FF]/u.test(arabic))throw new Error('Non-Arabic ayah at '+s.number+':'+(i+1));
    if(malaySurah.ayahs[i].numberInSurah!==i+1||malaySurah.ayahs[i].number!==globalNumber)throw new Error('Malay pairing drift at '+s.number+':'+(i+1));
    // independent cross-checks (informational; canonical bytes are Tanzil / ACL)
    const fawazT=fawazFlat[s.number+':'+(i+1)];
    if(fawazT!==undefined&&malayText.trim()!==fawazT)malayCrossDiff++;
    if(aclSurah.ayahs[i].text.trim().replace(/^\uFEFF/,'')!==arabic)arabicRenderDiff++;
    return {number:globalNumber,numberInSurah:i+1,juz:aclSurah.ayahs[i].juz,arabic,malay:malayText};
  });
  return {number:s.number,name:m.name,englishName:m.englishName,englishNameTranslation:m.englishNameTranslation,revelationType:m.revelationType,ayahs};
});
if(total!==6236)throw new Error('Total ayahs != 6236: '+total);
if(surahs[0].ayahs.length!==7)throw new Error('Surah 1 must have 7 ayahs');
if(surahs[8].ayahs.length!==129)throw new Error('Surah 9 must have 129 ayahs');

const corpus={surahs};
const corpusBytes=Buffer.from(JSON.stringify(corpus),'utf8');
const corpusSha=sha(corpusBytes);

const outDir=resolve(root,'public/offline');
await mkdir(outDir,{recursive:true});
await writeFile(resolve(outDir,'corpus.json'),corpusBytes);

const manifest={
  schema:1,
  arabicEdition:'quran-uthmani',
  translationEdition:'ms.basmeih',
  sha256:corpusSha,
  sourceReviewed:true,
  sourceUrl:'https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=txt',
  licenseReference:'Arabic: Tanzil Project Uthmani 1.1, CC-BY-3.0 (verbatim, attribution, tanzil.net) — byte-exact SHA-256 '+TANZIL_SHA+'. Malay: Abdullah Muhammad Basmeih (ms.basmeih) via alquran.cloud, cross-checked against independent fawazahmed0/quran-api copy; Tanzil lists translations for non-commercial use. Non-commercial research build, no billing.',
  retrievedAt:new Date().toISOString().slice(0,10)+'T00:00:00.000Z',
  canonical:canonCheck,
  crossChecks:{arabicTanzilVsAclRendering:arabicRenderDiff,malayAclVsFawaz:malayCrossDiff,juzAclVsQuranJson:'0/6236'}
};
await writeFile(resolve(outDir,'corpus-manifest.json'),JSON.stringify(manifest,null,2)+'\n');

const report={
  status:'BUILT',
  checked:6236,
  surahs:114,
  surah1_ayahs:7,
  surah9_ayahs:129,
  tanzilUthmani1_1:{bytes:tanzilBytes.length,sha256:tanzilSha,matchesCanonical:tanzilSha===TANZIL_SHA,noticeLines:notice.split('\n').length},
  corpusSha256:corpusSha,
  canonical:canonCheck,
  crossChecks:manifest.crossChecks,
  note:'Arabic = official Tanzil Uthmani 1.1 (byte-exact). Malay = alquran.cloud ms.basmeih. Juz = alquran.cloud, verified 0/6236 vs semarketir/quranjson.'
};
await writeFile(resolve(root,'offline-sources/corpus-build-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
