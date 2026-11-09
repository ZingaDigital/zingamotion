// Motor do lyric video (Deckss, "Vai Fazer Sentido"). Gramática da referência (blink-182, More Than You Know):
// vídeo da banda em P&B de alto contraste, papel creme com buraco rasgado que revela o vídeo, palavras gigantes que
// estouram a borda, cortes secos na batida. Lettering pré-renderizado no estilo da arte do título (letras/*.png).
// Tudo é função de t. Tempo da faixa T = t + C.OFF.
(() => {
  const { W, H, div, img, tranco } = C;
  const FPS = 30;
  let ROSTOS, MANUAL, LETRAS, CHAVE;
  const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619); return (h >>> 0).toString(36); };
  const rnd = (a, b = 0) => M.mulberry32(a * 9973 + b * 131 + 17)();
  const troca = (el, src, espera) => { if (!el.src.endsWith(src)) { el.src = src; espera.push(el.decode().catch(() => {})); } };

  // ---------- vídeo P&B com o rosto enquadrado ----------
  // uso: { clip, ini (quadro inicial), rosto: altura do rosto na tela (px), cx, cy (onde o rosto fica), deriva }
  const Video = (pai, css = {}) => {
    const caixa = div(pai, { left: '0px', top: '0px', width: W + 'px', height: H + 'px', overflow: 'hidden', background: '#0b0a09', ...css });
    const im = img(caixa, 'footage/pb/vocal-0342/f0001.jpg', { left: '0px', top: '0px', transformOrigin: '0 0' });
    div(caixa, { inset: '0px', background: '#f3e6cc', mixBlendMode: 'multiply', opacity: '.16' });
    return { caixa, im };
  };
  const poeVideo = (v, uso, tl, espera) => {
    const R0 = ROSTOS[uso.clip], man = MANUAL[uso.clip] || [R0.w / 2, R0.h * 0.3, Math.min(R0.w, R0.h) * 0.3];
    const n = R0.n, i = Math.max(1, Math.min(n, (uso.ini || 1) + Math.floor(tl * FPS)));
    troca(v.im, `footage/pb/${uso.clip}/f${String(i).padStart(4, '0')}.jpg`, espera);
    const [fx, fy, fs] = man;
    const alvo = uso.rosto || 420; let sc = (alvo / fs) * (1 + (uso.deriva ?? 0.04) * tl);
    const cx = uso.cx ?? W / 2, cy = uso.cy ?? H * 0.45;
    // não deixa aparecer borda: limita a translação
    let x = cx - fx * sc, y = cy - fy * sc;
    // caixa visível (o vídeo tem que cobrir ela inteira): uso.box = [x0, y0, x1, y1]; padrão a tela toda
    const [bx0, by0, bx1, by1] = uso.box || [0, 0, uso.wBox ?? W, H];
    const minSc = Math.max((bx1 - bx0) / R0.w, (by1 - by0) / R0.h);
    if (sc < minSc) { sc = minSc; x = cx - fx * sc; y = cy - fy * sc; }
    x = Math.min(bx0, Math.max(bx1 - R0.w * sc, x)); y = Math.min(by0, Math.max(by1 - R0.h * sc, y));
    v.im.style.width = R0.w + 'px'; v.im.style.height = R0.h + 'px';
    v.im.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(4)})`;
  };

  // ---------- papel creme com buraco rasgado (clip-path evenodd) ----------
  const furo = (cx, cy, rx, ry, p, sem) => {
    const N = 34, pts = [];
    for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2, j = 0.82 + 0.3 * rnd(sem, k) + (k % 2 ? 0.08 : -0.04);
      pts.push(`${(cx + Math.cos(a) * rx * p * j).toFixed(1)} ${(cy + Math.sin(a) * ry * p * j).toFixed(1)}`);
    }
    return `M-50 -50 H${W + 50} V${H + 50} H-50 Z M${pts.join(' L')} Z`;
  };

  // ---------- palavra pré-renderizada + pingos ----------
  const regra = (w) => {
    const txt = w.toUpperCase().replace(/[.,!?]/g, ''), chave = CHAVE.has(w.toLowerCase());
    const fonte = !chave && parseInt(hash(txt), 36) % 100 < 28 ? 'Permanent Marker' : 'Sedgwick';
    return { txt, chave, fonte, tipo: chave ? 'fogo' : 'creme' };
  };
  const pontosDeBase = (txt, fonte, tam) => {
    const c = document.createElement('canvas'), ctx = c.getContext('2d'); ctx.font = `${tam}px "${fonte}"`;
    const m = ctx.measureText(txt), A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent, w = Math.ceil(m.width) + 4, h = Math.ceil(A + D + tam * 0.3);
    c.width = w; c.height = h; ctx.font = `${tam}px "${fonte}"`; ctx.fillText(txt, 0, A);
    const d = ctx.getImageData(0, 0, w, h).data, cols = [];
    for (let x = 1; x < w - 1; x += 2) { let yb = -1; for (let y = h - 1; y >= 0; y--) if (d[(y * w + x) * 4 + 3] > 180) { yb = y; break; } if (yb >= A - tam * 0.05) cols.push({ fx: x / m.width, y: yb - tam * 0.06 + (tam - (A + D)) / 2 }); }
    return cols;
  };
  // cria a palavra no tamanho de fonte `tam`. Retorna { el, w, h, gw, gh } (gw/gh = caixa do texto, para layout)
  const Palavra = (pai, w, tam, sem, nPingos = 2) => {
    const r = regra(w), id = hash(`${r.txt}|${r.fonte}|${r.tipo}`), I = LETRAS[id];
    if (!I) throw new Error('falta letra pré-renderizada: ' + r.txt);
    const k = tam / I.tam;
    const el = div(pai, { left: '0px', top: '0px', width: I.W * k + 'px', height: I.H * k + 'px', transformOrigin: `${(I.ox + I.padX + I.tw / 2) * k}px ${(I.oy + I.padY + I.tam / 2) * k}px` });
    // pingos atrás da letra
    const R = M.mulberry32(sem * 7 + 3), cols = nPingos ? pontosDeBase(r.txt, r.fonte, I.tam) : [], pingos = [];
    for (let i = 0; i < nPingos && cols.length; i++) {
      const pc = cols[Math.floor(R() * cols.length)], larg = tam * (0.05 + R() * 0.035), len = tam * (0.15 + R() * 0.4);
      const p = div(el, { left: ((I.ox + I.padX + pc.fx * I.tw) * k - larg / 2) + 'px', top: ((I.oy + I.padY + pc.y) * k) + 'px', width: larg + 'px', height: '0px',
        background: r.tipo === 'fogo' ? 'linear-gradient(180deg, #e8261c, #ff7a1a 55%, #ffc21a)' : '#f3e6cc', borderRadius: `${larg / 2}px ${larg / 2}px ${larg}px ${larg}px`,
        boxShadow: `0 0 0 ${tam * 0.07}px #0b0a09, 0 0 0 ${tam * 0.085}px ${r.tipo === 'fogo' ? '#ffd23a' : '#f3e6cc'}` });
      pingos.push({ p, len, atraso: R() * 0.3 });
    }
    img(el, `letras/${id}.png`, { left: '0px', top: '0px', width: I.W * k + 'px', height: I.H * k + 'px' });
    return { el, r, I, k, pingos, gw: I.tw * k, gh: I.tam * k * 0.86, cx0: (I.ox + I.padX + I.tw / 2) * k, cy0: (I.oy + I.padY + I.tam / 2) * k };
  };
  const escorre = (P, t, t0) => P.pingos.forEach((q) => { const p = M.E.entra(M.prog(t, t0 + q.atraso, t0 + q.atraso + 1.3)); q.p.style.height = (q.len * p).toFixed(1) + 'px'; });
  const poePal = (P, cx, cy, r = 0, sx = 1, sy = 1) => { P.el.style.transform = `translate(${(cx - P.cx0).toFixed(1)}px, ${(cy - P.cy0).toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`; };

  // ---------- layout em bloco que fecha a tela (linhas justificadas + coluna vertical opcional) ----------
  const medida = (w) => { const r = regra(w), I = LETRAS[hash(`${r.txt}|${r.fonte}|${r.tipo}`)]; return { w100: I.tw / I.tam * 100, h100: 86 }; };
  const bloco = (pals, { vert, lado, mascara, MX = 60, MY = 80, Y0, Y1, maxSz = 400 } = {}) => {
    const top = Y0 ?? MY, AW = W - 2 * MX, AH = (Y1 ?? H - MY) - top, ms = pals.map((p) => ({ p, ...medida(p.w) }));
    let colW = 0, v = null;
    if (vert) { v = ms.find((q) => q.p.w === vert); const sz = Math.min(maxSz, (AH * 0.95 / v.w100) * 100); v.size = sz; colW = sz * 0.95; v.rot = lado === 'esq' ? -90 : 90; v.cx = lado === 'esq' ? MX + colW / 2 : W - MX - colW / 2; v.cy = top + AH / 2; }
    const resto = ms.filter((q) => q !== v), larg = AW - (colW ? colW + 20 : 0), x0 = v && lado === 'esq' ? MX + colW + 20 : MX, n = resto.length;
    let melhor = null;
    for (let mask = 0; mask < 1 << (n - 1); mask++) {
      if (mascara != null && mask !== mascara) continue;
      const ls = []; let cur = [resto[0]];
      for (let i = 1; i < n; i++) { if (mask & (1 << (i - 1))) { ls.push(cur); cur = []; } cur.push(resto[i]); }
      ls.push(cur);
      if (ls.length > 4 || ls.some((l) => l.reduce((a, q) => a + q.p.w.length, 0) < 5 && n > 1)) continue;
      const info = ls.map((l) => { const ws = l.reduce((a, q) => a + q.w100, 0) + (l.length - 1) * 14; const sz = Math.min(maxSz, larg / ws * 100); return { l, sz, h: sz * 0.92 }; });
      const tot = info.reduce((a, b) => a + b.h, 0);
      const score = (tot <= AH ? AH - tot : (tot - AH) * 3) + info.reduce((a, i) => a + Math.max(0, 150 - i.sz) * 12, 0);
      if (!melhor || score < melhor.score) melhor = { info, tot, score };
    }
    const esc = Math.min(1, AH / melhor.tot), est = Math.min(1.25, Math.max(1, AH / melhor.tot));
    let y = top + (AH - melhor.tot * esc * est) / 2;
    melhor.info.forEach((li) => {
      const sz = li.sz * esc, h = li.h * esc * est, ws = li.l.reduce((a, q) => a + q.w100 * sz / 100, 0);
      const sobra = Math.min(sz * 0.4, Math.max(sz * 0.12, (larg - ws) / Math.max(1, li.l.length - 1)));
      const usado = ws + sobra * (li.l.length - 1);
      let x = x0 + (larg - usado) / 2;
      li.l.forEach((q) => { q.size = sz; q.est = est; const w = q.w100 * sz / 100; q.cx = x + w / 2; q.cy = y + h / 2; x += w + sobra; });
      y += h;
    });
    return ms;
  };

  // ---------- camada grunge: sujeira, riscos, tremor de película ----------
  const Grunge = (pai) => {
    const suj = img(pai, 'tex/sujeira.png', { left: '0px', top: '0px', width: W * 1.3 + 'px', height: H * 1.3 + 'px', mixBlendMode: 'screen', opacity: '.55', zIndex: 40 });
    const riscos = [0, 1, 2].map(() => div(pai, { left: '0px', top: '0px', width: '2px', height: H + 'px', background: 'rgba(243,230,204,.35)', zIndex: 41 }));
    const mancha = div(pai, { inset: '0px', zIndex: 39, background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.45) 100%)' });
    return { suj, riscos, mancha };
  };
  const grunge = (g, t) => {
    const n = Math.floor(t * 12), r = (k) => rnd(n, k);
    g.suj.style.transform = `translate(${(-r(1) * W * 0.3).toFixed(0)}px, ${(-r(2) * H * 0.3).toFixed(0)}px) rotate(${(r(3) < 0.5 ? 0 : 180)}deg)`;
    g.riscos.forEach((el, k) => { const on = r(10 + k) < 0.35; el.style.display = on ? '' : 'none'; if (on) el.style.transform = `translateX(${(r(20 + k) * W).toFixed(0)}px)`; el.style.opacity = (0.3 + r(30 + k) * 0.5).toFixed(2); });
  };
  const tremor = (t) => { const n = Math.floor(t * 12); return { x: (rnd(n, 50) - 0.5) * 3, y: (rnd(n, 51) - 0.5) * 3 }; };

  window.ML = {
    async carregar() {
      [ROSTOS, MANUAL, LETRAS] = await Promise.all(['footage/rostos.json', 'footage/rostos-manual.json', 'letras/indice.json'].map((u) => fetch(u).then((r) => r.json())));
      CHAVE = new Set(await fetch('chave.json').then((r) => r.json()));
      await Promise.all(['Sedgwick', 'Permanent Marker'].map((f) => document.fonts.load(`100px "${f}"`, 'AÇÃÉ')));
    },
    Video, poeVideo, furo, Palavra, escorre, poePal, bloco, regra, medida, Grunge, grunge, tremor, rnd, troca,
  };
})();
