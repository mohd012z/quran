import{Capacitor}from '@capacitor/core';
import{LocalNotifications}from '@capacitor/local-notifications';
import{synchronizeOfficialEventReminders}from './hijri-event-reminders.js';
const eventId=id=>2000+['israk-mikraj','ramadan','nuzul','aidilfitri','zulhijjah','aidiladha','maal-hijrah','maulidur-rasul'].indexOf(id);
export const nativeHijriAdapter={
 available:()=>Capacitor.isNativePlatform()&&Capacitor.isPluginAvailable('LocalNotifications'),
 checkPermission:async()=>(await LocalNotifications.checkPermissions()).display,
 requestPermission:async()=>(await LocalNotifications.requestPermissions()).display,
 cancel:async()=>LocalNotifications.cancel({notifications:Array.from({length:8},(_,i)=>({id:2000+i}))}),
 schedule:async events=>LocalNotifications.schedule({notifications:events.map(e=>({id:eventId(e.id),title:e.title,body:'Baca peristiwa Islam dan rujuk takwim rasmi Malaysia.',schedule:{at:e.at,allowWhileIdle:false}}))})
};
export function configureHijriEventReminders(prefs,options){return synchronizeOfficialEventReminders(prefs,nativeHijriAdapter,options)}
