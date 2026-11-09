import{verseReference,verseShareText,verseUrl}from './share-ayah.js';
export function cardLines(text,measure,maxWidth){
 if(typeof text!=='string'||!text.trim())throw Error('Arabic verse required');
 const words=text.trim().split(/\s+/u);const lines=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(measure(next)<=maxWidth){line=next;continue}if(line)lines.push(line);if(measure(word)>maxWidth)throw Error('Arabic word exceeds card width');line=word}
 if(line)lines.push(line);return lines;
}
export function createVerseCard(verse,{documentObject=globalThis.document}={}){
 verseShareText(verse);
 const canvas=documentObject.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
 const width=1080,pad=90,spacing=94;
 ctx.font='48px "Noto Naskh Arabic","Amiri",serif';
 const lines=cardLines(verse.arabic,t=>ctx.measureText(t).width,width-2*pad);
 const height=Math.max(560,330+lines.length*spacing);
 if(height>12000)throw Error('Verse too long for image; use text sharing');
 canvas.width=width;canvas.height=height;
 ctx.fillStyle='#f8f5ea';ctx.fillRect(0,0,width,height);
 ctx.strokeStyle='#0f6b57';ctx.lineWidth=6;ctx.strokeRect(30,30,width-60,height-60);
 ctx.textAlign='center';ctx.direction='ltr';ctx.fillStyle='#0f6b57';ctx.font='bold 40px sans-serif';ctx.fillText('AL-QURAN',width/2,120);
 ctx.direction='rtl';ctx.fillStyle='#142c28';ctx.font='48px "Noto Naskh Arabic","Amiri",serif';
 lines.forEach((line,i)=>ctx.fillText(line,width/2,235+i*spacing));
 ctx.direction='ltr';ctx.fillStyle='#0f6b57';ctx.font='32px sans-serif';
 ctx.fillText('Al-Quran '+verseReference(verse.surah,verse.ayah),width/2,height-135);
 ctx.font='27px sans-serif';ctx.fillText(verseUrl(verse.surah,verse.ayah),width/2,height-85);
 return canvas;
}
export function cardBlob(canvas){return new Promise((resolve,reject)=>{canvas.toBlob(b=>b?resolve(b):reject(Error('PNG export unavailable')),'image/png')})}
export async function shareVerseImage(verse,{navigatorObject=globalThis.navigator,documentObject=globalThis.document}={}){
 const blob=await cardBlob(createVerseCard(verse,{documentObject}));
 const file=new File([blob],'al-quran-'+verseReference(verse.surah,verse.ayah).replace(':','-')+'.png',{type:'image/png'});
 if(typeof navigatorObject?.share!=='function'||typeof navigatorObject?.canShare!=='function'||!navigatorObject.canShare({files:[file]}))return {status:'unavailable',blob,file};
 try{await navigatorObject.share({files:[file],title:'Al-Quran '+verseReference(verse.surah,verse.ayah)});return {status:'shared',blob,file}}catch(e){if(e?.name==='AbortError')return {status:'cancelled',blob,file};throw e}
}
