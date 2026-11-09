import{MALAYSIA_2026_EVENTS,eligibleOfficialEventReminders,localEventDate}from './malaysia-hijri-events.js';
export const EVENT_REMINDER_STORAGE_KEY='quran-hijri-event-reminders-v1';
export function readEventReminderPreferences(storage){
 try{const raw=JSON.parse(storage.getItem(EVENT_REMINDER_STORAGE_KEY)||'null');return {enabled:raw?.enabled===true,selectedIds:Array.isArray(raw?.selectedIds)?raw.selectedIds.filter(id=>MALAYSIA_2026_EVENTS.some(e=>e.id===id)):[]}}catch{return {enabled:false,selectedIds:[]}}
}
export function saveEventReminderPreferences(storage,prefs){try{storage.setItem(EVENT_REMINDER_STORAGE_KEY,JSON.stringify(prefs));return true}catch{return false}}
export function planOfficialEventReminders(prefs,{now=new Date(),confirmedDeclarations={}}={}){
 if(!prefs?.enabled||!Array.isArray(prefs.selectedIds))return [];
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))throw new Error('Invalid current date');
 const eligible=eligibleOfficialEventReminders(MALAYSIA_2026_EVENTS,Object.entries(confirmedDeclarations).filter(([id,proof])=>MALAYSIA_2026_EVENTS.some(e=>e.id===id&&e.requiresDeclaration)&&proof?.verified===true&&proof?.source=== 'official-declaration'&&proof?.date===MALAYSIA_2026_EVENTS.find(e=>e.id===id).date).map(([id])=>id));
 return eligible.filter(e=>prefs.selectedIds.includes(e.id)).map(e=>({...e,at:localEventDate(e.date)})).filter(e=>e.at>now).sort((a,b)=>a.at-b.at);
}
export async function synchronizeOfficialEventReminders(prefs,adapter,{now=new Date(),confirmedDeclarations={},requestPermission=false}={}){
 if(!adapter?.available())return {status:'unsupported',count:0};
 if(!prefs?.enabled){await adapter.cancel();return {status:'disabled',count:0}}
 const events=planOfficialEventReminders(prefs,{now,confirmedDeclarations});
 if(events.length===0){await adapter.cancel();return {status:'no-verified-upcoming-events',count:0}}
 let permission=await adapter.checkPermission();
 if(permission!=='granted'&&requestPermission)permission=await adapter.requestPermission();
 if(permission!=='granted'){await adapter.cancel();return {status:'permission-required',count:0}}
 await adapter.cancel();
 await adapter.schedule(events);
 return {status:'scheduled',count:events.length};
}
