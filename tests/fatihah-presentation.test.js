import test from 'node:test';
import assert from 'node:assert/strict';
import {fatihahReadingLabel} from '../src/fatihah-presentation.js';
test('Al-Fatihah canonical Basmalah remains opening reference 1:1',()=>assert.equal(fatihahReadingLabel(1,1),'Basmalah · pembukaan (rujukan 1:1)'));
test('Alhamdulillah canonical 1:2 is first reading line, not rewritten ayah ID',()=>assert.equal(fatihahReadingLabel(1,2),'Baris bacaan 1 · rujukan 1:2'));
test('Al-Fatihah last canonical verse remains explicitly labelled as reading line 6',()=>assert.equal(fatihahReadingLabel(1,7),'Baris bacaan 6 · rujukan 1:7'));
test('Al-Baqarah, At-Tawbah and An-Naml keep original verse numbers',()=>{for(const n of [2,9,27])assert.equal(fatihahReadingLabel(n,1),'Ayat 1');assert.equal(fatihahReadingLabel(27,30),'Ayat 30')});
test('Invalid references fail closed',()=>{for(const args of [[0,1],[115,1],[1,0],[1,1.5],['1',2]])assert.throws(()=>fatihahReadingLabel(...args),RangeError)});
