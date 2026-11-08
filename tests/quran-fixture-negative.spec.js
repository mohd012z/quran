import{test,expect}from '@playwright/test';
import{mkdir,writeFile}from 'node:fs/promises';
import{installLayoutQuranMocks,layoutQuranPayload}from './quran-layout-fixture.mjs';
const API='https://api.alquran.cloud/v1';
const arabic=API+'/surah/1/quran-uthmani';
const malay=API+'/surah/1/ms.basmeih';
async function setup(page){await installLayoutQuranMocks(page);await page.addInitScript(()=>{localStorage.removeItem('quran-mushaf-v1');localStorage.removeItem('quran-reader-v1')})}
async function mutate(page,url,change){const base=layoutQuranPayload(url);if(!base)throw Error('Fixture not allowed');const copy=structuredClone(base);change(copy);await page.route(url,route=>route.fulfill({status:200,headers:{'access-control-allow-origin':'*'},json:copy}))}
async function record(caseId,expected){await mkdir('test-results',{recursive:true});await writeFile('test-results/quran-fixture-negative-'+caseId+'.json',JSON.stringify({schemaVersion:1,caseId,expected,fixture:'synthetic',liveNetwork:false},null,2)+'\n')}
test('unexpected Quran endpoint and query are blocked without fallback',async({page})=>{
 await setup(page);await page.goto('/');
 for(const url of [API+'/surah/1/unreviewed',arabic+'?token=secret',API+'/edition?language=ms',API+'/surah/2/quran-uthmani']){
  const result=await page.evaluate(async u=>{try{await fetch(u);return 'unexpected-success'}catch{return 'blocked'}},url);
  expect(result).toBe('blocked');
 }
 await record('unexpected-endpoint','blocked');
});
for(const [caseId,change]of [
 ['arabic-missing-ayah',p=>p.data.ayahs.pop()],
 ['arabic-duplicate-id',p=>p.data.ayahs[1].number=p.data.ayahs[0].number],
 ['arabic-missing-text',p=>p.data.ayahs[0].text=''],
 ['supporting-edition-misaligned',p=>p.data.ayahs[1].numberInSurah=1]
]){
 test(caseId+' rejects invalid verse identity before rendering',async({page})=>{
  await setup(page);
  const url=caseId==='supporting-edition-misaligned'?API+'/surah/1/en.sahih':arabic;
  await mutate(page,url,change);
  await page.goto('/');
  await expect(page.locator('.ayah-card')).toHaveCount(0);
  await expect(page.getByText(/Surah 1: (Verse count mismatch|Verse identity or text mismatch)/)).toBeVisible();
  await record(caseId,'no-verse-cards');
 });
}
for(const [caseId,change]of [
 ['malay-wrong-edition',p=>p.data.edition.identifier='ms.unreviewed'],
 ['malay-duplicate-ayah',p=>p.data.ayahs[1].number=p.data.ayahs[0].number],
 ['malay-missing-ayah',p=>p.data.ayahs.pop()]
]){
 test(caseId+' fails closed without displaying unverified translation',async({page})=>{
  await setup(page);await mutate(page,malay,change);await page.goto('/');
  await expect(page.locator('.ayah-card')).toHaveCount(7);
  await expect(page.locator('.verse-translation').first()).toContainText('Terjemahan tidak tersedia');
  await expect(page.locator('.verse-translation').first()).not.toContainText('MALAY_FIXTURE_1');
  await record(caseId,'translation-rejected');
 });
}

test('malay-wrong-surah rejects translation without corrupting Arabic cards',async({page})=>{
 await setup(page);await mutate(page,malay,p=>p.data.number=2);await page.goto('/');
 await expect(page.locator('.ayah-card')).toHaveCount(7);
 await expect(page.locator('.verse-translation').first()).toContainText('Terjemahan tidak tersedia');
 await expect(page.locator('.verse-translation').first()).not.toContainText('MALAY_FIXTURE_1');
 await record('malay-wrong-surah','translation-rejected');
});
test('malay-metadata-identity mismatch is rejected before translation request',async({page})=>{
 await setup(page);
 const url=API+'/edition?format=text&language=ms&type=translation';
 await mutate(page,url,p=>p.data[0].language='id');
 await page.goto('/');
 await expect(page.locator('.ayah-card')).toHaveCount(7);
 await expect(page.locator('.verse-translation').first()).toContainText('Terjemahan tidak tersedia');
 await expect(page.locator('.verse-translation').first()).not.toContainText('MALAY_FIXTURE_1');
 await record('malay-metadata-language','translation-rejected');
});
