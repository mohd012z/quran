import{Capacitor}from '@capacitor/core';
import{LocalNotifications}from '@capacitor/local-notifications';
import{dailyReminderPayload}from './daily-schedule.js';
const ID=1001;
export function nativeRemindersAvailable(){return Capacitor.isNativePlatform()&&Capacitor.isPluginAvailable('LocalNotifications')}
export async function configureNativeReminder(reminder,{requestPermission=false,now=new Date()}={}){
 if(!nativeRemindersAvailable())return {status:'unsupported'};
 if(!reminder?.enabled){await LocalNotifications.cancel({notifications:[{id:ID}]});return {status:'disabled'}}
 let permission=await LocalNotifications.checkPermissions();
 if(permission.display!=='granted'&&requestPermission)permission=await LocalNotifications.requestPermissions();
 if(permission.display!=='granted')return {status:'permission-required'};
 const notification=dailyReminderPayload(reminder,now);
 await LocalNotifications.cancel({notifications:[{id:ID}]});
 await LocalNotifications.schedule({notifications:[{id:notification.id,title:notification.title,body:notification.body,schedule:{on:{hour:Number(reminder.time.slice(0,2)),minute:Number(reminder.time.slice(3,5))},allowWhileIdle:false},channelId:'daily-quran'}]});
 return {status:'scheduled'};
}
