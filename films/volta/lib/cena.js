// Peças da volta (mesmo estilo adesivo do kit das férias: contorno navy grosso + borda branca larga):
// despertador, espreguiçadeira, cabo com plugue, lápis-batuta, carimbo de ✓ e o DESAMASSAR (o inverso do amasso).
(function () {
  const NAVY = '#002140', ROSA = '#f50953';
  const caixa = (pai, x, y, w, h, vb) => {
    const d = Z.div(pai, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
    const s = T.svg(d, w, h, { width: w + 'px', height: h + 'px' });
    s.setAttribute('viewBox', vb);
    return { d, s };
  };
  // desenha o mesmo caminho duas vezes: borda branca larga embaixo, contorno navy em cima
  const adesivo = (s, tag, attrs, fill = '#fff', larg = 5) => {
    T.el(s, tag, Object.assign({}, attrs, { fill: '#fff', stroke: '#fff', 'stroke-width': larg + 12, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    return T.el(s, tag, Object.assign({}, attrs, { fill, stroke: NAVY, 'stroke-width': larg, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  };

  // despertador de dois sinos marcando 8h (viewBox 0 0 140 150)
  T.despertador = (pai, { x = 0, y = 0, tam = 180 } = {}) => {
    const { d, s } = caixa(pai, x, y, tam, tam * 150 / 140, '-10 -10 160 170');
    d.style.transformOrigin = '50% 60%';
    const sinos = T.el(s, 'g', {});
    adesivo(sinos, 'path', { d: 'M14 42 A26 26 0 0 1 50 10 Z' }, ROSA);
    adesivo(sinos, 'path', { d: 'M126 42 A26 26 0 0 0 90 10 Z' }, ROSA);
    adesivo(s, 'path', { d: 'M34 128 L24 142 M106 128 L116 142' }, 'none', 6);
    adesivo(s, 'circle', { cx: 70, cy: 82, r: 52 });
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * Math.PI * 2;
      T.el(s, 'line', { x1: 70 + Math.sin(a) * 42, y1: 82 - Math.cos(a) * 42, x2: 70 + Math.sin(a) * (k % 3 ? 45 : 38), y2: 82 - Math.cos(a) * (k % 3 ? 45 : 38), stroke: NAVY, 'stroke-width': k % 3 ? 2.5 : 4, 'stroke-linecap': 'round' });
    }
    T.el(s, 'line', { x1: 70, y1: 82, x2: 70, y2: 46, stroke: NAVY, 'stroke-width': 5, 'stroke-linecap': 'round' });                 // minutos: 12
    T.el(s, 'line', { x1: 70, y1: 82, x2: 70 - Math.sin(Math.PI / 3) * 26, y2: 82 + Math.cos(Math.PI / 3) * 26, stroke: NAVY, 'stroke-width': 6, 'stroke-linecap': 'round' }); // horas: 8
    T.el(s, 'circle', { cx: 70, cy: 82, r: 5, fill: ROSA });
    return { el: d, sinos };
  };

  // espreguiçadeira vista de lado, lona listrada (viewBox 0 0 300 200)
  T.espreguicadeira = (pai, { x = 0, y = 0, larg = 420 } = {}) => {
    const { d, s } = caixa(pai, x, y, larg, larg * 200 / 300, '-12 -12 324 224');
    adesivo(s, 'path', { d: 'M40 190 L120 110 M150 190 L90 128 M250 190 L230 130 M60 190 L250 190' }, 'none', 7);
    const lona = 'M18 30 L60 22 L128 122 L270 122 L270 140 L118 140 Z';
    adesivo(s, 'path', { d: lona }, '#fff', 6);
    for (const k of [0, 1, 2]) T.el(s, 'path', { d: `M${28 + k * 26} ${44 + k * 34} L${44 + k * 26} ${41 + k * 34} L${58 + k * 26} ${60 + k * 34} L${42 + k * 26} ${64 + k * 34} Z`, fill: ROSA, opacity: 0.9 });
    for (const k of [0, 1, 2, 3]) T.el(s, 'rect', { x: 150 + k * 32, y: 124, width: 14, height: 14, fill: ROSA, opacity: 0.9 });
    return { el: d };
  };

  // cabo: caminho livre (navy grosso com borda branca) + plugue na ponta
  T.cabo = (pai) => {
    const s = T.svg(pai, Z.W, Z.H, { left: '0px', top: '0px' });
    const borda = T.el(s, 'path', { fill: 'none', stroke: '#fff', 'stroke-width': 26, 'stroke-linecap': 'round' });
    const linha = T.el(s, 'path', { fill: 'none', stroke: NAVY, 'stroke-width': 12, 'stroke-linecap': 'round' });
    const plug = T.el(s, 'g', {});
    adesivo(plug, 'rect', { x: -24, y: -20, width: 48, height: 40, rx: 8 }, '#fff', 5);
    T.el(plug, 'rect', { x: 24, y: -12, width: 16, height: 6, rx: 2, fill: NAVY });
    T.el(plug, 'rect', { x: 24, y: 6, width: 16, height: 6, rx: 2, fill: NAVY });
    return {
      seek(d, px, py, ang) {
        borda.setAttribute('d', d); linha.setAttribute('d', d);
        plug.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      },
    };
  };

  // lápis (batuta): corpo branco, cinta rosa, ponta navy (viewBox 0 0 40 240, eixo vertical, ponta pra cima)
  T.lapis = (pai, { tam = 230 } = {}) => {
    const { d, s } = caixa(pai, 0, 0, tam * 40 / 240, tam, '-10 -10 60 260');
    adesivo(s, 'path', { d: 'M8 60 L32 60 L32 226 L8 226 Z' }, '#fff', 4);
    T.el(s, 'rect', { x: 8, y: 196, width: 24, height: 16, fill: ROSA });
    adesivo(s, 'path', { d: 'M8 60 L20 10 L32 60 Z' }, '#f5f3f0', 4);
    T.el(s, 'path', { d: 'M15.5 28 L20 10 L24.5 28 Z', fill: NAVY });
    d.style.transformOrigin = '50% 92%';
    return d;
  };

  // carimbo de ✓: disco rosa com borda navy e check branco
  T.carimbo = (pai, { tam = 120 } = {}) => {
    const { d, s } = caixa(pai, 0, 0, tam, tam, '-14 -14 128 128');
    adesivo(s, 'circle', { cx: 50, cy: 50, r: 46 }, ROSA, 5);
    T.el(s, 'path', { d: 'M28 52 L44 68 L74 34', fill: 'none', stroke: '#fff', 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    return d;
  };

  // DESAMASSAR: o elemento (uma folha) nasce bolinha e abre; os vincos ficam de leve (papel que já foi amassado)
  T.desamassavel = (pai, folha, { w, h, semente = 5 } = {}) => {
    const r = M.mulberry32(semente);
    const vinco = T.svg(folha, w, h, { left: '0px', top: '0px', zIndex: 60, pointerEvents: 'none' });
    for (let i = 0; i < 18; i++) {
      const a = r() * Math.PI * 2, l = 200 + r() * 600, cx = w / 2 + (r() - 0.5) * w * 0.8, cy = h / 2 + (r() - 0.5) * h * 0.8;
      T.el(vinco, 'path', { d: `M${cx - Math.cos(a) * l / 2} ${cy - Math.sin(a) * l / 2}L${cx + (r() - 0.5) * 120} ${cy + (r() - 0.5) * 120}L${cx + Math.cos(a) * l / 2} ${cy + Math.sin(a) * l / 2}`,
        fill: 'none', stroke: NAVY, 'stroke-width': 4, 'stroke-linejoin': 'round', opacity: 0.5 });
    }
    const ruido = Array.from({ length: 30 }, () => r());
    return {
      // p: 0 = bolinha, 1 = folha aberta
      seek(p) {
        const e = M.clamp(p);
        const s = M.lerp(0.3, 1, e), jag = 0.36 * (1 - e), rr = M.lerp(0.95, 1.25, e) * Math.max(w, h) * 0.5;   // bolinha inicial ~300 px
        const pts = ruido.map((n, i) => {
          const a = (i / ruido.length) * Math.PI * 2, R = rr * (1 - jag * n);
          return `${(w / 2 + Math.cos(a) * R).toFixed(1)}px ${(h / 2 + Math.sin(a) * R).toFixed(1)}px`;
        });
        folha.style.clipPath = e >= 0.999 ? 'none' : `polygon(${pts.join(',')})`;
        folha.style.transform = `rotate(${(-24 * (1 - e)).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        vinco.style.opacity = M.lerp(1, 0.13, e).toFixed(3);   // papel aberto: vinco só de leve, não atrapalha a leitura
      },
    };
  };
})();
