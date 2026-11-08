import{installLayoutQuranMocks}from './quran-layout-fixture.mjs';
import{attachQuranNetworkDiagnostics}from './quran-playwright-network.mjs';
import{test,expect}from '@playwright/test';
import{mkdir,writeFile}from 'node:fs/promises';
import{observeQuranRequests}from '../src/quran-playwright-observer.js';
const sizes=[{name:'portrait',width:393,height:852},{name:'landscape',width:852,height:393}];
test.beforeEach(async({page},testInfo)=>{
 if(/^(portrait|landscape) /.test(testInfo.title)){
  await installLayoutQuranMocks(page);
  await page.addInitScript(()=>{localStorage.removeItem('quran-mushaf-v1');localStorage.removeItem('quran-reader-v1')});
 }
});

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
 await expect(page.locator('.ayah-card').first()).toBeVisible({timeout:15000});await mkdir('screenshots',{recursive:true});await page.screenshot({path:'screenshots/reader-'+size.name+'.png',fullPage:true});
 await disclosure.locator('summary').focus();await page.keyboard.press('Enter');await expect(disclosure).not.toHaveAttribute('open','');
});}

for(const size of sizes){test(size.name+' ayah Arabic translation visual isolation',async({page})=>{
 await page.setViewportSize(size);await page.goto('/');
 const card=page.locator('.ayah-card').first();await expect(card).toBeVisible({timeout:15000});
 await expect(card.locator(':scope > .arabic')).toContainText('LAYOUT_FIXTURE_1');
 await expect(card.locator(':scope > .verse-translation')).toContainText('MALAY_FIXTURE_1');
 const arabic=card.locator(':scope > .arabic');await expect(arabic).toHaveAttribute('dir','rtl');
 const translation=card.locator(':scope > .verse-translation');await expect(translation).toHaveAttribute('lang',/^(ms|id|en)$/);
 const result=await card.evaluate(el=>{const a=el.querySelector(':scope > .arabic'),t=el.querySelector(':scope > .verse-translation');if(!a||!t)return null;const ar=a.getBoundingClientRect(),tr=t.getBoundingClientRect(),cr=el.getBoundingClientRect();return {arabicBottom:ar.bottom,translationTop:tr.top,cardWidth:cr.width,viewport:innerWidth,rtl:getComputedStyle(a).direction,translationDirection:getComputedStyle(t).direction}});
 expect(result).not.toBeNull();expect(result.rtl).toBe('rtl');expect(result.translationDirection).toBe('ltr');
 expect(result.translationTop).toBeGreaterThanOrEqual(result.arabicBottom-1);expect(result.cardWidth).toBeLessThanOrEqual(result.viewport+1);
 await mkdir('screenshots',{recursive:true});await card.screenshot({path:'screenshots/ayah-pair-'+size.name+'.png'});
});}

test('redacted browser network evidence with deterministic Arabic and Basmeih mocks',async({page})=>{
 const observer=observeQuranRequests(page);
 await page.route('https://api.alquran.cloud/v1/surah/2/*',async route=>{
  const path=new URL(route.request().url()).pathname;
  const edition=path.endsWith('/quran-uthmani')?'quran-uthmani':path.endsWith('/ms.basmeih')?'ms.basmeih':null;
  if(!edition)return route.abort();
  const ayahs=[{number:8,numberInSurah:1,text:edition==='quran-uthmani'?'الٓمٓ':'Alif, Laam, Miim.'},{number:9,numberInSurah:2,text:edition==='quran-uthmani'?'ذَٰلِكَ الْكِتَابُ':'Kitab Al-Quran ini'}];
  await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({code:200,status:'OK',data:{number:2,edition:{identifier:edition,type:edition==='ms.basmeih'?'translation':'quran'},ayahs}})});
 });
 await page.goto('/');
 const result=await page.evaluate(async()=>{
  const urls=['quran-uthmani','ms.basmeih'].map(x=>'https://api.alquran.cloud/v1/surah/2/'+x);
  return Promise.all(urls.map(async url=>(await(await fetch(url)).json()).data.ayahs.map(v=>({number:v.number,numberInSurah:v.numberInSurah}))));
 });
 expect(result[0]).toEqual(result[1]);expect(result[0]).toEqual([{number:8,numberInSurah:1},{number:9,numberInSurah:2}]);
 const records=observer.records.filter(x=>x.endpoint==='arabic-uthmani'||x.endpoint==='malay-basmeih');
 expect(records.some(x=>x.endpoint==='arabic-uthmani'&&x.status===200)).toBeTruthy();
 expect(records.some(x=>x.endpoint==='malay-basmeih'&&x.status===200)).toBeTruthy();
 await mkdir('test-results',{recursive:true});await writeFile('test-results/quran-network-redacted.json',JSON.stringify(records,null,2));
 observer.stop();
});

