export const HIJRI_MONTHS=Object.freeze(['Muharram','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah']);
export const HISTORY_TOPICS=Object.freeze([
 {id:'hijrah',title:'Hijrah Rasulullah SAW',category:'sirah',month:1,day:null,summary:'Perpindahan Rasulullah SAW dari Makkah ke Madinah menjadi asas penetapan era takwim Hijri. Tarikh hari dan bulan peristiwa mempunyai perbahasan sejarah.',references:['https://quran.com/9/40']},
 {id:'badr',title:'Perang Badar',category:'sirah',month:9,day:17,summary:'Peristiwa penting pada tahun kedua Hijrah. Tarikh 17 Ramadan masyhur dalam penulisan sirah; perincian kronologi perlu dirujuk kepada sumber sejarah.',references:['https://quran.com/3/123']},
 {id:'ramadan',title:'Ramadan dan kewajipan berpuasa',category:'ibadah',month:9,day:1,summary:'Ramadan ialah bulan puasa. Permulaan Ramadan mengikut pengisytiharan pihak berkuasa agama setempat.',references:['https://quran.com/2/183','https://quran.com/2/185']},
 {id:'eid-fitr',title:'Aidilfitri',category:'ibadah',month:10,day:1,summary:'Hari raya selepas Ramadan. Tarikh rasmi tertakluk kepada penetapan pihak berkuasa setempat.',references:[]},
 {id:'eid-adha',title:'Aidiladha',category:'ibadah',month:12,day:10,summary:'Hari raya korban. Semak pengumuman rasmi bagi tarikh tempatan dan hukum ibadah.',references:[]},
 {id:'prophets',title:'Kisah para Nabi dalam Al-Quran',category:'kisah-nabi',month:null,day:null,summary:'Baca kisah para Nabi melalui ayat Al-Quran yang dapat disemak, tanpa menetapkan tarikh peristiwa yang tidak diketahui.',references:['https://quran.com/12/1','https://quran.com/21/48']}
]);
export function hijriToday(date=new Date(),locale='ms-MY'){
 if(!(date instanceof Date)||!Number.isFinite(date.getTime()))throw new Error('Invalid date');
 try{return new Intl.DateTimeFormat(locale+'-u-ca-islamic', {day:'numeric',month:'long',year:'numeric'}).format(date)}catch{return 'Takwim Hijri tidak disokong oleh peranti'}
}
export function searchHistory(query='',category='all'){
 const q=String(query).trim().toLocaleLowerCase('ms');
 return HISTORY_TOPICS.filter(t=>(category==='all'||t.category===category)&&(!q||[t.title,t.summary,t.category].some(s=>s.toLocaleLowerCase('ms').includes(q))));
}
