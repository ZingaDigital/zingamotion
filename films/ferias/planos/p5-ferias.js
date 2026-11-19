// P5 · Virada · 8,3 a 10,0 s · P6 · Datas · 10,0 a 14,0 s · P7 · Assinatura · 14,0 a 20,0 s. Tema rosa.
// A folha do P4 amassou e voou; por trás, o rosa. "Estamos de férias." entra grande com ecos vazados (gramática da
// referência) e a lâmpada de óculos escuros joga os papéis pro alto em b18. Em b20 tudo se reorganiza: o título sobe,
// a bateria vira a barra entre "19 DEZ" e "04 JAN" e carrega dia a dia; a lâmpada acende junto e vai pro canto.
// O fim é o quadro fixado; em b39 o rosa encolhe até o 1º dia da grade (loop).
(() => {
  const B = (n) => Z.b(n);
  const T0 = G.P5;
  const SOBE = B(20);
  const JOGA = B(18);
  // férias a partir de sábado, 19/12/2026; volta segunda, 04/01/2027 (corrigido pelo cliente)
  const DIAS = [...Array.from({ length: 13 }, (_, i) => `${19 + i} DEZ`), '01 JAN', '02 JAN', '03 JAN', '04 JAN'];
  const U = DIAS.length - 1;
  const quandoDia = (k) => (k === 0 ? SOBE : B(21) + 0.125 * k);   // 20 DEZ em b21,25 ... 04 JAN em b25 (semicolcheias)
  const VOLTA = quandoDia(U);
  const BAR = [
    [0, { x: 72, y: 1210, w: 300, h: 140, r: 32 }],
    [SOBE, { x: 72, y: 800, w: 830, h: 104, r: 30 }],
  ];
  // lâmpada: caixa 240 x 320 em (640, 1080); no fim, 60% no canto de baixo (origem 50% 90%)
  const LX = 640, LY = 1080;
  const FOLHAS = Array.from({ length: 7 }, (_, i) => {
    const r = M.mulberry32(500 + i);
    return { vx: -1150 + i * 360 + (r() - 0.5) * 160, vy: -(2300 + r() * 700), giro: (r() - 0.5) * 1000, atraso: r() * 0.05, mao: i % 2 };   // leque, das duas mãos
  });
  let tampa, linhas = [], cab, est, fer, eco, letras = [], bat, polo, fill, raio, dia, sai1, d1, cap1, sai2, d2, cap2, H, lamp, folhas = [], logo, festas, rab;

  const bloco = (el, y, over, data, l1, l2) => {
    const o = Z.div(el, { left: '74px', top: y + 'px', fontSize: '40px', fontWeight: 600, letterSpacing: '0.16em', color: G.COR.navy });
    o.textContent = over;
    const d = G.texto(el, [[data]], { x: 62, y: y + 36, tam: 178, peso: 900, lh: 1, ls: '-0.015em' });
    const c = G.texto(el, [[l1], [[l2, { cor: G.COR.navy }]]], { x: 690, y: y + 70, tam: 48, peso: 600, lh: 1.1 });
    return [o, d, c];
  };

  Z.plano({
    id: 'p5', inicio: T0, fim: 20, z: 4,
    montar(el) {
      tampa = Z.div(el, { background: `linear-gradient(160deg, ${G.COR.rosa} 0%, ${G.COR.rosaFundo} 100%)` });
      rab = T.rabiscos(el, [
        { f: 'sol', x: 945, y: 330, s: 0.9 }, { f: 'onda', x: 560, y: 1700, s: 1.3 }, { f: 'onda', x: 250, y: 1790, s: 1, r: 4 },
        { f: 'estrela', x: 990, y: 1600, s: 0.5, r: 10 }, { f: 'espiral', x: 120, y: 1640, s: 0.55 },
      ], { cor: '#ffffff', op: 0.4, semente: 51 });
      cab = Z.div(el, { left: '72px', top: '246px', transformOrigin: '0px 0px' });
      est = G.texto(cab, [['Estamos de']], { x: 2, y: 0, tam: 64, peso: 600 });
      eco = T.eco(cab, 'férias.', { x: -6, y: 58, tam: 232, cor: '#ffffff', op: 0.6, copias: 3, passo: -0.26, traco: 3 });
      fer = Z.div(cab, { left: '-6px', top: '58px', fontSize: '232px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em',
        color: G.COR.navy, whiteSpace: 'nowrap' });
      for (const ch of 'férias.') { const s = document.createElement('span'); s.className = 'w'; s.textContent = ch; fer.append(s); letras.push(s); }

      [sai1, d1, cap1] = bloco(el, 548, 'A PARTIR DE', '19 DEZ', 'sábado', '2026');
      [sai2, d2, cap2] = bloco(el, 946, 'VOLTAMOS EM', '04 JAN', 'segunda', '2027');

      bat = Z.div(el, { boxSizing: 'border-box', border: '9px solid #fff', overflow: 'hidden' });
      polo = Z.div(el, { background: '#fff' });
      fill = Z.div(bat, { background: G.COR.navy });
      raio = Z.div(bat, { right: '18px', top: '0px', bottom: '0px', display: 'flex', alignItems: 'center' });
      raio.innerHTML = G.glifo('raio', '#fff', 64);
      dia = Z.div(bat, { top: '0px', bottom: '0px', display: 'flex', alignItems: 'center', fontSize: '44px', fontWeight: 700,
        color: '#fff', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' });

      H = G.texto(el, [['Voltamos com a bateria cheia'], [['e ideias novas.', { cor: G.COR.navy }]]], { x: 72, y: 1182, tam: 54, peso: 600, lh: 1.12 });
      logo = Z.div(el, { left: '66px', top: '1352px' });
      logo.innerHTML = G.logo('#ffffff', G.COR.navy, 236);
      festas = G.texto(el, [['Boas festas!']], { x: 360, y: 1372, tam: 48, peso: 600 });
      lamp = T.lampada(el, { x: LX, y: LY, tam: 240 });
      for (let i = 0; i < FOLHAS.length; i++) {
        const f = Z.div(el, { left: '0px', top: '0px', width: '74px', height: '96px', background: '#fff', borderRadius: '6px',
          border: `4px solid ${G.COR.navy}`, boxSizing: 'border-box', boxShadow: `5px 6px 0 ${G.COR.navy}` });
        for (let k = 0; k < 3; k++) Z.div(f, { left: '10px', top: 18 + k * 20 + 'px', width: (k === 2 ? 30 : 46) + 'px', height: '5px', borderRadius: '3px', background: G.COR.navy, opacity: 0.6 });
        folhas.push(f);
      }
      // linhas da composição, na ordem de leitura: saem em escadinha no loop
      for (const grupo of [[cab], [sai1, d1.box, cap1.box], [bat, polo], [sai2, d2.box, cap2.box], [H.box, lamp.el], [logo, festas.box]]) {
        const l = Z.div(el, { inset: '0px' }); for (const n of grupo) l.append(n); linhas.push(l);
      }
    },
    seek(t, el) {
      const pl = G.E.morph(M.prog(t, G.LOOP + 0.14, G.LOOP + 0.48));
      Z.poeEstado(tampa, { x: M.lerp(-40, 141, pl), y: M.lerp(-40, 720, pl), w: M.lerp(Z.W + 80, 34, pl), h: M.lerp(Z.H + 80, 34, pl), r: M.lerp(0, 9, pl) });
      Z.mostra(tampa, t >= G.LOOP, 'block');
      linhas.forEach((l, i) => G.poe(l, G.sai(t, G.LOOP - 0.06 + i * 1 / 30, { para: 'cima', dist: 900, dur: 0.22 })));
      rab.seek(t);
      rab.svg.style.visibility = t < G.LOOP ? 'visible' : 'hidden';
      const respira = 1 + 0.008 * Math.sin((t - T0) * 1.6);
      el.style.transform = `translate(0px, ${M.kick(t, VOLTA, 16, 4, 0.35).toFixed(2)}px) scale(${respira.toFixed(4)})`;

      // título: nasce grande no meio com ecos vazados descendo; sobe pro topo em b20 e os ecos se recolhem
      const m = M.spring(t - SOBE, 2.1, 0.7);
      const k = M.lerp(1.3, 1, m), dy = M.lerp(400, 0, m);
      cab.style.transform = `translate(0px, ${dy.toFixed(2)}px) scale(${k.toFixed(4)})`;
      G.palavrasSeek(est, t, T0 + 0.02, { de: 'baixo', dist: 60 });
      eco.seek(t, T0 + 0.42, SOBE - 0.1);
      letras.forEach((s, i) => {
        const ti = T0 + 0.1 + i * 2 / 30;
        const a = G.entra(t, ti, { dur: 0.42, de: 'baixo', dist: 160, s0: 1.35, blur: 18, mola: 2.8 });
        G.poe(s, G.soma(a, { y: -M.kick(t, B(36), 10, 3, 0.4) }));
      });

      // bateria pequena carregando -> barra do período
      const s = Z.estado(t, BAR, { freq: 2.3, zeta: 0.68 });
      Z.poeEstado(bat, s);
      const ph = s.h * 0.4;
      Object.assign(polo.style, { left: (s.x + s.w + 3).toFixed(2) + 'px', top: (s.y + s.h / 2 - ph / 2).toFixed(2) + 'px',
        width: '18px', height: ph.toFixed(2) + 'px', borderRadius: '0 10px 10px 0' });
      const nasce = G.entra(t, B(17), { dur: 0.4, de: 'baixo', dist: 120, blur: 12, mola: 2.6 });
      G.poe(bat, nasce); G.poe(polo, nasce);
      let kd = -1;
      for (let i = 0; i < DIAS.length; i++) if (t >= quandoDia(i)) kd = i;
      const alvo = kd <= 0 ? 0.03 : kd / U, ant = kd <= 1 ? 0.03 : (kd - 1) / U;
      const nivel = kd < 1 ? 0.03 : M.lerp(ant, alvo, M.spring(t - quandoDia(kd), 6, 0.6));
      const pad = 9, interno = s.w - 18 - 2 * pad;
      Object.assign(fill.style, { left: pad + 'px', top: pad + 'px', bottom: pad + 'px', width: Math.max(10, interno * nivel).toFixed(2) + 'px', borderRadius: '18px' });
      raio.style.opacity = t < SOBE ? (Math.floor((t - T0) * 4) % 2 ? 1 : 0.35) : (kd >= U ? 1 : 0.55);
      dia.textContent = t >= B(34) ? '100%' : kd >= 0 ? DIAS[kd] : '';
      dia.style.left = M.clamp(pad + interno * nivel - 190, pad + 20, interno - 300).toFixed(1) + 'px';
      G.poe(dia, G.soma(G.entra(t, SOBE + 0.2, { dur: 0.3, dist: 20, blur: 8 }), { s: 1 + M.kick(t, quandoDia(Math.max(kd, 0)), 0.06, 5, 0.5) + M.kick(t, B(34), 0.12, 4, 0.45) }));

      // datas
      G.poe(sai1, G.entra(t, SOBE + 0.06, { de: 'esq', dist: 200 }));
      G.palavrasSeek(d1, t, SOBE + 0.1, { de: 'esq', dist: 260, mola: 2.6, passo: 3 / 30 });
      G.palavrasSeek(cap1, t, SOBE + 0.3, { dist: 30 });
      G.poe(sai2, G.entra(t, VOLTA - 0.1, { de: 'cima', dist: 80 }));
      G.palavrasSeek(d2, t, VOLTA - 0.06, { de: 'cima', dist: 200, s0: 1.25, mola: 3, blur: 18, passo: 2 / 30 });
      G.palavrasSeek(cap2, t, VOLTA + 0.2, { dist: 30 });

      // lâmpada de férias: entra de óculos, joga os papéis pro alto em b18, vai pro canto em b20, acende com a barra
      const vai = M.spring(t - SOBE - 0.1, 2.2, 0.7);
      const pulo = Math.abs(M.kick(t, VOLTA, 60, 3, 0.45)) + Math.abs(M.kick(t, B(29), 40, 3, 0.45)) + Math.abs(M.kick(t, JOGA, 50, 3, 0.5));
      G.poe(lamp.el, G.soma(G.entra(t, T0 + 0.18, { dur: 0.4, de: 'baixo', dist: 500, blur: 2, mola: 2.8 }),
        { x: 112 * vai, y: 114 * vai - pulo, s: M.lerp(1, 0.6, vai), r: M.wiggle(t, 0.8, 3, 12) }));
      const arma = G.E.outCubic(M.prog(t, JOGA - 0.3, JOGA - 0.05)), solta = G.E.outCubic(M.prog(t, JOGA - 0.05, JOGA + 0.08)), desce = G.E.outCubic(M.prog(t, JOGA + 0.35, JOGA + 0.8));
      const festa = Math.abs(M.kick(t, B(29), 1, 2, 0.35));
      const braco = M.lerp(M.lerp(M.lerp(30, 70, arma), 140, solta), 30, desce) + 110 * festa;   // pra cima e pra fora
      const oc = t < B(29) ? 1 : M.lerp(1, 0.01, M.clamp(M.spring(t - B(29), 3, 0.7)));
      lamp.seek({ humor: 'feliz', oculos: oc, luz: t < SOBE ? 0.25 : t < B(29) ? 0.25 + 0.6 * nivel : 1,
        bracoE: [braco + 4 * Math.sin(t * 4), M.lerp(20, 30, Math.max(solta * (1 - desce), festa))], bracoD: [braco + 4 * Math.sin(t * 4 + 1), M.lerp(20, 30, Math.max(solta * (1 - desce), festa))] });
      // papéis pro alto: saem das mãos e passam do topo antes das datas
      folhas.forEach((f, i) => {
        const o = FOLHAS[i], tau = t - JOGA - o.atraso;
        if (tau < 0 || tau > 1.1) { f.style.visibility = 'hidden'; return; }
        const x = (o.mao ? 840 : 680) + o.vx * tau, y = 1100 + o.vy * tau + 2000 * tau * tau;
        f.style.visibility = 'visible';
        f.style.transform = `translate(${(x - 37).toFixed(1)}px, ${(y - 48).toFixed(1)}px) rotate(${(o.giro * tau).toFixed(1)}deg) rotateX(${(tau * 520).toFixed(1)}deg)`;
      });

      // assinatura
      G.palavrasSeek(H, t, B(28), { passo: 2 / 30 });
      G.poe(logo, G.entra(t, B(30), { dur: 0.5, de: 'baixo', dist: 70, blur: 14 }));
      G.palavrasSeek(festas, t, B(30.4));
    },
    som(S) {
      S.impact(B(16), 0.7);
      S.zip(B(17), 0.14, 0.08, true);
      S.swoosh(JOGA - 0.05, 0.5, 0.2, true);
      for (let i = 0; i < 4; i++) S.ruid({ t: JOGA + i * 0.0625, dur: 0.05, tipo: 'bandpass', f0: 3000 + i * 400, q: 1, ganho: 0.07 });
      S.pop(SOBE, 520, 0.24);
      S.swoosh(SOBE - 0.05, 0.3, 0.12, true);
      for (let k = 1; k < U; k++) S.tick(quandoDia(k), 0.07, 2200 + k * 70);
      S.impact(VOLTA, 0.8);
      S.ding(VOLTA, 2093, 0.13);
      S.ding(B(29), 1568, 0.12);
      S.pop(B(30), 900, 0.18);
      S.ding(B(34), 2637, 0.08);
      S.kick(B(39), 0.6);
      S.swoosh(B(39), 0.4, 0.16, false);
    },
  });
})();
