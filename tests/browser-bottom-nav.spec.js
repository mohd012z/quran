import{test,expect}from '@playwright/test';
const sizes=[{name:'portrait',width:393,height:852},{name:'landscape',width:852,height:393}];
for(const size of sizes){test(size.name+' bottom dock screenshot and accessibility',async({page})=>{
 await page.setViewportSize(size);await page.goto('/');const nav=page.getByRole('navigation',{name:'Bottom navigation'});await expect(nav).toBeVisible();const buttons=nav.getByRole('button');await expect(buttons).toHaveCount(11);
 await expect(page.getByRole('button',{name:'Baca',exact:true}).first()).toBeVisible();
 const metrics=await nav.evaluate(el=>({scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,rect:el.getBoundingClientRect().toJSON(),buttons:[...el.querySelectorAll('button')].map(b=>({label:b.getAttribute('aria-label'),height:b.getBoundingClientRect().height,width:b.getBoundingClientRect().width}))}));
 expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);expect(metrics.rect.bottom).toBeLessThanOrEqual(size.height+1);expect(metrics.rect.top).toBeGreaterThanOrEqual(0);
 for(const b of metrics.buttons){expect(b.label).toBeTruthy();expect(b.height).toBeGreaterThanOrEqual(44);expect(b.width).toBeGreaterThanOrEqual(44)}
 await nav.screenshot({path:'screenshots/nav-'+size.name+'.png'});
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
