// Kit de desenho finalizado: papel, rabisco de lápis que "ferve" (3 variações a 8 qps), eco de palavra vazada,
// folha que amassa e vira bolinha, a lâmpada personagem (estilo adesivo: contorno navy grosso + borda branca) e a
// lixeira. Tudo montado uma vez; seek só troca atributos em função de t.
(function () {
  const T = {};
  const NS = 'http://www.w3.org/2000/svg';
  const NAVY = '#002140', ROSA = '#f50953';
  T.svg = (pai, w, h, css = {}) => {
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', w); s.setAttribute('height', h); s.setAttribute('viewBox', `0 0 ${w} ${h}`);
    s.style.position = 'absolute'; s.style.overflow = 'visible';
    Object.assign(s.style, css);
    pai.append(s);
    return s;
  };
  T.el = (pai, tag, attrs = {}) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    pai.append(e);
    return e;
  };

  // ---------- papel de caderno pontilhado ----------
  T.papel = (pai, css = {}) => Z.div(pai, Object.assign({ inset: '0px', background: '#f5f3f0',
    backgroundImage: 'radial-gradient(circle, rgba(0,33,64,.16) 2.2px, transparent 2.6px)',
    backgroundSize: '54px 54px', backgroundPosition: '27px 27px' }, css));

  // ---------- traço tremido: polilinha -> curva suave, com tremor de semente ----------
  const tremido = (pts, semente, amp) => {
    const r = M.mulberry32(semente);
    const p = pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amp, y + (r() - 0.5) * 2 * amp]);
    if (p.length < 3) return `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}L${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)}`;
    let d = `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
    for (let i = 1; i < p.length - 1; i++) {
      const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2;
      d += `Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const u = p[p.length - 1];
    return d + `L${u[0].toFixed(1)} ${u[1].toFixed(1)}`;
  };
  // formas de rabisco, em coordenadas locais (~ -60..60)
  const FORMAS = {
    espiral: () => [Array.from({ length: 40 }, (_, i) => { const a = i * 0.32, r = 3 + i * 1.5; return [Math.cos(a) * r, Math.sin(a) * r]; })],
    estrela: () => [Array.from({ length: 11 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 22 : 54; return [Math.cos(a) * r, Math.sin(a) * r]; })],
    onda: () => [Array.from({ length: 22 }, (_, i) => [-90 + i * 8.5, Math.sin(i * 0.9) * 14])],
    seta: () => [Array.from({ length: 12 }, (_, i) => [-70 + i * 12, -Math.sin(i / 11 * Math.PI) * 30]), [[40, -18], [62, 0], [36, 14]]],
    xis: () => [[[-40, -40], [-10, -8], [40, 40]], [[40, -40], [8, -6], [-40, 40]]],
    sol: () => [Array.from({ length: 19 }, (_, i) => { const a = i / 18 * Math.PI * 2; return [Math.cos(a) * 30, Math.sin(a) * 30]; }),
      ...Array.from({ length: 8 }, (_, k) => { const a = k / 8 * Math.PI * 2; return [[Math.cos(a) * 42, Math.sin(a) * 42], [Math.cos(a) * 62, Math.sin(a) * 62]]; })],
    zz: () => [[[-50, -30], [-10, -30], [-50, 10], [-10, 10]], [[6, -4], [36, -4], [6, 26], [36, 26]]],
    circulo: () => [Array.from({ length: 22 }, (_, i) => { const a = i / 19 * Math.PI * 2 + 0.3; return [Math.cos(a) * 58, Math.sin(a) * 40]; })],
    risco: () => [[[-80, 0], [-40, -6], [0, 4], [40, -4], [80, 3]], [[-70, 18], [-20, 12], [30, 20], [76, 14]]],
    gota: () => [[[0, -40], [-18, -6], [-20, 12], [-10, 26], [8, 26], [18, 12], [16, -6], [0, -40]]],
  };
  // rabiscos: lista [{ f, x, y, s, r }]; seek(t) alterna 3 variações do traço a 8 qps (line boil)
  T.rabiscos = (pai, lista, { cor = NAVY, op = 0.22, larg = 5, semente = 1, w = Z.W, h = Z.H } = {}) => {
    const s = T.svg(pai, w, h, { left: '0px', top: '0px', opacity: op });
    const itens = lista.map((it, k) => {
      const g = T.el(s, 'g', { transform: `translate(${it.x} ${it.y}) rotate(${it.r || 0}) scale(${it.s || 1})` });
      const tracos = FORMAS[it.f]();
      const paths = tracos.map(() => T.el(g, 'path', { fill: 'none', stroke: it.cor || cor, 'stroke-width': larg / (it.s || 1),
        'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
      const sk = it.semente ?? k;                         // cópias de pattern repetem a semente do original (sem emenda)
      const variantes = [0, 1, 2].map((v) => tracos.map((pts) => tremido(pts, semente * 1000 + sk * 37 + v * 7919, 2.6)));
      return { g, paths, variantes };
    });
    return {
      svg: s,
      seek(t) {
        const v = ((Math.floor((Z.T_REAL ?? t) * 8) % 3) + 3) % 3;   // ferve no tempo real (continua nas pausas de leitura)   // t pode ser negativo (plano rodando por baixo da emenda do loop)
        for (const it of itens) it.paths.forEach((p, i) => p.setAttribute('d', it.variantes[v][i]));
      },
    };
  };

  // ---------- eco: palavra gigante vazada repetida em escadinha (gramática da referência) ----------
  T.eco = (pai, texto, { x = 0, y = 0, tam = 400, cor = NAVY, op = 0.14, copias = 4, passo = 0.2, traco = 3 } = {}) => {
    const els = [];
    for (let i = 0; i < copias; i++) {
      const d = Z.div(pai, { left: x + 'px', top: y + 'px', fontSize: tam + 'px', fontWeight: 900, lineHeight: 1,
        letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: 'transparent', webkitTextStroke: `${traco}px ${cor}`, opacity: op });
      d.textContent = texto;
      els.push(d);
    }
    return {
      els,
      // entra em escadinha: cada cópia sobe de trás da anterior; deriva lenta enquanto fica
      seek(t, t0, tSai = 1e9) {
        els.forEach((d, i) => {
          const e = G.E.outCubic(M.prog(t, t0 + i * 0.07, t0 + i * 0.07 + 0.5));
          const s = G.E.inExp(M.prog(t, tSai + i * 0.04, tSai + i * 0.04 + 0.35));
          const dy = -i * passo * tam * e * (1 - s) + Math.sin(t * 1.2 + i) * 4;
          d.style.transform = `translate(${(-(t - t0) * 6).toFixed(2)}px, ${dy.toFixed(2)}px)`;
          d.style.visibility = t >= t0 && s < 1 ? 'visible' : 'hidden';
        });
      },
    };
  };

  // ---------- folha que amassa e vira bolinha arremessada ----------
  // folha: elemento de tela cheia (0..W, 0..H). Cria por cima dele os vincos e, fora dele, a bolinha.
  T.amassavel = (pai, folha, semente = 3) => {
    const r = M.mulberry32(semente);
    const vinco = T.svg(folha, Z.W, Z.H, { left: '0px', top: '0px', zIndex: 60, pointerEvents: 'none' });
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, l = 300 + r() * 700, cx = 540 + (r() - 0.5) * 700, cy = 960 + (r() - 0.5) * 1200;
      T.el(vinco, 'path', { d: `M${cx - Math.cos(a) * l / 2} ${cy - Math.sin(a) * l / 2}L${cx + (r() - 0.5) * 160} ${cy + (r() - 0.5) * 160}L${cx + Math.cos(a) * l / 2} ${cy + Math.sin(a) * l / 2}`,
        fill: 'none', stroke: NAVY, 'stroke-width': 7, 'stroke-linejoin': 'round', opacity: 0.55 });
    }
    const bola = T.bola(pai, 220, semente + 1);
    const ruido = Array.from({ length: 30 }, () => r());
    return {
      // t0: começa a amassar; dur: até virar bolinha; voo: { dur, x1, y1, h, giro } a partir do fim do amasso
      seek(t, t0, { dur = 0.32, cx = 540, cy = 960, voo = { dur: 0.4, x1: -300, y1: 300, h: 300, giro: -400 } } = {}) {
        const p = M.prog(t, t0, t0 + dur), e = M.bezier(0.55, 0, 0.9, 0.6)(p);
        if (t < t0) {
          folha.style.clipPath = 'none'; folha.style.transform = 'none'; folha.style.visibility = 'visible';
          vinco.style.opacity = 0; bola.style.visibility = 'hidden';
          return;
        }
        const s = M.lerp(1, 0.105, e), jag = 0.38 * Math.min(1, e * 1.6), r0 = M.lerp(1180, 640, Math.min(1, e * 1.3));
        const pts = ruido.map((n, i) => {
          const a = (i / ruido.length) * Math.PI * 2, rr = r0 * (1 - jag * n);
          return `${(cx + Math.cos(a) * rr).toFixed(1)}px ${(cy + Math.sin(a) * rr).toFixed(1)}px`;
        });
        folha.style.transformOrigin = `${cx}px ${cy}px`;
        folha.style.clipPath = `polygon(${pts.join(',')})`;
        folha.style.transform = `rotate(${(-28 * e).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        folha.style.visibility = p < 1 ? 'visible' : 'hidden';
        vinco.style.opacity = M.clamp(e * 1.4).toFixed(3);
        // bolinha: troca no fim do amasso e voa em arco
        const pv = M.prog(t, t0 + dur, t0 + dur + voo.dur);
        const pos = M.hop(G.E.inExp(pv) * 0.5 + pv * 0.5, cx, cy, cx + voo.x1, cy + voo.y1, voo.h);
        bola.style.visibility = p >= 1 && pv < 1 ? 'visible' : 'hidden';
        bola.style.transform = `translate(${(pos.x - 110).toFixed(1)}px, ${(pos.y - 110).toFixed(1)}px) rotate(${(voo.giro * pv - 28).toFixed(1)}deg)`;
      },
    };
  };

  // ---------- bolinha de papel (adesivo) ----------
  T._nb = 0;
  T.bola = (pai, tam = 120, semente = 9) => {
    const r = M.mulberry32(semente);
    const d = Z.div(pai, { left: '0px', top: '0px', width: tam + 'px', height: tam + 'px', zIndex: 70 });
    const s = T.svg(d, 120, 120, { width: tam + 'px', height: tam + 'px' });
    s.setAttribute('viewBox', '-10 -10 140 140');
    const pts = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, rr = 46 + r() * 12; return `${(60 + Math.cos(a) * rr).toFixed(1)},${(60 + Math.sin(a) * rr).toFixed(1)}`; }).join(' ');
    T.el(s, 'polygon', { points: pts, fill: '#fff', stroke: '#fff', 'stroke-width': 16, 'stroke-linejoin': 'round' });
    T.el(s, 'polygon', { points: pts, fill: '#ffffff', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' });
    // vincos recortados por dentro do contorno (nenhum risco sai da bolinha)
    const cid = 'bolaClip' + (++T._nb);
    T.el(T.el(s, 'clipPath', { id: cid }), 'polygon', { points: pts });
    const vincos = T.el(s, 'g', { 'clip-path': `url(#${cid})` });
    for (let i = 0; i < 6; i++) {
      const x0 = 30 + r() * 60, y0 = 30 + r() * 60;
      T.el(vincos, 'path', { d: `M${x0} ${y0}l${(r() - 0.5) * 40} ${(r() - 0.5) * 40}l${(r() - 0.5) * 30} ${(r() - 0.5) * 30}`, fill: 'none', stroke: NAVY, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.7 });
    }
    d.style.visibility = 'hidden';
    return d;
  };

  // ---------- lixeira (adesivo) ----------
  T.lixeira = (pai, { x, y, tam = 170 } = {}) => {
    const d = Z.div(pai, { left: x + 'px', top: y + 'px', width: tam + 'px', height: tam * 1.15 + 'px' });
    const s = T.svg(d, 100, 115, { width: tam + 'px', height: tam * 1.15 + 'px' });
    s.setAttribute('viewBox', '-8 -8 116 131');
    const corpo = 'M12 22 L88 22 L80 112 L20 112 Z', tampa = 'M4 10 L96 10 L96 22 L4 22 Z';
    for (const [dd, fill] of [[corpo, '#ffffff'], [tampa, ROSA]]) T.el(s, 'path', { d: dd, fill: '#fff', stroke: '#fff', 'stroke-width': 16, 'stroke-linejoin': 'round' });
    T.el(s, 'path', { d: corpo, fill: '#ffffff', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' });
    T.el(s, 'path', { d: tampa, fill: ROSA, stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' });
    for (const lx of [36, 50, 64]) T.el(s, 'path', { d: `M${lx} 36 L${lx + (lx - 50) * 0.1} 98`, stroke: NAVY, 'stroke-width': 4, 'stroke-linecap': 'round' });
    return d;
  };

  // ---------- a lâmpada personagem ----------
  // caixa 240 x 320 (viewBox -20 -20 240 320). Partes: vidro, filamento, rostos (cansada, feliz), óculos, braços.
  T.lampada = (pai, { x = 0, y = 0, tam = 240 } = {}) => {
    const d = Z.div(pai, { left: x + 'px', top: y + 'px', width: tam + 'px', height: tam * 4 / 3 + 'px', transformOrigin: '50% 90%' });
    const s = T.svg(d, 240, 320, { width: tam + 'px', height: tam * 4 / 3 + 'px' });
    s.setAttribute('viewBox', '-20 -20 240 320');
    const VIDRO = 'M100 8 C46 8 12 50 12 102 C12 140 34 160 52 180 C58 187 60 192 60 200 L140 200 C140 192 142 187 148 180 C166 160 188 140 188 102 C188 50 154 8 100 8 Z';
    const ROSCA = ['M62 200 h76 a6 6 0 0 1 6 6 v8 a6 6 0 0 1 -6 6 h-76 a6 6 0 0 1 -6 -6 v-8 a6 6 0 0 1 6 -6 Z',
      'M66 220 h68 a6 6 0 0 1 6 6 v6 a6 6 0 0 1 -6 6 h-68 a6 6 0 0 1 -6 -6 v-6 a6 6 0 0 1 6 -6 Z',
      'M74 238 h52 l-8 18 h-36 Z'];
    const BRACO = (lado) => {
      const sx = lado < 0 ? 26 : 174, g = T.el(s, 'g', {});
      const contorno = T.el(g, 'path', { d: '', fill: 'none', stroke: '#fff', 'stroke-width': 26, 'stroke-linecap': 'round' });
      const linha = T.el(g, 'path', { d: '', fill: 'none', stroke: NAVY, 'stroke-width': 8, 'stroke-linecap': 'round' });
      const mb = T.el(g, 'circle', { r: 20, fill: '#fff' });
      const mao = T.el(g, 'circle', { r: 13, fill: '#fff', stroke: NAVY, 'stroke-width': 6 });
      return { g, contorno, linha, mao, mb, sx, sy: 140, lado };
    };
    // braços atrás do corpo (saem dos lados do vidro)
    const bE = BRACO(-1), bD = BRACO(1);
    const borda = T.el(s, 'g', {});
    T.el(borda, 'path', { d: VIDRO, fill: '#fff', stroke: '#fff', 'stroke-width': 26, 'stroke-linejoin': 'round' });
    for (const r of ROSCA) T.el(borda, 'path', { d: r, fill: '#fff', stroke: '#fff', 'stroke-width': 26, 'stroke-linejoin': 'round' });
    const vidro = T.el(s, 'path', { d: VIDRO, fill: '#d6dee8', stroke: NAVY, 'stroke-width': 7, 'stroke-linejoin': 'round' });
    for (const r of ROSCA) T.el(s, 'path', { d: r, fill: '#ffffff', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' });
    T.el(s, 'path', { d: 'M40 88 Q44 54 72 38', fill: 'none', stroke: '#fff', 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.9 });
    const fil = T.el(s, 'path', { d: 'M82 198 L82 168 Q100 150 118 168 L118 198', fill: 'none', stroke: NAVY, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.45 });
    const cans = T.el(s, 'g', {}), feliz = T.el(s, 'g', {}), acord = T.el(s, 'g', {}), oculos = T.el(s, 'g', {});
    const st = (o) => Object.assign({ fill: 'none', stroke: NAVY, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, o);
    // cansada: pálpebras caídas, olheira, boca torta, gota de suor
    T.el(cans, 'path', st({ d: 'M62 100 Q76 108 90 100' })); T.el(cans, 'path', st({ d: 'M110 100 Q124 108 138 100' }));
    T.el(cans, 'path', st({ d: 'M64 114 Q76 119 88 114', 'stroke-width': 3.5, opacity: 0.55 }));
    T.el(cans, 'path', st({ d: 'M112 114 Q124 119 136 114', 'stroke-width': 3.5, opacity: 0.55 }));
    T.el(cans, 'path', st({ d: 'M86 136 Q96 131 104 135 Q110 138 116 134' }));
    T.el(cans, 'path', { d: 'M160 52 Q150 70 158 76 Q168 80 168 68 Q166 60 160 52 Z', fill: '#ffffff', stroke: NAVY, 'stroke-width': 4.5, 'stroke-linejoin': 'round' });
    // feliz: olhos de arco, bochecha rosa, sorriso aberto
    T.el(feliz, 'path', st({ d: 'M62 104 Q76 88 90 104' })); T.el(feliz, 'path', st({ d: 'M110 104 Q124 88 138 104' }));
    T.el(feliz, 'circle', { cx: 60, cy: 124, r: 9, fill: ROSA, opacity: 0.75 }); T.el(feliz, 'circle', { cx: 140, cy: 124, r: 9, fill: ROSA, opacity: 0.75 });
    T.el(feliz, 'path', { d: 'M80 124 Q100 152 120 124 Z', fill: NAVY, stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' });
    // acordada: olhos arregalados com brilho, sobrancelhas no alto, boca em "o"
    for (const cx of [76, 124]) {
      T.el(acord, 'circle', { cx, cy: 100, r: 11, fill: NAVY });
      T.el(acord, 'circle', { cx: cx + 3.5, cy: 96, r: 3.5, fill: '#fff' });
    }
    T.el(acord, 'path', st({ d: 'M62 78 Q76 68 90 76', 'stroke-width': 5 })); T.el(acord, 'path', st({ d: 'M110 76 Q124 68 138 78', 'stroke-width': 5 }));
    T.el(acord, 'ellipse', { cx: 100, cy: 134, rx: 8, ry: 10, fill: NAVY });
    // óculos escuros
    T.el(oculos, 'path', { d: 'M52 90 h40 a4 4 0 0 1 4 4 q0 22 -22 22 q-24 0 -26 -22 a4 4 0 0 1 4 -4 Z', fill: NAVY });
    T.el(oculos, 'path', { d: 'M108 90 h40 a4 4 0 0 1 4 4 q-2 22 -26 22 q-22 0 -22 -22 a4 4 0 0 1 4 -4 Z', fill: NAVY });
    T.el(oculos, 'path', st({ d: 'M92 96 Q100 90 108 96' }));
    T.el(oculos, 'path', { d: 'M60 96 l12 0', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' });
    T.el(oculos, 'path', { d: 'M116 96 l12 0', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round' });

    const pose = (b, ang, dobra) => {          // ângulo do ombro (graus, 0 = pra baixo), dobra do cotovelo
      const a = ang * Math.PI / 180, l1 = 56, l2 = 48;   // longos o bastante pra mão sair do vidro com o braço erguido
      const ex = b.sx + Math.sin(a) * l1 * b.lado, ey = b.sy + Math.cos(a) * l1;
      const a2 = a + dobra * Math.PI / 180;
      const hx = ex + Math.sin(a2) * l2 * b.lado, hy = ey + Math.cos(a2) * l2;
      const dd = `M${b.sx} ${b.sy} Q${ex.toFixed(1)} ${ey.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`;
      b.contorno.setAttribute('d', dd); b.linha.setAttribute('d', dd);
      for (const c of [b.mao, b.mb]) { c.setAttribute('cx', hx.toFixed(1)); c.setAttribute('cy', hy.toFixed(1)); }
      return { x: hx, y: hy };
    };
    return {
      el: d, tam,
      // o: { humor: 'cansada'|'feliz', oculos: 0..1 (1 no rosto, 0 fora), luz: 0..1, bracoE: [ang, dobra], bracoD: [...] }
      seek(o) {
        cans.style.display = o.humor === 'cansada' ? '' : 'none';
        feliz.style.display = o.humor === 'feliz' ? '' : 'none';
        acord.style.display = o.humor === 'acordada' ? '' : 'none';
        oculos.style.display = o.oculos > 0 ? '' : 'none';
        oculos.setAttribute('transform', `translate(0 ${(-(1 - o.oculos) * 70).toFixed(1)})`);
        const luz = M.clamp(o.luz ?? 0);
        const c = (a, b) => Math.round(M.lerp(a, b, luz));
        vidro.setAttribute('fill', `rgb(${c(0xd6, 0xff)}, ${c(0xde, 0xff)}, ${c(0xe8, 0xff)})`);
        fil.setAttribute('stroke', luz > 0.5 ? ROSA : NAVY);
        fil.setAttribute('opacity', (0.45 + 0.55 * luz).toFixed(2));
        const pe = pose(bE, ...(o.bracoE || [20, 10])), pd = pose(bD, ...(o.bracoD || [20, 10]));
        return { maoE: pe, maoD: pd };   // coordenadas no viewBox (multiplique por tam/240 e some x, y da caixa)
      },
    };
  };

  window.T = T;
})();
