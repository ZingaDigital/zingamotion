// P3 · Bateria criativa · 4,3 a 6,08 s (navy) e P4 · As ideias pediram férias · 6,08 a 8,0 s (folha de papel).
// A bateria absorve as folhas, despenca 100 -> 47 -> 12 -> 2 na batida, encolhe pro canto e o fundo corta pra
// folha de caderno: a lâmpada cansada arremessa três rascunhos amassados no lixo e erra todos. O cursor clica em
// "Pausa" em b16 e a folha inteira amassa e voa, revelando o rosa das férias.
(() => {
  const B = (n) => Z.b(n);
  const NIVEIS = [[B(9), 1], [B(10), 0.47], [B(10.5), 0.12], [B(11), 0.02]];
  const ENCOLHE = B(12) + 0.08;
  const BAT = [
    [0, { x: 110, y: 760, w: 780, h: 360, r: 60, b: 14 }],
    [ENCOLHE, { x: 72, y: 640, w: 300, h: 136, r: 30, b: 9 }],
  ];
  const CLIQUE = B(16);
  const PILL = { x: 72, y: 1250, w: 420, h: 140 };
  const CURSOR = [[B(13.2), 1010, 1800], [B(14.2), 820, 1600], [B(15), 560, 1420], [CLIQUE - 0.02, 262, 1320, true]];
  // lâmpada: caixa 300 x 400 em (300, 760); arremessos soltam na colcheia e pousam na colcheia seguinte + 1
  const LX = 300, LY = 760, LT = 300;
  const ARREMESSO = [B(12.75), B(13.75), B(14.75)];
  const VOO = 0.375;
  const POUSO = [[742, 1072], [992, 1078], [690, 1080]];
  const SOLTA = { x: 628, y: 872 };                   // mão no instante da soltura (pose 117,5° / 40°)
  const vb = (p) => ({ x: LX + (p.x + 20) * LT / 240, y: LY + (p.y + 20) * LT / 240 });
  let folha, papel, amasso, bat, polo, fill, num, pct, rotulo, H, lamp, lixo, bolas = [], pill, pillMiolo, curBox, cur, rab, mesa, seta;

  Z.plano({
    id: 'p3', inicio: B(8.6), fim: CLIQUE + 0.8, z: 3,
    montar(el) {
      Z.marca({ destaque: '#ffffff' });
      folha = Z.div(el, { inset: '0px' });
      papel = T.papel(folha);
      rab = T.rabiscos(folha, [
        { f: 'zz', x: 660, y: 740, s: 0.9, r: -8 }, { f: 'espiral', x: 930, y: 1560, s: 0.8 }, { f: 'estrela', x: 150, y: 1640, s: 0.6, r: 12 },
        { f: 'circulo', x: 880, y: 330, s: 0.8 }, { f: 'onda', x: 560, y: 1760, s: 1 }, { f: 'gota', x: 990, y: 720, s: 0.6 },
      ], { op: 0.3, semente: 31 });
      mesa = T.rabiscos(folha, [{ f: 'risco', x: 610, y: 1108, s: 4.6 }], { op: 0.9, larg: 6, semente: 7 });
      seta = T.rabiscos(folha, [{ f: 'seta', x: 640, y: 1300, s: 1.1, r: 180 }], { cor: G.COR.rosa, op: 0.95, larg: 7, semente: 9 });
      // bolinhas que já estavam no chão (o dia todo foi assim)
      for (const [x, y, s] of [[850, 1050, 0.62], [1000, 1060, 0.55]]) {
        const b = T.bola(folha, 110 * s / 0.62, 40 + x); b.style.visibility = 'visible'; b.dataset.fixa = '1';
        b.style.transform = `translate(${x - 55}px, ${y - 55}px) rotate(${x % 90}deg)`;
        bolas.push({ b, fixa: true });
      }
      lixo = T.lixeira(folha, { x: 800, y: 935, tam: 150 });
      lamp = T.lampada(folha, { x: LX, y: LY, tam: LT });
      ARREMESSO.forEach((_, i) => bolas.push({ b: T.bola(folha, 78, 60 + i), i }));
      H = G.texto(folha, [['Até as ideias'], [['pediram férias.', { cor: G.COR.rosa }]]], { x: 72, y: 330, tam: 100, peso: 600, lh: 1.04, cor: G.COR.navy });
      bat = Z.div(folha, { boxSizing: 'border-box', borderStyle: 'solid' });
      polo = Z.div(folha, {});
      fill = Z.div(bat, { left: '0px', top: '0px', bottom: '0px', background: G.COR.rosa });
      pill = Z.div(folha, { left: PILL.x + 'px', top: PILL.y + 'px', width: PILL.w + 'px', height: PILL.h + 'px', borderRadius: '70px',
        background: G.COR.rosa, overflow: 'hidden', border: `6px solid ${G.COR.navy}`, boxSizing: 'border-box', boxShadow: `8px 10px 0 ${G.COR.navy}` });
      pillMiolo = Z.div(pill, { left: '52px', top: '0px', height: '128px', display: 'flex', alignItems: 'center', gap: '20px',
        fontSize: '62px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' });
      pillMiolo.innerHTML = G.glifo('pausa', '#fff', 58) + '<span>Pausa</span>';
      curBox = Z.div(folha, { inset: '0px', zIndex: 30 });
      cur = Z.cursor(curBox);
      num = Z.div(el, { left: '62px', top: '400px', fontSize: '250px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' });
      num.innerHTML = '<span></span><span style="font-size:120px;font-weight:600;color:#f50953">%</span>';
      pct = num.firstChild;
      rotulo = G.texto(el, [['Bateria ', ['criativa', { cor: G.COR.rosa }]]], { x: 72, y: 1176, tam: 60, peso: 600 });
      amasso = T.amassavel(el, folha, 41);
    },
    seek(t, el) {
      const p4 = t >= ENCOLHE;
      let sh = 0;
      for (const [tn] of NIVEIS.slice(1)) sh += M.kick(t, tn, 14, 5, 0.32);
      el.style.transform = `translate(0px, ${sh.toFixed(2)}px)`;
      Z.mostra(papel, p4, 'block');
      for (const x of [rab, mesa, seta]) { x.svg.style.display = p4 ? '' : 'none'; x.seek(t); }
      seta.svg.style.clipPath = `inset(0px 0px 0px ${(560 - 180 * G.E.outCubic(M.prog(t, B(14), B(14) + 0.4))).toFixed(1)}px)`;

      // ----- bateria (branca no navy, navy no papel) -----
      const s = Z.estado(t, BAT, { freq: 2.4, zeta: 0.66 });
      Z.poeEstado(bat, s);
      const tinta = p4 ? G.COR.navy : '#ffffff';
      bat.style.borderWidth = s.b.toFixed(2) + 'px'; bat.style.borderColor = tinta; polo.style.background = tinta;
      const ph = s.h * 0.36, pw = s.w * 0.06;
      Object.assign(polo.style, { left: (s.x + s.w + 4).toFixed(2) + 'px', top: (s.y + s.h / 2 - ph / 2).toFixed(2) + 'px',
        width: pw.toFixed(2) + 'px', height: ph.toFixed(2) + 'px', borderRadius: `0 ${(pw * 0.6).toFixed(1)}px ${(pw * 0.6).toFixed(1)}px 0` });
      const nasce = G.entra(t, B(8.9), { dur: 0.4, s0: 0.35, dist: 0, blur: 12, mola: 2.4 });
      G.poe(bat, nasce); G.poe(polo, nasce);
      let nivel = 0;
      NIVEIS.forEach(([tn, v], i) => {
        const de = i === 0 ? 0 : NIVEIS[i - 1][1];
        if (t >= tn - (i === 0 ? 0.1 : 0)) nivel = M.lerp(de, v, M.spring(t - tn + (i === 0 ? 0.1 : 0), i === 0 ? 2.2 : 3.2, 0.5));
      });
      nivel = M.clamp(nivel, 0, 1);   // a mola não passa de 100% (nem no número nem na barra)
      const pad = s.b * 1.4, interno = s.w - 2 * s.b - 2 * pad;
      Object.assign(fill.style, { left: pad + 'px', top: pad + 'px', bottom: pad + 'px',
        width: Math.max(0, interno * nivel).toFixed(2) + 'px', borderRadius: Math.max(4, s.r * 0.45).toFixed(1) + 'px' });
      pct.textContent = String(Math.max(1, Math.round(nivel * 100)));
      G.poe(num, G.soma(G.entra(t, B(9), { de: 'baixo', dist: 70 }), G.sai(t, ENCOLHE - 0.06, { para: 'cima', dist: 500, dur: 0.3 })));
      G.palavrasSeek(rotulo, t, B(9.3), {}, ENCOLHE - 0.04, { para: 'cima', dist: 500, dur: 0.3 });

      // ----- P4: lâmpada cansada arremessando rascunhos -----
      G.poe(lamp.el, G.soma(G.entra(t, ENCOLHE + 0.04, { dur: 0.45, de: 'dir', dist: 520, blur: 14 }),
        { sy: 1 - 0.025 * (0.5 + 0.5 * Math.sin(t * 5)), r: M.wiggle(t, 1.2, 2, 4) }));
      const pisca = t < B(12.5) ? 1 : t < B(13.25) ? (M.noise1(t * 38, 7) > -0.05 ? 1 : 0) : 0;
      // braço direito: arma (sobe), arremessa na soltura, volta a pender
      let ang = 18, dobra = 14;
      for (const r of ARREMESSO) {
        const arma = G.E.outCubic(M.prog(t, r - 0.32, r - 0.06)), solta = M.prog(t, r - 0.06, r + 0.06), volta = G.E.outCubic(M.prog(t, r + 0.08, r + 0.4));
        if (t >= r - 0.32 && t < r + 0.4) { ang = M.lerp(M.lerp(18, 165, arma), 70, solta); ang = M.lerp(ang, 18, volta); dobra = M.lerp(70, 10, solta); }
      }
      const mao = lamp.seek({ humor: 'cansada', oculos: 0, luz: pisca, bracoE: [16 + 3 * Math.sin(t * 3), 12], bracoD: [ang, dobra] }).maoD;
      const hm = vb(mao);
      bolas.forEach((o) => {
        if (o.fixa) { o.b.style.display = p4 ? '' : 'none'; return; }
        const r = ARREMESSO[o.i], [lx, ly] = POUSO[o.i];
        const naMao = t >= r - 0.42 && t < r, voando = t >= r && t < r + VOO;
        o.b.style.display = p4 ? '' : 'none';
        o.b.style.visibility = t >= r - 0.42 ? 'visible' : 'hidden';
        let x = hm.x, y = hm.y, giro = 0, sc = naMao ? M.clamp(M.spring(t - (r - 0.42), 4, 0.5)) : 1;
        if (voando || t >= r + VOO) {
          const pv = M.prog(t, r, r + VOO);
          const pos = M.hop(pv, SOLTA.x, SOLTA.y, lx, ly, 240);
          x = pos.x; y = pos.y; giro = pv * 540;
          if (t >= r + VOO) { const q = t - r - VOO; x = lx + Math.min(q, 0.3) * 60; y = ly - Math.abs(M.kick(t, r + VOO, 34, 3, 0.5)); giro = 540 + Math.min(q, 0.3) * 200; }
        }
        o.b.style.transform = `translate(${(x - 39).toFixed(1)}px, ${(y - 39).toFixed(1)}px) rotate(${giro.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      });
      G.palavrasSeek(H, t, ENCOLHE + 0.1);
      lixo.style.display = p4 ? '' : 'none';
      lixo.style.transform = `rotate(${(M.kick(t, ARREMESSO[0] + VOO, 3, 4, 0.4) - M.kick(t, ARREMESSO[2] + VOO, 4, 4, 0.4)).toFixed(2)}deg)`;
      lixo.style.transformOrigin = '50% 100%';

      // pill "Pausa" abre da esquerda; o clique afunda e a folha amassa
      const abre = G.E.outCubic(M.prog(t, B(13), B(13) + 0.4));
      pill.style.clipPath = `inset(-20px ${((1 - abre) * PILL.w * 0.8).toFixed(1)}px -20px -20px round 70px)`;
      pill.style.visibility = t >= B(13) ? 'visible' : 'hidden';
      pill.style.transform = `scale(${(1 - M.kick(t, CLIQUE, 0.08, 4, 0.5)).toFixed(4)})`;
      G.poe(pillMiolo, G.entra(t, B(13.15), { dur: 0.35, de: 'esq', dist: 60 }));
      Z.cursorSeek(cur, t, CURSOR, { voo: 0.55 });
      const cansa = M.prog(t, B(13.2), CLIQUE);
      curBox.style.transform = `translate(${M.wiggle(t, 2.2, 10 * cansa, 3).toFixed(2)}px, ${M.wiggle(t, 1.7, 14 * cansa, 9).toFixed(2)}px)`;
      curBox.style.visibility = t >= B(13.2) && t < CLIQUE + 0.25 ? 'visible' : 'hidden';

      amasso.seek(t, CLIQUE + 0.02, { dur: 0.32, cx: 540, cy: 960, voo: { dur: 0.42, x1: 620, y1: -1000, h: 160, giro: 620 } });
    },
    som(S) {
      S.riser(B(8.6), B(9), 0.12);
      NIVEIS.slice(1).forEach(([tn], i) => { S.zip(tn, 0.16, 0.1, false); S.osc({ t: tn, tipo: 'triangle', f0: 220 - i * 50, f1: 70 - i * 12, glide: 0.25, dur: 0.3, ganho: 0.32 }); });
      for (const k of [12.5, 12.75, 13]) S.tick(B(k), 0.08, 1200);
      ARREMESSO.forEach((r, i) => {
        SOM.amassa(S, r - 0.375, 0.5);
        S.swoosh(r, 0.1, 0.07, true);
        SOM.toc(S, r + VOO, i === 2 ? 0.9 : 0.7);
      });
      S.click(CLIQUE, 0.3);
      SOM.amassa(S, CLIQUE, 1);
      S.swoosh(CLIQUE + 0.34, 0.36, 0.16, true);
    },
  });
})();
