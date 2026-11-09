import { chromium } from 'playwright';
import { serve } from './sfx.mjs';
const dir = process.argv[2], out = process.argv[3];
const srv = await serve(process.cwd() + '/' + dir);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.log('ERRO', e.message)); p.on('response', (r) => r.status() >= 400 && console.log('404', r.url()));
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?render=1`);
await p.evaluate(() => window.ready);
for (const k of [0, 1, 2]) { await p.evaluate((t) => window.seek(t), k + 0.5); await p.waitForTimeout(150); await p.screenshot({ path: `${out}-${k + 1}.png` }); }
await b.close(); srv.close();
