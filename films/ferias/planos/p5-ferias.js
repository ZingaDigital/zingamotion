// P5 · Virada · 8,36 a 10,0 s · P6 · Datas · 10,0 a 14,0 s · P7 · Assinatura · 14,0 a 20,0 s. Tema rosa.
// Uma composição que se reorganiza: "Estamos de férias." entra grande e sobe pro topo (morph), a bateria pequena
// vira a barra entre "18 DEZ" e "04 JAN" e carrega dia a dia na grade de semicolcheias. O fim é o quadro fixado.
(() => {
  const B = (n) => Z.b(n);
  const T0 = G.TROCA;
  const SOBE = B(20);                                  // o título sobe e as datas entram
  const DIAS = [...Array.from({ length: 14 }, (_, i) => `${18 + i} DEZ`), '01 JAN', '02 JAN', '03 JAN', '04 JAN'];
  const quandoDia = (k) => (k === 0 ? SOBE : B(20.75) + 0.125 * k);   // 19 DEZ em b21 ... 04 JAN em b25
  const VOLTA = quandoDia(17);
  const BAR = [
    [0, { x: 72, y: 1210, w: 300, h: 140, r: 32 }],
    [SOBE, { x: 72, y: 800, w: 830, h: 104, r: 30 }],
  ];
  let tampa, linhas = [], cab, est, fer, letras = [], bat, polo, fill, raio, dia, sai1, d1, cap1, sai2, d2, cap2, H, lamp, lampG, logo, festas;

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
      cab = Z.div(el, { left: '72px', top: '246px', transformOrigin: '0px 0px' });
      est = G.texto(cab, [['Estamos de']], { x: 2, y: 0, tam: 64, peso: 600 });
      fer = Z.div(cab, { left: '-6px', top: '58px', fontSize: '232px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.015em',
        color: G.COR.navy, whiteSpace: 'nowrap' });
      for (const ch of 'férias.') { const s = document.createElement('span'); s.className = 'w'; s.textContent = ch; fer.append(s); letras.push(s); }

      [sai1, d1, cap1] = bloco(el, 548, 'SAÍMOS EM', '18 DEZ', 'sexta', '2026');
      [sai2, d2, cap2] = bloco(el, 946, 'VOLTAMOS EM', '04 JAN', 'segunda', '2027');

      bat = Z.div(el, { boxSizing: 'border-box', border: '9px solid #fff', overflow: 'hidden' });
      polo = Z.div(el, { background: '#fff' });
      fill = Z.div(bat, { background: G.COR.navy });
      raio = Z.div(bat, { right: '18px', top: '0px', bottom: '0px', display: 'flex', alignItems: 'center' });
      raio.innerHTML = G.glifo('raio', '#fff', 64);
      dia = Z.div(bat, { top: '0px', bottom: '0px', display: 'flex', alignItems: 'center', fontSize: '44px', fontWeight: 700,
        color: '#fff', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' });

      H = G.texto(el, [['Voltamos com a bateria cheia'], [['e ideias novas.', { cor: G.COR.navy }]]], { x: 72, y: 1182, tam: 54, peso: 600, lh: 1.12 });
      lamp = G.tile(el, 'lampada', { x: 808, y: 1180, tam: 124, fundo: 'navy' });
      lampG = lamp.querySelector('path');
      logo = Z.div(el, { left: '66px', top: '1352px' });
      logo.innerHTML = G.logo('#ffffff', G.COR.navy, 236);
      festas = G.texto(el, [['Boas festas!']], { x: 360, y: 1372, tam: 48, peso: 600 });
      // linhas da composição, na ordem de leitura: saem em escadinha no loop
      for (const grupo of [[cab], [sai1, d1.box, cap1.box], [bat, polo], [sai2, d2.box, cap2.box], [H.box, lamp], [logo, festas.box]]) {
        const l = Z.div(el, { inset: '0px' }); for (const n of grupo) l.append(n); linhas.push(l);
      }
    },
    seek(t, el) {
      // loop: o rosa vira um quadrado que encolhe até o 1º dia da grade de 2026 (141, 720, 34 px)
      const pl = G.E.morph(M.prog(t, G.LOOP + 0.14, G.LOOP + 0.48));
      Z.poeEstado(tampa, { x: M.lerp(-40, 141, pl), y: M.lerp(-40, 720, pl), w: M.lerp(Z.W + 80, 34, pl), h: M.lerp(Z.H + 80, 34, pl), r: M.lerp(0, 9, pl) });
      Z.mostra(tampa, t >= G.LOOP, 'block');
      tampa.style.zIndex = '0';
      linhas.forEach((l, i) => G.poe(l, G.sai(t, G.LOOP - 0.06 + i * 1 / 30, { para: 'cima', dist: 900, dur: 0.22 })));
      const respira = 1 + 0.008 * Math.sin((t - T0) * 1.6);
      el.style.transform = `translate(0px, ${M.kick(t, VOLTA, 16, 4, 0.35).toFixed(2)}px) scale(${respira.toFixed(4)})`;

      // título: nasce grande no meio, sobe pro topo na batida 20 (morph do contêiner)
      const m = M.spring(t - SOBE, 2.1, 0.7);
      const k = M.lerp(1.3, 1, m), dy = M.lerp(400, 0, m);
      cab.style.transform = `translate(0px, ${dy.toFixed(2)}px) scale(${k.toFixed(4)})`;
      G.palavrasSeek(est, t, T0 + 0.02, { de: 'baixo', dist: 60 });
      letras.forEach((s, i) => {
        const ti = T0 + 0.1 + i * 2 / 30;
        const a = G.entra(t, ti, { dur: 0.42, de: 'baixo', dist: 160, s0: 1.35, blur: 18, mola: 2.8 });
        G.poe(s, G.soma(a, { y: -M.kick(t, B(36), 10, 3, 0.4) }));
      });

      // bateria pequena carregando -> barra do período
      const s = Z.estado(t, BAR, { freq: 2.3, zeta: 0.68 });
      Z.poeEstado(bat, s);
      const ph = s.h * 0.4, pw = 18;
      Object.assign(polo.style, { left: (s.x + s.w + 3).toFixed(2) + 'px', top: (s.y + s.h / 2 - ph / 2).toFixed(2) + 'px',
        width: pw + 'px', height: ph.toFixed(2) + 'px', borderRadius: '0 10px 10px 0' });
      const nasce = G.entra(t, B(18), { dur: 0.4, de: 'baixo', dist: 120, blur: 12, mola: 2.6 });
      G.poe(bat, nasce); G.poe(polo, nasce);
      let kd = -1;
      for (let i = 0; i < DIAS.length; i++) if (t >= quandoDia(i)) kd = i;
      const alvo = kd <= 0 ? 0.03 : kd / 17;
      const ant = kd <= 1 ? 0.03 : (kd - 1) / 17;
      const nivel = kd < 1 ? 0.03 : M.lerp(ant, alvo, M.spring(t - quandoDia(kd), 6, 0.6));
      const pad = 9, interno = s.w - 18 - 2 * pad;
      Object.assign(fill.style, { left: pad + 'px', top: pad + 'px', bottom: pad + 'px', width: Math.max(10, interno * nivel).toFixed(2) + 'px',
        borderRadius: '18px' });
      const pisca = t < SOBE ? (Math.floor((t - T0) * 4) % 2 ? 1 : 0.35) : (kd >= 17 ? 1 : 0.55);
      raio.style.opacity = pisca;
      // em b34 a barra cheia troca a data por 100%
      dia.textContent = t >= B(34) ? '100%' : kd >= 0 ? DIAS[kd] : '';
      const dx = M.clamp(pad + interno * nivel - 190, pad + 20, interno - 300);
      dia.style.left = dx.toFixed(1) + 'px';
      G.poe(dia, G.soma(G.entra(t, SOBE + 0.2, { dur: 0.3, dist: 20, blur: 8 }), { s: 1 + M.kick(t, quandoDia(Math.max(kd, 0)), 0.06, 5, 0.5) + M.kick(t, B(34), 0.12, 4, 0.45) }));

      // datas: 18 DEZ entra da esquerda na batida 20; 04 JAN cai de cima quando a barra enche (b25)
      G.poe(sai1, G.entra(t, SOBE + 0.06, { de: 'esq', dist: 200 }));
      G.palavrasSeek(d1, t, SOBE + 0.1, { de: 'esq', dist: 260, mola: 2.6, passo: 3 / 30 });
      G.palavrasSeek(cap1, t, SOBE + 0.3, { dist: 30 });
      G.poe(sai2, G.entra(t, VOLTA - 0.1, { de: 'cima', dist: 80 }));
      G.palavrasSeek(d2, t, VOLTA - 0.06, { de: 'cima', dist: 200, s0: 1.25, mola: 3, blur: 18, passo: 2 / 30 });
      G.palavrasSeek(cap2, t, VOLTA + 0.2, { dist: 30 });

      // assinatura
      G.palavrasSeek(H, t, B(28), { passo: 2 / 30 });
      G.poe(lamp, G.soma(G.entra(t, B(28) + 0.3, { dur: 0.4, s0: 0.5, dist: 0, mola: 3 }), { s: 1 + M.kick(t, B(29), 0.18, 4, 0.4) }));
      lampG.setAttribute('fill', t >= B(29) ? '#ffffff' : '#2e4a6b');
      G.poe(logo, G.entra(t, B(30), { dur: 0.5, de: 'baixo', dist: 70, blur: 14 }));
      G.palavrasSeek(festas, t, B(30.4));
    },
    som(S) {
      S.impact(T0 - 0.36, 0.7);
      S.swoosh(T0 - 0.36, 0.36, 0.22, true);
      S.zip(B(18), 0.14, 0.08, true);
      S.pop(SOBE, 520, 0.24);
      S.swoosh(SOBE - 0.05, 0.3, 0.12, true);
      for (let k = 1; k < 17; k++) S.tick(quandoDia(k), 0.07, 2200 + k * 70);
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
