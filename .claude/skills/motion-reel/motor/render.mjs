// Render determinístico: cada quadro é window.seek(t), capturado no Chromium e codificado pelo ffmpeg.
//
// Uso (a partir da raiz do projeto; o motor fica em .claude/skills/motion-reel/motor ou copiado na raiz):
//   node render.mjs <pasta-do-filme>            render completo com som -> out/<nome>.mp4
//   node render.mjs <pasta> --contact           um quadro por batida -> out/<nome>-contato.png
//   node render.mjs <pasta> --contact --sub 2   subdivide cada batida (2 = batida e contratempo)
//   node render.mjs <pasta> --at 1.2,3.45       tira com os instantes pedidos -> out/<nome>-tira.png
//   node render.mjs <pasta> --verify            checa se seek(t) é função pura (mesmo t, mesmo quadro)
//   node render.mjs <pasta> --rascunho          animático: metade da resolução, 15 fps, codificação rápida
//   node render.mjs <pasta> --from 4 --to 6.5 --no-audio --nome t1   só os segundos afetados (depois: emenda.py)
//   opções: --fps 30  --crf 16  --formato 9x16|1x1|16x9 (vai pra página como ?formato=)  --nome x (sufixo)
//
// Contrato da página (index.html dentro da pasta do filme):
//   window.FILM = { width, height, fps, duration }
//   window.ready         Promise opcional, resolvida quando a página está pronta pra seek
//   window.seek(t)       desenha o quadro do instante t (pode retornar Promise)
//   window.renderAudio() opcional: Promise<{ sampleRate, channels: [base64 Float32 PCM, ...] }>
//   beats.json           { "bpm": 120, "beats": [0, 0.5, ...] } em segundos
// Em modo render a página recebe ?render=1 e não deve rodar loop de preview.

import { chromium } from 'playwright';
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { serve, run, somDaPagina, finalizaSom } from './sfx.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !args[i - 1]?.match(/^--(fps|crf|from|to|sub|at|cols|nome|formato)$/));

const filmDir = path.resolve(positional[0] ?? 'films/teste');
const filmName = path.basename(filmDir);
const outDir = path.resolve('out');
// pasta temporária por processo: vários renders do mesmo filme podem rodar ao mesmo tempo
const tmpDir = path.join(outDir, `.tmp-${filmName}-${process.pid}`);
const formato = opt('formato');
const rascunho = flag('rascunho');
const sufixo = (formato ? `-${formato}` : '') + (rascunho ? '-rascunho' : '') + (opt('nome') ? `-${opt('nome')}` : '');

if (!existsSync(path.join(filmDir, 'index.html'))) {
  console.error(`Não achei ${path.join(filmDir, 'index.html')}`);
  process.exit(1);
}

// Fiscal do contrato: Math.random quebra na hora, timers e rAF ficam registrados e reprovam o render.
function enforceContract() {
  window.__violations = [];
  const note = (what) => window.__violations.push(what);
  Math.random = () => { throw new Error('Math.random proibido no render: use mulberry32 com semente'); };
  for (const name of ['setTimeout', 'setInterval', 'requestAnimationFrame']) {
    const original = window[name].bind(window);
    window[name] = (...a) => { note(name); return original(...a); };
  }
}
const NO_CSS_MOTION = '*,*::before,*::after{transition:none!important;animation:none!important}';

const server = await serve(filmDir);
const url = `http://127.0.0.1:${server.address().port}/index.html?render=1${formato ? `&formato=${formato}` : ''}`;
const browser = await chromium.launch();

