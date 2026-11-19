// Coleta o material real da marca no site: capturas de página e de seção, logo, cores e fontes.
//
// Uso: node captura.mjs <url> [--saida assets] [--larguras 1440,390] [--escala 2] [--esperar 1500]
// Gera em --saida:
//   pagina-<largura>.png          página inteira em cada largura (densidade --escala)
//   secao-<largura>-NN.png         cada bloco grande (header, section, footer...) recortado
//   logo.svg / logo.png            o candidato a logo mais provável (svg inline ou imagem no cabeçalho)
//   marca.json                     cores mais usadas (fundo, texto, botões), famílias de fonte, título, @font-face
// Depois de rodar: ABRA as capturas. Slider e animação de entrada podem ter sido pegos no meio (letras sobrepostas):
// recapture com --esperar maior ou recomponha o texto por cima (Montserrat/fonte do site), nunca invente tela.
// Se o proxy bloquear o CDN de imagens do site (aconteceu com static.wixstatic.com), use o screenshot do Firecrawl
// (firecrawl_scrape com formats ["screenshot"]) ou o sandbox dele, e registre a origem em marca.json.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, f) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : f; };
const url = args.find((a) => /^https?:\/\//.test(a));
if (!url) { console.error('Uso: node captura.mjs <url> [--saida assets]'); process.exit(1); }
const saida = path.resolve(opt('saida', 'assets'));
const larguras = opt('larguras', '1440,390').split(',').map(Number);
const escala = Number(opt('escala', 2)), esperar = Number(opt('esperar', 1500));
await mkdir(saida, { recursive: true });

const browser = await chromium.launch();
const achados = [];
let marca = null;
try {
  for (const w of larguras) {
    const page = await browser.newPage({ viewport: { width: w, height: Math.round(w * (w > 800 ? 0.6 : 2)) }, deviceScaleFactor: escala });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => page.goto(url, { waitUntil: 'load' }));
    // rola até o fim para disparar o carregamento preguiçoso, volta ao topo e espera assentar
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(esperar);
    const pg = path.join(saida, `pagina-${w}.png`);
    await page.screenshot({ path: pg, fullPage: true, animations: 'disabled' });
    achados.push(pg);

    // blocos grandes, em ordem de página
    const blocos = await page.$$('header, section, footer, main > div, [class*="hero" i], [id*="hero" i]');
    let k = 0;
    for (const b of blocos) {
      const r = await b.boundingBox();
      if (!r || r.height < 200 || r.width < w * 0.6) continue;
      const f = path.join(saida, `secao-${w}-${String(++k).padStart(2, '0')}.png`);
      await b.screenshot({ path: f, animations: 'disabled' }).catch(() => {});
      achados.push(f);
      if (k >= 24) break;
    }

    if (!marca) {
      marca = await page.evaluate(() => {
        const cor = (c) => {
          const m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
          if (!m || (m[4] !== undefined && +m[4] < 0.5)) return null;
          return '#' + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, '0')).join('');
        };
        const conta = {}, soma = (papel, c, peso) => { if (!c) return; conta[papel] ??= {}; conta[papel][c] = (conta[papel][c] || 0) + peso; };
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.width * r.height < 400) continue;
          const s = getComputedStyle(el), area = Math.min(r.width * r.height, 2e6);
          soma('fundos', cor(s.backgroundColor), area);
          if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) soma('textos', cor(s.color), r.width);
          if (el.matches('a, button, [role=button], [class*="btn" i], [class*="button" i]')) soma('botoes', cor(s.backgroundColor), 1);
        }
        soma('fundos', cor(getComputedStyle(document.body).backgroundColor) || cor(getComputedStyle(document.documentElement).backgroundColor), 4e6);
        const top = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => c);
        const fam = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).fontFamily : null; };
        const faces = [...document.styleSheets].flatMap((ss) => { try { return [...ss.cssRules]; } catch { return []; } })
          .filter((r) => r.type === 5).map((r) => r.cssText.slice(0, 300));
        // logo: svg/img no cabeçalho com "logo" no nome, ou o primeiro do topo
        const cands = [...document.querySelectorAll('header svg, header img, nav svg, nav img, [class*="logo" i] svg, [class*="logo" i] img, img[alt*="logo" i], img[src*="logo" i]')];
        const lg = cands.find((e) => e.getBoundingClientRect().top < 200) || cands[0];
        return {
          titulo: document.title,
          cores: { fundos: top(conta.fundos), textos: top(conta.textos), botoes: top(conta.botoes) },
          fontes: { titulo: fam('h1') || fam('h2'), texto: fam('p'), botao: fam('button, a') },
          fontFaces: faces.slice(0, 12),
          logo: lg ? (lg.tagName.toLowerCase() === 'svg' ? { svg: lg.outerHTML } : { src: lg.currentSrc || lg.src }) : null,
        };
      });
      if (marca.logo?.svg) { await writeFile(path.join(saida, 'logo.svg'), marca.logo.svg); achados.push(path.join(saida, 'logo.svg')); }
      else if (marca.logo?.src) {
        const r = await page.request.get(marca.logo.src).catch(() => null);
        if (r?.ok()) { const f = path.join(saida, 'logo' + (marca.logo.src.match(/\.(svg|png|webp|jpe?g)/i)?.[0] || '.png')); await writeFile(f, await r.body()); achados.push(f); }
      }
      if (marca.logo?.svg) marca.logo = { svg: 'logo.svg' };
      marca.origem = url;
    }
    await page.close();
  }
  await writeFile(path.join(saida, 'marca.json'), JSON.stringify(marca, null, 1));
  console.log(`Achei ${achados.length} arquivos em ${saida}:`);
  for (const f of achados) console.log('  ' + path.relative(process.cwd(), f));
  console.log('Cores (fundos):', marca.cores.fundos.join(' '), '| textos:', marca.cores.textos.join(' '), '| botões:', marca.cores.botoes.join(' '));
  console.log('Fontes:', JSON.stringify(marca.fontes));
} finally {
  await browser.close();
}
