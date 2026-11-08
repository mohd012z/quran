import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBookmarks,readBookmarks,toggleBookmark} from '../src/bookmarks.js';
test('normalizes and rejects invalid bookmark identities',()=>{
  assert.deepEqual(normalizeBookmarks([3,2,3,0,6237,'4',1]),[1,2,3]);
});
test('toggles and persists stable verse IDs',()=>{
  const memory=new Map();
  const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  assert.deepEqual(toggleBookmark([],42,storage),[42]);
  assert.deepEqual(readBookmarks(storage),[42]);
  assert.deepEqual(toggleBookmark([42],42,storage),[]);
  assert.deepEqual(readBookmarks(storage),[]);
});
test('corrupted storage is ignored safely',()=>{
  assert.deepEqual(readBookmarks({getItem:()=>'{invalid'}),[]);
  assert.throws(()=>toggleBookmark([],0,{setItem(){}}),/Invalid verse/);
});
