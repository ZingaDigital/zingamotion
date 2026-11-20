// P6 · Logo reveal · 23,0 a 28,0 s (tempo real, b46 a b56), no estilo do reveal enviado pelo cliente
// (refs/logo/ref-logo.mp4): a ligadura "ng" gigante passeando na tela, flash de 2 quadros em navy só com o contorno,
// zoom que abre até o "zinga" grande cortado, as letras se recolhem no ponto navy, o ponto vai pro lugar, uma barra
// branca se abre e vira o logo, segura e sai num wipe. Depois o rosa encolhe até o 1º dia da grade (loop).
// Vetor: assets/logo.svg (logo-tokenizado do design system). Coordenadas do logo: viewBox 143.6 342.9 712.9 314.2.
(() => {
  const B = (n) => Z.b(n);
  const NS = 'http://www.w3.org/2000/svg';
  const T0 = B(46);                                    // 23,0 s
  const FLASH = [T0 + 0.375, T0 + 0.45], CONTORNO = T0 + 0.6;
  const ABRE = [T0 + 0.6, T0 + 1.0], RECOLHE = [T0 + 1.0, T0 + 1.3];
  const PONTO = B(49), BARRA = B(49.5), POUSA = B(50), WIPE = B(54), FECHA = G.PAPEL_REAL;
  const DOT = { x: 346.5, y: 369.7 }, CENTRO = { x: 500, y: 500 }, SF = 600 / 712.9;
  const PIVO_Y = 535;                                  // linha da barra, em coordenadas do logo
  let fundo, svg, cam, letras, ponto, barra, wipeRect, paths = [];

  Z.plano({
    id: 'p6', inicio: T0, fim: 28, z: 6, real: true,
    montar(el) {
      fundo = Z.div(el, { background: `linear-gradient(180deg, ${G.COR.rosa} 0%, ${G.COR.rosa} 30%, #a3053a 100%)` });
      svg = T.svg(el, Z.W, Z.H, { left: '0px', top: '0px' });
      const defs = T.el(svg, 'defs');
      const cp = T.el(defs, 'clipPath', { id: 'wipeLogo', clipPathUnits: 'userSpaceOnUse' });
      wipeRect = T.el(cp, 'rect', { x: 100, y: 300, width: 800, height: 400 });
      cam = T.el(svg, 'g');
      const doc = new DOMParser().parseFromString(G.LOGO, 'image/svg+xml');
      const ps = [...doc.querySelectorAll('path')];
      letras = T.el(cam, 'g', { 'clip-path': 'url(#wipeLogo)' });
      for (const p of ps.slice(0, -1)) paths.push(T.el(letras, 'path', { d: p.getAttribute('d') }));
      ponto = T.el(cam, 'path', { d: ps[ps.length - 1].getAttribute('d'), fill: G.COR.navy });
      barra = Z.div(el, { background: '#ffffff', borderRadius: '14px' });
    },
    seek(t, el) {
      // fundo: rosa; flash navy de 2 quadros; no fim encolhe até o 1º dia da grade
      const flash = t >= FLASH[0] && t < FLASH[1];
      fundo.style.background = flash ? G.COR.navy : `linear-gradient(180deg, ${G.COR.rosa} 0%, ${G.COR.rosa} 30%, #a3053a 100%)`;
      const pf = G.E.morph(M.prog(t, FECHA, FECHA + 0.45));
      Z.poeEstado(fundo, { x: M.lerp(-40, 141, pf), y: M.lerp(-40, 720, pf), w: M.lerp(Z.W + 80, 34, pf), h: M.lerp(Z.H + 80, 34, pf), r: M.lerp(0, 9, pf) });

      // câmera: ponto do logo (fx, fy) desenhado na tela em (sx, sy) com escala s
      let fx, fy, sx, sy, s, rot = 0;
      if (t < ABRE[0]) {                               // ligadura gigante passeando
        const p = M.prog(t, T0, ABRE[0]);
        fx = M.lerp(640, 575, G.E.outCubic(p)); fy = M.lerp(530, 500, p); sx = 540; sy = 900; s = 6.4; rot = M.lerp(-7, 0, G.E.outCubic(p));
      } else if (t < RECOLHE[0]) {                     // zoom abre até o "zinga" grande cortado
        const p = G.E.morph(M.prog(t, ABRE[0], ABRE[1]));
        fx = M.lerp(575, 500, p); fy = M.lerp(500, 480, p); sx = 540; sy = M.lerp(900, 840, p); s = M.lerp(6.4, 1.75, p);
      } else {                                         // recolhe no ponto, ponto vai pro lugar, logo final
        const p = G.E.morph(M.prog(t, RECOLHE[0], RECOLHE[1]));
        const a = { fx: M.lerp(500, DOT.x, p), fy: M.lerp(480, DOT.y, p), sx: 540, sy: M.lerp(840, 830, p), s: M.lerp(1.75, 1.1, p) };
        const m = M.clamp(M.spring(t - PONTO, 2.6, 0.62), 0, 1.08);
        const fin = { fx: CENTRO.x, fy: CENTRO.y, sx: 540, sy: 960, s: SF * (1 + 0.035 * M.prog(t, POUSA, WIPE)) };
        fx = M.lerp(a.fx, fin.fx, m); fy = M.lerp(a.fy, fin.fy, m); sx = M.lerp(a.sx, fin.sx, m); sy = M.lerp(a.sy, fin.sy, m); s = M.lerp(a.s, fin.s, m);
      }
      cam.setAttribute('transform', `translate(${sx.toFixed(2)} ${sy.toFixed(2)}) rotate(${rot.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`);

      // letras: sólidas; contorno fino no flash e logo depois; recolhem no ponto; renascem da barra
      const contorno = t >= FLASH[0] && t < CONTORNO;
      for (const p of paths) {
        p.setAttribute('fill', contorno ? 'none' : '#ffffff');
        p.setAttribute('stroke', contorno ? '#ffffff' : 'none');
        p.setAttribute('stroke-width', (2.2 / s).toFixed(3));
      }
      let lt = '';
      if (t >= RECOLHE[0] && t < POUSA) {
        const k = 1 - G.E.inExp(M.prog(t, RECOLHE[0], RECOLHE[1]));
        lt = `translate(${DOT.x} ${DOT.y}) scale(${k.toFixed(4)}) translate(${-DOT.x} ${-DOT.y})`;
        letras.style.display = k > 0.002 ? '' : 'none';
      } else if (t >= POUSA) {
        const ky = M.clamp(M.spring(t - POUSA, 3.2, 0.55), 0.02, 1.2);
        lt = `translate(0 ${PIVO_Y}) scale(1 ${ky.toFixed(4)}) translate(0 ${-PIVO_Y})`;
        letras.style.display = '';
      } else letras.style.display = '';
      letras.setAttribute('transform', lt);
      // wipe: a borda esquerda do recorte corre da esquerda pra direita
      const pw = G.E.inExp(M.prog(t, WIPE, WIPE + 0.32));
      wipeRect.setAttribute('x', (100 + 800 * pw).toFixed(1));
      const kp = 1 - G.E.inExp(M.prog(t, WIPE + 0.22, WIPE + 0.36)) + M.kick(t, PONTO, 0.25, 4, 0.45);
      ponto.setAttribute('transform', `translate(${DOT.x} ${DOT.y}) scale(${Math.max(0, kp).toFixed(4)}) translate(${-DOT.x} ${-DOT.y})`);
      ponto.style.display = t < FECHA ? '' : 'none';
      svg.style.display = t < FECHA + 0.05 ? '' : 'none';

      // barra branca: abre embaixo do ponto e vira o logo (achata enquanto as letras crescem)
      const yb = 960 + (PIVO_Y - CENTRO.y) * SF;
      const wb = 600 * M.clamp(M.spring(t - BARRA, 3.4, 0.7), 0, 1.06);
      const hb = 28 * (1 - M.prog(t, POUSA, POUSA + 0.16));
      Object.assign(barra.style, { left: (540 - wb / 2).toFixed(1) + 'px', top: (yb - hb / 2).toFixed(1) + 'px', width: wb.toFixed(1) + 'px', height: hb.toFixed(1) + 'px' });
      barra.style.display = t >= BARRA && t < POUSA + 0.16 ? '' : 'none';
    },
    som(S) {
      S.impact(T0, 0.7);
      S.swoosh(T0, 0.35, 0.18, true);
      S.clap(FLASH[0], 0.45);
      S.swoosh(ABRE[0] + 0.025, 0.36, 0.16, false);
      S.zip(RECOLHE[0], 0.2, 0.09, false);
      S.pop(B(48.5), 1200, 0.16);
      S.pop(PONTO, 900, 0.2);
      S.zip(BARRA, 0.18, 0.1, true);
      S.ding(POUSA, 2093, 0.14);
      S.ding(POUSA, 1568, 0.08);
      S.swoosh(WIPE, 0.32, 0.16, true);
      S.swoosh(B(54.75), 0.4, 0.14, false);
    },
  });
})();
