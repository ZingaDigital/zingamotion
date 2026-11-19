// P3 · Bateria criativa · 4,5 a 6,0 s (b9 a b12) e P4 · As ideias pediram férias · 6,0 a 8,4 s (b12 a b16+).
// Um contêiner só: a bateria absorve os cards, despenca 100 -> 47 -> 12 -> 2 na batida, depois encolhe pro lado
// e abre espaço pra lâmpada que apaga e pro cursor cansado que clica em "Pausa" em b16. O pill engole a tela.
(() => {
  const B = (n) => Z.b(n);
  const NIVEIS = [[B(9), 1], [B(10), 0.47], [B(10.5), 0.12], [B(11), 0.02]];
  const ENCOLHE = B(12) + 0.08;
  const BAT = [                                        // estados do corpo da bateria (Z.estado: mola entre estados)
    [0, { x: 110, y: 760, w: 780, h: 360, r: 60, b: 14 }],
    [ENCOLHE, { x: 72, y: 790, w: 330, h: 156, r: 32, b: 9 }],
  ];
  const CLIQUE = B(16), COBRE = G.TROCA;
  const PILL = [
    [0, { x: 72, y: 1170, w: 420, h: 140, r: 70 }],
    [CLIQUE, { x: -60, y: -60, w: 1200, h: 2040, r: 0 }],
  ];
  const CURSOR = [[B(13.2), 1010, 1760], [B(14.2), 800, 1520], [B(15), 560, 1330], [CLIQUE - 0.02, 262, 1240, true]];
  let bat, polo, fill, num, pct, rotulo, H, lamp, lampG, pill, pillMiolo, curBox, cur;

  Z.plano({
    id: 'p3', inicio: B(8.6), fim: COBRE + 0.04, z: 3,
    montar(el) {
      Z.marca({ destaque: '#ffffff' });
      num = Z.div(el, { left: '62px', top: '400px', fontSize: '250px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' });
      num.innerHTML = '<span></span><span style="font-size:120px;font-weight:600;color:#f50953">%</span>';
      pct = num.firstChild;
      rotulo = G.texto(el, [['Bateria ', ['criativa', { cor: G.COR.rosa }]]], { x: 72, y: 1176, tam: 60, peso: 600 });
      bat = Z.div(el, { boxSizing: 'border-box', borderStyle: 'solid', borderColor: '#fff' });
      polo = Z.div(el, { background: '#fff' });
      fill = Z.div(bat, { left: '0px', top: '0px', bottom: '0px', background: G.COR.rosa });
      H = G.texto(el, [['Até as ideias'], [['pediram férias.', { cor: G.COR.rosa }]]], { x: 72, y: 340, tam: 100, peso: 600, lh: 1.04 });
      lamp = G.tile(el, 'lampada', { x: 548, y: 712, tam: 312, fundo: 'navy' });
      lampG = lamp.querySelector('path');
      pill = Z.div(el, { background: G.COR.rosa, overflow: 'hidden', zIndex: 20 });
      pillMiolo = Z.div(pill, { left: '58px', top: '0px', height: '140px', display: 'flex', alignItems: 'center', gap: '20px',
        fontSize: '62px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' });
      pillMiolo.innerHTML = G.glifo('pausa', '#fff', 58) + '<span>Pausa</span>';
      curBox = Z.div(el, { inset: '0px', zIndex: 30 });
      cur = Z.cursor(curBox);
    },
    seek(t, el) {
      // câmera: pancada a cada degrau de descarga
      let sh = 0;
      for (const [tn] of NIVEIS.slice(1)) sh += M.kick(t, tn, 14, 5, 0.32);
      el.style.transform = `translate(0px, ${sh.toFixed(2)}px) scale(${(1 + 0.012 * Math.sin(t * 1.7)).toFixed(4)})`;

      // ----- bateria -----
      const s = Z.estado(t, BAT, { freq: 2.4, zeta: 0.66 });
      Z.poeEstado(bat, s);
      bat.style.borderWidth = s.b.toFixed(2) + 'px';
      const ph = s.h * 0.36, pw = s.w * 0.06;
      Object.assign(polo.style, { left: (s.x + s.w + 4).toFixed(2) + 'px', top: (s.y + s.h / 2 - ph / 2).toFixed(2) + 'px',
        width: pw.toFixed(2) + 'px', height: ph.toFixed(2) + 'px', borderRadius: `0 ${(pw * 0.6).toFixed(1)}px ${(pw * 0.6).toFixed(1)}px 0` });
      const nasce = G.entra(t, B(8.9), { dur: 0.4, s0: 0.35, dist: 0, blur: 12, mola: 2.4 });
      G.poe(bat, nasce); G.poe(polo, nasce);
      // nível: enche com os cards entrando (b9), depois despenca na batida, com mola
      let nivel = 0;
      NIVEIS.forEach(([tn, v], i) => {
        const de = i === 0 ? 0 : NIVEIS[i - 1][1];
        if (t >= tn - (i === 0 ? 0.1 : 0)) nivel = M.lerp(de, v, M.spring(t - tn + (i === 0 ? 0.1 : 0), i === 0 ? 2.2 : 3.2, 0.5));
      });
      nivel = M.clamp(nivel, 0, 1.03);
      const pad = s.b * 1.4, interno = s.w - 2 * s.b - 2 * pad;
      Object.assign(fill.style, { left: pad + 'px', top: pad + 'px', bottom: pad + 'px',
        width: Math.max(0, interno * nivel).toFixed(2) + 'px', borderRadius: Math.max(4, s.r * 0.45).toFixed(1) + 'px' });

      pct.textContent = String(Math.max(1, Math.round(nivel * 100)));
      G.poe(num, G.soma(G.entra(t, B(9), { de: 'baixo', dist: 70 }), G.sai(t, ENCOLHE, { para: 'cima', dist: 500 })));
      G.palavrasSeek(rotulo, t, B(9.3), {}, ENCOLHE + 0.04, { para: 'cima', dist: 500 });

      // ----- P4: lâmpada que pisca e apaga, frase, pill, cursor -----
      G.poe(lamp, G.entra(t, ENCOLHE + 0.06, { dur: 0.45, de: 'dir', dist: 520, ry: -40, blur: 14 }));
      const pisca = t < B(12.5) ? 1 : t < B(13.25) ? (M.noise1(t * 38, 7) > -0.05 ? 1 : 0.15) : 0.15;
      lampG.setAttribute('fill', pisca > 0.5 ? '#ffffff' : '#3d5a7c');
      G.palavrasSeek(H, t, ENCOLHE + 0.12);

      const ps = Z.estado(t, PILL, { freq: 1.6, zeta: 0.9 });
      Z.poeEstado(pill, ps);
      const abre = G.E.outCubic(M.prog(t, B(13), B(13) + 0.4));
      if (t < CLIQUE) {
        pill.style.clipPath = `inset(0px ${((1 - abre) * ps.w * 0.8).toFixed(1)}px 0px 0px round 70px)`;
        pill.style.visibility = t >= B(13) ? 'visible' : 'hidden';
      } else { pill.style.clipPath = 'none'; pill.style.visibility = 'visible'; }
      const apertao = M.kick(t, CLIQUE, 0.06, 4, 0.5);
      pill.style.transform = `scale(${(1 - apertao).toFixed(4)})`;
      G.poe(pillMiolo, G.soma(G.entra(t, B(13.15), { dur: 0.35, de: 'esq', dist: 60 }), G.sai(t, CLIQUE + 0.02, { para: 'cima', dist: 160, dur: 0.25 })));

      // cursor cansado: atrasa, treme, a seta pende
      Z.cursorSeek(cur, t, CURSOR, { voo: 0.55 });
      const cansa = M.prog(t, B(13.2), CLIQUE);
      curBox.style.transform = `translate(${M.wiggle(t, 2.2, 10 * cansa, 3).toFixed(2)}px, ${M.wiggle(t, 1.7, 14 * cansa, 9).toFixed(2)}px)`;
      curBox.style.visibility = t >= B(13.2) && t < CLIQUE + 0.25 ? 'visible' : 'hidden';
    },
    som(S) {
      S.riser(B(8.6), B(9), 0.12);
      NIVEIS.slice(1).forEach(([tn], i) => S.zip(tn, 0.16, 0.1, false) || S.osc({ t: tn, tipo: 'triangle', f0: 220 - i * 50, f1: 70 - i * 12, glide: 0.25, dur: 0.3, ganho: 0.32 }));
      for (const k of [12.5, 12.75, 13]) S.tick(B(k), 0.08, 1200);
      S.osc({ t: B(13.25), tipo: 'sawtooth', f0: 120, f1: 40, glide: 0.3, dur: 0.25, ganho: 0.06 });
      S.click(CLIQUE, 0.3);
    },
  });
})();
