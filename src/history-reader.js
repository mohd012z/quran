// Original educational summaries; citations point to Quran verses, not invented quotations.
export const HISTORY_CHAPTERS=Object.freeze([
 {id:'adam',title:'Nabi Adam AS',category:'kisah-nabi',chapters:[
 {id:'creation',title:'Penciptaan Adam',body:'Al-Quran menerangkan penciptaan Adam, perintah Allah kepada malaikat dan keengganan Iblis. Baca ayat rujukan untuk memahami konteks lengkap.',refs:['2:30','2:34','7:11']},
 {id:'repentance',title:'Taubat Adam',body:'Adam dan pasangannya memohon keampunan kepada Allah. Kisah ini mengajar tentang tanggungjawab, taubat dan rahmat Allah.',refs:['7:23','2:37']}]},
 {id:'nuh',title:'Nabi Nuh AS',category:'kisah-nabi',chapters:[
 {id:'mission',title:'Dakwah Nabi Nuh',body:'Nabi Nuh menyeru kaumnya supaya menyembah Allah. Al-Quran menceritakan ketekunan baginda dalam dakwah.',refs:['71:1','71:5','71:10']},
 {id:'ark',title:'Bahtera dan ujian',body:'Kisah bahtera menggambarkan ujian keimanan dan akibat penolakan terhadap peringatan. Rujuk ayat untuk butiran peristiwa.',refs:['11:36','11:40','11:44']}]},
 {id:'ibrahim',title:'Nabi Ibrahim AS',category:'kisah-nabi',chapters:[
 {id:'faith',title:'Mencari kebenaran',body:'Al-Quran menampilkan hujah Nabi Ibrahim tentang ketuhanan dan penolakan penyembahan selain Allah.',refs:['6:74','6:79','21:52']},
 {id:'prayer',title:'Doa Nabi Ibrahim',body:'Antara doa baginda ialah memohon keteguhan mendirikan solat untuk diri dan keturunan.',refs:['14:40']}]},
 {id:'yusuf',title:'Nabi Yusuf AS',category:'kisah-nabi',chapters:[
 {id:'dream',title:'Mimpi Nabi Yusuf',body:'Surah Yusuf bermula dengan kisah mimpi Nabi Yusuf dan nasihat ayahnya. Baca Surah Yusuf untuk susunan kisah penuh.',refs:['12:4','12:5']},
 {id:'patience',title:'Kesabaran dan pertemuan keluarga',body:'Kisah Nabi Yusuf menonjolkan kesabaran, amanah dan pengampunan ketika keluarganya kembali bertemu.',refs:['12:90','12:92','12:100']}]},
 {id:'musa',title:'Nabi Musa AS',category:'kisah-nabi',chapters:[
 {id:'calling',title:'Seruan kepada Firaun',body:'Allah mengutus Nabi Musa untuk menyeru Firaun. Baginda memohon kelapangan dada dan kemudahan dalam menyampaikan risalah.',refs:['20:24','20:25','20:28']},
 {id:'sea',title:'Penyelamatan Bani Israel',body:'Al-Quran menerangkan penyelamatan Nabi Musa dan pengikutnya ketika dikejar tentera Firaun.',refs:['26:61','26:63','26:66']}]},
 {id:'isa',title:'Nabi Isa AS',category:'kisah-nabi',chapters:[
 {id:'maryam',title:'Maryam dan kelahiran Nabi Isa',body:'Surah Maryam dan Surah Ali Imran menerangkan kisah Maryam serta kelahiran Nabi Isa sebagai tanda kekuasaan Allah.',refs:['19:16','19:20','3:45']}]},
 {id:'muhammad',title:'Sirah Nabi Muhammad SAW',category:'sirah',chapters:[
 {id:'revelation',title:'Wahyu dan risalah',body:'Al-Quran mengingatkan tentang peranan Rasulullah sebagai pembawa petunjuk. Untuk kronologi wahyu pertama, rujukan sirah dan hadis yang disemak diperlukan.',refs:['96:1','33:21']},
 {id:'hijrah',title:'Hijrah dan pertolongan Allah',body:'Surah At-Taubah menyebut peristiwa Rasulullah bersama sahabatnya di dalam gua. Tarikh terperinci tidak ditentukan oleh ayat ini.',refs:['9:40']},
 {id:'badr',title:'Badar dan pertolongan Allah',body:'Al-Quran mengingatkan tentang pertolongan Allah dalam Perang Badar. Perincian sejarah perlu dibaca bersama sumber sirah yang ditahkik.',refs:['3:123']}]}
]);
export function getHistoryChapter(bookId,chapterId){return HISTORY_CHAPTERS.find(b=>b.id===bookId)?.chapters.find(c=>c.id===chapterId)||null}
export function readHistoryProgress(storage){try{const p=JSON.parse(storage.getItem('quran-history-progress-v1')||'{}');return p&&typeof p==='object'&&!Array.isArray(p)?Object.fromEntries(Object.entries(p).filter(([k,v])=>/^[a-z-]+:[a-z-]+$/.test(k)&&v&&typeof v==='object').map(([k,v])=>[k,{read:v.read===true,bookmark:v.bookmark===true}])):{} }catch{return {}}}
export function saveHistoryProgress(storage,progress){try{storage.setItem('quran-history-progress-v1',JSON.stringify(progress));return true}catch{return false}}
export function updateHistoryProgress(progress,bookId,chapterId,patch){if(!getHistoryChapter(bookId,chapterId))throw new Error('Unknown chapter');const key=bookId+':'+chapterId;return {...progress,[key]:{read:progress[key]?.read===true,bookmark:progress[key]?.bookmark===true,...patch}}}
