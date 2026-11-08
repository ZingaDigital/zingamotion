// Modelo 2: SPRAY NO MURO. Muro preto; cada palavra é pintada com um passe de spray (máscara que varre) no tempo
// da sílaba; palavras-chave no degradê da marca escorrem. Verso velho é coberto por uma passada de rolo preto.
// Fonte de título: Sedgwick Ave Display (grafite).
(() => {
  const { LETRA, W, H, div, img, poe, pincel, tranco, COR, GRAD } = C;
  const R = M.mulberry32(0x5b2a);
  const DESTAQUE = new Set(['cresceu', 'perceber', 'sentir', 'descalço', 'sorrir']);
  const ORIGEM = [{ x: 170, y: 110 }, { x: 260, y: 120 }, { x: 140, y: 110 }, { x: 230, y: 130 }];
  let cam, caveira, versos = [];

  window.MODELO = {
    async montar(cena) {
      cam = div(cena, { inset: '0px', transformOrigin: '55% 50%' });
      div(cam, { left: '-80px', top: '-60px', width: (W + 160) + 'px', height: (H + 120) + 'px', background: 'url(tex/muro.jpg) center / cover' });
      caveira = img(cam, 'rec/caveira.png', { left: '0px', top: '0px', width: '980px', mixBlendMode: 'screen', transformOrigin: '50% 50%' });
      LETRA.forEach((l, li) => {
        const g = div(cam, { left: '0px', top: '0px' });
        let x = 0, linha = 0, maxX = 0;
        const pals = l.palavras.map((p) => {
          const d = DESTAQUE.has(p.w), tam = d ? 250 : 165;
          const caixa = div(g, { left: '0px', top: '0px', transformOrigin: '50% 60%' });
          let spray = null;
          if (d) spray = img(caixa, 'tex/reticula-disco.png', { left: '0px', top: '0px', opacity: '.22' });
          const el = div(caixa, { position: 'relative', fontFamily: 'Sedgwick', fontSize: tam + 'px', lineHeight: '1.1', padding: '0 18px', whiteSpace: 'nowrap',
            color: d ? 'transparent' : COR.creme, WebkitTextStroke: d ? `3px ${COR.preto}` : '0px', paintOrder: 'stroke fill',
            textShadow: d ? 'none' : `5px 6px 0 ${COR.preto}` }, p.w.toUpperCase());
          if (d) Object.assign(el.style, { backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', filter: `drop-shadow(5px 6px 0 ${COR.preto})` });
          return { caixa, el, spray, p, d, tam };
        });
        pals.forEach((q) => {
          const w = q.el.offsetWidth, h = q.el.offsetHeight;
          if (x + w > 1450 && x > 0) { x = 60 + R() * 120; linha++; }
          q.w = w; q.h = h; q.cx = x + w / 2; q.cy = linha * 212 + h / 2 + (R() - 0.5) * 60; q.r = (R() - 0.5) * 12;
          x += w - 10 + R() * 40; maxX = Math.max(maxX, x);
          if (q.spray) Object.assign(q.spray.style, { width: w * 1.3 + 'px', left: -w * 0.15 + 'px', top: (h - w * 1.3) / 2 + 'px' });
          // pingos (só nas palavras-chave)
          q.pingos = [];
          if (q.d) for (let k = 0; k < 6; k++) {
            const px = w * (0.12 + 0.76 * R()), len = 120 + R() * 260, larg = 10 + R() * 9;
            const pg = div(q.caixa, { left: px + 'px', top: h * 0.7 + 'px', width: larg + 'px', height: '0px', borderRadius: `${larg}px`,
              background: `linear-gradient(180deg, ${COR.vermelho}, ${COR.laranja} 70%, ${COR.amarelo})`, boxShadow: `3px 3px 0 ${COR.preto}` });
            q.pingos.push({ pg, len, atraso: R() * 0.25 });
          }
        });
        const altura = (linha + 1) * 212;
        const rolo = div(cam, { left: '0px', top: '0px', width: maxX + 260 + 'px', height: altura + 120 + 'px', background: '#100f0e',
          clipPath: 'polygon(0% 6%, 8% 0%, 30% 4%, 55% 1%, 78% 5%, 100% 2%, 99% 94%, 74% 100%, 46% 96%, 20% 100%, 1% 95%)' });
        versos.push({ g, pals, l, o: ORIGEM[li], rolo, altura });
      });
    },
    seek(t) {
      const inicios = LETRA.map((l) => l.palavras[0].t);
      const tr = tranco(t, [0.056, ...inicios].filter((q) => q <= t && t - q < 1.2), 9);
      const z = 1 + 0.07 * M.E.suave(t / C.DUR);
      cam.style.transform = `translate(${(tr.x + M.wiggle(t, 0.9, 7, 2)).toFixed(1)}px, ${(tr.y + M.wiggle(t, 0.8, 6, 5)).toFixed(1)}px) rotate(${(tr.r + M.wiggle(t, 0.5, 0.8, 7)).toFixed(2)}deg) scale(${z.toFixed(4)})`;
      // caveira: estêncil pintado na pancada, depois fica fraca no fundo
      const c0 = 0.056;
      caveira.style.display = t >= c0 ? '' : 'none';
      pincel(caveira, M.E.entra(M.prog(t, c0, c0 + 0.45)), 180);
      caveira.style.opacity = M.lerp(1, 0.22, M.E.cruza(M.prog(t, 0.5, 1.0))).toFixed(3);
      poe(caveira, 1420, 560, 1 + M.kick(t, c0, 0.05, 4, 0.4), 8);
      caveira.style.left = '0px';
      versos.forEach((v, vi) => {
        const prox = versos[vi + 1];
        const tCobre = prox ? prox.l.palavras[0].t - 0.18 : 99;
        const on = t >= v.l.palavras[0].t - 0.01;
        v.g.style.display = on && t < tCobre + 0.32 ? '' : 'none';
        v.g.style.transform = `translate(${v.o.x}px, ${v.o.y}px)`;
        v.g.style.zIndex = 10 + vi * 2;
        // rolo preto cobre o verso velho (e o remendo fica no muro)
        const pc = M.E.cruza(M.prog(t, tCobre, tCobre + 0.3));
        v.rolo.style.display = pc > 0 ? '' : 'none';
        v.rolo.style.zIndex = 11 + vi * 2;
        v.rolo.style.transform = `translate(${v.o.x - 120}px, ${v.o.y - 60}px) rotate(${vi % 2 ? 1.5 : -1.2}deg)`;
        pincel(v.rolo, pc, vi % 2 ? 270 : 90, 6);
        v.rolo.style.opacity = M.lerp(0.97, 0.3, M.E.cruza(M.prog(t, tCobre + 0.3, tCobre + 0.9))).toFixed(3);
        v.pals.forEach((q, k) => {
          const t0 = q.p.t, prx = v.pals[k + 1], dur = Math.min(0.24, prx ? Math.max(0.08, prx.p.t - t0) : 0.24);
          if (t < t0) { q.caixa.style.display = 'none'; return; }
          q.caixa.style.display = '';
          pincel(q.el, M.E.entra(M.prog(t, t0, t0 + dur)), 90, 22);
          if (q.spray) { q.spray.style.opacity = (0.22 * M.prog(t, t0, t0 + 0.2)).toFixed(3); }
          const s = 1 + M.kick(t, t0 + dur, 0.06, 5, 0.45);
          q.caixa.style.transform = `translate(${(q.cx - q.w / 2).toFixed(1)}px, ${(q.cy - q.h / 2).toFixed(1)}px) rotate(${q.r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
          q.pingos.forEach((pg) => {
            const p = M.E.entra(M.prog(t, t0 + dur + pg.atraso, t0 + dur + pg.atraso + 1.6));
            pg.pg.style.height = (pg.len * p).toFixed(1) + 'px';
          });
        });
      });
    },
  };
})();
