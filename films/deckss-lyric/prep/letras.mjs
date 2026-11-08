// Pré-renderiza cada palavra da letra no estilo do título (lettering.js) como PNG transparente, uma vez só.
// Saída: letras/<id>.png + letras/indice.json { id: { txt, fonte, tipo, tam, w, h, padX, padY, tw, A, D } }.
// Uso (na raiz): node films/deckss-lyric/prep/letras.mjs
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { serve } from '../../../sfx.mjs';
const raiz = path.resolve('films/deckss-lyric');
const letra = JSON.parse(await readFile(path.join(raiz, 'letra.json'), 'utf8'));
const CHAVE = new Set(JSON.parse(await readFile(path.join(raiz, 'chave.json'), 'utf8')));
const TAM = 360;
const pedidos = new Map();
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619); return (h >>> 0).toString(36); };
for (const l of letra) for (const p of l.palavras) {
  const txt = p.w.toUpperCase().replace(/[.,!?]/g, ''), chave = CHAVE.has(p.w.toLowerCase());
  // regra fixa (o filme usa a mesma): chave = fogo/Sedgwick; resto = creme, Permanent Marker em ~28% (pelo hash)
  const fonte = !chave && parseInt(hash(txt), 36) % 100 < 28 ? 'Permanent Marker' : 'Sedgwick', tipo = chave ? 'fogo' : 'creme';
  pedidos.set(hash(`${txt}|${fonte}|${tipo}`), { txt, fonte, tipo });
}
for (const extra of ['VAI', 'FAZER', 'SENTIDO', 'DECKSS']) for (const tipo of ['creme', 'fogo']) pedidos.set(hash(`${extra}|Sedgwick|${tipo}`), { txt: extra, fonte: 'Sedgwick', tipo });
await mkdir(path.join(raiz, 'letras'), { recursive: true });
const indPath = path.join(raiz, 'letras/indice.json');
const indice = existsSync(indPath) ? JSON.parse(await readFile(indPath, 'utf8')) : {};
const srv = await serve(raiz);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 4300, height: 1000 } });
await pg.goto(`http://127.0.0.1:${srv.address().port}/prep/letras-pagina/index.html`);
let n = 0;
for (const [id, q] of pedidos) {
  if (indice[id] && existsSync(path.join(raiz, `letras/${id}.png`))) continue;
  const semente = parseInt(id, 36) % 997;
  const m = await pg.evaluate(([t, f, ti, s, tam]) => window.monta(t, f, ti, s, tam), [q.txt, q.fonte, q.tipo, semente, TAM]);
  // margem para o contorno/sombra que o filtro desenha fora da caixa
  const ox = 60, oy = 150, mx = TAM * 0.14, my = TAM * 0.16;   // caixa da palavra começa em (ox, oy) na página
  await pg.screenshot({ path: path.join(raiz, `letras/${id}.png`), omitBackground: true, clip: { x: 0, y: 0, width: ox + m.w + mx, height: oy + m.h + my } });
  indice[id] = { ...q, tam: TAM, ...m, ox, oy, W: ox + m.w + mx, H: oy + m.h + my };
  if (++n % 20 === 0) process.stdout.write(`${n} `);
}
await writeFile(indPath, JSON.stringify(indice));
console.log(`\n${n} palavras novas, ${Object.keys(indice).length} no índice`);
await b.close(); srv.close();
