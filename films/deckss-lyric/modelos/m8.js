// Aprovação v3 (15 s do refrão, faixa 58,95 a 74,40) no motor-lyric.js: rostos da banda em P&B, papel rasgado,
// palavras gigantes estourando a tela, cortes por batida, camada grunge. Sem foto parada: só vídeo.
(() => {
  const OFF = 58.95, DUR = 15.45, BT = 60 / 163;
  const BATIDAS = []; for (let k = Math.ceil(OFF / BT); k * BT < OFF + DUR; k++) BATIDAS.push(+(k * BT - OFF).toFixed(3));
  Object.assign(C, { OFF, DUR, BATIDAS });
  const { W, H, div, img, tranco } = C;
  const TFIM = 73.55 - OFF;
  // cena por verso (índice da letra.json)
  const CENAS = {
    15: { modo: 'gigante', banda: [700, 1040], fundo: { tipo: 'video', uso: { clip: 'vocal-0342', ini: 3, rosto: 470, cx: 1060, cy: 330 } } },
    16: { modo: 'bloco', vert: 'Onde', lado: 'esq', mascara: 0b10, fundo: { tipo: 'furo', uso: { clip: 'bateria-1317', ini: 243, rosto: 330, cx: 1320, cy: 560 }, furo: [1320, 560, 560, 430] } },
    17: { modo: 'gigante', banda: [690, 1040], fundo: { tipo: 'video', uso: { clip: 'baixo-1252', ini: 150, rosto: 400, cx: 960, cy: 300 } } },
    18: { modo: 'bloco', Y0: 470, mascara: 72, Y1: 1040, fundo: { tipo: 'split', usos: [{ clip: 'guit2-1606', ini: 100, rosto: 300, cx: 480, cy: 280 }, { clip: 'guit-0049', ini: 230, rosto: 300, cx: 1440, cy: 280, wBox: 960 }] } },
    19: { modo: 'bloco', Y0: 430, Y1: 1040, mascara: 0b10, fundo: { tipo: 'cortes', usos: [{ clip: 'vocal-7498', ini: 60, rosto: 380, cy: 250 }, { clip: 'vocal-7522', ini: 4, rosto: 360, cy: 250 }, { clip: 'bateria-1317', ini: 300, rosto: 330, cy: 250 }, { clip: 'guit-0046', ini: 160, rosto: 360, cy: 250 }, { clip: 'baixo-1252', ini: 230, rosto: 360, cy: 250 }] } },
  };
  let cam, papel, papelVid, vA, vB, divisor, grg, titulo, cenas = [];

  window.MODELO = {
    async montar(cena) {
      await ML.carregar();
      const letra = await fetch('letra.json').then((r) => r.json());
      cam = div(cena, { inset: '0px', transformOrigin: '50% 50%' });
      vA = ML.Video(cam); vB = ML.Video(cam, { width: W / 2 + 'px' });
      vB.caixa.style.left = W / 2 + 'px';
      papel = div(cam, { left: '0px', top: '0px', width: W + 'px', height: H + 'px', background: 'url(tex/papel-creme.jpg) center / cover' });
      img(papel, 'tex/reticula-disco.png', { left: '-200px', top: '300px', width: '1100px', opacity: '.35', filter: 'invert(1)', mixBlendMode: 'multiply' });
      divisor = div(cam, { left: (W / 2 - 60) + 'px', top: '-40px', width: '120px', height: (H + 80) + 'px', background: 'url(tex/papel-creme.jpg) center / cover',
        clipPath: 'polygon(30% 0%, 70% 0%, 62% 8%, 78% 17%, 60% 26%, 74% 37%, 58% 49%, 76% 60%, 61% 71%, 79% 82%, 63% 91%, 72% 100%, 28% 100%, 40% 92%, 22% 81%, 38% 70%, 24% 59%, 41% 48%, 23% 36%, 39% 25%, 21% 15%, 37% 7%)' });
      const camadaLetras = div(cam, { inset: '0px' });
      for (const l of letra.filter((x) => CENAS[x.linha])) {
        const cfg = CENAS[l.linha], g = div(camadaLetras, { inset: '0px' });
        const pals = l.palavras.map((p) => ({ ...p, t: p.t - OFF }));
        let itens;
        if (cfg.modo === 'bloco') {
          const ms = ML.bloco(pals, { vert: cfg.vert, lado: cfg.lado, mascara: cfg.mascara, Y0: cfg.Y0, Y1: cfg.Y1 });
          itens = ms.map((q, k) => { const P = ML.Palavra(g, q.p.w, q.size, l.linha * 40 + k, q.rot ? 0 : (ML.regra(q.p.w).chave ? 4 : 2)); return { P, t: q.p.t, cx: q.cx, cy: q.cy, rot: q.rot || 0, est: q.est || 1, k, r: (ML.rnd(l.linha, k) - 0.5) * 3 }; });
        } else {
          itens = pals.map((p, k) => {
            const m = p.w.length <= 3 ? 0.42 : 1.08, sz0 = 100, P0 = ML.regra(p.w);
            const bh = cfg.banda ? cfg.banda[1] - cfg.banda[0] : H * 0.92, tamW = (W * m) / (ML.bloco([p])[0].w100 / 100), tam = Math.min(tamW, bh / 0.86);
            const P = ML.Palavra(g, p.w, tam, l.linha * 40 + k, P0.chave ? 4 : 0); void sz0;
            const bc = cfg.banda ? (cfg.banda[0] + cfg.banda[1]) / 2 : H / 2;
            return { P, t: p.t, cx: W / 2 + (ML.rnd(l.linha, k) - 0.5) * 260, cy: bc + (ML.rnd(l.linha, k + 9) - 0.5) * 50, rot: (ML.rnd(l.linha, k + 5) - 0.5) * 9, est: 1, k, r: 0 };
          });
        }
        cenas.push({ l, cfg, g, itens, t0: pals[0].t });
      }
      titulo = img(cam, 'rec/titulo-caveira.png', { left: '0px', top: '0px', width: '1150px', transformOrigin: '50% 60%' });
      grg = ML.Grunge(cena);
    },
    seek(t) {
      const espera = [];
      const tPal = cenas.flatMap((c) => c.itens.map((i) => i.t));
      const tr = tranco(t, [...tPal, TFIM].filter((q) => q <= t && t - q < 0.8), 7), tm = ML.tremor(t);
      cam.style.transform = `translate(${(tr.x + tm.x).toFixed(1)}px, ${(tr.y + tm.y).toFixed(1)}px) rotate(${tr.r.toFixed(2)}deg) scale(1.02)`;
      let ci = 0; cenas.forEach((c, k) => { if (t >= c.t0 - 0.1) ci = k; });
      const S = cenas[ci], f = S.cfg.fundo, tl = t - (S.t0 - 0.1), fim = t >= TFIM - 0.05;
      // fundo
      vB.caixa.style.display = divisor.style.display = 'none';
      papel.style.display = 'none'; papel.style.clipPath = 'none';
      if (fim) {
        papel.style.display = ''; ML.poeVideo(vA, { clip: 'vocal-7501', ini: 100, rosto: 300, cx: 960, cy: 560 }, t - TFIM, espera);
        papel.style.clipPath = `path(evenodd, "${ML.furo(960, 560, 900, 480, 1, 77)}")`;
      } else if (f.tipo === 'video') ML.poeVideo(vA, f.uso, tl, espera);
      else if (f.tipo === 'furo') {
        ML.poeVideo(vA, f.uso, tl, espera); papel.style.display = '';
        const p = M.spring(tl, 2.6, 0.62), [x, y, rx, ry] = f.furo;
        papel.style.clipPath = `path(evenodd, "${ML.furo(x, y, rx, ry, 0.15 + 0.85 * p, S.l.linha)}")`;
      } else if (f.tipo === 'split') {
        ML.poeVideo(vA, f.usos[0], tl, espera); ML.poeVideo(vB, { ...f.usos[1], cx: f.usos[1].cx - W / 2 }, tl, espera);
        vB.caixa.style.display = divisor.style.display = '';
        const p = M.spring(tl, 3.2, 0.6); vB.caixa.style.transform = `translateY(${((1 - p) * H).toFixed(1)}px)`;
      } else if (f.tipo === 'cortes') {
        const bs = BATIDAS.filter((b) => b >= S.t0 - 0.1 && b < TFIM); let j = 0; bs.forEach((b, k) => { if (t >= b) j = k; });
        const u = f.usos[j % f.usos.length]; ML.poeVideo(vA, u, t - (bs[j] ?? S.t0), espera);
      }
      // letras
      cenas.forEach((c, k) => {
        const prox = cenas[k + 1], tSai = prox ? prox.t0 - 0.28 : TFIM - 0.1;
        const on = !fim && t >= c.t0 - 0.2 && t < tSai + 0.35;
        c.g.style.display = on ? '' : 'none';
        if (!on) return;
        if (c.cfg.modo === 'gigante') {
          let cur = null; c.itens.forEach((i) => { if (t >= i.t) cur = i; });
          c.itens.forEach((i) => {
            const vis = i === cur && t < tSai;
            i.P.el.style.display = vis ? '' : 'none';
            if (!vis) return;
            const fq = Math.floor((t - i.t) * 15), s = fq === 0 ? 1.18 : fq === 1 ? 0.97 : 1;   // tapa em 2 quadros (stop motion)
            ML.escorre(i.P, t, i.t + 0.05);
            ML.poePal(i.P, i.cx + M.wiggle(t, 1.5, 6, i.k), i.cy, i.rot, s, s);
          });
          return;
        }
        c.itens.forEach((i) => {
          const a = i.t, ch = i.P.r.chave;
          if (t < a - (ch ? 0.12 : 0)) { i.P.el.style.display = 'none'; return; }
          i.P.el.style.display = '';
          let dy = 0, sx = 1, sy = 1, rr = 0, sc = 1;
          if (ch && t < a) { const p = M.prog(t, a - 0.12, a); dy = -(1 - p * p) * 260; sx = 0.9; sy = 1.15; }
          else if (ch) { const kk = M.kick(t, a, 0.2, 4.5, 0.4); sx = 1 + kk; sy = 1 - kk; }
          else { const p = M.spring(t - a, 3.8, 0.56); sc = M.lerp(1.38, 1, p); rr = (1 - p) * (i.k % 2 ? 12 : -12); }
          ML.escorre(i.P, t, a + 0.1);
          const e = M.prog(t, tSai + i.k * 0.018, tSai + i.k * 0.018 + 0.28) ** 2, lado = i.cy < H / 2 ? -1 : 1;
          dy += lado * e * 1300; rr += e * (i.k % 2 ? 22 : -18);
          ML.poePal(i.P, i.cx, i.cy + dy, i.rot + i.r + rr, sc * sx, sc * sy * i.est);
        });
      });
      // título final
      titulo.style.display = fim ? '' : 'none';
      if (fim) {
        let y = 560, sq = 0;
        if (t < TFIM) { const p = M.prog(t, TFIM - 0.05, TFIM); y = M.lerp(-500, 560, p); } else sq = M.kick(t, TFIM, 0.16, 4.2, 0.4);
        titulo.style.transform = `translate(${960 - 575}px, ${(y - 520).toFixed(1)}px) rotate(-2deg) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
      }
      ML.grunge(grg, t);
      return espera.length ? Promise.all(espera) : undefined;
    },
  };
})();
