// Som do filme: renderiza a trilha + os efeitos que a página agenda (window.renderAudio), mistura uma música
// opcional, crava -14 LUFS com pico real <= -1 dBTP e põe o áudio no vídeo.
//
// Uso:
//   node sfx.mjs <pasta-do-filme> --video out/filme.mp4 [--saida out/final.mp4]
//        [--musica arquivo.wav|mp3] [--ganho-musica -4] [--opcoes '{"foley":false}'] [--wav out/so-som.wav]
//   --wav sozinho (sem --video) só exporta o áudio, ex.: a trilha pura para medir com beats.py:
//   node sfx.mjs films/x --opcoes '{"foley":false}' --wav out/trilha.wav && python3 beats.py medir out/trilha.wav
//
// Contrato: window.renderAudio(opcoes) -> Promise<{ sampleRate, channels: [base64 Float32, ...] }>.
// O áudio pode ser mais longo que o vídeo (ex.: uma assinatura emendada depois): o mux não corta.
// render.mjs importa daqui; este arquivo também roda sozinho.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
};

// Servidor local: file:// bloqueia fetch e fonte em alguns casos, http não.
export function serve(root) {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(root, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(root)) return res.writeHead(403).end();
    let body;
    try { body = await readFile(file); } catch { return res.writeHead(404).end(); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' }).end(body);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

export function run(cmd, args, input) {
  return new Promise((ok, fail) => {
    const p = spawn(cmd, args, { stdio: [input ? 'pipe' : 'ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => (code === 0 ? ok(err) : fail(new Error(`${cmd} saiu com ${code}\n${err.slice(-2000)}`))));
    if (input) input(p.stdin);
  });
}

export function wavFloat32(channels, sampleRate) {
  const n = channels[0].length, ch = channels.length, dataBytes = n * ch * 4;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataBytes, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20); buf.writeUInt16LE(ch, 22);
  buf.writeUInt32LE(sampleRate, 24); buf.writeUInt32LE(sampleRate * ch * 4, 28);
  buf.writeUInt16LE(ch * 4, 32); buf.writeUInt16LE(32, 34);
  buf.write('data', 36); buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) buf.writeFloatLE(channels[c][i], 44 + (i * ch + c) * 4);
  return buf;
}

// Loudness integrado e pico real (ebur128 do ffmpeg).
export function mede(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
  const s = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
  return { lufs: Number(s.match(/I:\s+(-?[\d.]+) LUFS/)?.[1]), pico: Number(s.match(/Peak:\s+(-?[\d.]+) dBFS/)?.[1]) };
}

// Ganho calculado + limitador, medindo de novo até cravar o alvo. (loudnorm linear desiste quando o ganho estouraria
// o pico, e bumbo sintetizado tem pico alto demais pra média.)
export async function normaliza(entrada, saida, alvo = -14) {
  let ganho = alvo - mede(entrada).lufs;
  for (let i = 0; i < 4; i++) {
    await run('ffmpeg', ['-hide_banner', '-y', '-i', entrada, '-af',
      `volume=${ganho.toFixed(2)}dB,alimiter=limit=0.75:attack=1:release=60:level=false:latency=true`,
      '-ar', '48000', '-c:a', 'pcm_s24le', saida]);
    const m = mede(saida);
    if (Math.abs(m.lufs - alvo) <= 0.3) break;
    ganho += alvo - m.lufs;
  }
}

// Renderiza o áudio da página aberta. Devolve o caminho de um WAV float32.
export async function somDaPagina(page, wav, opcoes = {}) {
  const tem = await page.evaluate(() => typeof window.renderAudio === 'function');
  if (!tem) return null;
  const a = await page.evaluate((o) => window.renderAudio(o), opcoes);
  const channels = a.channels.map((b64) => {
    const bytes = Buffer.from(b64, 'base64');
    return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.length / 4);
  });
  await writeFile(wav, wavFloat32(channels, a.sampleRate));
  return wav;
}

// Mistura (música opcional), normaliza com compensação do AAC e põe no vídeo. Devolve a medição final.
export async function finalizaSom({ wav, video, saida, tmp, de = 0, musica, ganhoMusica = -4, alvo = -14 }) {
  let mix = wav;
  if (musica) {
    mix = path.join(tmp, 'mix.wav');
    await run('ffmpeg', ['-hide_banner', '-y', '-i', wav, '-i', musica, '-filter_complex',
      `[1:a]volume=${ganhoMusica}dB[m];[0:a][m]amix=inputs=2:duration=longest:normalize=0`, '-c:a', 'pcm_f32le', mix]);
  }
  const norm = path.join(tmp, 'audio.wav');
  let meta = alvo, m, ok;
  for (let i = 0; i < 3; i++) {
    await normaliza(mix, norm, meta);
    await run('ffmpeg', ['-hide_banner', '-y', '-i', video, '-ss', String(de), '-i', norm, '-map', '0:v', '-map', '1:a',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', saida]);
    m = mede(saida);
    ok = Math.abs(m.lufs - alvo) <= 0.3 && m.pico <= -1;
    if (ok) break;
    meta += alvo - m.lufs;                       // o AAC muda o loudness em alguns décimos: compensa no alvo do WAV
  }
  console.log(`Áudio: ${m.lufs} LUFS integrado, pico real ${m.pico} dBTP ${ok ? '(dentro da regra)' : '(FORA: -14 LUFS, pico <= -1)'}`);
  return m;
}

// ---------- uso pela linha de comando ----------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n, f) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : f; };
  const pasta = path.resolve(args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) ?? '.');
  const video = opt('video'), wavOut = opt('wav');
  if (!video && !wavOut) { console.error('Passe --video (pra pôr som no vídeo) e/ou --wav (pra exportar o áudio)'); process.exit(1); }
  const tmp = path.resolve('out', `.tmp-sfx-${process.pid}`);
  await mkdir(tmp, { recursive: true });
  const server = await serve(pasta);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    page.on('pageerror', (e) => console.error('[página]', e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html?render=1`);
    await page.evaluate(async () => { await window.ready; });
    const wav = await somDaPagina(page, wavOut ? path.resolve(wavOut) : path.join(tmp, 'bruto.wav'), JSON.parse(opt('opcoes', '{}')));
    if (!wav) throw new Error('A página não define window.renderAudio');
    if (wavOut) console.log(`WAV: ${wav}`);
    if (video) {
      const saida = path.resolve(opt('saida', video.replace(/\.mp4$/, '-som.mp4')));
      await finalizaSom({ wav, video, saida, tmp, musica: opt('musica'), ganhoMusica: Number(opt('ganho-musica', -4)) });
      console.log(`Final: ${saida}`);
    }
  } finally {
    await browser.close(); server.close();
    await rm(tmp, { recursive: true, force: true });
  }
}
