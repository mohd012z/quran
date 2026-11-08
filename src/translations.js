export const TRANSLATION_LANGUAGES=Object.freeze([{id:'ms',label:'Bahasa Melayu'},{id:'id',label:'Bahasa Indonesia'},{id:'en',label:'English'}]);
const API='https://api.alquran.cloud/v1';
const preferred={ms:['ms.basmeih'],id:['id.indonesian'],en:['en.sahih']};
export function validLanguage(lang){return TRANSLATION_LANGUAGES.some(x=>x.id===lang)}
export function selectTranslationEdition(editions,language){
 if(!validLanguage(language)||!Array.isArray(editions))throw Error('Unsupported translation language');
 const matches=editions.filter(x=>x&&x.language===language&&x.type==='translation'&&x.format==='text'&&/^[a-z]{2}\.[a-z0-9._-]+$/i.test(x.identifier||'')&&typeof x.name==='string'&&x.name.trim());
 if(!matches.length)throw Error('No verified edition metadata for '+language);
 return matches.find(x=>preferred[language].includes(x.identifier))||matches[0];
}
export function validateTranslationSurah(payload,surah,edition,arabicVerses){
 const data=payload?.data;if(data?.number!==surah||data?.edition?.identifier!==edition.identifier||data.edition.type!=='translation'||!Array.isArray(data.ayahs)||data.ayahs.length!==arabicVerses.length)throw Error('Translation metadata or verse count mismatch');
 const out=new Map();
 for(let i=0;i<data.ayahs.length;i++){const row=data.ayahs[i],source=arabicVerses[i];if(row?.numberInSurah!==source?.numberInSurah||typeof row.text!=='string'||!row.text.trim()||row.text.length>12000)throw Error('Translation ayah mismatch');out.set(row.numberInSurah,row.text)}
 return out;
}
export async function loadTranslationSurah(surah,language,arabicVerses,{fetchImpl=globalThis.fetch,signal}={}){
 if(!Number.isInteger(surah)||surah<1||surah>114||!validLanguage(language)||!Array.isArray(arabicVerses)||!arabicVerses.length)throw Error('Invalid translation request');
 const metadata=await fetchImpl(API+'/edition?format=text&language='+encodeURIComponent(language)+'&type=translation',{signal});
 if(!metadata.ok)throw Error('Edition metadata HTTP '+metadata.status);
 const meta=await metadata.json();if(meta?.status!=='OK')throw Error('Edition metadata unavailable');
 const edition=selectTranslationEdition(meta.data,language);
 const response=await fetchImpl(API+'/surah/'+surah+'/'+encodeURIComponent(edition.identifier),{signal});
 if(!response.ok)throw Error('Translation HTTP '+response.status);
 const payload=await response.json();if(payload?.status!=='OK')throw Error('Translation unavailable');
 return {edition:{identifier:edition.identifier,name:edition.name,englishName:edition.englishName||edition.name,language},verses:validateTranslationSurah(payload,surah,edition,arabicVerses)};
}
