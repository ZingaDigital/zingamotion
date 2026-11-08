// Modelo 5: PINGO & RAIO. Fundo preto com a caveira em retícula; cada palavra despenca do alto e esmaga ao cair na
// sílaba; palavras-chave no degradê da marca com um raio que risca a tela. O verso velho cai pra fora do quadro.
// Fonte de título: Rubik Wet Paint (letra que escorre).
(() => {
  const { LETRA, W, H, div, img, poe, tranco, COR, GRAD } = C;
  const R = M.mulberry32(0x9e11);
  const DESTAQUE = new Set(['cresceu', 'perceber', 'sentir', 'descalço', 'sorrir']);
  const RAIO = 'M60 0 L0 150 L48 150 L10 300 L120 110 L66 110 L110 0 Z';
  let cam, fundoCav, titulo, raios = [], versos = [];

  window.MODELO = {
    async montar(cena) {
      cam = div(cena, { inset: '0px' });
      div(cam, { inset: '-60px', background: 'url(tex/muro.jpg) center / cover', filter: 'brightness(.6)' });
      fundoCav = img(cam, 'rec/caveira.png', { left: '0px', top: '0px', width: '1150px', mixBlendMode: 'screen', opacity: '.13' });
      img(cam, 'tex/reticula-disco.png', { left: '420px', top: '-40px', width: '1200px', opacity: '.12' });
      titulo = img(cam, 'rec/titulo-caveira.png', { left: '0px', top: '0px', width: '1000px' });
      LETRA.forEach((l, li) => {
        const g = div(cam, { left: '0px', top: '0px' });
        let x = 0, linha = 0, larg = 0;
        const pals = l.palavras.map((p) => {
          const d = DESTAQUE.has(p.w), tam = d ? 270 : 175;
          const el = div(g, { left: '0px', top: '0px', fontFamily: 'Wet Paint', fontSize: tam + 'px', lineHeight: '1.15', padding: '0 14px', transformOrigin: '50% 100%',
            color: d ? 'transparent' : COR.creme, filter: `drop-shadow(6px 7px 0 ${COR.preto})` }, p.w.toUpperCase());
          if (d) Object.assign(el.style, { backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text' });
          return { el, p, d };
        });
        pals.forEach((q) => {
          const w = q.el.offsetWidth, h = q.el.offsetHeight;
          if (x + w > 1320 && x > 0) { x = linha % 2 ? 0 : 120; linha++; }
          q.w = w; q.h = h; q.x = x; q.y = linha * 215 + (q.d ? -40 : 30); q.r = (R() - 0.5) * 9;
          x += w - 6; larg = Math.max(larg, x);
        });
        const alt = (linha + 1) * 215;
        versos.push({ g, pals, l, gx: (W - larg) / 2 + (li % 2 ? 90 : -90), gy: (H - alt) / 2 - 20, ry: li % 2 ? -10 : 10 });
        // um raio por palavra-chave
        pals.filter((q) => q.d).forEach((q) => {
          const r = C.svg(cam, 120, 300, `<path d="${RAIO}" fill="${COR.amarelo}" stroke="${COR.preto}" stroke-width="8" stroke-linejoin="round"/>`, { left: '0px', top: '0px', transformOrigin: '50% 50%' });
          raios.push({ r, t: q.p.t, x: 300 + R() * 1300, rot: (R() - 0.5) * 40 });
        });
      });
    },
    seek(t) {
      const chaves = raios.map((r) => r.t);
      const tr = tranco(t, [0.056, ...chaves].filter((q) => q <= t && t - q < 1), 14);
      cam.style.transform = `translate(${tr.x.toFixed(1)}px, ${tr.y.toFixed(1)}px) rotate(${tr.r.toFixed(2)}deg)`;
      poe(fundoCav, 960 + M.wiggle(t, 0.3, 30, 2), 560, 1 + 0.03 * Math.sin(t * 2.76), 0);
      fundoCav.style.left = '0px';
      // abertura: título cai e esmaga na pancada, depois despenca quando entra a voz
      const t0 = 0.056, tf = 0.62;
      const queda = M.E.sai(M.prog(t, tf, tf + 0.3));
      titulo.style.display = t >= t0 - 0.2 && queda < 1 ? '' : 'none';
      const y = t < t0 ? M.lerp(-700, 540, M.E.sai(M.prog(t, t0 - 0.2, t0))) : 540 + queda * 1200;
      const sq = t >= t0 ? M.kick(t, t0, 0.18, 5, 0.4) : 0;
      titulo.style.transform = `translate(${960 - 500}px, ${(y - 440).toFixed(1)}px) rotate(${(-3 + queda * 18).toFixed(2)}deg) scale(${(1 + sq).toFixed(3)}, ${(1 - sq).toFixed(3)})`;
      titulo.style.transformOrigin = '50% 100%';
      // raios: riscam por 3 quadros e somem
      raios.forEach((r) => {
        const on = t >= r.t && t < r.t + 0.1;
        r.r.style.display = on ? '' : 'none';
        if (on) r.r.style.transform = `translate(${r.x}px, 120px) rotate(${r.rot}deg) scale(2.6)`;
      });
      versos.forEach((v, vi) => {
        const prox = versos[vi + 1], tSai = prox ? prox.l.palavras[0].t - 0.36 : 99;
        const on = t >= v.l.palavras[0].t - 0.3 && t < tSai + 0.6;
        v.g.style.display = on ? '' : 'none';
        if (!on) return;
        const ry = v.ry * Math.sin(Math.min(1, (t - v.l.t0) / 2.4) * Math.PI / 2);
        v.g.style.transform = `translate(${v.gx}px, ${v.gy}px) skewY(${(ry * 0.25).toFixed(2)}deg) scaleX(${Math.cos(ry * Math.PI / 180).toFixed(4)})`;
        v.pals.forEach((q, k) => {
          const a = q.p.t, pre = 0.16;                       // despenca 0,16 s antes e esmaga na sílaba
          if (t < a - pre) { q.el.style.display = 'none'; return; }
          q.el.style.display = '';
          let dy = 0, sx = 1, sy = 1;
          if (t < a) { const p = M.prog(t, a - pre, a); dy = -(1 - p * p) * 520; sy = 1.25; sx = 0.85; }
          else { const k2 = M.kick(t, a, 0.28, 4.5, 0.38); sx = 1 + k2; sy = 1 - k2; }
          // saída: cai pra fora com gravidade, cada palavra um tico depois
          const ts = tSai + k * 0.02, ps = M.prog(t, ts, ts + 0.3);
          dy += ps * ps * 1300; const rs = ps * (k % 2 ? 25 : -20);
          q.el.style.transform = `translate(${q.x.toFixed(1)}px, ${(q.y + dy).toFixed(1)}px) rotate(${(q.r + rs).toFixed(2)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
        });
      });
    },
  };
})();
