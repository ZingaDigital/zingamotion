// Prepara um projeto de filme com um comando: confere e instala o que falta e monta as pastas.
//
// Uso, na pasta do projeto (a que vai guardar os filmes):
//   node <pasta-da-skill>/motor/preparar.mjs <nome-do-filme> [--bpm 120] [--duracao 15] [--so-checar]
// Faz:
//   1. confere Node 20+, ffmpeg, Python 3 com numpy e Pillow, Playwright e o Chromium dele
//      (instala sozinho o que dá: playwright via npm, chromium via npx, numpy/pillow via pip)
//   2. copia o motor para a raiz (render.mjs, sfx.mjs, beats.py, revisao.py, emenda.py, captura.mjs)
//   3. cria films/<nome> a partir do modelo, docs/ com os modelos de documento e as regras no CLAUDE.md
//   4. gera a grade de batidas e faz um teste de render de 2 quadros
// Nunca sobrescreve um filme, um doc ou um CLAUDE.md que já existam.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (n, f) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : f; };
const nome = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) || 'filme';
const soChecar = args.includes('--so-checar');
const MOTOR = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.dirname(MOTOR);
const RAIZ = process.cwd();
const win = process.platform === 'win32';
const faltas = [];

const roda = (cmd, a, o = {}) => spawnSync(cmd, a, { encoding: 'utf8', shell: win, ...o });
const ok = (msg) => console.log(`  ok  ${msg}`);
const falta = (msg, como) => { console.log(`  --  ${msg}`); faltas.push(`${msg}: ${como}`); };

console.log('1. Dependências');
const maior = Number(process.versions.node.split('.')[0]);
maior >= 20 ? ok(`Node ${process.versions.node}`) : falta(`Node ${process.versions.node} (precisa 20+)`, 'instale o Node LTS em nodejs.org');

const ff = roda('ffmpeg', ['-version']);
if (ff.status === 0) ok(ff.stdout.split('\n')[0].slice(0, 40));
else falta('ffmpeg', process.platform === 'darwin' ? 'brew install ffmpeg' : win ? 'winget install Gyan.FFmpeg' : 'sudo apt install ffmpeg');

const PY = ['python3', 'python', 'py'].find((p) => roda(p, ['--version']).status === 0);
if (!PY) falta('Python 3', 'instale em python.org');
else {
  const libs = () => roda(PY, ['-c', 'import numpy, PIL']).status === 0;
  if (!libs() && !soChecar) roda(PY, ['-m', 'pip', 'install', '--user', '-q', 'numpy', 'pillow'], { stdio: 'inherit' });
  libs() ? ok(`${PY} com numpy e Pillow`) : falta('numpy e Pillow', `${PY} -m pip install numpy pillow`);
}

// Playwright resolvido a partir da raiz do projeto (é de lá que o render importa)
if (!existsSync(path.join(RAIZ, 'package.json')) && !soChecar) {
  writeFileSync(path.join(RAIZ, 'package.json'), JSON.stringify({ name: path.basename(RAIZ).toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    private: true, type: 'module', devDependencies: { playwright: '1.56.1' } }, null, 2) + '\n');
}
const temPW = () => existsSync(path.join(RAIZ, 'node_modules', 'playwright', 'package.json'));
if (!temPW() && !soChecar) roda('npm', ['i', '-D', 'playwright@1.56.1'], { stdio: 'inherit', cwd: RAIZ });
const testaChromium = () => roda('node', ['--input-type=module', '-e',
  "import { chromium } from 'playwright'; const b = await chromium.launch(); await b.close();"], { cwd: RAIZ });
if (!temPW()) falta('Playwright', 'npm i -D playwright');
else {
  let c = testaChromium();
  if (c.status !== 0 && !soChecar) { roda('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', cwd: RAIZ }); c = testaChromium(); }
  c.status === 0 ? ok('Playwright + Chromium abrem') : falta('Chromium do Playwright', 'npx playwright install chromium');
}

if (soChecar) { fim(); process.exit(faltas.length ? 1 : 0); }

console.log('2. Motor na raiz');
for (const f of readdirSync(MOTOR)) {
  if (f === 'preparar.mjs') continue;
  cpSync(path.join(MOTOR, f), path.join(RAIZ, f));
}
ok('render.mjs sfx.mjs beats.py revisao.py emenda.py captura.mjs');

console.log('3. Pastas do projeto');
for (const d of ['films', 'docs', 'out', 'resultados', 'refs']) mkdirSync(path.join(RAIZ, d), { recursive: true });
const filme = path.join(RAIZ, 'films', nome);
if (existsSync(filme)) ok(`films/${nome} já existe (mantido)`);
else { cpSync(path.join(SKILL, 'modelo'), filme, { recursive: true }); ok(`films/${nome} criado a partir do modelo`); }
for (const f of readdirSync(path.join(SKILL, 'docs-modelo'))) {
  if (f === 'regras-do-estudio.md') continue;
  const d = path.join(RAIZ, 'docs', f);
  if (!existsSync(d)) cpSync(path.join(SKILL, 'docs-modelo', f), d);
}
ok('docs/ com lista de planos, guia de animação e estado');
const regras = readFileSync(path.join(SKILL, 'docs-modelo', 'regras-do-estudio.md'), 'utf8');
const cm = path.join(RAIZ, 'CLAUDE.md');
if (existsSync(cm) && readFileSync(cm, 'utf8').includes('Contrato de render')) ok('CLAUDE.md já tem as regras do estúdio');
else { appendFileSync(cm, (existsSync(cm) ? '\n' : '') + regras.replace(/^# .*\n/, '# Regras do estúdio de motion\n')); ok('regras do estúdio no CLAUDE.md'); }

console.log('4. Grade e teste');
const bpm = opt('bpm', '120'), dur = opt('duracao', '8');
if (PY) {
  const g = roda(PY, ['beats.py', 'grade', '--bpm', bpm, '--duracao', dur, '-o', path.join('films', nome, 'beats.json')], { cwd: RAIZ });
  g.status === 0 ? ok(g.stdout.trim()) : falta('grade de batidas', g.stderr.trim().slice(-200));
}
if (!faltas.length) {
  const t = roda('node', ['render.mjs', path.join('films', nome), '--at', '1,3', '--cols', '2', '--nome', 'teste'], { cwd: RAIZ });
  t.status === 0 ? ok(`render de teste: out/${nome}-tira-teste.png`) : falta('render de teste', (t.stderr || t.stdout).trim().slice(-300));
}
fim();

function fim() {
  if (!faltas.length) {
    console.log(`\nPronto. Próximo passo: node captura.mjs <url> --saida films/${nome}/assets`);
    return;
  }
  console.log('\nFalta resolver:');
  for (const f of faltas) console.log('  - ' + f);
  process.exitCode = 1;
}
