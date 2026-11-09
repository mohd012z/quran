import{PRAYERS,validPrayerTime}from './solat.js';
export const JAKIM_ZONES=Object.freeze([
 {
  "code": "JHR01",
  "state": "Johor",
  "label": "Johor — Pulau Aur, Pulau Pemanggil",
  "areaVerified": true
 },
 {
  "code": "JHR02",
  "state": "Johor",
  "label": "Johor — Johor Bahru, Kota Tinggi, Mersing",
  "areaVerified": true
 },
 {
  "code": "JHR03",
  "state": "Johor",
  "label": "Johor — Kluang, Pontian",
  "areaVerified": true
 },
 {
  "code": "JHR04",
  "state": "Johor",
  "label": "Johor — Batu Pahat, Muar, Segamat, Gemas",
  "areaVerified": true
 },
 {
  "code": "KDH01",
  "state": "Kedah",
  "label": "Kedah — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KDH02",
  "state": "Kedah",
  "label": "Kedah — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KDH03",
  "state": "Kedah",
  "label": "Kedah — Zon 3 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KDH04",
  "state": "Kedah",
  "label": "Kedah — Zon 4 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KDH05",
  "state": "Kedah",
  "label": "Kedah — Zon 5 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KDH06",
  "state": "Kedah",
  "label": "Kedah — Zon 6 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KDH07",
  "state": "Kedah",
  "label": "Kedah — Zon 7 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KTN01",
  "state": "Kelantan",
  "label": "Kelantan — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "KTN02",
  "state": "Kelantan",
  "label": "Kelantan — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "MLK01",
  "state": "Melaka",
  "label": "Melaka — Seluruh Melaka",
  "areaVerified": true
 },
 {
  "code": "NGS01",
  "state": "Negeri Sembilan",
  "label": "Negeri Sembilan — Tampin, Jempol",
  "areaVerified": true
 },
 {
  "code": "NGS02",
  "state": "Negeri Sembilan",
  "label": "Negeri Sembilan — Kuala Pilah, Jelebu, Rembau",
  "areaVerified": true
 },
 {
  "code": "NGS03",
  "state": "Negeri Sembilan",
  "label": "Negeri Sembilan — Seremban, Port Dickson",
  "areaVerified": true
 },
 {
  "code": "PHG01",
  "state": "Pahang",
  "label": "Pahang — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PHG02",
  "state": "Pahang",
  "label": "Pahang — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PHG03",
  "state": "Pahang",
  "label": "Pahang — Zon 3 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PHG04",
  "state": "Pahang",
  "label": "Pahang — Zon 4 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PHG05",
  "state": "Pahang",
  "label": "Pahang — Zon 5 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PHG06",
  "state": "Pahang",
  "label": "Pahang — Zon 6 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PHG07",
  "state": "Pahang",
  "label": "Pahang — Zon 7 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK01",
  "state": "Perak",
  "label": "Perak — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK02",
  "state": "Perak",
  "label": "Perak — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK03",
  "state": "Perak",
  "label": "Perak — Zon 3 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK04",
  "state": "Perak",
  "label": "Perak — Zon 4 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK05",
  "state": "Perak",
  "label": "Perak — Zon 5 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK06",
  "state": "Perak",
  "label": "Perak — Zon 6 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PRK07",
  "state": "Perak",
  "label": "Perak — Zon 7 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "PLS01",
  "state": "Perlis",
  "label": "Perlis — Seluruh Perlis",
  "areaVerified": true
 },
 {
  "code": "PNG01",
  "state": "Pulau Pinang",
  "label": "Pulau Pinang — Seluruh Pulau Pinang",
  "areaVerified": true
 },
 {
  "code": "SBH01",
  "state": "Sabah",
  "label": "Sabah — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH02",
  "state": "Sabah",
  "label": "Sabah — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH03",
  "state": "Sabah",
  "label": "Sabah — Zon 3 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH04",
  "state": "Sabah",
  "label": "Sabah — Zon 4 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH05",
  "state": "Sabah",
  "label": "Sabah — Zon 5 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH06",
  "state": "Sabah",
  "label": "Sabah — Zon 6 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH07",
  "state": "Sabah",
  "label": "Sabah — Zon 7 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH08",
  "state": "Sabah",
  "label": "Sabah — Zon 8 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SBH09",
  "state": "Sabah",
  "label": "Sabah — Zon 9 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK01",
  "state": "Sarawak",
  "label": "Sarawak — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK02",
  "state": "Sarawak",
  "label": "Sarawak — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK03",
  "state": "Sarawak",
  "label": "Sarawak — Zon 3 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK04",
  "state": "Sarawak",
  "label": "Sarawak — Zon 4 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK05",
  "state": "Sarawak",
  "label": "Sarawak — Zon 5 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK06",
  "state": "Sarawak",
  "label": "Sarawak — Zon 6 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK07",
  "state": "Sarawak",
  "label": "Sarawak — Zon 7 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK08",
  "state": "Sarawak",
  "label": "Sarawak — Zon 8 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SWK09",
  "state": "Sarawak",
  "label": "Sarawak — Zon 9 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "SGR01",
  "state": "Selangor",
  "label": "Selangor — Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor",
  "areaVerified": true
 },
 {
  "code": "SGR02",
  "state": "Selangor",
  "label": "Selangor — Kuala Selangor, Sabak Bernam",
  "areaVerified": true
 },
 {
  "code": "SGR03",
  "state": "Selangor",
  "label": "Selangor — Klang, Kuala Langat",
  "areaVerified": true
 },
 {
  "code": "TRG01",
  "state": "Terengganu",
  "label": "Terengganu — Zon 1 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "TRG02",
  "state": "Terengganu",
  "label": "Terengganu — Zon 2 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "TRG03",
  "state": "Terengganu",
  "label": "Terengganu — Zon 3 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "TRG04",
  "state": "Terengganu",
  "label": "Terengganu — Zon 4 (semak kawasan di e-Solat)",
  "areaVerified": false
 },
 {
  "code": "WLY01",
  "state": "Wilayah Persekutuan",
  "label": "Wilayah Persekutuan — Kuala Lumpur, Putrajaya",
  "areaVerified": true
 },
 {
  "code": "WLY02",
  "state": "Wilayah Persekutuan",
  "label": "Wilayah Persekutuan — Labuan",
  "areaVerified": true
 }
].map(z=>Object.freeze(z)));
// Zone-code coverage: solat.my/api (third-party directory, cross-check before authoritative use).
// Selected district labels checked against JAKIM, Johor MAIJ, Selangor Mufti and Negeri Sembilan MAINS.
// Unknown district descriptions deliberately omitted. Users must confirm the zone on e-Solat.
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
function parseTime(value){if(typeof value!=='string')return null;const x=value.trim();if(validPrayerTime(x))return x;if(/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(x))return x.slice(0,5);const m=/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(x);if(!m)return null;let h=Number(m[1]);if(h<1||h>12)return null;h=h%12+(m[3].toUpperCase()==='PM'?12:0);return String(h).padStart(2,'0')+':'+m[2]}
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
