import { chromium } from 'playwright';
import { serve } from './sfx.mjs';
const [dir, out, w = 1920, h = 2160] = process.argv.slice(2);
const srv = await serve(new URL(dir, 'file://' + process.cwd() + '/').pathname);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html?render=1`);
await p.evaluate(() => window.ready);
await p.screenshot({ path: out }); await b.close(); srv.close();
