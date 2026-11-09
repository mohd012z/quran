export const PRAYERS=Object.freeze([{id:'subuh',name:'Subuh'},{id:'zohor',name:'Zohor'},{id:'asar',name:'Asar'},{id:'maghrib',name:'Maghrib'},{id:'isyak',name:'Isyak'}]);
export const WIRID=Object.freeze([
 {id:'istighfar',arabic:'أَسْتَغْفِرُ اللَّهَ',meaning:'Aku memohon keampunan kepada Allah.',note:'Lafaz istighfar ringkas; amalan selepas solat perlu disemak mengikut sumber hadis.'},
 {id:'tasbih',arabic:'سُبْحَانَ اللَّهِ',meaning:'Maha Suci Allah.'},
 {id:'tahmid',arabic:'الْحَمْدُ لِلَّهِ',meaning:'Segala puji bagi Allah.'},
 {id:'takbir',arabic:'اللَّهُ أَكْبَرُ',meaning:'Allah Maha Besar.'},
 {id:'tahlil',arabic:'لَا إِلَٰهَ إِلَّا اللَّهُ',meaning:'Tiada Tuhan yang berhak disembah melainkan Allah.'}
]);
export const FRIDAY_NIGHT=Object.freeze([
 {id:'kahf',title:'Surah Al-Kahf',surah:18,note:'Bacaan hari Jumaat; semak panduan ulama berkenaan waktunya dan kelebihan yang diriwayatkan.'},
 {id:'yasin',title:'Surah Yasin',surah:36,note:'Bacaan Al-Quran yang boleh diamalkan; jangan anggap kewajipan khusus malam Jumaat.'},
 {id:'durood',title:'Selawat ke atas Nabi',surah:33,ayah:56,note:'Rujukan Al-Quran 33:56; teks selawat tambahan memerlukan semakan sumber.'}
]);
export function validPrayerTime(t){return typeof t==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(t)}
export function normalizePrayerSettings(v){
 const times={};for(const p of PRAYERS)times[p.id]=validPrayerTime(v?.times?.[p.id])?v.times[p.id]:'';
 return {times,adhanEnabled:v?.adhanEnabled===true};
}
export function loadPrayerSettings(storage){try{return normalizePrayerSettings(JSON.parse(storage?.getItem('quran-solat-v1')||'null'))}catch{return normalizePrayerSettings(null)}}
export function savePrayerSettings(storage,v){try{storage?.setItem('quran-solat-v1',JSON.stringify(normalizePrayerSettings(v)));return true}catch{return false}}
export function prayerDue(now,settings,shown={}){
 if(!(now instanceof Date)||!Number.isFinite(now.getTime()))return [];
 const day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 const time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 return PRAYERS.filter(p=>settings?.times?.[p.id]===time&&shown[p.id]!==day).map(p=>({...p,day}));
}
