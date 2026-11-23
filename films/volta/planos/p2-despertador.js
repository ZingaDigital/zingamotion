// P2 · Despertador · 3,1 a 6,0 s (b6 a b12). Ainda é férias (rosa): a lâmpada dorme na espreguiçadeira, de óculos.
// O despertador toca em b8 (8h); em b9 ela pula, os óculos voam, o olho abre. "Bom dia, 2027." Corte seco em b12.
(() => {
  const B = (n) => Z.b(n);
  const TOCA = B(8), PULA = B(9), TEXTO = B(9.5);
  const LX = 250, LY = 950, LT = 270;                  // lâmpada deitada na espreguiçadeira (base no assento)
  let cadeira, lamp, rel, aneis = [], oc, T2, rab;

  Z.plano({
    id: 'p2', inicio: B(6), fim: B(12), z: 2,
    montar(el) {
      rab = T.rabiscos(el, [
        { f: 'sol', x: 930, y: 300, s: 1 }, { f: 'onda', x: 300, y: 1720, s: 1.2 }, { f: 'onda', x: 760, y: 1790, s: 0.9 },
        { f: 'estrela', x: 120, y: 620, s: 0.5 },
      ], { cor: '#ffffff', op: 0.4, semente: 71 });
      T2 = G.texto(el, [['Bom dia, '], [['2027.', { cor: G.COR.navy }]]], { x: 72, y: 330, tam: 132, peso: 900, lh: 1, ls: '-0.015em' });
      cadeira = T.espreguicadeira(el, { x: 40, y: 1040, larg: 640 });
      rel = T.despertador(el, { x: 740, y: 1110, tam: 230 });
      const s = T.svg(el, Z.W, Z.H, { left: '0px', top: '0px' });
      for (let k = 0; k < 3; k++) {
        const r = 150 + k * 34;
        aneis.push(T.el(s, 'path', { d: `M${855 - r * 0.6} ${1230 - r * 0.8} A${r} ${r} 0 0 1 ${855 + r * 0.6} ${1230 - r * 0.8}`, fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      }
      lamp = T.lampada(el, { x: LX, y: LY, tam: LT });
      // óculos que voam (cópia solta dos óculos do rosto)
      oc = Z.div(el, { left: '0px', top: '0px', width: '150px', height: '60px' });
      const so = T.svg(oc, 150, 60, { width: '150px', height: '60px' });
      so.setAttribute('viewBox', '48 86 104 34');
      T.el(so, 'path', { d: 'M52 90 h40 a4 4 0 0 1 4 4 q0 22 -22 22 q-24 0 -26 -22 a4 4 0 0 1 4 -4 Z', fill: G.COR.navy });
      T.el(so, 'path', { d: 'M108 90 h40 a4 4 0 0 1 4 4 q-2 22 -26 22 q-22 0 -22 -22 a4 4 0 0 1 4 -4 Z', fill: G.COR.navy });
      T.el(so, 'path', { d: 'M92 96 Q100 90 108 96', fill: 'none', stroke: G.COR.navy, 'stroke-width': 6, 'stroke-linecap': 'round' });
    },
    seek(t, el) {
      rab.seek(t);
      el.style.transform = `translate(${M.wiggle(t, 9, 6 * M.prog(t, TOCA, TOCA + 0.1) * (1 - M.prog(t, PULA, PULA + 0.3)), 5).toFixed(2)}px, 0px)`;
      // lâmpada: deitada (girada) respirando; no pulo endireita com mola e sobe
      const pp = M.clamp(M.spring(t - PULA, 2.6, 0.55), 0, 1.15);
      const hop = Math.max(0, Math.sin(Math.PI * M.prog(t, PULA, PULA + 0.45))) * 260;
      const resp = t < PULA ? Math.sin(t * 2.4) * 0.02 : 0;
      G.poe(lamp.el, G.soma(G.entra(t, B(6) + 0.12, { dur: 0.4, de: 'baixo', dist: 200, blur: 4, mola: 2.6 }),
        { r: M.lerp(-66, 0, pp), x: M.lerp(0, 90, pp), y: M.lerp(0, -220, pp) - hop, sy: 1 + resp }));
      const acordada = t >= PULA;
      lamp.seek({ humor: acordada ? 'acordada' : 'feliz', oculos: acordada ? 0 : 1, luz: acordada ? 0.35 : 0.15,
        bracoE: acordada ? [150 + 10 * Math.sin(t * 9), 25] : [40, 50], bracoD: acordada ? [150 + 10 * Math.sin(t * 9 + 1), 25] : [40, 50] });
      // óculos voando em arco, girando, saindo pelo topo
      const pv = M.prog(t, PULA, PULA + 0.9);
      const v = M.hop(pv, 370, 930, 980, -200, 520);
      oc.style.visibility = acordada && pv < 1 ? 'visible' : 'hidden';
      oc.style.transform = `translate(${v.x - 75}px, ${v.y - 30}px) rotate(${(pv * 720).toFixed(1)}deg)`;
      // despertador: treme forte enquanto toca; anéis de som piscando a cada semicolcheia
      const toca = t >= TOCA && t < PULA + 0.25;
      const tr = toca ? Math.sin(t * 95) * 11 : M.kick(t, PULA + 0.25, 6, 4, 0.4);
      G.poe(rel.el, G.soma(G.entra(t, B(6) + 0.2, { dur: 0.4, de: 'dir', dist: 300, blur: 6, mola: 2.6 }), { r: tr, y: toca ? -Math.abs(Math.sin(t * 47)) * 10 : 0 }));
      aneis.forEach((a, k) => { a.style.display = toca && (Math.floor(t * 16) + k) % 2 === 0 ? '' : 'none'; });
      G.poe(cadeira.el, G.entra(t, B(6) + 0.05, { dur: 0.45, de: 'baixo', dist: 300, blur: 6, mola: 2.4 }));
      G.palavrasSeek(T2, t, TEXTO, { passo: 3 / 30, dist: 90, s0: 1.2, mola: 2.8 });
    },
    som(S) {
      for (let k = 0; k < 8; k++) S.osc({ t: TOCA + k * 0.0625, tipo: 'square', f0: k % 2 ? 2300 : 1900, dur: 0.05, ganho: 0.08 });
      S.boing(PULA, 260, 820, 0.22);
      S.swoosh(PULA, 0.5, 0.16, true);
      S.pop(TEXTO, 700, 0.18);
    },
  });
})();
