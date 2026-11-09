// Location is requested only after a user gesture; coordinates are never stored or sent.
// Conservative city-core rectangles are suggestions, NOT authoritative JAKIM zone boundaries.
const CANDIDATES=Object.freeze([
 {code:'WLY01',name:'Kuala Lumpur (pusat)',minLat:3.11,maxLat:3.19,minLon:101.67,maxLon:101.73},
 {code:'JHR02',name:'Johor Bahru (pusat)',minLat:1.45,maxLat:1.51,minLon:103.72,maxLon:103.78}
]);
export function suggestPrayerZone(latitude,longitude,accuracy){
 if(![latitude,longitude,accuracy].every(Number.isFinite)||latitude< -90||latitude>90||longitude< -180||longitude>180||accuracy<0||accuracy>1000)return null;
 const deltaLat=accuracy/111000,deltaLon=accuracy/(111000*Math.max(.1,Math.cos(latitude*Math.PI/180)));
 const found=CANDIDATES.filter(c=>latitude-deltaLat>=c.minLat&&latitude+deltaLat<=c.maxLat&&longitude-deltaLon>=c.minLon&&longitude+deltaLon<=c.maxLon);
 return found.length===1?{code:found[0].code,area:found[0].name,verified:false}:null;
}
export function detectPrayerZone({geolocation=globalThis.navigator?.geolocation,timeout=12000}={}){
 if(!geolocation?.getCurrentPosition)return Promise.reject(Error('Lokasi tidak tersedia pada peranti'));
 return new Promise((resolve,reject)=>geolocation.getCurrentPosition(
 p=>{const candidate=suggestPrayerZone(p.coords.latitude,p.coords.longitude,p.coords.accuracy);if(!candidate)reject(Error('Lokasi tidak cukup tepat atau di luar kawasan cadangan; pilih zon JAKIM secara manual'));else resolve(candidate)},
 e=>reject(Error(e?.code===1?'Kebenaran lokasi ditolak':'Lokasi tidak dapat ditentukan; pilih zon manual')),
 {enableHighAccuracy:false,timeout,maximumAge:0}
 ));
}
