import test from 'node:test';import assert from 'node:assert/strict';import{STUDY_MODULES,searchStudyModules}from '../src/islamic-studies.js';
test('eight distinct curriculum modules',()=>{assert.equal(STUDY_MODULES.length,8);assert.equal(new Set(STUDY_MODULES.map(m=>m.id)).size,8)});
test('source references are HTTPS and no unreviewed quotations are bundled',()=>{for(const m of STUDY_MODULES){assert.ok(m.source===null||m.source.startsWith('https://'));assert.ok(m.topics.length>0);assert.equal(Object.hasOwn(m,'text'),false)}});
test('Malay subject and topic search is deterministic',()=>{assert.deepEqual(searchStudyModules('solat').map(m=>m.id),['fiqh']);assert.deepEqual(searchStudyModules('tauhid').map(m=>m.id),['tauhid']);assert.equal(searchStudyModules('nonexistent').length,0)});
