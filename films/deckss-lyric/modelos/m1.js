// Modelo 1: BILHETE DE RESGATE. Cada palavra é uma tira de papel rasgada que bate no papel creme no tempo da sílaba.
// Fonte de título: Permanent Marker (pincel). Recortes da capa em xerox colados com fita.
(() => {
  const { LETRA, W, H, div, img, poe, tranco, COR } = C;
  const R = M.mulberry32(0xb1e7);
  const DESTAQUE = new Set(['cresceu', 'perceber', 'sentir', 'descalço', 'sorrir']);
  // onde cada verso mora (não alinhados de propósito)
  const POS = [{ x: 140, y: 150, r: -3 }, { x: 110, y: 150, r: 2.5 }, { x: 170, y: 130, r: 1.5 }, { x: 110, y: 160, r: -2 }];
  const rasgo = (r) => {                       // borda rasgada: zigue-zague irregular em cima e embaixo
    const pts = [], n = 16;
    for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(1)}% ${(r() * 9).toFixed(1)}%`);
    pts.push(`${(99 + r()).toFixed(1)}% 50%`);
    for (let i = n; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(1)}% ${(100 - r() * 9).toFixed(1)}%`);
    pts.push(`${r().toFixed(1)}% 50%`);
    return `polygon(${pts.join(',')})`;
  };
  let cam, versos = [], fotos = [], caveira;

  window.MODELO = {
    async montar(cena) {
      cam = div(cena, { inset: '0px', transformOrigin: '50% 50%' });
      div(cam, { left: '-60px', top: '-40px', width: (W + 120) + 'px', height: (H + 80) + 'px', background: `url(tex/papel-creme.jpg) center / cover` });
      // pedaço de papel preto rasgado atrás das fotos + retícula
      img(cam, 'tex/reticula-disco.png', { left: '1080px', top: '-120px', width: '1000px', opacity: '.55', filter: 'invert(1)', mixBlendMode: 'multiply' });
      div(cam, { left: '1290px', top: '-60px', width: '760px', height: '1240px', background: COR.preto, clipPath: rasgo(R).replace(/(\d+\.\d)% (\d+\.\d)%/g, (m, a, b) => `${b}% ${a}%`), transform: 'rotate(4deg)' });
      // fotos xerox coladas (trocam a cada verso)
      const F = [['p-garoto', 1610, 300, 1.0, 7], ['p-criancas', 1620, 780, 0.72, -6], ['p-bola', 1620, 320, 1.25, -4], ['p-polaroid', 1600, 780, 1.0, 5]];
      fotos = F.map(([n, x, y, s, r], i) => {
        const g = div(cam, { left: '0px', top: '0px' });
        const im = img(g, `tex/xerox/${n}.png`, { left: '0px', top: '0px', filter: 'drop-shadow(8px 10px 0 rgba(11,10,9,.28))' });
        const fita = div(g, { left: '0px', top: '0px', width: '170px', height: '48px', background: 'rgba(240, 232, 210, .78)', clipPath: rasgo(R) });
        return { g, im, fita, x, y, s, r, i };
      });
      // caveira carimbada (abertura)
      caveira = img(cam, 'rec/caveira.png', { left: '0px', top: '0px', width: '760px', filter: 'invert(1) contrast(1.4)', mixBlendMode: 'multiply', opacity: '.9' });
      // versos: tiras por palavra
      LETRA.forEach((l, li) => {
        const g = div(cam, { left: '0px', top: '0px' });
        let x = 0, y = 0, linha = 0;
        const tiras = l.palavras.map((p, k) => {
          const d = DESTAQUE.has(p.w);
          const tam = d ? 185 : 138;
          const fundo = d ? COR.amarelo : (R() < 0.3 ? COR.preto : '#efe5cf');
          const tinta = fundo === COR.preto ? COR.creme : COR.preto;
          const el = div(g, { left: '0px', top: '0px', padding: `${tam * 0.12}px ${tam * 0.22}px ${tam * 0.02}px`, background: fundo, color: tinta,
            fontFamily: 'Permanent Marker', fontSize: tam + 'px', lineHeight: '1.05', clipPath: rasgo(R), filter: 'drop-shadow(6px 8px 0 rgba(11,10,9,.35))', transformOrigin: '50% 50%' }, p.w.toUpperCase());
          let risco = null;
          if (d) {
            risco = C.svg(g, 10, 10, '', { left: '0px', top: '0px' });
            const caminho = Array.from({ length: 26 }, (_, i) => { const a = -0.4 + i / 20 * Math.PI * 2, rr = 1 + (R() - 0.5) * 0.08; return `${(50 + 54 * rr * Math.cos(a)).toFixed(1)},${(50 + 60 * rr * Math.sin(a)).toFixed(1)}`; }).join(' ');
            risco.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible"><polyline points="${caminho}" fill="none" stroke="${COR.vermelho}" stroke-width="2.4" vector-effect="non-scaling-stroke" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="stroke-width:12px"/></svg>`;
          }
          return { el, p, d, tam, risco };
        });
        // mede e posiciona (só na montagem)
        tiras.forEach((ti) => {
          const w = ti.el.offsetWidth, h = ti.el.offsetHeight;
          if (x + w > 1180 && x > 0) { x = (linha % 2 ? 0 : 70); linha++; }
          ti.w = w; ti.h = h; ti.cx = x + w / 2 + (R() - 0.5) * 20; ti.cy = linha * 205 + h / 2 + (R() - 0.5) * 34; ti.r = (R() - 0.5) * 11; ti.r0 = ti.r + (R() < 0.5 ? -18 : 18);
          x += w + 8 + R() * 18;
        });
        versos.push({ g, tiras, l, pos: POS[li] });
      });
    },
    seek(t) {
      // câmera: deriva lenta + tranco quando cada palavra cai
      const quedas = LETRA.flatMap((l) => l.palavras.map((p) => p.t));
      const tr = tranco(t, quedas.filter((q) => q <= t && t - q < 1), 5);
      const zoom = 1.03 + 0.02 * Math.sin(t * 0.6);
      cam.style.transform = `translate(${(tr.x + M.wiggle(t, 0.4, 8, 3)).toFixed(1)}px, ${(tr.y + M.wiggle(t, 0.35, 6, 9)).toFixed(1)}px) rotate(${(tr.r + M.wiggle(t, 0.3, 0.6, 4)).toFixed(2)}deg) scale(${zoom.toFixed(4)})`;
      // caveira: carimbo na pancada da banda, depois some sob o primeiro verso
      const c0 = 0.056, cs = t < c0 ? 0 : M.lerp(1.5, 1, M.spring(t - c0, 3.4, 0.6));
      const cfora = M.E.sai(M.prog(t, 0.62, 0.86));
      caveira.style.display = t >= c0 && cfora < 1 ? '' : 'none';
      poe(caveira, 900 - cfora * 300, 520 + cfora * 900, cs, -6 + cfora * -40);
      caveira.style.left = '0px';
      // fotos: cada verso bate a sua (entra com tapa, sai arremessada quando chega a próxima do mesmo lado)
      fotos.forEach((f) => {
        const t0 = LETRA[f.i].t0 - 0.05, prox = fotos.find((o) => o.i === f.i + 2), t1 = prox ? LETRA[prox.i].t0 - 0.05 : 99;
        const on = t >= t0 && t < t1 + 0.4;
        f.g.style.display = on ? '' : 'none';
        if (!on) return;
        const s = M.lerp(1.45, 1, M.spring(t - t0, 3.2, 0.6)) * f.s;
        const out = M.E.sai(M.prog(t, t1, t1 + 0.35));
        const w = f.im.naturalWidth, h = f.im.naturalHeight;
        poe(f.im, w / 2, h / 2);
        f.im.style.transform = '';
        poe(f.fita, w / 2 + 20, 18, 1, -4);
        f.g.style.transform = `translate(${f.x - w / 2 + out * 700}px, ${f.y - h / 2 - out * 200}px)`;
        f.g.style.transformOrigin = `${w / 2}px ${h / 2}px`;
        f.g.style.transform += ` rotate(${f.r + out * 30}deg) scale(${s})`;
      });
      // versos
      versos.forEach((v, vi) => {
        const prox = versos[vi + 1], tSai = prox ? prox.l.palavras[0].t - 0.3 : 99;
        const on = t >= v.l.palavras[0].t - 0.01 && t < tSai + 0.5;
        v.g.style.display = on ? '' : 'none';
        if (!on) return;
        const sai = M.prog(t, tSai, tSai + 0.42);
        v.g.style.transform = `translate(${v.pos.x}px, ${v.pos.y}px) rotate(${v.pos.r}deg)`;
        v.tiras.forEach((ti, k) => {
          const t0 = ti.p.t;
          if (t < t0) { ti.el.style.display = 'none'; return; }
          ti.el.style.display = '';
          const p = M.spring(t - t0, 3.6, 0.55);
          const s = M.lerp(ti.d ? 1.7 : 1.45, 1, p);
          const r = M.lerp(ti.r0, ti.r, p);
          // saída: cada tira é arrancada pra cima, uma depois da outra (escadinha de 0,03 s)
          const so = M.E.sai(M.prog(t, tSai + k * 0.02, tSai + k * 0.02 + 0.22));
          const dx = so * (k % 2 ? 260 : -180), dy = so * -1100;
          if (ti.risco) {
            const pr = M.E.entra(M.prog(t, t0 + 0.12, t0 + 0.42));
            Object.assign(ti.risco.style, { width: ti.w * 1.1 + 'px', height: ti.h * 1.25 + 'px' });
            ti.risco.querySelector('polyline').setAttribute('stroke-dashoffset', (1 - pr).toFixed(3));
            ti.risco.style.transform = `translate(${(ti.cx - ti.w * 0.55 + dx).toFixed(1)}px, ${(ti.cy - ti.h * 0.62 + dy).toFixed(1)}px) rotate(${(ti.r * 0.5 + so * 30).toFixed(2)}deg)`;
            ti.risco.style.display = pr > 0 ? '' : 'none';
          }
          ti.el.style.transform = `translate(${(ti.cx - ti.w / 2 + dx).toFixed(1)}px, ${(ti.cy - ti.h / 2 + dy).toFixed(1)}px) rotate(${(r + so * (k % 2 ? 40 : -35)).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        });
        void sai;
      });
    },
  };
})();
