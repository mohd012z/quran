import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const cases=[
 ['maven rate limit',"Could not GET 'https://repo.maven.apache.org/maven2/a.pom'. Received status code 429 from server: Too Many Requests",true],
 ['maven unavailable','Received status code 503 from server: Service Unavailable',true],
 ['wrapper timeout','Downloading gradle-8.2.1-all.zip failed: timeout',true],
 ['socket timeout','java.net.SocketTimeoutException: Read timed out',true],
 ['wrapper github 502','Server returned HTTP response code: 502 for URL: https://github.com/gradle/gradle-distributions/releases/download/v8.2.1/gradle-8.2.1-all.zip',true],
 ['compile failure','Execution failed for task :app:compileDebugJavaWithJavac',false],
 ['missing resource','AAPT: error: resource drawable/icon not found',false],
 ['non-retryable HTTP 404','Received status code 404 from server: Not Found',false],
 ['irrelevant 429','Status code 429 was configured in a unit test assertion',false],
 ['empty log','',false]
];
for(const [name,log,retryable] of cases)test('Gradle retry classifier: '+name,()=>{
 const dir=mkdtempSync(join(tmpdir(),'quran-gradle-classifier-'));
 try{
  const file=join(dir,'gradle.log');writeFileSync(file,log);
  const result=spawnSync('bash',['scripts/classify-gradle-failure.sh',file],{encoding:'utf8'});
  assert.equal(result.status,retryable?0:1,result.stderr);
  assert.equal(result.stdout.trim(),retryable?'retryable':'non-retryable');
 }finally{rmSync(dir,{recursive:true,force:true})}
});
