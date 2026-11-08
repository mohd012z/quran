import React,{useEffect,useRef,useState}from 'react';
export const NAV_ITEMS=Object.freeze([['baca','Baca'],['belajar','Belajar'],['tarannum','Tarannum'],['sejarah','Sejarah Nabi'],['kalendar','Kalendar Islam'],['doa','Doa Harian'],['solat','Solat & Wirid'],['ilmu','Ilmu Islam'],['rujukan','Rujukan'],['cari','Cari'],['tetapan','Tetapan']]);
export function nextBottomNavVisibility({previousY,currentY,visible,threshold=12}){
 if(!Number.isFinite(previousY)||!Number.isFinite(currentY))return true;
 if(currentY<80)return true;
 if(Math.abs(currentY-previousY)<threshold)return visible;
 return currentY<previousY;
}
export default function BottomNavigation({active,onNavigate}){
 const[visible,setVisible]=useState(true),lastY=useRef(0);
 useEffect(()=>{lastY.current=window.scrollY;const scroll=()=>{const current=window.scrollY;setVisible(old=>nextBottomNavVisibility({previousY:lastY.current,currentY,visible:old}));if(Math.abs(current-lastY.current)>=12)lastY.current=current};window.addEventListener('scroll',scroll,{passive:true});return()=>window.removeEventListener('scroll',scroll)},[]);
 useEffect(()=>{setVisible(true)},[active]);
 return <><button className={'bottom-nav-reveal'+(visible?' is-hidden':'')} type="button" onClick={()=>setVisible(true)} aria-label="Show bottom navigation" tabIndex={visible?-1:0} aria-hidden={visible}>☰ Menu</button><nav className={'reader-tabs bottom-reader-tabs'+(visible?'':' nav-hidden')} aria-label="Bottom navigation" aria-hidden={!visible} inert={!visible?'':undefined} onFocusCapture={()=>setVisible(true)}>{NAV_ITEMS.map(([id,label])=><button key={id} type="button" tabIndex={visible?0:-1} aria-current={active===id?'page':undefined} onClick={()=>{onNavigate(id);setVisible(true)}}>{label}</button>)}</nav></>;
}
