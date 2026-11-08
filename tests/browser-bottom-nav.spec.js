import{test,expect}from '@playwright/test';
import{mkdir}from 'node:fs/promises';
const sizes=[{name:'portrait',width:393,height:852},{name:'landscape',width:852,height:393}];
for(const size of sizes){test(size.name+' bottom dock screenshot and accessibility',async({page})=>{
 await page.setViewportSize(size);await page.goto('/');const nav=page.getByRole('navigation',{name:'Bottom navigation'});await expect(nav).toBeVisible();const buttons=nav.getByRole('button');await expect(buttons).toHaveCount(11);
 await expect(page.getByRole('button',{name:'Baca',exact:true}).first()).toBeVisible();
 const metrics=await nav.evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,rect:el.getBoundingClientRect().toJSON(),buttons:[...el.querySelectorAll('button')].map(b=>({label:b.getAttribute('aria-label'),height:b.getBoundingClientRect().height,width:b.getBoundingClientRect().width}))}));
 expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);expect(metrics.rect.bottom).toBeLessThanOrEqual(size.height+1);expect(metrics.rect.top).toBeGreaterThanOrEqual(0);
 for(const b of metrics.buttons){expect(b.label).toBeTruthy();expect(b.height).toBeGreaterThanOrEqual(44);expect(b.width).toBeGreaterThanOrEqual(44)}
 await mkdir('screenshots',{recursive:true});await nav.screenshot({path:'screenshots/nav-'+size.name+'.png'});
 await buttons.last().focus();await expect(buttons.last()).toBeFocused();await expect(nav).toBeVisible();
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(80);
 await page.evaluate(()=>{const spacer=document.createElement('div');spacer.style.height='2500px';document.body.append(spacer);window.scrollTo(0,500)});await page.waitForTimeout(120);
 await expect(nav).toBeVisible(); // focus guard prevents hiding during keyboard navigation
 await page.getByRole('button',{name:'Baca',exact:true}).first().focus();
 await page.evaluate(()=>document.activeElement.blur());
 await page.evaluate(()=>window.scrollTo(0,900));await page.waitForTimeout(120);
 await expect(page.getByRole('button',{name:'Show bottom navigation'})).toBeVisible();
 await page.getByRole('button',{name:'Show bottom navigation'}).click();
 await expect(nav).toBeVisible();await expect(nav.locator('[aria-current="page"]')).toBeFocused();
});}

for(const size of sizes){test(size.name+' compact reader toolbar and advanced disclosure',async({page})=>{
 await page.setViewportSize(size);await page.goto('/');
 const toolbar=page.locator('.reader-toolbar');await expect(toolbar).toBeVisible();
 await expect(toolbar.getByRole('combobox',{name:'Pilih Surah'})).toBeVisible();
 await expect(toolbar.getByRole('textbox',{name:'Cari ayat'})).toBeVisible();
 await expect(toolbar.getByRole('combobox',{name:'Penapis bacaan'})).toBeVisible();
 const disclosure=page.locator('details.reader-more-controls');await expect(disclosure).toBeVisible();
 await expect(disclosure).not.toHaveAttribute('open','');
 await disclosure.locator('summary').focus();await page.keyboard.press('Enter');
 await expect(disclosure).toHaveAttribute('open','');
 await expect(disclosure.getByRole('combobox',{name:'Bilangan ulang ayat'})).toBeVisible();
 await expect(disclosure.getByRole('combobox',{name:'Mod bacaan perkataan'})).toBeVisible();
 await expect(disclosure.getByRole('button',{name:/Sambung bacaan/})).toBeVisible();
 const dimensions=await toolbar.evaluate(el=>({width:el.getBoundingClientRect().width,viewport:window.innerWidth,scrollWidth:document.documentElement.scrollWidth}));
 expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport+1);
 expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport+1);
 await mkdir('screenshots',{recursive:true});await page.screenshot({path:'screenshots/reader-'+size.name+'.png',fullPage:true});
 await disclosure.locator('summary').focus();await page.keyboard.press('Enter');await expect(disclosure).not.toHaveAttribute('open','');
});}

for(const size of sizes){test(size.name+' ayah Arabic translation visual isolation',async({page})=>{
 await page.setViewportSize(size);await page.goto('/');
 const card=page.locator('.ayah-card').first();await expect(card).toBeVisible({timeout:15000});
 const arabic=card.locator(':scope > .arabic');await expect(arabic).toHaveAttribute('dir','rtl');
 const translation=card.locator(':scope > .verse-translation');await expect(translation).toHaveAttribute('lang',/^(ms|id|en)$/);
 const result=await card.evaluate(el=>{const a=el.querySelector(':scope > .arabic'),t=el.querySelector(':scope > .verse-translation');if(!a||!t)return null;const ar=a.getBoundingClientRect(),tr=t.getBoundingClientRect(),cr=el.getBoundingClientRect();return {arabicBottom:ar.bottom,translationTop:tr.top,cardWidth:cr.width,viewport:innerWidth,rtl:getComputedStyle(a).direction,translationDirection:getComputedStyle(t).direction}});
 expect(result).not.toBeNull();expect(result.rtl).toBe('rtl');expect(result.translationDirection).toBe('ltr');
 expect(result.translationTop).toBeGreaterThanOrEqual(result.arabicBottom-1);expect(result.cardWidth).toBeLessThanOrEqual(result.viewport+1);
 await mkdir('screenshots',{recursive:true});await card.screenshot({path:'screenshots/ayah-pair-'+size.name+'.png'});
});}
