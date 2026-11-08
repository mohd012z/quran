import{readFile,writeFile}from 'node:fs/promises';import{createHash}from 'node:crypto';import{auditCorpus,auditSourceManifest}from '../src/quran-corpus-audit.js';import{auditJuzCoverage}from '../src/quran-juz-audit.js';
const args=process.argv.slice(2);
if(args.length<4||args.length>6){console.error('Usage: node scripts/audit-quran-corpus.mjs PRIMARY.json REFERENCE.json MALAY.json REPORT.json [JUZ_BOUNDARIES.json] [SOURCE_MANIFEST.json]');process.exitCode=2}else{
 const [a,b,c,out,juzPath,manifestPath]=args;
 const load=async p=>{const bytes=await readFile(p);return {file:p,sha256:createHash('sha256').update(bytes).digest('hex'),data:JSON.parse(bytes.toString('utf8'))}};
 const files=await Promise.all([a,b,c].map(load));
 const audit=auditCorpus(files[0].data,files[1].data,{translation:files[2].data});
 const juz=juzPath?await load(juzPath):null,manifest=manifestPath?await load(manifestPath):null;
 const juzAudit=juz?auditJuzCoverage(files[0].data,juz.data):null;
 const provenance=manifest?auditSourceManifest(manifest.data):null;
 const roles=['arabic-primary','arabic-reference','malay-translation'];
 const hashIssues=manifest?files.flatMap((f,i)=>manifest.data?.sources?.find(s=>s?.role===roles[i])?.sha256===f.sha256?[]:[{code:'SOURCE_HASH_MISMATCH',source:roles[i]}]):[];
 const report={status:audit.passed&&juzAudit?.passed&&provenance?.passed&&hashIssues.length===0?'PASS':'UNVERIFIED_OR_FAIL',checked:audit.checked,expected:6236,sources:[...files,...(juz?[juz]:[]),...(manifest?[manifest]:[])].map(({file,sha256})=>({file,sha256})),normalization:'NONE: exact Unicode comparison',checks:{arabicAndMalay:{passed:audit.passed,issues:audit.issues},juzBoundaries:juzAudit??{passed:false,reason:'INDEPENDENT_BOUNDARIES_NOT_SUPPLIED'},provenance:provenance??{passed:false,reason:'SOURCE_MANIFEST_NOT_SUPPLIED'},hashes:{passed:!!manifest&&!hashIssues.length,issues:hashIssues}},limitations:['PASS means structural parity only; religious authenticity and license permissions require human review']};
 await writeFile(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checked:report.checked,report:out}));if(report.status!=='PASS')process.exitCode=1;
}