test('Al-Baqarah 2:1/2:2 mocked API diagnostic records are redacted',async({page})=>{
 const records=[];const detach=attachQuranNetworkDiagnostics(page,records);
 await page.route('https://api.alquran.cloud/v1/surah/2/ms.basmeih',route=>route.fulfill({status:503,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify({status:'ERROR',data:null})}));
 const response=await page.evaluate(async()=>{try{const r=await fetch('https://api.alquran.cloud/v1/surah/2/ms.basmeih');return r.status}catch{return -1}});
 expect(response).toBe(503);
 expect(records).toContainEqual({endpoint:'malay-2',event:'response',status:503,kind:'HTTP'});
 expect(JSON.stringify(records)).not.toMatch(/https:|token|بسم|Alif/);
 detach();
});
test('Arabic quran-uthmani network failure has safe endpoint evidence',async({page})=>{
 const records=[];const detach=attachQuranNetworkDiagnostics(page,records);
 await page.route('https://api.alquran.cloud/v1/surah/2/quran-uthmani',route=>route.abort('failed'));
 await page.evaluate(async()=>{try{await fetch('https://api.alquran.cloud/v1/surah/2/quran-uthmani')}catch{}});
 await expect.poll(()=>records.length).toBeGreaterThan(0);
 expect(records.some(x=>x.endpoint==='arabic-2'&&x.event==='requestfailed'&&x.kind==='NETWORK_UNDETERMINED')).toBe(true);
 detach();
});

for(const size of sizes){test(size.name+' last verse remains reachable above fixed bottom dock',async({page})=>{
 await page.setViewportSize(size);await page.goto('/');
 const cards=page.locator('.ayah-card');await expect(cards.first()).toBeVisible({timeout:15000});
 await expect(cards).toHaveCount(7);
 await expect(cards.last().locator(':scope > .verse-translation')).toContainText('MALAY_FIXTURE_7');
 const last=cards.last();await last.scrollIntoViewIfNeeded();
 await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
 await expect.poll(async()=>last.evaluate(el=>{const card=el.getBoundingClientRect(),nav=document.querySelector('.bottom-reader-tabs'),dock=nav?.getBoundingClientRect(),visible=nav&&!nav.classList.contains('nav-hidden');return {cardBottom:Math.round(card.bottom),dockTop:Math.round(visible?dock.top:innerHeight),viewport:innerHeight,scrollEnd:Math.abs(window.scrollY+innerHeight-document.documentElement.scrollHeight)<=2}})).toMatchObject({scrollEnd:true});
 const metrics=await last.evaluate(el=>{const r=el.getBoundingClientRect(),nav=document.querySelector('.bottom-reader-tabs'),dock=nav?.getBoundingClientRect();return {cardBottom:r.bottom,dockTop:nav&&!nav.classList.contains('nav-hidden')?dock.top:innerHeight,viewport:innerHeight,buttons:[...el.querySelectorAll('.ayah-actions button')].map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))}});
 expect(metrics.cardBottom).toBeLessThanOrEqual(metrics.dockTop+1);
 for(const b of metrics.buttons){expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44)}
 await mkdir('screenshots',{recursive:true});await page.screenshot({path:'screenshots/last-ayah-safe-'+size.name+'.png'});
});}


test('audio playback highlights only the active ayah and clears on pause',async({page})=>{
 await installLayoutQuranMocks(page);
 await page.addInitScript(()=>{localStorage.removeItem('quran-mushaf-v1');localStorage.removeItem('quran-reader-v1')});
 await page.goto('/');
 const first=page.locator('.ayah-card').first();await expect(first).toBeVisible();
 await first.getByRole('button',{name:'Dengar ayat 1'}).click();
 const audio=first.locator('audio');await expect(audio).toHaveCount(1);
 await audio.dispatchEvent('play');await expect(first).toHaveClass(/ayah-audio-playing/);
 await expect(page.locator('.ayah-card.ayah-audio-playing')).toHaveCount(1);
 await audio.dispatchEvent('pause');await expect(first).not.toHaveClass(/ayah-audio-playing/);
 const motion=await first.evaluate(el=>getComputedStyle(el).animationName);
 expect(typeof motion).toBe('string');
});

