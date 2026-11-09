const BASE='https://api.alquran.cloud/v1';
export async function json(path,timeout=12000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(BASE+path,{signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);const body=await response.json();if(body?.code!==200||body?.status!=='OK'||body?.data==null)throw new Error('Invalid Quran API response');return body.data}catch(error){throw new Error(error.name==='AbortError'?'Quran API request timed out':error.message)}finally{clearTimeout(timer)}}
export const getSurahs=()=>json('/surah');
export const getMeta=()=>json('/meta');
export const getJuz=(n)=>{if(!Number.isInteger(n)||n<1||n>30)throw new Error('Invalid Juz');return json('/juz/'+n+'/quran-uthmani')};
export function alignEditions(editions,expectedSurah){if(!Array.isArray(editions)||editions.length!==4)throw new Error('Missing Quran editions');const [arabic,english,tafsir,audio]=editions;const count=arabic?.ayahs?.length;if(!count||editions.some(e=>e?.ayahs?.length!==count))throw new Error('Verse count mismatch');if(expectedSurah!==undefined&&editions.some(e=>e?.number!==expectedSurah))throw new Error('Surah identity mismatch');return arabic.ayahs.map((a,i)=>{const b=english.ayahs[i],c=tafsir.ayahs[i],d=audio.ayahs[i];if(!Number.isInteger(a.number)||a.numberInSurah!==i+1||![b,c,d].every(x=>x?.number===a.number&&x?.numberInSurah===a.numberInSurah&&(!x.surah||x.surah.number===expectedSurah))||a.surah&&a.surah.number!==expectedSurah||![a.text,b.text,c.text].every(x=>typeof x==='string'&&x.length>0))throw new Error('Verse identity or text mismatch at index '+i);if(expectedSurah===2&&i===0&&!/^الٓ?مٓ?$/u.test(a.text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g,'')))throw new Error('Canonical Quran anchor mismatch: 2:1');return {number:a.number,numberInSurah:a.numberInSurah,juz:a.juz,arabic:a.text,english:b.text,tafsir:c.text,audio:typeof d.audio==='string'&&d.audio.startsWith('https://')?d.audio:null}})};
export async function getSurah(number){if(!Number.isInteger(number)||number<1||number>114)throw new Error('Invalid Surah');const ids=['quran-uthmani','en.sahih','ar.muyassar','ar.alafasy'];const editions=await Promise.all(ids.map(id=>json('/surah/'+number+'/'+id)));return alignEditions(editions,number)}

/**
 * Verify a complete, explicitly reviewed offline corpus before accepting it.
 * The manifest checksum covers the exact UTF-8 bytes of the corpus JSON.
 * This does not certify a text edition by itself: provenance and licensing
 * must be reviewed independently before bundling any sacred text.
 */
export async function verifyOfflineCorpus(bytes,manifest,{digest=globalThis.crypto?.subtle?.digest?.bind(globalThis.crypto.subtle)}={}){
 if(!(bytes instanceof Uint8Array)||typeof digest!=='function')throw Error('Offline corpus bytes or SHA-256 unavailable');
 if(manifest?.schema!==1||manifest?.arabicEdition!=='quran-uthmani'||manifest?.translationEdition!=='ms.basmeih'||!/^([a-f0-9]{64})$/.test(manifest.sha256||''))throw Error('Unreviewed offline corpus manifest');
 const hash=Array.from(new Uint8Array(await digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
 if(hash!==manifest.sha256)throw Error('Offline corpus SHA-256 mismatch');
 const corpus=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(!Array.isArray(corpus.surahs)||corpus.surahs.length!==114)throw Error('Offline corpus must contain 114 Surahs');
 let total=0,globalNumber=0;
 for(let n=1;n<=114;n++){
  const surah=corpus.surahs[n-1];
  if(surah?.number!==n||!Array.isArray(surah.ayahs)||!surah.ayahs.length)throw Error('Offline Surah identity mismatch: '+n);
  for(let i=0;i<surah.ayahs.length;i++){
   const a=surah.ayahs[i];globalNumber++;total++;
   if(a?.number!==globalNumber||a?.numberInSurah!==i+1||typeof a.arabic!=='string'||!/[\u0600-\u06ff]/u.test(a.arabic)||typeof a.malay!=='string'||!a.malay.trim())throw Error('Offline ayah or Basmeih pairing mismatch: '+n+':'+(i+1));
  }
 }
 if(total!==6236)throw Error('Offline corpus verse count mismatch: '+total);
 if(corpus.surahs[0].ayahs.length!==7||corpus.surahs[8].ayahs.length!==129)throw Error('Offline Surah 1/9 boundary mismatch');
 return corpus;
}
