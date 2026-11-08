// Aprovação v2 (15 s do refrão, faixa 58,95 a 74,40): lettering no estilo da arte do título (lettering.js),
// blocos que fecham a tela com palavra na vertical, e a banda entrando atrás (vídeo em xerox escuro, painéis rasgados,
// fotos coladas). Tempos das palavras: letra.json (voz separada + reconhecimento + onsets).
(() => {
  const OFF = 58.95, DUR = 15.45, BT = 60 / 163;
  const s = (x) => +(x - OFF).toFixed(3);
  const BATIDAS = []; for (let k = Math.ceil(OFF / BT); k * BT < OFF + DUR; k++) BATIDAS.push(s(k * BT));
  Object.assign(C, { OFF, DUR, BATIDAS });
  const { W, H, div, img, poe, tranco, COR } = C;
  const R = M.mulberry32(0x7a7a);
  const CHAVE = new Set(['lugar', 'memórias', 'morrem', 'tempo', 'amor', 'pergunta', 'sentido']);
  // por verso: palavra vertical, lado, fundo e mídia
  const CFG = {
    15: { vert: 'lugar', lado: 'dir', fundo: 'video', video: 'vocal-a1' },
    16: { vert: 'Onde', lado: 'esq', fundo: 'papel', fotos: [['baixo-medio', 1560, 250, 0.55, 7], ['gremio-perto', 1700, 820, 0.95, -6]], mascara: 0b10 },
    17: { vert: 'amor', lado: 'dir', fundo: 'muro', paineis: ['guit-1', 'guit-2'] },
    18: { vert: null, fundo: 'video', video: 'vocal-a2' },
    19: { vert: null, fundo: 'muro', flashes: true },
  };
  const VIDEOS = { 'vocal-a1': 102, 'vocal-a2': 114, 'guit-1': 96, 'guit-2': 97, 'vocal-b': 48, 'guit-3': 48 };
  const FLASH = [['selfie-medio', 'foto'], ['jaqueta-perto', 'foto'], ['vocal-b', 'video'], ['gremio-medio', 'foto'], ['baixo-perto', 'foto'], ['guitarrista', 'foto']];
  const MX = 50, MY = 70, AW = W - 2 * MX, AH = H - 2 * MY;
  const rasgo = (r, amp = 6) => { const p = [], n = 12; for (let i = 0; i <= n; i++) p.push(`${(i / n * 100).toFixed(1)}% ${(r() * amp).toFixed(1)}%`); p.push(`${(100 - r() * 2).toFixed(1)}% 50%`); for (let i = n; i >= 0; i--) p.push(`${(i / n * 100).toFixed(1)}% ${(100 - r() * amp).toFixed(1)}%`); p.push(`${(r() * 2).toFixed(1)}% 50%`); return `polygon(${p.join(',')})`; };
  let cam, muro, papel, telao, telaoImg, titulo, versos = [], raios = [], TFIM;
  const quadro = (nome, tl) => { const n = VIDEOS[nome], i = Math.max(1, Math.min(n, 1 + Math.floor(tl * 30))); return `footage/q/${nome}/f${String(i).padStart(3, '0')}.jpg`; };
  const troca = (el, src, espera) => { if (!el.src.endsWith(src)) { el.src = src; espera.push(el.decode().catch(() => {})); } };

  window.MODELO = {
    async montar(cena) {
      const letra = await fetch('letra.json').then((r) => r.json());
      const lin = letra.filter((l) => CFG[l.linha]).map((l) => ({ ...l, palavras: l.palavras.map((p) => ({ ...p, t: s(p.t) })) }));
      TFIM = s(73.55);
      cam = div(cena, { inset: '0px', transformOrigin: '50% 50%' });
      muro = div(cam, { left: '-70px', top: '-50px', width: (W + 140) + 'px', height: (H + 100) + 'px', background: 'url(tex/muro.jpg) center / cover' });
      img(muro, 'rec/caveira.png', { left: '420px', top: '0px', width: '1150px', mixBlendMode: 'screen', opacity: '.1' });
      papel = div(cam, { left: '-40px', top: '-30px', width: (W + 80) + 'px', height: (H + 60) + 'px', background: 'url(tex/papel-creme.jpg) center / cover', clipPath: rasgo(R, 2) });
      img(papel, 'tex/reticula-disco.png', { left: '900px', top: '200px', width: '1300px', opacity: '.35', filter: 'invert(1)', mixBlendMode: 'multiply' });
      // telão: vídeo em tela cheia tratado como xerox escuro (a letra tem que ler por cima)
      telao = div(cam, { left: '-40px', top: '-30px', width: (W + 80) + 'px', height: (H + 60) + 'px', overflow: 'hidden', background: '#0b0a09' });
      telaoImg = img(telao, 'footage/q/vocal-a1/f001.jpg', { left: '0px', top: '0px', width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.45) brightness(.95)' });
      div(telao, { inset: '0px', background: '#a8501c', mixBlendMode: 'multiply', opacity: '.45' });
      div(telao, { inset: '0px', backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.55) 38%, transparent 42%)', backgroundSize: '9px 9px', mixBlendMode: 'multiply' });
      for (const l of lin) {
        const cfg = CFG[l.linha], extras = div(cam, { left: '0px', top: '0px' });
        const g = div(cam, { left: '0px', top: '0px' });
        // fotos coladas e painéis de vídeo (atrás do bloco)
        const pecas = [];
        (cfg.fotos || []).forEach(([n, x, y, sc, r]) => {
          const m = div(extras, { left: '0px', top: '0px', padding: '16px 16px 46px', background: '#efe5cf', clipPath: rasgo(R), filter: 'drop-shadow(10px 12px 0 rgba(0,0,0,.4))' });
          const im = img(m, `footage/fotos/${n}.jpg`, { position: 'relative', width: '420px', filter: 'contrast(1.15) saturate(.85)' });
          pecas.push({ m, x, y, sc, r, im });
        });
        (cfg.paineis || []).forEach((n, k) => {
          const m = div(extras, { left: '0px', top: '0px', padding: '14px', background: '#efe5cf', clipPath: rasgo(R), filter: 'drop-shadow(10px 12px 0 rgba(0,0,0,.45))' });
          const im = img(m, quadro(n, 0), { position: 'relative', width: '430px', height: '765px', objectFit: 'cover', filter: 'contrast(1.2) saturate(.8)' });
          pecas.push({ m, x: k ? 1690 : 230, y: 540, sc: 1, r: k ? 5 : -6, im, video: n });
        });
        let flashes = [];
        if (cfg.flashes) flashes = FLASH.map(([n, tipo], k) => {
          const m = div(extras, { left: '0px', top: '0px', padding: '14px 14px 40px', background: '#efe5cf', clipPath: rasgo(R), filter: 'drop-shadow(10px 12px 0 rgba(0,0,0,.45))' });
          const im = img(m, tipo === 'foto' ? `footage/${n === 'guitarrista' ? '' : 'fotos/'}${n}.jpg` : quadro(n, 0), { position: 'relative', width: '520px', height: '640px', objectFit: 'cover', filter: 'contrast(1.2) saturate(.85)' });
          return { m, im, n, tipo, x: [480, 1440, 700, 1250, 520, 1400][k], y: [560, 520, 600, 560, 540, 600][k], r: [-7, 6, -4, 8, -9, 5][k] };
        });
        // medidas a 100 px (fonte simples) para montar o bloco
        const pals = l.palavras.map((p, k) => {
          const chave = CHAVE.has(p.w.toLowerCase());
          const fonte = R() < 0.28 && !chave ? 'Permanent Marker' : 'Sedgwick';
          const txt = p.w.toUpperCase();
          const m = div(document.body, { left: '0px', top: '0px', fontFamily: fonte, fontSize: '100px', lineHeight: '1', whiteSpace: 'nowrap', visibility: 'hidden' }, txt);
          const q = { p, txt, chave, fonte, w100: m.offsetWidth, h100: m.offsetHeight * 1.02 }; m.remove(); return q;
        });
        let colW = 0, vert = null;
        if (cfg.vert) {
          vert = pals.find((q) => q.p.w === cfg.vert);
          const sz = Math.min(400, (AH * 0.92 / vert.w100) * 100);
          vert.size = sz; colW = vert.h100 * sz / 100 * 1.02; vert.rot = cfg.lado === 'esq' ? -90 : 90;
          vert.cx = cfg.lado === 'esq' ? MX + colW / 2 : W - MX - colW / 2; vert.cy = H / 2;
        }
        const resto = pals.filter((q) => q !== vert);
        const largura = AW - (colW ? colW + 10 : 0), x0 = vert && cfg.lado === 'esq' ? MX + colW + 10 : MX;
        let melhor = null; const n = resto.length;
        for (let mask = 0; mask < 1 << (n - 1); mask++) {
          if (cfg.mascara != null && mask !== cfg.mascara) continue;
          const linhas = []; let cur = [resto[0]];
          for (let i = 1; i < n; i++) { if (mask & (1 << (i - 1))) { linhas.push(cur); cur = []; } cur.push(resto[i]); }
          linhas.push(cur);
          if (linhas.length > 4 || linhas.some((ln) => ln.reduce((a, q) => a + q.txt.length, 0) < 5)) continue;
          const info = linhas.map((ln) => { const ws = ln.reduce((a, q) => a + q.w100, 0) + (ln.length - 1) * 16; const sz = Math.min(400, largura / ws * 100); return { ln, sz, h: Math.max(...ln.map((q) => q.h100)) * sz / 100 }; });
          const tot = info.reduce((a, b) => a + b.h, 0);
          const score = (tot <= AH ? AH - tot : (tot - AH) * 3) + info.reduce((a, i) => a + Math.max(0, 150 - i.sz) * 12, 0);
          if (!melhor || score < melhor.score) melhor = { info, tot, score };
        }
        const esc = Math.min(1, AH / melhor.tot), estica = Math.min(1.3, Math.max(1, AH / melhor.tot));
        let y = MY + (AH - melhor.tot * esc * estica) / 2;
        melhor.info.forEach((li) => {
          const sz = li.sz * esc, h = li.h * esc * estica, ws = li.ln.reduce((a, q) => a + q.w100 * sz / 100, 0);
          const sobra = Math.max(sz * 0.1, (largura - ws) / Math.max(1, li.ln.length - 1));
          let x = x0 + (li.ln.length === 1 ? (largura - ws) / 2 : 0);
          li.ln.forEach((q) => { q.size = sz; q.sy0 = estica; const w = q.w100 * sz / 100; q.cx = x + w / 2; q.cy = y + h / 2; x += w + sobra; });
          y += h;
        });
        // palavras no estilo do título
        pals.forEach((q, k) => {
          q.lt = LT.palavra(g, q.txt, { fonte: q.fonte, tam: q.size, tipo: q.chave ? 'fogo' : 'creme', semente: l.linha * 31 + k, pingos: q.rot ? 0 : (q.chave ? 4 : 2) });
          q.w = q.lt.caixa.offsetWidth; q.h = q.lt.caixa.offsetHeight;
          q.r = (q.rot || 0) + (R() - 0.5) * 3; q.lado = q.cy < H / 2 ? -1 : 1;
        });
        versos.push({ l, cfg, g, extras, pals, pecas, flashes });
        pals.filter((q) => q.chave).forEach((q) => raios.push({ t: q.p.t }));
      }
      titulo = img(cam, 'rec/titulo-caveira.png', { left: '0px', top: '0px', width: '1150px', transformOrigin: '50% 60%' });
    },
    seek(t) {
      const espera = [];
      const tPal = versos.flatMap((v) => v.pals.map((q) => q.p.t));
      const tr = tranco(t, [...tPal, TFIM].filter((q) => q <= t && t - q < 0.9), 6);
      cam.style.transform = `translate(${(tr.x + M.wiggle(t, 0.7, 6, 3)).toFixed(1)}px, ${(tr.y + M.wiggle(t, 0.6, 5, 6)).toFixed(1)}px) rotate(${(tr.r + M.wiggle(t, 0.4, 0.4, 9)).toFixed(2)}deg) scale(${(1.02 + 0.012 * Math.sin(t * 1.1)).toFixed(4)})`;
      let vi = 0; versos.forEach((v, k) => { if (t >= v.l.palavras[0].t - 0.12) vi = k; });
      const V = versos[vi], t0 = V.l.palavras[0].t - 0.12, fundo = t >= TFIM ? 'muro' : V.cfg.fundo;
      papel.style.display = fundo === 'papel' ? '' : 'none';
      if (fundo === 'papel') { const p = M.spring(t - t0, 3.6, 0.62); papel.style.transform = `rotate(${M.lerp(4, -0.6, p).toFixed(2)}deg) scale(${M.lerp(1.25, 1, p).toFixed(4)})`; }
      telao.style.display = fundo === 'video' ? '' : 'none';
      if (fundo === 'video') { troca(telaoImg, quadro(V.cfg.video, t - t0), espera); telao.style.transform = `scale(${(1.06 + 0.03 * M.E.suave(M.prog(t, t0, t0 + 3))).toFixed(4)})`; }
      versos.forEach((v, k) => {
        const prox = versos[k + 1], tSai = prox ? prox.l.palavras[0].t - 0.3 : TFIM - 0.05;
        const on = t >= v.l.palavras[0].t - 0.2 && t < tSai + 0.4;
        v.g.style.display = v.extras.style.display = on ? '' : 'none';
        if (!on) return;
        const vt0 = v.l.palavras[0].t - 0.12;
        v.pecas.forEach((pc, j) => {
          const ta = vt0 + 0.05 + j * 0.18, p = M.spring(t - ta, 3.4, 0.6), sai = M.E.sai(M.prog(t, tSai, tSai + 0.3));
          pc.m.style.display = t >= ta ? '' : 'none';
          if (pc.video) troca(pc.im, quadro(pc.video, t - vt0), espera);
          poe(pc.m, pc.x, pc.y + sai * (j % 2 ? 1200 : -1200), pc.sc * M.lerp(1.4, 1, p), pc.r + (1 - p) * 12);
        });
        v.flashes.forEach((f, j) => {                     // um integrante por batida até o título
          const bs = BATIDAS.filter((b) => b >= vt0 && b < TFIM), b = bs[j], b2 = bs[j + 1] ?? TFIM;
          const vis = b != null && t >= b && t < b2;
          f.m.style.display = vis ? '' : 'none';
          if (!vis) return;
          if (f.tipo === 'video') troca(f.im, quadro(f.n, t - b), espera);
          poe(f.m, f.x, f.y, M.lerp(1.3, 1, M.spring(t - b, 4, 0.6)), f.r);
        });
        v.pals.forEach((q, k2) => {
          const a = q.p.t, el = q.lt.caixa;
          if (t < a - 0.14) { el.style.display = 'none'; return; }
          el.style.display = '';
          let dy = 0, sx = 1, sy = 1, rr = 0, sc = 1;
          if (q.chave) {
            if (t < a) { const p = M.prog(t, a - 0.14, a); dy = -(1 - p * p) * 380; sx = 0.9; sy = 1.18; }
            else { const kk = M.kick(t, a, 0.22, 4.5, 0.4); sx = 1 + kk; sy = 1 - kk; }
          } else {
            if (t < a) { el.style.display = 'none'; return; }
            const p = M.spring(t - a, 3.8, 0.56); sc = M.lerp(1.42, 1, p); rr = (1 - p) * (k2 % 2 ? 12 : -12);
          }
          LT.escorre(q.lt, t, a + 0.1, 1.2);
          const ts = tSai + k2 * 0.018, e = M.prog(t, ts, ts + 0.3) ** 2;
          dy += q.lado * e * 1300; rr += e * (k2 % 2 ? 22 : -18);
          el.style.transform = `translate(${(q.cx - q.w / 2).toFixed(1)}px, ${(q.cy - q.h / 2 + dy).toFixed(1)}px) rotate(${(q.r + rr).toFixed(2)}deg) scale(${(sc * sx).toFixed(4)}, ${(sc * sy * (q.sy0 || 1)).toFixed(4)})`;
        });
      });
      titulo.style.display = t >= TFIM - 0.12 ? '' : 'none';
      if (t >= TFIM - 0.12) {
        let y = 600, sq = 0;
        if (t < TFIM) { const p = M.prog(t, TFIM - 0.12, TFIM); y = M.lerp(-500, 600, p * p); } else sq = M.kick(t, TFIM, 0.16, 4.2, 0.4);
        titulo.style.transform = `translate(${960 - 575}px, ${(y - 520).toFixed(1)}px) rotate(-2deg) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
      }
      return espera.length ? Promise.all(espera) : undefined;
    },
  };
})();
