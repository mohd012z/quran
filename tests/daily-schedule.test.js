import test from 'node:test';import assert from 'node:assert/strict';import{nextDailyOccurrence,dailyReminderPayload,shouldReschedule}from '../src/daily-schedule.js';
test('future time today is chosen',()=>{const now=new Date(2026,10,8,7,0);const next=nextDailyOccurrence(now,'08:00');assert.equal(next.getDate(),8);assert.equal(next.getHours(),8)});
test('past or equal time advances one local calendar day',()=>{const now=new Date(2026,10,8,8,0);const next=nextDailyOccurrence(now,'08:00');assert.equal(next.getDate(),9)});
test('local timezone offset is preserved by calendar construction',()=>{const now=new Date(2026,10,8,20,0);const next=nextDailyOccurrence(now,'07:15');assert.equal(next.getHours(),7);assert.equal(next.getMinutes(),15)});
test('rejects invalid reminder time and dates',()=>{assert.throws(()=>nextDailyOccurrence(new Date(),'24:30'));assert.throws(()=>nextDailyOccurrence(new Date(NaN),'08:00'))});
test('disabled reminders never create notification payloads',()=>assert.equal(dailyReminderPayload({enabled:false,time:'08:00'}),null));
test('stable id and non-sensitive notification body',()=>{const p=dailyReminderPayload({enabled:true,time:'08:00'},new Date(2026,10,8,7));assert.equal(p.id,1001);assert.ok(!JSON.stringify(p).includes('audio'))});
test('schedule changes detected for enabled or time changes',()=>{assert.equal(shouldReschedule('08:00','09:00',true,true),true);assert.equal(shouldReschedule('08:00','08:00',true,true),false)});