test('Khat themes and translation follow active audio without changing Arabic source',async({page})=>{
 await installLayoutQuranMocks(page);
 await page.addInitScript(()=>{localStorage.removeItem('quran-mushaf-v1');localStorage.removeItem('quran-reader-v1')});
 await page.goto('/');
 const first=page.locator('.ayah-card').first();
 await expect(first).toBeVisible();
 const original=await first.locator('p.arabic').textContent();
 const controls=page.getByRole('group',{name:'Pilihan bacaan Khat dan audio'});
 await expect(controls).toBeVisible();
 await expect(page.locator('.ayah-list')).toHaveClass(/khat-mushaf/);
 await controls.getByRole('combobox',{name:'Gaya Khat'}).selectOption('modern');
 await expect(page.locator('.ayah-list')).toHaveClass(/khat-modern/);
 expect(await first.locator('p.arabic').textContent()).toBe(original);
 await first.getByRole('button',{name:'Dengar ayat 1'}).click();
 const audio=first.locator('audio');
 await expect(audio).toHaveCount(1);
 await audio.dispatchEvent('play');
 await expect(first.locator('.verse-translation')).toHaveClass(/translation-audio-active/);
 await controls.getByRole('checkbox',{name:'Serlah terjemahan'}).uncheck();
 await expect(first.locator('.verse-translation')).not.toHaveClass(/translation-audio-active/);
 await controls.getByRole('checkbox',{name:'Serlah terjemahan'}).check();
 await audio.dispatchEvent('pause');
 await expect(first.locator('.verse-translation')).not.toHaveClass(/translation-audio-active/);
 expect(await first.locator('p.arabic').textContent()).toBe(original);
});
test('ayah follow option can be disabled while audio highlight remains',async({page})=>{
 await installLayoutQuranMocks(page);
 await page.goto('/');
 const controls=page.getByRole('group',{name:'Pilihan bacaan Khat dan audio'});
 await controls.getByRole('checkbox',{name:'Ikut ayat audio'}).uncheck();
 const first=page.locator('.ayah-card').first();
 await first.getByRole('button',{name:'Dengar ayat 1'}).click();
 const audio=first.locator('audio');
 await audio.dispatchEvent('play');
 await expect(first).toHaveClass(/ayah-audio-playing/);
 await expect(controls.getByRole('checkbox',{name:'Ikut ayat audio'})).not.toBeChecked();
 await audio.dispatchEvent('pause');
 await expect(first).not.toHaveClass(/ayah-audio-playing/);
});

test('Kareem sidebar, dark mode and shared audio dock work with synthetic fixtures',async({page})=>{
 await installLayoutQuranMocks(page);
 await page.addInitScript(()=>{localStorage.removeItem('quran-mushaf-v1');localStorage.removeItem('quran-reader-v1')});
 await page.goto('/');
 await expect(page.getByRole('button',{name:'Buka senarai Surah'})).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Buka senarai Surah'}).click();
 await expect(page.getByRole('complementary',{name:'Navigasi Surah dan Juz'})).toHaveClass(/is-open/);
 await page.getByRole('button',{name:'Tutup senarai Surah'}).click();
 await expect(page.getByRole('complementary',{name:'Navigasi Surah dan Juz'})).not.toHaveClass(/is-open/);
 await page.setViewportSize({width:1280,height:800});
 await page.getByRole('button',{name:'Tukar tema gelap'}).click();
 await expect(page.locator('.quran-shell')).toHaveClass(/kareem-dark/);
 await page.getByRole('button',{name:'Tukar tema gelap'}).click();
 await expect(page.locator('.quran-shell')).not.toHaveClass(/kareem-dark/);
 const first=page.locator('.ayah-card').first();
 await first.getByRole('button',{name:'Dengar ayat 1'}).click();
 const dock=page.getByLabel('Pemain audio ayat');
 await expect(dock).toBeVisible();
 await expect(dock.getByRole('combobox',{name:'Qari pemain'})).toBeVisible();
 await expect(dock.getByRole('combobox',{name:'Kelajuan audio'})).toHaveValue('1');
 await dock.getByRole('combobox',{name:'Kelajuan audio'}).selectOption('1.25');
 await expect(dock.getByRole('combobox',{name:'Kelajuan audio'})).toHaveValue('1.25');
 const audio=first.locator('audio');
 await audio.dispatchEvent('play');
 await expect(dock.getByRole('button',{name:'Jeda audio'})).toBeVisible();
 await audio.dispatchEvent('pause');
 await expect(dock.getByRole('button',{name:'Main audio'})).toBeVisible();
});
