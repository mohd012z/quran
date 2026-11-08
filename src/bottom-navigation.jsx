import React,{useEffect,useRef,useState}from 'react';
import{NAV_ITEMS,nextBottomNavVisibility}from './bottom-navigation-logic.js';
export default function BottomNavigation({active,onNavigate}){
 const[visible,setVisible]=useState(true),lastY=useRef(0);
 useEffect(()=>{lastY.current=window.scrollY;const scroll=()=>{const current=window.scrollY;setVisible(old=>nextBottomNavVisibility({previousY:lastY.current,currentY,visible:old}));if(Math.abs(current-lastY.current)>=12)lastY.current=current};window.addEventListener('scroll',scroll,{passive:true});return()=>window.removeEventListener('scroll',scroll)},[]);
 useEffect(()=>{setVisible(true)},[active]);
 return <><button className={'bottom-nav-reveal'+(visible?' is-hidden':'')} type="button" onClick={()=>setVisible(true)} aria-label="Show bottom navigation" tabIndex={visible?-1:0} aria-hidden={visible}>☰ Menu</button><nav className={'reader-tabs bottom-reader-tabs'+(visible?'':' nav-hidden')} aria-label="Bottom navigation" aria-hidden={!visible} inert={!visible?'':undefined} onFocusCapture={()=>setVisible(true)}>{NAV_ITEMS.map(([id,label])=><button key={id} type="button" tabIndex={visible?0:-1} aria-current={active===id?'page':undefined} onClick={()=>{onNavigate(id);setVisible(true)}}>{label}</button>)}</nav></>;
}
