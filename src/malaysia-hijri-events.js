// Transcribed from JAKIM 2026 important-dates PDF hosted by Mufti Wilayah Persekutuan.
// Date labels are published references, not live confirmation of moon-sighting declarations.
export const MALAYSIA_2026_SOURCE='https://muftiwp.gov.my/images/falak/takwim/tarikh_penting/TARIKH_Penting_Islam_2026.pdf';
export const MALAYSIA_2026_EVENTS=Object.freeze([
 {id:'israk-mikraj',date:'2026-01-17',hijri:'27 Rejab 1447H',title:'Israk dan Mikraj',requiresDeclaration:false},
 {id:'ramadan',date:'2026-02-19',hijri:'1 Ramadan 1447H',title:'Awal Ramadan',requiresDeclaration:true},
 {id:'nuzul',date:'2026-03-07',hijri:'17 Ramadan 1447H',title:'Nuzul al-Quran',requiresDeclaration:false},
 {id:'aidilfitri',date:'2026-03-21',hijri:'1 Syawal 1447H',title:'Aidilfitri',requiresDeclaration:true},
 {id:'zulhijjah',date:'2026-05-18',hijri:'1 Zulhijjah 1447H',title:'Awal Zulhijjah',requiresDeclaration:false},
 {id:'aidiladha',date:'2026-05-27',hijri:'10 Zulhijjah 1447H',title:'Aidiladha',requiresDeclaration:true},
 {id:'maal-hijrah',date:'2026-06-17',hijri:'1 Muharam 1448H',title:'Maal Hijrah',requiresDeclaration:false},
 {id:'maulidur-rasul',date:'2026-08-25',hijri:'12 Rabiulawal 1448H',title:'Maulidur Rasul',requiresDeclaration:false}
]);
export function eligibleOfficialEventReminders(events,confirmedIds=[]){
 const confirmed=new Set(confirmedIds);
 return events.filter(e=>!e.requiresDeclaration||confirmed.has(e.id));
}
export function localEventDate(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid official date');const [y,m,d]=date.split('-').map(Number);const result=new Date(y,m-1,d,9,0,0,0);if(result.getFullYear()!==y||result.getMonth()!==m-1||result.getDate()!==d)throw new Error('Invalid official date');return result}
