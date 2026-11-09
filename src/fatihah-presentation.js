/** Display labels only. Canonical Quran IDs, Arabic, translations and audio remain unchanged. */
export function fatihahReadingLabel(surah,numberInSurah){
 if(!Number.isInteger(surah)||surah<1||surah>114||!Number.isInteger(numberInSurah)||numberInSurah<1)throw new RangeError('Invalid canonical Quran reference');
 if(surah!==1)return 'Ayat '+numberInSurah;
 return numberInSurah===1?'Basmalah · pembukaan (rujukan 1:1)':'Baris bacaan '+(numberInSurah-1)+' · rujukan 1:'+numberInSurah;
}
