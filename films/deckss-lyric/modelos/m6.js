// Modelo 6 (aprovação, 15 s do refrão): mistura do 5 (pingo, queda e esmaga, raio) com o papel rasgado do 1 e o
// muro com spray do 2. Cada verso vira um bloco de lettering que ocupa a tela inteira: linhas justificadas, uma palavra
// na vertical, quatro fontes alternando. Fundo alterna muro / lambe-lambe de papel a cada verso (corte seco).
// Trecho da faixa: 58,95 a 74,40 s.
(() => {
  const OFF = 58.95, DUR = 15.45, BT = 60 / 163;
  const s = (x) => +(x - OFF).toFixed(3);
  const V = (pares, opt) => ({ palavras: pares.map(([w, t]) => ({ w, t: s(t) })), ...opt });
  // vert: índice da palavra na vertical; lado: 'esq' | 'dir'; fundo: 'muro' | 'papel'
  const LETRA = [
    V([['Ainda', 59.24], ['existe', 59.75], ['um', 60.30], ['lugar', 60.47]], { vert: 3, lado: 'dir', fundo: 'muro' }),
    V([['Onde', 62.18], ['as', 62.33], ['memórias', 62.58], ['não', 63.36], ['morrem', 63.78]], { vert: 0, lado: 'esq', fundo: 'papel', mascara: 0b10 }),
    V([['Onde', 65.30], ['o', 65.44], ['tempo', 65.85], ['não', 66.21], ['vence', 66.41], ['o', 66.77], ['amor', 66.91]], { vert: 6, lado: 'dir', fundo: 'muro' }),
    V([['E', 68.03], ['um', 68.21], ['dia', 68.32], ['tudo', 68.80], ['que', 69.13], ['hoje', 69.31], ['é', 69.65], ['pergunta', 69.85]], { vert: -1, fundo: 'papel' }),
    V([['Vai', 71.23], ['fazer', 71.49], ['sentido', 72.08]], { vert: -1, fundo: 'muro', final: true }),
  ];
  const BATIDAS = []; for (let k = Math.ceil(OFF / BT); k * BT < OFF + DUR; k++) BATIDAS.push(s(k * BT));
  Object.assign(C, { OFF, DUR, LETRA, BATIDAS });
  const TFIM = s(73.25);                                   // nota longa do "sentido": entra a arte do título

  const { W, H, div, img, poe, pincel, tranco, COR, GRAD } = C;
  const R = M.mulberry32(0x6d6d);
  const FONTES = ['Wet Paint', 'Permanent Marker', 'Sedgwick', 'Knewave'];
  const CHAVE = new Set(['lugar', 'memórias', 'morrem', 'tempo', 'amor', 'pergunta', 'sentido']);
  const RAIO = 'M60 0 L0 150 L48 150 L10 300 L120 110 L66 110 L110 0 Z';
  const MX = 54, MY = 46, AW = W - 2 * MX, AH = H - 2 * MY;
  const rasgo = (r, amp = 9) => { const p = [], n = 14; for (let i = 0; i <= n; i++) p.push(`${(i / n * 100).toFixed(1)}% ${(r() * amp).toFixed(1)}%`); p.push(`${(99 + r()).toFixed(1)}% 50%`); for (let i = n; i >= 0; i--) p.push(`${(i / n * 100).toFixed(1)}% ${(100 - r() * amp).toFixed(1)}%`); p.push(`${r().toFixed(1)}% 50%`); return `polygon(${p.join(',')})`; };
  let cam, muro, papel, titulo, caveira, fotos = [], blocos = [], raios = [];

  // tratamento de cada palavra conforme o fundo: tira de papel, spray, pingo (degradê)
  const estilo = (el, trat, fundo, chave) => {
    const naoMuro = fundo === 'papel';
    if (trat === 'tira') {
      const bg = chave ? COR.amarelo : naoMuro ? COR.preto : (R() < 0.5 ? '#efe5cf' : COR.preto);
      Object.assign(el.style, { background: bg, color: bg === COR.preto ? COR.creme : COR.preto, padding: '0.1em 0.16em 0.02em', clipPath: rasgo(R) });
    } else if (trat === 'pingo') {
      Object.assign(el.style, { color: 'transparent', backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', padding: '0 0.05em' });
    } else {
      Object.assign(el.style, { color: naoMuro ? (chave ? COR.vermelho : COR.preto) : (chave ? COR.amarelo : COR.creme), padding: '0 0.05em' });
    }
  };

  window.MODELO = {
    async montar(cena) {
      cam = div(cena, { inset: '0px', transformOrigin: '50% 50%' });
      muro = div(cam, { left: '-70px', top: '-50px', width: (W + 140) + 'px', height: (H + 100) + 'px', background: 'url(tex/muro.jpg) center / cover' });
      img(muro, 'tex/reticula-disco.png', { left: '380px', top: '-120px', width: '1300px', opacity: '.16' });
      caveira = img(muro, 'rec/caveira.png', { left: '420px', top: '0px', width: '1150px', mixBlendMode: 'screen', opacity: '.12' });
      papel = div(cam, { left: '-40px', top: '-30px', width: (W + 80) + 'px', height: (H + 60) + 'px', background: 'url(tex/papel-creme.jpg) center / cover', clipPath: rasgo(R, 3) });
      img(papel, 'tex/reticula-disco.png', { left: '900px', top: '200px', width: '1300px', opacity: '.35', filter: 'invert(1)', mixBlendMode: 'multiply' });
      // fotos xerox nas bordas (aparecem nas frestas do bloco)
      [['p-garoto', 1790, 150, 0.9, 9], ['p-criancas', 120, 930, 0.7, -8], ['p-bola', 1800, 950, 1.0, -6], ['p-polaroid', 140, 120, 0.85, 7]].forEach(([n, x, y, sc, r], i) => {
        const f = img(cam, `tex/xerox/${n}.png`, { left: '0px', top: '0px', transformOrigin: '50% 50%', filter: 'drop-shadow(8px 10px 0 rgba(0,0,0,.4))' });
        fotos.push({ f, x, y, sc, r, i });
      });
      // blocos de lettering
      LETRA.forEach((l, li) => {
        const g = div(cam, { left: '0px', top: '0px' });
        const tratamentos = l.fundo === 'papel' ? ['tira', 'tinta', 'tira', 'tinta'] : ['pingo', 'tira', 'tinta', 'pingo'];
        const pals = l.palavras.map((p, k) => {
          const chave = CHAVE.has(p.w.toLowerCase());
          const fonte = l.final ? ['Sedgwick', 'Permanent Marker', 'Wet Paint'][k] : FONTES[(k + li * 3 + (R() < 0.35 ? 1 : 0)) % 4];
          const trat = l.final ? ['tinta', 'tira', 'pingo'][k] : chave ? (l.fundo === 'papel' ? 'tira' : 'pingo') : tratamentos[(k + li) % 4];
          const el = div(g, { left: '0px', top: '0px', fontFamily: fonte, fontSize: '100px', lineHeight: '0.92', whiteSpace: 'nowrap', transformOrigin: '50% 50%',
            filter: `drop-shadow(5px 6px 0 ${l.fundo === 'papel' ? 'rgba(11,10,9,.35)' : COR.preto})` }, p.w.toUpperCase());
          estilo(el, trat, l.fundo, chave);
          return { el, p, chave, trat, w100: 0, h100: 0 };
        });

        pals.forEach((q) => { q.w100 = q.el.offsetWidth; q.h100 = q.el.offsetHeight; });
        // coluna vertical
        let colW = 0, vert = null;
        if (l.vert >= 0) {
          vert = pals[l.vert];
          const sz = Math.min(430, (AH / vert.w100) * 100);
          vert.size = sz; colW = vert.h100 * sz / 100 * 0.9;
          vert.vertical = l.lado === 'esq' ? -90 : 90;
          vert.cx = l.lado === 'esq' ? MX + colW / 2 : W - MX - colW / 2; vert.cy = H / 2;
        }
        const resto = pals.filter((q) => q !== vert);
        const largura = AW - (colW ? colW + 22 : 0), x0 = vert && l.lado === 'esq' ? MX + colW + 22 : MX;
        // melhor divisão em linhas justificadas (ordem mantida) com altura mais perto da área
        let melhor = null;
        const n = resto.length;
        for (let mask = 0; mask < 1 << (n - 1); mask++) {
          if (l.mascara != null && mask !== l.mascara) continue;
          const linhas = []; let cur = [resto[0]];
          for (let i = 1; i < n; i++) { if (mask & (1 << (i - 1))) { linhas.push(cur); cur = []; } cur.push(resto[i]); }
          linhas.push(cur);
          if (linhas.length > 4 || linhas.some((ln) => ln.reduce((a, q) => a + q.p.w.length, 0) < 5)) continue;
          const info = linhas.map((ln) => { const wsum = ln.reduce((a, q) => a + q.w100, 0) + (ln.length - 1) * 10; const sz = Math.min(440, largura / wsum * 100); return { ln, sz, h: Math.max(...ln.map((q) => q.h100)) * sz / 100 * 0.86 }; });
          const tot = info.reduce((a, b) => a + b.h, 0);
          const nota = tot <= AH ? AH - tot : (tot - AH) * 3;
          const varia = Math.max(...info.map((i) => i.sz)) / Math.min(...info.map((i) => i.sz));
          const score = nota + (varia < 1.4 ? 120 : 0) + info.reduce((a, i) => a + Math.max(0, 140 - i.sz) * 12, 0);                   // tamanhos variados são mais interessantes
          if (!melhor || score < melhor.score) melhor = { info, tot, score };
        }
        const esc = Math.min(1, AH / melhor.tot), estica = Math.min(1.7, Math.max(1, AH / melhor.tot));
        let y = MY + (AH - melhor.tot * esc * estica) / 2;
        melhor.info.forEach((li2) => {
          const sz = li2.sz * esc, h = li2.h * esc * estica;
          const wsum = li2.ln.reduce((a, q) => a + q.w100 * sz / 100, 0);
          const sobra = (largura - wsum) / Math.max(1, li2.ln.length - 1);
          let x = x0 + (li2.ln.length === 1 ? (largura - wsum) / 2 : 0);
          li2.ln.forEach((q) => { q.size = sz; q.sy0 = estica; const w = q.w100 * sz / 100; q.cx = x + w / 2; q.cy = y + h / 2; x += w + sobra; });
          y += h;
        });
        pals.forEach((q) => {
          q.el.style.fontSize = q.size.toFixed(1) + 'px';
          q.w = q.el.offsetWidth; q.h = q.el.offsetHeight;
          q.r = (q.vertical || 0) + (R() - 0.5) * 3.5;
          q.lado = q.cy < H / 2 ? -1 : 1;
        });
        blocos.push({ g, pals, l, li });
        pals.filter((q) => q.chave).forEach((q) => {
          const r = C.svg(cam, 120, 300, `<path d="${RAIO}" fill="${COR.amarelo}" stroke="${COR.preto}" stroke-width="8" stroke-linejoin="round"/>`, { left: '0px', top: '0px', zIndex: 20 });
          raios.push({ r, t: q.p.t, x: 200 + R() * 1400, rot: (R() - 0.5) * 50 });
        });
      });
      titulo = img(cam, 'rec/titulo-caveira.png', { left: '0px', top: '0px', width: '1150px', transformOrigin: '50% 60%', zIndex: 30 });
    },
    seek(t) {
      const tPal = LETRA.flatMap((l) => l.palavras.map((p) => p.t));
      const tr = tranco(t, [...tPal, TFIM].filter((q) => q <= t && t - q < 0.9), 7);
      const z = 1.02 + 0.015 * Math.sin(t * 1.1);
      cam.style.transform = `translate(${(tr.x + M.wiggle(t, 0.7, 6, 3)).toFixed(1)}px, ${(tr.y + M.wiggle(t, 0.6, 5, 6)).toFixed(1)}px) rotate(${(tr.r + M.wiggle(t, 0.4, 0.5, 9)).toFixed(2)}deg) scale(${z.toFixed(4)})`;
      // fundo: verso atual define muro ou lambe-lambe (o papel é colado com tapa)
      let li = 0; LETRA.forEach((l, k) => { if (t >= l.palavras[0].t - 0.12) li = k; });
      const L = LETRA[li], t0 = L.palavras[0].t - 0.12;
      const ehPapel = L.fundo === 'papel' && t < TFIM;
      papel.style.display = ehPapel ? '' : 'none';
      if (ehPapel) { const p = M.spring(t - t0, 3.6, 0.62); papel.style.transform = `rotate(${M.lerp(4, -0.6, p).toFixed(2)}deg) scale(${M.lerp(1.25, 1, p).toFixed(4)})`; }
      poe(caveira, 995, 540, 1 + 0.04 * Math.sin(t * 2.76), 0); caveira.style.left = '0px';
      fotos.forEach((f) => { const vis = (f.i + li) % 2 === 0; f.f.style.display = vis ? '' : 'none'; if (vis) { const w = f.f.naturalWidth; poe(f.f, f.x, f.y, f.sc * (1 + M.kick(t, t0 + 0.12, 0.08, 4, 0.4)), f.r); f.f.style.left = '0px'; void w; } });
      raios.forEach((r) => { const on = t >= r.t && t < r.t + 0.1; r.r.style.display = on ? '' : 'none'; if (on) r.r.style.transform = `translate(${r.x}px, 120px) rotate(${r.rot}deg) scale(2.8)`; });
      blocos.forEach((b, bi) => {
        const prox = blocos[bi + 1], tSai = prox ? prox.l.palavras[0].t - 0.3 : TFIM - 0.05;
        const on = t >= b.l.palavras[0].t - 0.2 && t < tSai + 0.4;
        b.g.style.display = on ? '' : 'none';
        if (!on) return;
        b.pals.forEach((q, k) => {
          const a = q.p.t;
          if (t < a - 0.14) { q.el.style.display = 'none'; return; }
          q.el.style.display = '';
          let dx = 0, dy = 0, sx = 1, sy = 1, rr = 0, sc = 1;
          if (q.trat === 'pingo') {                         // despenca e esmaga
            if (t < a) { const p = M.prog(t, a - 0.14, a); dy = -(1 - p * p) * 420; sx = 0.88; sy = 1.2; }
            else { const k2 = M.kick(t, a, 0.26, 4.5, 0.38); sx = 1 + k2; sy = 1 - k2; }
            q.el.style.webkitMaskImage = q.el.style.maskImage = 'none';
          } else if (q.trat === 'tira') {                   // tapa de papel
            if (t < a) { q.el.style.display = 'none'; return; }
            const p = M.spring(t - a, 3.8, 0.55); sc = M.lerp(1.45, 1, p); rr = (1 - p) * (k % 2 ? 14 : -14);
          } else {                                          // pintado com spray
            if (t < a) { q.el.style.display = 'none'; return; }
            const nx = b.pals[k + 1], dur = Math.min(0.2, nx ? Math.max(0.08, nx.p.t - a) : 0.2);
            pincel(q.el, M.E.entra(M.prog(t, a, a + dur)), q.vertical ? 0 : 90, 22);
            sc = 1 + M.kick(t, a + dur, 0.05, 5, 0.45);
          }
          // saída: metade de cima sai pra cima, de baixo cai, em escadinha
          const ts = tSai + k * 0.018, ps = M.prog(t, ts, ts + 0.3), e = ps * ps;
          dy += q.lado * e * 1250; rr += e * (k % 2 ? 22 : -18);
          q.el.style.transform = `translate(${(q.cx + dx).toFixed(1)}px, ${(q.cy + dy).toFixed(1)}px) translate(-50%, -50%) rotate(${(q.r + rr).toFixed(2)}deg) scale(${(sc * sx).toFixed(4)}, ${(sc * sy * (q.sy0 || 1)).toFixed(4)})`;
        });
      });
      // final: arte original do título bate na nota longa
      titulo.style.display = t >= TFIM - 0.12 ? '' : 'none';
      if (t >= TFIM - 0.12) {
        let y = 600, sq = 0;
        if (t < TFIM) { const p = M.prog(t, TFIM - 0.12, TFIM); y = M.lerp(-500, 600, p * p); }
        else sq = M.kick(t, TFIM, 0.16, 4.2, 0.4);
        titulo.style.transform = `translate(${960 - 575}px, ${(y - 520).toFixed(1)}px) rotate(-2deg) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
      }
    },
  };
})();
