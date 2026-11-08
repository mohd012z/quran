import{readFile,writeFile}from 'node:fs/promises';import{createHash}from 'node:crypto';import{auditCorpus}from '../src/quran-corpus-audit.js';
const args=process.argv.slice(2);
if(args.length!==4){console.error('Usage: node scripts/audit-quran-corpus.mjs PRIMARY.json REFERENCE.json MALAY.json REPORT.json');process.exitCode=2}else{
 const [a,b,c,out]=args;const files=await Promise.all([a,b,c].map(async p=>{const bytes=await readFile(p);return {file:p,sha256:createHash('sha256').update(bytes).digest('hex'),data:JSON.parse(bytes.toString('utf8'))}}));
 const audit=auditCorpus(files[0].data,files[1].data,{translation:files[2].data});
 const report={status:audit.passed?'PASS':'FAIL',checked:audit.checked,expected:6236,sources:files.map(({file,sha256})=>({file,sha256})),normalization:'NONE: exact Unicode comparison, no diacritics or Basmalah removed',issues:audit.issues};
 await writeFile(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checked:report.checked,discrepancies:report.issues.length,report:out}));if(!audit.passed)process.exitCode=1;
}
