import test from 'node:test';import assert from 'node:assert/strict';import{alignEditions}from '../src/api.js';
const make=(text='الٓمٓ')=>[0,1,2,3].map((_,index)=>({number:2,ayahs:[{number:8,numberInSurah:1,surah:{number:2},text:index===0?text:'verified',audio:'https://example.invalid/audio.mp3'}]}));
test('reject mismatched Arabic and Malay verse identity',()=>{const e=make();e[1].ayahs[0].numberInSurah=2;assert.throws(()=>alignEditions(e,2),/Verse identity/)});
test('reject mismatched surah metadata',()=>{const e=make();e[2].number=3;assert.throws(()=>alignEditions(e,2),/Surah identity/)});
test('reject Basmalah substituted for Al-Baqarah 2:1',()=>assert.throws(()=>alignEditions(make('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'),2),/Canonical Quran anchor/));
test('accept Al-Baqarah 2:1 canonical letters',()=>assert.equal(alignEditions(make(),2)[0].arabic,'الٓمٓ'));
