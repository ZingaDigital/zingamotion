// P5 · Mensagem · 15,2 a 19,0 s (b30,4 a b38) e Chamada · 19,0 a 21,0 s (b38 a b42). Rosa.
// Espelho do quadro final das férias: "Estamos de volta." grande com ecos vazados, sobe em b32; "SEGUNDA 04 JAN 2027",
// a barra cheia e "Novas ideias. Bateria cheia." Segura pra leitura (quadro de capa). Em b38 tudo sai em escadinha e
// entra "Prontos para atender." com a lâmpada comemorando. Corte seco pro logo em b42.
(() => {
  const B = (n) => Z.b(n);
  const T0 = B(30.4), SOBE = B(32), CHAMA = B(38);
  let cab, est, eco, letras = [], over, data, cap, bar, polo, fill, rot100, txt, lamp, rab, linhas = [], P;

  Z.plano({
    id: 'p5', inicio: T0, fim: B(42), z: 5,
    montar(el) {
      rab = T.rabiscos(el, [
        { f: 'sol', x: 945, y: 330, s: 0.9 }, { f: 'onda', x: 560, y: 1700, s: 1.3 }, { f: 'estrela', x: 990, y: 1580, s: 0.5, r: 10 },
        { f: 'espiral', x: 120, y: 1640, s: 0.55 },
      ], { cor: '#ffffff', op: 0.4, semente: 101 });
      cab = Z.div(el, { left: '72px', top: '246px', transformOrigin: '0px 0px' });
      est = G.texto(cab, [['Estamos de']], { x: 2, y: 0, tam: 64, peso: 600 });
      eco = T.eco(cab, 'volta.', { x: -6, y: 58, tam: 232, cor: '#ffffff', op: 0.6, copias: 3, passo: -0.26, traco: 3 });
      const fer = Z.div(cab, { left: '-6px', top: '58px', fontSize: '232px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: G.COR.navy, whiteSpace: 'nowrap' });
      for (const ch of 'volta.') { const s = document.createElement('span'); s.className = 'w'; s.textContent = ch; fer.append(s); letras.push(s); }
      over = Z.div(el, { left: '74px', top: '548px', fontSize: '40px', fontWeight: 600, letterSpacing: '0.16em', color: G.COR.navy });
      over.textContent = 'SEGUNDA';
      data = G.texto(el, [['04 JAN']], { x: 62, y: 584, tam: 178, peso: 900, lh: 1, ls: '-0.015em' });
      cap = G.texto(el, [[['2027', { cor: G.COR.navy }]]], { x: 690, y: 654, tam: 48, peso: 600 });
      bar = Z.div(el, { left: '72px', top: '800px', width: '830px', height: '104px', boxSizing: 'border-box', border: '9px solid #fff', borderRadius: '30px', overflow: 'hidden' });
      polo = Z.div(el, { left: '905px', top: '831px', width: '18px', height: '42px', background: '#fff', borderRadius: '0 10px 10px 0' });
      fill = Z.div(bar, { left: '9px', top: '9px', bottom: '9px', background: G.COR.navy, borderRadius: '18px' });
      rot100 = Z.div(bar, { left: '0px', right: '28px', top: '0px', bottom: '0px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '18px', fontSize: '44px', fontWeight: 700, color: '#fff' });
      rot100.innerHTML = '<span>100%</span>' + G.glifo('raio', '#fff', 60);
      txt = G.texto(el, [['Novas ideias.'], [['Bateria cheia.', { cor: G.COR.navy }]]], { x: 72, y: 980, tam: 72, peso: 700, lh: 1.08 });
      lamp = T.lampada(el, { x: 770, y: 1120, tam: 200 });
      for (const grupo of [[cab], [over, data.box, cap.box], [bar, polo], [txt.box]]) {
        const l = Z.div(el, { inset: '0px' }); for (const n of grupo) l.append(n); linhas.push(l);
      }
      P = G.texto(el, [['Prontos'], [['para atender.', { cor: G.COR.navy }]]], { x: 64, y: 560, tam: 150, peso: 900, lh: 1.0, ls: '-0.015em' });
    },
    seek(t, el) {
      rab.seek(t);
      el.style.transform = `scale(${(1 + 0.008 * Math.sin((t - T0) * 1.6)).toFixed(4)})`;
      const m = M.spring(t - SOBE, 2.1, 0.7);
      cab.style.transform = `translate(0px, ${M.lerp(400, 0, m).toFixed(2)}px) scale(${M.lerp(1.3, 1, m).toFixed(4)})`;
      G.palavrasSeek(est, t, T0 + 0.02, { de: 'baixo', dist: 60 });
      eco.seek(t, T0 + 0.42, SOBE - 0.1);
      letras.forEach((s, i) => G.poe(s, G.entra(t, T0 + 0.1 + i * 2 / 30, { dur: 0.42, de: 'baixo', dist: 160, s0: 1.35, blur: 18, mola: 2.8 })));
      G.poe(over, G.entra(t, SOBE + 0.06, { de: 'esq', dist: 200 }));
      G.palavrasSeek(data, t, SOBE + 0.1, { de: 'esq', dist: 260, mola: 2.6 });
      G.palavrasSeek(cap, t, SOBE + 0.3, { dist: 30 });
      const pb = G.E.outCubic(M.prog(t, B(33), B(33) + 0.5));
      fill.style.width = (812 * pb - 18).toFixed(1) + 'px';
      const nb = G.entra(t, B(33) - 0.15, { dur: 0.35, de: 'baixo', dist: 60, blur: 8 });
      G.poe(bar, nb); G.poe(polo, nb);
      G.poe(rot100, G.entra(t, B(33) + 0.45, { dur: 0.3, dist: 20, blur: 6 }));
      G.palavrasSeek(txt, t, B(34), { passo: 3 / 30 });
      // saída em escadinha na chamada
      linhas.forEach((l, i) => G.poe(l, G.sai(t, CHAMA + i * 2 / 30, { para: 'cima', dist: 900, dur: 0.3 })));
      G.palavrasSeek(P, t, CHAMA + 0.3, { passo: 3 / 30, dist: 120, s0: 1.25, mola: 2.8, blur: 16 });
      // lâmpada: entra acesa, de óculos na cabeça; na chamada pula pro centro e comemora
      const vai = M.clamp(M.spring(t - CHAMA - 0.1, 2.4, 0.65), 0, 1.1);
      const pulo = Math.abs(M.kick(t, B(39), 60, 3, 0.45)) + Math.abs(M.kick(t, B(41), 40, 3, 0.45));
      G.poe(lamp.el, G.soma(G.entra(t, B(31), { dur: 0.4, de: 'baixo', dist: 400, blur: 2, mola: 2.8 }),
        { x: M.lerp(0, -340, vai), y: M.lerp(0, 120, vai) - pulo, s: M.lerp(1, 1.35, vai), r: M.wiggle(t, 0.8, 3, 12) }));
      const festa = t >= CHAMA ? 150 + 14 * Math.sin(t * 8) : 30 + 8 * Math.sin(t * 3);
      lamp.seek({ humor: 'feliz', oculos: 0.01, luz: 1, bracoE: [festa, 25], bracoD: [festa, 25] });
    },
    som(S) {
      S.impact(B(30.5), 0.6);
      S.pop(SOBE, 520, 0.24); S.swoosh(SOBE - 0.05, 0.3, 0.12, true);
      S.zip(B(33), 0.5, 0.08, true); S.ding(B(34), 2093, 0.1);
      S.swoosh(CHAMA, 0.3, 0.18, false);
      S.impact(B(39), 0.5); S.ding(B(39), 1568, 0.12);   // no tempo forte: o grave não mascara o bumbo
    },
  });
})();
