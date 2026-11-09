const KEY='quran-settings-ui-v1';
export const DEFAULT_SETTINGS_UI=Object.freeze({keepAwake:false});
export function normalizeSettingsUi(input){const s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};return {keepAwake:s.keepAwake===true}}
export function readSettingsUi(storage=globalThis.localStorage){try{return normalizeSettingsUi(JSON.parse(storage?.getItem(KEY)||'null'))}catch{return {...DEFAULT_SETTINGS_UI}}}
export function saveSettingsUi(value,storage=globalThis.localStorage){try{storage?.setItem(KEY,JSON.stringify(normalizeSettingsUi(value)));return true}catch{return false}}
export async function acquireScreenWakeLock({enabled,visibility='visible',wakeLock}={}){
 if(!enabled)return {status:'off',sentinel:null};
 if(visibility!=='visible')return {status:'background',sentinel:null};
 if(!wakeLock||typeof wakeLock.request!=='function')return {status:'unsupported',sentinel:null};
 try{const sentinel=await wakeLock.request('screen');return {status:'active',sentinel}}catch{return {status:'denied',sentinel:null}}
}
export async function releaseScreenWakeLock(sentinel){if(sentinel&&typeof sentinel.release==='function'){try{await sentinel.release()}catch{return false}}return true}
