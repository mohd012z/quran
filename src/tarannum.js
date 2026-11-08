// Educational contour only. Not a scholarly transcription of any Quran verse or Qari.
export const TARANNUM_STYLES=Object.freeze([
 {id:'bayyati',name:'Bayyati'},
 {id:'hijaz',name:'Hijaz'},
 {id:'nahawand',name:'Nahawand'},
 {id:'rast',name:'Rast'},
 {id:'soba',name:'Soba'},
 {id:'sikah',name:'Sikah'},
 {id:'jiharkah',name:'Jiharkah'}
]);
export const PITCH_LEVELS=Object.freeze([
 {id:'low',label:'Rendah'},
 {id:'medium',label:'Sederhana'},
 {id:'high',label:'Tinggi'}
]);
export function createPracticeContour(style='bayyati',range='medium'){
 if(!TARANNUM_STYLES.some(x=>x.id===style))throw new Error('Unknown Tarannum style');
 if(!PITCH_LEVELS.some(x=>x.id===range))throw new Error('Unknown pitch range');
 // Identical contour for every style intentionally: do not invent style-specific melodies.
 const indices=range==='low'?[0,0,1,0]:range==='high'?[1,2,2,1]:[0,1,2,1];
 return indices.map(i=>PITCH_LEVELS[i]);
}
