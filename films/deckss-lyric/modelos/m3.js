// Modelo 3: CAIXA DE MEMÓRIAS. Uma mesa de papelão com os recortes da capa espalhados; a câmera chicoteia de foto
// em foto (um verso por foto) e a letra é escrita a pincel ao lado, palavra por palavra. Fonte de título: Caveat Brush.
(() => {
  const { LETRA, W, H, div, img, pincel, COR } = C;
  const R = M.mulberry32(0x3c11);
  const DESTAQUE = new Set(['cresceu', 'perceber', 'sentir', 'descalço', 'sorrir']);
  // paradas da câmera (centro no mundo) e foto de cada verso
  const PARADAS = [
    { x: 960, y: 560, z: 1.0, r: -2 },                       // abertura: título
    { x: 2900, y: 620, r: 2, foto: ['p-garoto', 3420, 590, 1.45, 6], txt: [-690, -380] },
    { x: 4700, y: 1500, r: -3, foto: ['p-criancas', 4190, 1520, 1.15, -5], txt: [-120, -400] },
    { x: 2700, y: 2350, r: 3, foto: ['p-bola', 3110, 2120, 1.45, 8], txt: [-780, -150] },
    { x: 5000, y: 3100, r: -2, foto: ['p-polaroid', 4520, 3270, 1.35, -7], txt: [-190, -420] },
  ];
  const EXTRAS = [['p-carrinho', 3560, 960, 1.0, -14], ['p-mochila', 2050, 980, 0.8, 10], ['p-trofeu', 5560, 1940, 0.9, 12], ['p-beco', 5500, 1070, 0.7, -6],
    ['p-polaroid', 1900, 2050, 0.8, 18], ['p-garoto', 3560, 2640, 0.6, -10], ['p-criancas', 5800, 3500, 0.7, 9], ['p-bola', 4100, 2800, 0.7, -12], ['p-mochila', 4200, 3650, 0.8, 7], ['p-carrinho', 2100, 2800, 0.9, 15]];
  let cam, mundo, versos = [], fotos = [];
  const tParada = (i) => (i === 0 ? -1 : LETRA[i - 1].palavras[0].t - 0.28);

  window.MODELO = {
    async montar(cena) {
      cam = div(cena, { inset: '0px' });
      mundo = div(cam, { left: '0px', top: '0px', width: '7600px', height: '4200px', transformOrigin: '0 0',
        background: 'url(tex/muro.jpg) 0 0 / 1920px 1080px repeat', filter: 'none' });
      div(mundo, { inset: '0px', background: 'rgba(120, 72, 28, .55)', mixBlendMode: 'color' });
      div(mundo, { inset: '0px', background: 'url(tex/sujeira.png) 0 0 / 1920px 1080px repeat', opacity: '.35' });
      const poeImg = ([n, x, y, s, r], z = 1) => {
        const i = img(mundo, `rec/${n}.png`, { left: '0px', top: '0px', transformOrigin: '50% 50%', filter: 'drop-shadow(14px 18px 0 rgba(0,0,0,.45))', zIndex: z });
        return { i, x, y, s, r };
      };
      EXTRAS.forEach((e) => fotos.push(poeImg(e)));
      const tit = poeImg(['titulo-caveira', 960, 560, 0.9, -3], 2);
      fotos.push(tit);
      PARADAS.slice(1).forEach((p, i) => { const f = poeImg(p.foto, 3); f.verso = i; fotos.push(f); });
      // letra: escrita ao lado (à esquerda) de cada foto
      LETRA.forEach((l, li) => {
        const P = PARADAS[li + 1], g = div(mundo, { left: '0px', top: '0px', zIndex: 5 });
        let x = 0, linha = 0;
        const pals = l.palavras.map((p) => {
          const d = DESTAQUE.has(p.w), tam = d ? 290 : 175;
          const caixa = div(g, { left: '0px', top: '0px' });
          const el = div(caixa, { position: 'relative', fontFamily: 'Caveat Brush', fontSize: tam + 'px', lineHeight: '1', padding: '0 10px', whiteSpace: 'nowrap',
            color: d ? COR.amarelo : COR.creme, textShadow: `4px 5px 0 ${COR.preto}` }, d ? p.w.toUpperCase() : p.w);
          let traco = null;
          if (d) traco = div(caixa, { left: '6px', bottom: '-6px', width: '100%', height: '22px', background: COR.vermelho, borderRadius: '40% 60% 50% 45%', transform: 'rotate(-2deg)', boxShadow: `4px 4px 0 ${COR.preto}` });
          return { caixa, el, traco, p, d };
        });
        pals.forEach((q) => {
          const w = q.el.offsetWidth, h = q.el.offsetHeight;
          if (x + w > 980 && x > 0) { x = 40 * (linha % 2 ? 0 : 1) + R() * 40; linha++; }
          q.w = w; q.h = h; q.x = x; q.y = linha * 190 + (q.d ? -40 : 20) + (R() - 0.5) * 24; q.r = (R() - 0.5) * 8;
          x += w + R() * 16;
        });
        versos.push({ g, pals, l, gx: P.x + P.txt[0], gy: P.y + P.txt[1] });
      });
    },
    seek(t) {
      // câmera: chicote entre paradas (0,32 s, borrão pela velocidade), deriva lenta parado
      let i = 0; PARADAS.forEach((p, k) => { if (t >= tParada(k)) i = k; });
      const A = PARADAS[Math.max(0, i - 1)], B = PARADAS[i];
      const t0 = tParada(i), p = i === 0 ? 1 : M.E.cruza(M.prog(t, t0, t0 + 0.34));
      const cx = M.lerp(A.x, B.x, p) + M.wiggle(t, 0.4, 14, 3), cy = M.lerp(A.y, B.y, p) + M.wiggle(t, 0.35, 10, 8);
      const z = (1.05 + 0.03 * Math.sin(t * 0.7)) * (1 - 0.12 * Math.sin(Math.PI * p));
      const r = M.lerp(A.r, B.r, p);
      const vel = i === 0 ? 0 : Math.abs(M.vel((tt) => M.E.cruza(M.prog(tt, t0, t0 + 0.34)), t));
      mundo.style.transform = `translate(${W / 2}px, ${H / 2}px) rotate(${r.toFixed(2)}deg) scale(${z.toFixed(4)}) translate(${-cx.toFixed(1)}px, ${-cy.toFixed(1)}px)`;
      cam.style.filter = vel > 0.4 ? `blur(${Math.min(14, vel * 3.2).toFixed(1)}px)` : 'none';
      // fotos: as do verso caem na mesa quando a câmera chega
      fotos.forEach((f) => {
        const w = f.i.naturalWidth, h = f.i.naturalHeight;
        let s = f.s, rr = f.r;
        if (f.verso != null) {
          const tc = tParada(f.verso + 1) + 0.12;
          f.i.style.display = t >= tc ? '' : 'none';
          s = f.s * M.lerp(1.5, 1, M.spring(t - tc, 3.2, 0.58)); rr = f.r + (1 - M.spring(t - tc, 3.2, 0.6)) * 14;
        }
        f.i.style.transform = `translate(${(f.x - w / 2).toFixed(1)}px, ${(f.y - h / 2).toFixed(1)}px) rotate(${rr.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      });
      versos.forEach((v) => {
        v.g.style.transform = `translate(${v.gx}px, ${v.gy}px)`;
        v.pals.forEach((q, k) => {
          const a = q.p.t, nx = v.pals[k + 1], dur = Math.min(0.26, nx ? Math.max(0.1, nx.p.t - a) : 0.26);
          q.caixa.style.display = t >= a ? '' : 'none';
          if (t < a) return;
          pincel(q.el, M.E.entra(M.prog(t, a, a + dur)), 100, 18);
          if (q.traco) q.traco.style.transform = `rotate(-2deg) scaleX(${M.E.entra(M.prog(t, a + dur, a + dur + 0.2)).toFixed(3)})`, q.traco.style.transformOrigin = '0 50%';
          const s = 1 + M.kick(t, a, 0.08, 4.5, 0.45);
          q.caixa.style.transform = `translate(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px) rotate(${q.r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
        });
      });
    },
  };
})();
