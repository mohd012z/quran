import test from 'node:test';
import assert from 'node:assert/strict';
import{estimateF0,classifyRelativePitch}from '../src/pitch.js';
const wave=(hz,rate=16000,n=4096)=>Float32Array.from({length:n},(_,i)=>0.4*Math.sin(2*Math.PI*hz*i/rate));
test('detects clean 200 Hz periodic waveform',()=>{const p=estimateF0(wave(200),16000);assert.ok(p);assert.ok(Math.abs(p.hz-200)<4);assert.ok(p.confidence>.95)});
test('silence is not mistaken for a pitch',()=>assert.equal(estimateF0(new Float32Array(4096),16000),null));
test('rejects nonfinite and undersized input',()=>{assert.equal(estimateF0(new Float32Array(10),16000),null);assert.equal(estimateF0(Float32Array.from({length:4096},(_,i)=>i===4?NaN:0),16000),null);assert.throws(()=>estimateF0([],16000),/input/)});
test('relative voice levels are calibrated to speaker baseline',()=>{assert.equal(classifyRelativePitch(200,200),'medium');assert.equal(classifyRelativePitch(150,200),'low');assert.equal(classifyRelativePitch(260,200),'high')});
test('rejects invalid baseline and F0',()=>{assert.throws(()=>classifyRelativePitch(0,200),/frequency/);assert.throws(()=>classifyRelativePitch(200,0),/frequency/)});
