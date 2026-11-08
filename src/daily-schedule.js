import{validReminderTime}from './dua.js';
export function nextDailyOccurrence(now,time){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime())||!validReminderTime(time))throw new Error('Invalid daily schedule');
 const [hour,minute]=time.split(':').map(Number);
 const next=new Date(now.getTime());
 next.setHours(hour,minute,0,0);
 if(next.getTime()<=now.getTime())next.setDate(next.getDate()+1);
 return next;
}
export function dailyReminderPayload(reminder,now=new Date()){
 if(!reminder?.enabled)return null;
 const at=nextDailyOccurrence(now,reminder.time);
 return {id:1001,title:'Bacaan Al-Quran harian',body:'Luangkan masa untuk membaca Al-Quran dan berdoa.',schedule:{at},smallIcon:'ic_stat_icon_config_sample'};
}
export function shouldReschedule(previousTime,currentTime,previousEnabled,currentEnabled){
 return previousTime!==currentTime||previousEnabled!==currentEnabled;
}
