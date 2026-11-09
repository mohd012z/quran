import{Capacitor}from '@capacitor/core';
import{LocalNotifications}from '@capacitor/local-notifications';
import{PRAYERS,validPrayerTime}from './solat.js';
import{malaysiaDate}from './jakim-solat.js';
const ids=PRAYERS.map((_,i)=>4100+i);
export function buildPrayerNotifications(official,now=new Date()){
 if(!official?.verified||official.date!==malaysiaDate(now)||!/^([A-Z]{3}\d{2})$/.test(official.zone))throw Error('Jadual rasmi hari ini diperlukan');
 return PRAYERS.flatMap((p,i)=>{const time=official.times?.[p.id];if(!validPrayerTime(time))throw Error('Waktu tidak sah');const at=new Date(official.date+'T'+time+':00+08:00');return at>now?[{id:ids[i],title:'Waktu '+p.name,body:'Waktu solat '+p.name+' bagi zon '+official.zone+' (JAKIM '+official.date+'). Buka aplikasi untuk mendengar azan.',schedule:{at,allowWhileIdle:false}}]:[]});
}
export function solatNotificationsAvailable(){return Capacitor.isNativePlatform()&&Capacitor.isPluginAvailable('LocalNotifications')}
export async function enablePrayerNotifications(official,{now=new Date(),adapter=LocalNotifications,available=solatNotificationsAvailable}={}){
 if(!available())return 'unavailable';
 const entries=buildPrayerNotifications(official,now);
 const permission=await adapter.requestPermissions();if(permission.display!=='granted')return 'denied';
 await adapter.cancel({notifications:ids.map(id=>({id}))});
 if(entries.length)await adapter.schedule({notifications:entries});
 return entries.length?'scheduled':'no-upcoming-times';
}
export async function disablePrayerNotifications({adapter=LocalNotifications,available=solatNotificationsAvailable}={}){
 if(!available())return 'unavailable';
 await adapter.cancel({notifications:ids.map(id=>({id}))});return 'disabled';
}
