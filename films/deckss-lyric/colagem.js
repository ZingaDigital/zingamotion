// Peças de colagem: borda rasgada, pedaço de papel com vídeo, recorte bitmap, fita, rabisco, camada de letras com
// efeito negativo onde a letra cruza o vídeo. Tudo determinístico (mulberry32).
(() => {
  const { W, H, div, img } = C;
  // polígono rasgado em volta de um retângulo (cx, cy, w, h, rot em graus), em coordenadas de tela
  const rasgado = (cx, cy, w, h, rot = 0, sem = 1, amp = 12, passo = 11) => {
    const R = M.mulberry32(sem * 7919 + 11), pts = [];
    const lado = (x0, y0, x1, y1, nx, ny) => {
      const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / passo));
      let off = 0;
      for (let i = 0; i < n; i++) {
        const f = i / n; off = off * 0.78 + (R() - 0.5) * amp * (R() < 0.05 ? 3.5 : 0.8);
        pts.push([x0 + (x1 - x0) * f + nx * off, y0 + (y1 - y0) * f + ny * off]);
      }
    };
    const a = -w / 2, b = w / 2, c = -h / 2, d = h / 2;
    lado(a, c, b, c, 0, 1); lado(b, c, b, d, -1, 0); lado(b, d, a, d, 0, -1); lado(a, d, a, c, 1, 0);
    const r = rot * Math.PI / 180, co = Math.cos(r), si = Math.sin(r);
    return pts.map(([x, y]) => [cx + x * co - y * si, cy + x * si + y * co]);
  };
  const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
  const pathD = (pts) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z`;
  const cresce = (pts, cx, cy, px) => pts.map(([x, y]) => { const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1; return [x + dx / l * px, y + dy / l * px]; });

  // pedaço rasgado com vídeo dentro: borda de fibra branca + sombra; devolve { caixa, v, pts }
  const PedacoVideo = (pai, { cx, cy, w, h, rot = 0, sem = 1 }) => {
    const pts = rasgado(cx, cy, w, h, rot, sem);
    const sombra = div(pai, { inset: '0px', background: 'rgba(0,0,0,.35)', clipPath: poly(cresce(pts, cx, cy, 10).map(([x, y]) => [x + 12, y + 16])), filter: 'blur(6px)' });
    const fibra = div(pai, { inset: '0px', background: '#f6f1e6', clipPath: poly(cresce(rasgado(cx, cy, w, h, rot, sem + 50, 18, 14), cx, cy, 9)) });
    const caixa = div(pai, { inset: '0px', clipPath: poly(pts) });
    const v = ML.Video(caixa);
    return { caixa, v, pts, sombra, fibra };
  };
  // recorte bitmap (pessoa) com borda de adesivo
  const Recorte = (pai, nome, { cx, cy, h, rot = 0, z } = {}) => {
    const el = img(pai, `footage/recorte/${nome}-bit.png`, { left: '0px', top: '0px', height: h + 'px', transformOrigin: '50% 50%', filter: 'drop-shadow(10px 14px 6px rgba(0,0,0,.35))', zIndex: z ?? '' });
    el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) rotate(${rot}deg)`;
    return el;
  };
  const Fita = (pai, { cx, cy, w = 220, h = 54, rot = 0, cor = 'rgba(20,18,16,.92)', sem = 3 }) => {
    const pts = rasgado(0, 0, w, h, 0, sem, 5, 10);
    const f = div(pai, { left: '0px', top: '0px', width: '1px', height: '1px' });
    div(f, { left: '0px', top: '0px', width: '1px', height: '1px', clipPath: 'none' });
    const corpo = div(f, { left: -w / 2 - 10 + 'px', top: -h / 2 - 10 + 'px', width: w + 20 + 'px', height: h + 20 + 'px', background: cor, clipPath: poly(pts.map(([x, y]) => [x + w / 2 + 10, y + h / 2 + 10])) });
    f.style.transform = `translate(${cx}px, ${cy}px) rotate(${rot}deg)`; return { f, corpo };
  };
  // rabisco de caneta (círculo/sublinhado irregular)
  const Rabisco = (pai, { cx, cy, rx, ry, voltas = 1.3, cor = '#d8261c', larg = 7, sem = 5, rot = 0 }) => {
    const R = M.mulberry32(sem), n = Math.round(60 * voltas), p = [];
    for (let i = 0; i <= n; i++) { const a = -0.6 + i / 60 * Math.PI * 2, j = 1 + (R() - 0.5) * 0.06 + i / n * 0.07; p.push(`${(cx + Math.cos(a) * rx * j).toFixed(1)},${(cy + Math.sin(a) * ry * j).toFixed(1)}`); }
    return C.svg(pai, W, H, `<polyline points="${p.join(' ')}" fill="none" stroke="${cor}" stroke-width="${larg}" stroke-linecap="round" stroke-linejoin="round" opacity=".92" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" transform="rotate(${rot} ${cx} ${cy})"/>`, { left: '0px', top: '0px' });
  };

  // Camada de letras com negativo: normal fora do vídeo, negativo (diferença) dentro.
  // formas: lista de polígonos de tela (o vídeo); fonte do vídeo para a cópia interna: { uso }
  const Letras = (pai, { formas = [] } = {}) => {
    const fora = `path(evenodd, "M-200 -200 H${W + 200} V${H + 200} H-200 Z ${formas.map(pathD).join(' ')}")`;
    const normal = div(pai, { inset: '0px', perspective: '1700px', perspectiveOrigin: '50% 45%' });
    let inv = null, vInv = null, sil = null;
    if (formas.length) {
      normal.style.clipPath = fora;
      inv = div(pai, { inset: '0px', clipPath: `path("${formas.map(pathD).join(' ')}")` });
      // vídeo e letras no mesmo contexto: a letra branca em "difference" vira o negativo do vídeo
      vInv = ML.Video(inv);
      // camada plana (achatada) com as letras 3D dentro: ela inteira em branco e "difference" = negativo do vídeo
      sil = div(inv, { inset: '0px', perspective: '1700px', perspectiveOrigin: '50% 45%', filter: 'grayscale(1) contrast(1.5) brightness(1.5)', mixBlendMode: 'difference' });
    }
    const palavra = (w, tam, sem, pingos = 2) => {
      const a = ML.Palavra(normal, w, tam, sem, pingos);
      let b = null;
      if (sil) b = ML.Palavra(sil, w, tam, sem, pingos);
      return { a, b, vis: (v) => [a, b].forEach((e) => { if (e) e.el.style.display = v ? '' : 'none'; }), poe: (tf) => { a.el.style.transform = tf(a); if (b) b.el.style.transform = tf(b); } };
    };
    // texto em fonte comum (ex.: Anton) numa etiqueta de papel rasgado; o = { txt, fonte, tam, cor, fundo, sem }
    const etiqueta = (o) => {
      const spans = [];
      const mk = (camada) => {
        const el = div(camada, { left: '0px', top: '0px', transformOrigin: '50% 50%' });
        const t = div(el, { position: 'relative', fontFamily: o.fonte || 'Anton', fontSize: o.tam + 'px', lineHeight: '1', color: o.cor || '#f3e6cc',
          padding: `${o.tam * 0.1}px ${o.tam * 0.16}px ${o.tam * 0.06}px`, whiteSpace: 'nowrap', letterSpacing: '0.01em' });
        o.txt.split(' ').forEach((w, i) => { const sp = document.createElement('span'); sp.textContent = (i ? ' ' : '') + w; t.append(sp); (spans[i] = spans[i] || []).push(sp); });
        if (o.fundo) { t.style.background = o.fundo; t.style.clipPath = CG.poly(rasgado(0, 0, 100, 100, 0, o.sem || 1, 3, 9).map(([x, y]) => [x + 50, y + 50])).replace(/px/g, '%'); }
        return el;
      };
      const a = mk(normal), b = sil ? mk(sil) : null;
      const W0 = a.offsetWidth, H0 = a.offsetHeight;
      return { a, b, spans, W0, H0, w: () => W0, h: () => H0,
        mostra: (n) => spans.forEach((l, i) => l.forEach((sp) => { sp.style.display = i < n ? '' : 'none'; })),
        vis: (v) => [a, b].forEach((e) => { if (e) e.style.display = v ? '' : 'none'; }),
        poe: (cx, cy, tf = '') => [a, b].forEach((e) => { if (e) e.style.transform = `translate(${cx - W0 / 2}px, ${cy - H0 / 2}px) ${tf}`; }) };
    };
    return { normal, inv, vInv, palavra, etiqueta };
  };
  window.CG = { rasgado, poly, pathD, cresce, PedacoVideo, Recorte, Fita, Rabisco, Letras };
})();
