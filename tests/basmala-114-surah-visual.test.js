import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

// Execute the exact production visual splitter, without importing React or mutating sacred text.
const source=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const match=source.match(/function splitVerifiedBasmalaDisplay\(text,surah,ayah\)\{[\s\S]*?\n\}/u);
assert.ok(match,'Production Bismillah splitter must exist');
const split=runInNewContext(match[0]+';splitVerifiedBasmalaDisplay');
const opening='بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ';
const verse='يَا أَيُّهَا الَّذِينَ آمَنُوا';

for(let surah=1;surah<=114;surah++){
 test('Surah '+surah+': visual Bismillah split retains original Ayat 1 code points',()=>{
  const original=opening+verse;
  const result=split(original,surah,1);
  if(surah===1||surah===9){assert.equal(result,null);return;}
  assert.ok(result,'Opening is separated for eligible first-ayah fixture');
  assert.equal(result.opening+result.remainder,original,'Never modify the Arabic source');
  assert.equal(result.opening,opening);
  assert.equal(result.remainder,verse);
  assert.equal(split(original,surah,2),null,'Never split Ayat 2');
  assert.equal(split(verse,surah,1),null,'Do not invent an absent Bismillah');
 });
}

test('reader opening is a distinct section and the ayah list remains intact',()=>{
 assert.match(source,/className="surah-opening-basmala"/);
 assert.match(source,/Pembukaan Surah · Bismillah \(bukan Ayat 1\)/);
 assert.match(source,/aria-label="Ayat Al-Quran"/);
 assert.doesNotMatch(source,/details className="reader-mobile-options"/);
});
