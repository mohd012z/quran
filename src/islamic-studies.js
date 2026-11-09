// Curriculum metadata only. No book excerpts, fatwas or fabricated religious quotations.
export const STUDY_MODULES=Object.freeze([
 {id:'usuluddin',name:'Usuluddin',topics:['Asas keimanan','Kenabian','Wahyu','Samiyyat'],source:'https://www.islam.gov.my/ms/e-penerbitan/3789-petunjuk-akidah-1-ahli-sunnah-wal-jamaah'},
 {id:'tauhid',name:'Tauhid & Akidah',topics:['Rukun Iman','Ilahiyyat','Nubuwwat','Samiyyat'],source:'https://www.islam.gov.my/en/e-penerbitan/4544-keunggulan-akidah-tauhid'},
 {id:'fiqh',name:'Fiqh Ibadah',topics:['Taharah','Solat','Puasa','Zakat','Haji'],source:'https://www.islam.gov.my/en/e-penerbitan/3781-al-fiqh-al-manhaji'},
 {id:'usul-fiqh',name:'Usul Fiqh',topics:['Sumber hukum','Ijmak','Qiyas','Kaedah istinbat'],source:'https://muftiwp.gov.my/ms/artikel/irsyad-usul-fiqh'},
 {id:'akhlak',name:'Akhlak & Tasawuf',topics:['Adab','Ikhlas','Sabar','Syukur'],source:null},
 {id:'hadis',name:'Hadis & Ulum Hadis',topics:['Sanad','Matan','Takhrij','Darjat hadis'],source:null},
 {id:'tafsir',name:'Tafsir & Ulum Quran',topics:['Kaedah tafsir','Asbab al-nuzul','Makna ayat'],source:null},
 {id:'sirah',name:'Sirah',topics:['Kehidupan Rasulullah','Sejarah Islam'],source:null}
]);
export function searchStudyModules(query=''){
 const q=String(query).trim().toLocaleLowerCase('ms');
 return STUDY_MODULES.filter(m=>!q||[m.name,...m.topics].some(t=>t.toLocaleLowerCase('ms').includes(q)));
}
