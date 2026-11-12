// Fail-closed generator for public/offline/alafasy-manifest.json.
//
// The manifest pins the SHA-256 of every verse MP3 served by the on-demand
// audio pack. It is generated from the *source* tree (Raf0707/q7h_alafasy
// layout: <SSS>/<SSSAAA>.mp3) that also feeds the audio-pack branch, so the
// manifest, the pack and the corpus always describe the same bytes.
//
// Usage: node scripts/build-alafasy-manifest.mjs <SOURCE_AUDIO_ROOT>
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'..');
const src=process.argv[2];
if(!src)throw new Error('Usage: node scripts/build-alafasy-manifest.mjs <SOURCE_AUDIO_ROOT>');

const AYAH_COUNTS=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const TOTAL=AYAH_COUNTS.reduce((a,b)=>a+b,0);
if(AYAH_COUNTS.length!==114||TOTAL!==6236)throw new Error('Immutable ayah count table corrupted');
const sha=b=>createHash('sha256').update(b).digest('hex');
const isMp3=b=>b.length>=4&&((b[0]===0x49&&b[1]===0x44&&b[2]===0x33)||(b[0]===0xff&&(b[1]&0xe0)===0xe0));

let globalNumber=0;
const files=[];
let totalBytes=0;
for(let s=1;s<=114;s++){
  const dir=resolve(src,String(s).padStart(3,'0'));
  for(let a=1;a<=AYAH_COUNTS[s-1];a++){
    globalNumber++;
    const srcFile=resolve(dir,String(s).padStart(3,'0')+String(a).padStart(3,'0')+'.mp3');
    let bytes;try{bytes=await readFile(srcFile)}catch{throw new Error('Missing or unreadable Alafasy MP3 for '+s+':'+a)}
    if(bytes.length===0)throw new Error('Empty MP3 for '+s+':'+a);
    if(!isMp3(bytes))throw new Error('MP3 header not recognized for '+s+':'+a);
    files.push({verse:globalNumber,path:'/offline/alafasy/'+globalNumber+'.mp3',sha256:sha(bytes),bytes:bytes.length});
    totalBytes+=bytes.length;
  }
}
if(globalNumber!==6236)throw new Error('Found '+globalNumber+' MP3s, expected 6236');
if(new Set(files.map(f=>f.verse)).size!==6236)throw new Error('Duplicate verse numbers in audio source');

const manifest={
  schema:1,
  qari:'ar.alafasy',
  reciter:'Mishary Rashid Alafasy',
  bitrateKbps:128,
  licenseReviewed:false,
  licenseStatus:'documented-pending',
  licenseReference:'Recording: Mishary Rashid Alafasy, EveryAyah 128kbps collection, mirrored by Raf0707/q7h_alafasy (generated from alafasy.zip, everyayah.com). Redistribution terms are DOCUMENTED here but not yet independently confirmed by the rights holder, so licenseReviewed stays false. Audio is downloaded on demand per verse (served from the audio-pack branch via GitHub Pages) for non-commercial personal/research use; obtain written permission before commercial distribution. See docs/OFFLINE_ASSET_RIGHTS.md.',
  files
};
await writeFile(resolve(root,'public/offline/alafasy-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const report={status:'BUILT',files:files.length,totalBytes,totalMB:Math.round(totalBytes/1048576*10)/10,licenseReviewed:false};
console.log(JSON.stringify(report,null,2));
