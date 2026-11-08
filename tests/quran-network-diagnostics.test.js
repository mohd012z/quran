import test from 'node:test';import assert from 'node:assert/strict';import{classifyQuranNetworkFailure as classify,summarizeQuranRequest}from '../src/quran-network-diagnostics.js';
test('HTTP status is preserved without response content',()=>assert.deepEqual(classify(new Error('bad'),{status:503}),{kind:'HTTP',status:503}));
test('timeout is distinguished from generic fetch failure',()=>assert.equal(classify(Object.assign(new Error('aborted'),{name:'AbortError'})).kind,'TIMEOUT'));
test('DNS diagnostic requires explicit resolver evidence',()=>assert.equal(classify(new Error('net::ERR_NAME_NOT_RESOLVED')).kind,'DNS'));
test('generic Failed to fetch is not falsely asserted as CORS',()=>assert.equal(classify(new TypeError('Failed to fetch')).kind,'NETWORK_UNDETERMINED'));
test('CORS-like errors remain uncertain without browser evidence',()=>assert.equal(classify(new Error('CORS blocked')).certainty,'UNVERIFIED'));
test('redacted diagnostics include no Arabic, Malay or request URLs',()=>{const result=summarizeQuranRequest({edition:'ms.basmeih',kind:'NETWORK_UNDETERMINED',elapsedMs:120.4});assert.deepEqual(result,{edition:'ms.basmeih',kind:'NETWORK_UNDETERMINED',elapsedMs:120});assert.throws(()=>summarizeQuranRequest({edition:'https://bad.test?token=secret',kind:'OK'}))});
