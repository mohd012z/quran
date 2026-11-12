// Fail-closed verifier for the on-demand audio pack.
//
// The audio-pack branch serves 6,236 MP3s per verse (named by global verse
// number) from GitHub Pages. Before that branch is (re)pushed, run this
// against the local pack: every file must exist, be a recognizable MP3, and
// match the SHA-256 pinned in public/offline/alafasy-manifest.json. Any
// missing, empty, header-invalid or hash-mismatched verse fails the run.
//
// Usage: node scripts/verify-audio-pack.mjs <AUDIO_PACK_DIR> [MANIFEST]
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {validateOfflineAlafasyManifest} from '../src/qari.js';

const packDir=resolve(process.argv[2]||'audio-pack');
const manifestPath=resolve(process.argv[3]||'public/offline/alafasy-manifest.json');
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=JSON.parse((await readFile(manifestPath)).toString('utf8'));
const manifest=validateOfflineAlafasyManifest(raw);
const isMp3=b=>b.length>=4&&((b[0]===0x49&&b[1]===0x44&&b[2]===0x33)||(b[0]===0xff&&(b[1]&0xe0)===0xe0));
const listed=await readdir(packDir);
const expected=manifest.files.length;
if(listed.length!==expected)throw new Error('Audio pack has '+listed.length+' files, manifest pins '+expected);
let bytes=0;
for(const entry of manifest.files){
  const file=packDir+'/'+entry.verse+'.mp3';
  let data;try{data=await readFile(file)}catch{throw new Error('Missing verse '+entry.verse)}
  if(data.length===0)throw new Error('Empty verse '+entry.verse);
  if(!isMp3(data))throw new Error('MP3 header invalid for verse '+entry.verse);
  if(sha(data)!==entry.sha256)throw new Error('SHA-256 mismatch for verse '+entry.verse);
  bytes+=data.length;
}
const report={status:'VERIFIED',files:expected,totalBytes:bytes,totalMB:Math.round(bytes/1048576*10)/10,manifest:manifestPath,packDir};
console.log(JSON.stringify(report,null,2));
