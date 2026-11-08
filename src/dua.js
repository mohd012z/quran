// References only. Display Arabic directly from the existing Quran edition, never synthesize verses.
export const QURAN_DUAS=Object.freeze([
 {id:'2:201',surah:2,ayah:201,title:'Kebaikan dunia dan akhirat',category:'umum'},
 {id:'7:23',surah:7,ayah:23,title:'Memohon keampunan',category:'keampunan'},
 {id:'3:8',surah:3,ayah:8,title:'Keteguhan hati',category:'iman'},
 {id:'14:40',surah:14,ayah:40,title:'Menjaga solat',category:'ibadah'},
 {id:'20:114',surah:20,ayah:114,title:'Memohon tambahan ilmu',category:'ilmu'},
 {id:'21:87',surah:21,ayah:87,title:'Doa Nabi Yunus',category:'keampunan'},
 {id:'25:74',surah:25,ayah:74,title:'Keluarga dan keturunan',category:'keluarga'},
 {id:'28:24',surah:28,ayah:24,title:'Memohon kebaikan',category:'umum'},
 {id:'2:286',surah:2,ayah:286,title:'Keampunan dan pertolongan',category:'keampunan'}
]);
export const DAILY_PRACTICES=Object.freeze([
 {id:'morning',title:'Doa dan zikir pagi',note:'Pilih doa Quran yang mempunyai rujukan ayat; teks zikir luar Quran belum disahkan.'},
 {id:'evening',title:'Doa dan zikir petang',note:'Baca dan ulang doa Quran; semak sumber untuk zikir tambahan.'},
 {id:'reading',title:'Bacaan Al-Quran harian',note:'Tetapkan masa untuk membaca dan memahami ayat.'},
 {id:'before-sleep',title:'Persediaan sebelum tidur',note:'Semak sumber hadis sahih sebelum menambah doa khusus.'}
]);
export function searchDuas(query='',category='all'){
 const q=String(query).trim().toLocaleLowerCase('ms');
 return QURAN_DUAS.filter(d=>(category==='all'||d.category===category)&&(!q||[d.title,d.id,d.category].some(v=>v.toLocaleLowerCase('ms').includes(q))));
}
export function validReminderTime(value){return typeof value==='string'&&/^([01]\\d|2[0-3]):[0-5]\\d$/.test(value)}
export function reminderDue(now,reminder,lastShownDate){
 if(!reminder?.enabled||!validReminderTime(reminder.time)||!(now instanceof Date)||!Number.isFinite(now.getTime()))return false;
 const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const current=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 return current>=reminder.time&&lastShownDate!==date;
}
export function readReminder(storage){
 try{const r=JSON.parse(storage.getItem('quran-daily-reminder-v1')||'null');return {enabled:r?.enabled===true,time:validReminderTime(r?.time)?r.time:'08:00',lastShownDate:typeof r?.lastShownDate==='string'?r.lastShownDate:''}}catch{return {enabled:false,time:'08:00',lastShownDate:''}}
}
export function saveReminder(storage,value){try{storage.setItem('quran-daily-reminder-v1',JSON.stringify(value));return true}catch{return false}}
