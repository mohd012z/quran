import{PRAYERS,validPrayerTime}from './solat.js';
export const JAKIM_ZONES=Object.freeze([
 {code:'JHR01',label:'Johor — Pulau Aur, Pulau Pemanggil'},
 {code:'JHR02',label:'Johor — Johor Bahru, Kota Tinggi, Mersing'},
 {code:'JHR03',label:'Johor — Kluang, Pontian'},
 {code:'JHR04',label:'Johor — Batu Pahat, Muar, Segamat, Gemas'},
 {code:'WLY01',label:'Wilayah Persekutuan — Kuala Lumpur, Putrajaya'}
]);
const keys={subuh:'fajr',zohor:'dhuhr',asar:'asr',maghrib:'maghrib',isyak:'isha'};
const monthNames={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
export function malaysiaDate(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replace(/\//g,'-')}
export function parseJakimDate(value){
 if(typeof value!=='string')return null;
 const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
 const eng=/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(value);
 let y,m,d;if(iso){y=Number(iso[1]);m=Number(iso[2]);d=Number(iso[3])}else if(eng){y=Number(eng[3]);m=monthNames[eng[2].toUpperCase()];d=Number(eng[1])}else return null;
 if(!m||y<2000||y>2100||d<1||d>31)return null;
 const check=new Date(Date.UTC(y,m-1,d));if(check.getUTCFullYear()!==y||check.getUTCMonth()!==m-1||check.getUTCDate()!==d)return null;
 return [y,String(m).padStart(2,'0'),String(d).padStart(2,'0')].join('-');
}
function parseTime(value){if(typeof value!=='string')return null;const x=value.trim();if(validPrayerTime(x))return x;const m=/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(x);if(!m)return null;let h=Number(m[1]);if(h<1||h>12)return null;h=h%12+(m[3].toUpperCase()==='PM'?12:0);return String(h).padStart(2,'0')+':'+m[2]}
export function normalizeJakimResponse(payload,zone,expectedDate){
 if(!JAKIM_ZONES.some(z=>z.code===zone))throw Error('Zon belum disokong');
 const rows=payload?.prayerTime;if(!Array.isArray(rows)||rows.length!==1)throw Error('Rekod JAKIM tidak lengkap');
 const row=rows[0];const date=parseJakimDate(row.date);
 if(!date||date!==expectedDate)throw Error('Tarikh takwim tidak sepadan dengan hari Malaysia');
 const times={};for(const p of PRAYERS){const time=parseTime(row[keys[p.id]]);if(!time)throw Error('Waktu '+p.name+' tidak sah');times[p.id]=time}
 const minutes=t=>Number(t.slice(0,2))*60+Number(t.slice(3));
 const ordered=PRAYERS.map(p=>minutes(times[p.id]));if(ordered.some((v,i)=>i&&v<=ordered[i-1]))throw Error('Susunan waktu tidak sah');
 return {zone,date,times,source:'JAKIM e-Solat',verified:true};
}
export async function fetchJakimDaily(zone,{fetchImpl=globalThis.fetch,date=malaysiaDate(),signal}={}){
 if(!JAKIM_ZONES.some(z=>z.code===zone))throw Error('Zon tidak dikenali');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Tarikh tidak sah');
 const url='https://www.e-solat.gov.my/index.php?r=esolatApi%2Ftakwimsolat&period=today&zone='+encodeURIComponent(zone);
 const response=await fetchImpl(url,{method:'GET',signal,cache:'no-store',headers:{Accept:'application/json'}});
 if(!response.ok)throw Error('JAKIM HTTP '+response.status);
 return normalizeJakimResponse(await response.json(),zone,date);
}
