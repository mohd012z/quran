import test from 'node:test';
import assert from 'node:assert/strict';
import{TARANNUM_STYLES,PITCH_LEVELS,createPracticeContour}from '../src/tarannum.js';
test('seven named Tarannum modes have unique identifiers',()=>{assert.equal(TARANNUM_STYLES.length,7);assert.equal(new Set(TARANNUM_STYLES.map(x=>x.id)).size,7)});
test('three distinct bounded pitch levels',()=>{assert.deepEqual(PITCH_LEVELS.map(x=>x.id),['low','medium','high'])});
test('practice contours are deterministic and do not alter Quran text',()=>{const a=createPracticeContour('bayyati','medium');assert.deepEqual(a,createPracticeContour('hijaz','medium'));assert.deepEqual(a.map(x=>x.id),['low','medium','high','medium']);assert.equal(a.length,4)});
test('low and high ranges remain inside known pitch levels',()=>{for(const range of ['low','high'])for(const p of createPracticeContour('rast',range))assert.ok(PITCH_LEVELS.includes(p))});
test('reject unsupported mode and pitch level',()=>{assert.throws(()=>createPracticeContour('invalid','medium'),/style/);assert.throws(()=>createPracticeContour('bayyati','invalid'),/range/)});