try {
  const probe = await browser.newPage();
  await probe.goto(url);
  const film = await probe.evaluate(() => window.FILM);
  await probe.close();
  if (!film?.width || !film?.height || !film?.duration) throw new Error('A página precisa definir window.FILM = { width, height, fps, duration }');

  const fps = Number(opt('fps', rascunho ? 15 : film.fps ?? 30));
  const from = Number(opt('from', 0));
  const to = Number(opt('to', film.duration));

  const page = await browser.newPage({ viewport: { width: film.width, height: film.height }, deviceScaleFactor: rascunho ? 0.5 : 1 });
  await page.addInitScript(enforceContract);
  page.on('pageerror', (e) => console.error('[página]', e.message));
  await page.goto(url);
  await page.addStyleTag({ content: NO_CSS_MOTION });
  await page.evaluate(async () => { await window.ready; await document.fonts.ready; });

  const shot = async (t) => {
    await page.evaluate((t) => window.seek(t), t);
    return page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
  };
  const checkViolations = async () => {
    const v = await page.evaluate(() => [...new Set(window.__violations)]);
    if (v.length) throw new Error(`Contrato violado: a página chamou ${v.join(', ')}. Tudo tem que sair de seek(t).`);
  };

  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });

  if (flag('verify')) {
    // Mesmo t visitado em ordens diferentes tem que gerar bytes idênticos.
    const times = [0, film.duration * 0.37, film.duration * 0.71, film.duration - 1 / fps];
    const hash = (b) => createHash('sha1').update(b).digest('hex');
    const first = [];
    for (const t of times) first.push(hash(await shot(t)));
    const back = [...times].reverse();
    let fails = 0;
    for (const t of back) {
      const h = hash(await shot(t));
      const ok = h === first[times.indexOf(t)];
      if (!ok) fails++;
      console.log(`${ok ? 'ok   ' : 'FALHA'} t=${t.toFixed(3)}`);
    }
    await checkViolations();
    if (fails) throw new Error(`${fails} quadro(s) dependem do histórico. seek(t) não é função pura.`);
    console.log('seek(t) é função pura nos pontos testados.');
  } else if (flag('contact') || opt('at')) {
    let list, nome;
    if (opt('at')) {
      list = opt('at').split(',').map(Number);
      nome = 'tira';
    } else {
      const beatsFile = path.join(filmDir, 'beats.json');
      if (!existsSync(beatsFile)) throw new Error('Folha de contato precisa de beats.json na pasta do filme');
      const { beats } = JSON.parse(await readFile(beatsFile, 'utf8'));
      const sub = Number(opt('sub', 1));
      const passo = beats.length > 1 ? beats[1] - beats[0] : 0.5;
      list = beats.flatMap((b) => Array.from({ length: sub }, (_, k) => +(b + (k * passo) / sub).toFixed(4))).filter((t) => t >= from && t < to);
      nome = sub > 1 ? `contato-sub${sub}` : 'contato';
    }
    // Rótulo do instante embaixo de cada quadro (só na folha, nunca no filme).
    await page.evaluate(() => {
      const d = document.createElement('div'); d.id = '__rotulo';
      d.style.cssText = 'position:fixed;left:0;bottom:0;padding:6px 14px;font:700 34px monospace;background:#ff0;color:#000;z-index:2147483647';
      document.body.append(d);
    });
    for (const [i, t] of list.entries()) {
      await page.evaluate((t) => { document.getElementById('__rotulo').textContent = t.toFixed(2) + 's'; }, t);
      await writeFile(path.join(tmpDir, `b${String(i).padStart(3, '0')}.png`), await shot(t));
    }
    await checkViolations();
    const cols = Number(opt('cols', Math.min(list.length, list.length > 16 ? 8 : 5))), rows = Math.ceil(list.length / cols);
    const out = path.join(outDir, `${filmName}-${nome}${sufixo}.png`);
    await run('ffmpeg', ['-hide_banner', '-y', '-i', path.join(tmpDir, 'b%03d.png'),
      '-vf', `scale=360:-1,tile=${cols}x${rows}:padding=12:margin=12:color=0x808080`, '-frames:v', '1', out]);
    console.log(`Folha: ${out} (${list.length} quadros)`);
  } else {
    const total = Math.round((to - from) * fps);
    const silent = path.join(tmpDir, 'video.mp4');
    const started = Date.now();
    await run('ffmpeg', ['-hide_banner', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', rascunho ? 'veryfast' : 'slow', '-crf', String(opt('crf', rascunho ? 23 : 16)), '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', silent], async (stdin) => {
      for (let i = 0; i < total; i++) {
        const png = await shot(from + i / fps);
        if (!stdin.write(png)) await new Promise((ok) => stdin.once('drain', ok));
        if (i % fps === 0 || i === total - 1) process.stdout.write(`\rquadro ${i + 1}/${total}`);
      }
      stdin.end();
    });
    process.stdout.write('\n');
    await checkViolations();

    const final = path.join(outDir, `${filmName}${sufixo}.mp4`);
    const wav = flag('no-audio') ? null : await somDaPagina(page, path.join(tmpDir, 'audio-bruto.wav'));
    if (wav) await finalizaSom({ wav, video: silent, saida: final, tmp: tmpDir, de: from });
    else await run('ffmpeg', ['-hide_banner', '-y', '-i', silent, '-c', 'copy', '-movflags', '+faststart', final]);
    console.log(`Render: ${final} (${total} quadros, ${film.width}x${film.height}@${fps}, ${((Date.now() - started) / 1000).toFixed(1)}s)`);
  }
} catch (e) {
  console.error(`\n${e.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
  await rm(tmpDir, { recursive: true, force: true });
}
