// Deterministic offline Alafasy audio packager.
//
// Copies the 6,236 verse-by-verse Alafasy MP3s from a local source tree
// (Raf0707/q7h_alafasy layout: <SSS>/<SSSAAA>.mp3) into
// public/offline/alafasy/<GLOBAL_VERSE>.mp3 and writes
// public/offline/alafasy-manifest.json — the exact schema enforced by
// src/qari.js validateOfflineAlafasyManifest() / verifyOfflineAlafasyRecording().
//
// Each MP3's SHA-256 is computed from the actual packaged bytes, and every file
// is header-checked (ID3 or raw MP3 frame sync) before it is accepted.
// No file is silently skipped: any missing, empty or unrecognizable ayah fails
// the whole run (fail-closed, matching the corpus build).
//
// Usage: node scripts/build-offline-audio.mjs <SOURCE_AUDIO_ROOT>
//   SOURCE_AUDIO_ROOT must contain 001/ ... 114/ with SSSAAA.mp3 per ayah.
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const src=process.argv[2];
if(!src)throw new Error('Usage: node scripts/build-offline-audio.mjs <SOURCE_AUDIO_ROOT>');

// Immutable 114-surah ayah counts (Hafs).
const AYAH_COUNTS=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const TOTAL=AYAH_COUNTS.reduce((a,b)=>a+b,0);
if(AYAH_COUNTS.length!==114||TOTAL!==6236)throw new Error('Immutable ayah count table corrupted');

const sha=b=>createHash('sha256').update(b).digest('hex');
const outDir=resolve(root,'public/offline/alafasy');
await mkdir(outDir,{recursive:true});

let globalNumber=0;
const files=[];
for(let s=1;s<=114;s++){
  const dir=resolve(src,String(s).padStart(3,'0'));
  for(let a=1;a<=AYAH_COUNTS[s-1];a++){
    globalNumber++;
    const srcFile=resolve(dir,String(s).padStart(3,'0')+String(a).padStart(3,'0')+'.mp3');
    const destFile=resolve(outDir,globalNumber+'.mp3');
    let bytes;
    try{bytes=await readFile(srcFile)}catch(e){throw new Error('Missing or unreadable Alafasy MP3 for '+s+':'+a+' ('+srcFile+')')}
    if(bytes.length===0)throw new Error('Empty MP3 for '+s+':'+a);
    // Header check mirroring src/qari.js verifyOfflineAlafasyRecording():
    const id3=bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33;
    const raw=bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0;
    if(!id3&&!raw)throw new Error('MP3 header not recognized for '+s+':'+a);
    await copyFile(srcFile,destFile);
    // Re-read the packaged bytes so the manifest hash covers what ships, not the source.
    const shipped=await readFile(destFile);
    if(sha(shipped)!==sha(bytes))throw new Error('Copy mismatch for '+s+':'+a);
    files.push({verse:globalNumber,path:'/offline/alafasy/'+globalNumber+'.mp3',sha256:sha(shipped),bytes:shipped.length});
  }
}
if(globalNumber!==6236)throw new Error('Packed '+globalNumber+' MP3s, expected 6236');
if(new Set(files.map(f=>f.verse)).size!==6236)throw new Error('Duplicate verse numbers in audio pack');

const manifest={
  schema:1,
  qari:'ar.alafasy',
  reciter:'Mishary Rashid Alafasy',
  bitrateKbps:128,
  licenseReviewed:false,
  licenseStatus:'documented-pending',
  licenseReference:'Recording: Mishary Rashid Alafasy, EveryAyah 128kbps collection, mirrored by Raf0707/q7h_alafasy (generated from alafasy.zip, everyayah.com). Redistribution terms are DOCUMENTED here but not yet independently confirmed by the rights holder, so licenseReviewed stays false. This build ships the audio for non-commercial personal/research use; obtain written permission (or use the iptvchecker/content-everyayah SHA-256-verified source records) before commercial distribution. See docs/OFFLINE_ASSET_RIGHTS.md.',
  files
};
await writeFile(resolve(root,'public/offline/alafasy-manifest.json'),JSON.stringify(manifest,null,2)+'\n');

const totalBytes=files.reduce((n,f)=>n+f.bytes,0);
const report={
  status:'BUILT',
  files:files.length,
  totalBytes,
  totalMB:Math.round(totalBytes/1048576*10)/10,
  largestMB:Math.round(Math.max(...files.map(f=>f.bytes))/1048576*100)/100,
  smallestKB:Math.round(Math.min(...files.map(f=>f.bytes))/1024*10)/10,
  licenseReviewed:manifest.licenseReviewed
};
await writeFile(resolve(root,'offline-sources/alafasy-build-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
