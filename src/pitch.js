// F0 tracker: no network, no recording persistence, no Quran correctness grading.
export function estimateF0(samples,sampleRate,{minHz=75,maxHz=650,threshold=0.68}={}){
 if(!(samples instanceof Float32Array)||!Number.isFinite(sampleRate)||sampleRate<8000||minHz<=0||maxHz<=minHz||maxHz>=sampleRate/2)throw new Error('Invalid pitch input');
 if(samples.length<Math.ceil(sampleRate/minHz)*2)return null;
 let mean=0;for(const x of samples){if(!Number.isFinite(x))return null;mean+=x}mean/=samples.length;
 let power=0;for(const x of samples)power+=(x-mean)**2;
 if(Math.sqrt(power/samples.length)<0.008)return null;
 const minLag=Math.max(2,Math.floor(sampleRate/maxHz)),maxLag=Math.min(Math.floor(sampleRate/minHz),Math.floor(samples.length/2)-1);
 let bestLag=0,best=-1;
 for(let lag=minLag;lag<=maxLag;lag++){
  let xy=0,xx=0,yy=0;
  for(let i=0;i<samples.length-lag;i++){const a=samples[i]-mean,b=samples[i+lag]-mean;xy+=a*b;xx+=a*a;yy+=b*b}
  const correlation=xy/Math.sqrt(xx*yy||1);
  if(correlation>best){best=correlation;bestLag=lag}
 }
 if(best<threshold||!bestLag)return null;
 return {hz:sampleRate/bestLag,confidence:best};
}
export function classifyRelativePitch(hz,baseline){
 if(!Number.isFinite(hz)||hz<=0||!Number.isFinite(baseline)||baseline<=0)throw new Error('Invalid frequency');
 const semitones=12*Math.log2(hz/baseline);
 return semitones < -3?'low':semitones > 3?'high':'medium';
}
