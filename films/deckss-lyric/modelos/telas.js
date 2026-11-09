// 3 telas estáticas de direção (refrão). Colagem em papel amassado, recortes bitmap da banda (fotos), um vídeo por vez
// em pedaço rasgado com o rosto à mostra, palavra principal no lettering aprovado em 3D, palavras de apoio numa
// condensada alta em etiquetas de papel (encaixe das referências), negativo onde a letra cruza o vídeo.
(() => {
  Object.assign(C, { DUR: 3 });
  const { W, H, div, img } = C;
  let telas = [], vids = [], depois = [];
  const fundoPapel = (t) => div(t, { inset: '0px', background: 'url(tex/papel-amassado.jpg) center / cover' });
  const sucata = (t, cx, cy, w, h, rot, cor, sem) => div(t, { inset: '0px', background: cor, clipPath: CG.poly(CG.rasgado(cx, cy, w, h, rot, sem, 16, 12)), filter: 'drop-shadow(6px 8px 4px rgba(0,0,0,.3))' });
  const linhas = (t, x, y, w, h, rot) => C.svg(t, W, H, `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" stroke="#1d1a17" stroke-width="1.6" opacity=".45">${[0, 1, 2, 3, 4].map((i) => `<line x1="${x}" y1="${y + i * h / 4}" x2="${x + w}" y2="${y + i * h / 4}"/>`).join('')}${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${x + i * w / 5}" y1="${y}" x2="${x + i * w / 5}" y2="${y + h}"/>`).join('')}</g>`, { left: '0px', top: '0px' });
  // palavra do lettering aprovado: centro (cx, cy), tam, rotações 3D
  const grande = (L, w, tam, cx, cy, r = {}, sem = 1, pingos = 3) => {
    const p = L.palavra(w, tam, sem, pingos);
    p.poe((P) => `translate(${(cx - P.cx0).toFixed(1)}px, ${(cy - P.cy0).toFixed(1)}px) rotateY(${r.ry || 0}deg) rotateX(${r.rx || 0}deg) rotate(${r.rz || 0}deg)`);
    return p;
  };

  window.MODELO = {
    async montar(cena) {
      await ML.carregar(); await document.fonts.load('100px Anton', 'ÃÕÓ');
      // ================= TELA 1: ONDE AS MEMÓRIAS NÃO MORREM =================
      {
        const t = div(cena, { inset: '0px' }); telas.push(t); fundoPapel(t);
        linhas(t, 60, 560, 520, 380, -4);
        sucata(t, 380, 210, 760, 230, -3, '#141210', 41);
        img(t, 'tex/reticula-disco.png', { left: '-240px', top: '480px', width: '820px', opacity: '.5', filter: 'invert(1)', mixBlendMode: 'multiply' });
        CG.Recorte(t, 'bateria', { cx: 600, cy: 1000, h: 420, rot: -9 });
        const pv = CG.PedacoVideo(t, { cx: 1540, cy: 540, w: 690, h: 1000, rot: 2.5, sem: 4 });
        const uso = { clip: 'vocal-0342', ini: 63, rosto: 300, cx: 1600, cy: 330, box: [1170, 20, 1900, 1070] };
        vids.push([pv.v, uso]);
        CG.Fita(t, { cx: 1270, cy: 70, w: 210, rot: -28, cor: 'rgba(236,228,206,.88)', sem: 8 });
        CG.Fita(t, { cx: 1810, cy: 1010, w: 210, rot: -22, cor: 'rgba(236,228,206,.88)', sem: 9 });
        const L = CG.Letras(t, { formas: [pv.pts] }); vids.push([L.vInv, uso]);
        const e1 = L.etiqueta({ txt: 'ONDE AS', tam: 150, cor: '#f3e6cc' }); depois.push(() => e1.poe(430, 205, 'rotate(-3deg)'));
        grande(L, 'memórias', 250, 960, 440, { ry: 20, rz: -2 }, 11, 4);
        const e2 = L.etiqueta({ txt: 'NÃO', tam: 170, cor: '#f3e6cc', fundo: '#d8261c', sem: 5 }); depois.push(() => e2.poe(330, 740, 'rotate(5deg)'));
        grande(L, 'morrem', 280, 1010, 770, { ry: 20, rz: 1 }, 12, 3);
        CG.Rabisco(t, { cx: 330, cy: 740, rx: 175, ry: 125, cor: '#1d1a17', sem: 3, larg: 5, rot: -6 });
      }
      // ================= TELA 2: ONDE O TEMPO NÃO VENCE O AMOR (só fotos) =================
      {
        const t = div(cena, { inset: '0px' }); telas.push(t); fundoPapel(t);
        sucata(t, 960, 440, 2300, 400, -4, '#141210', 21);
        linhas(t, 1240, 700, 520, 330, 3);
        img(t, 'tex/reticula-disco.png', { left: '1180px', top: '-300px', width: '1000px', opacity: '.45', filter: 'invert(1)', mixBlendMode: 'multiply' });
        CG.Recorte(t, 'baixo', { cx: 260, cy: 760, h: 600, rot: -5 });
        CG.Recorte(t, 'bateria', { cx: 1740, cy: 640, h: 820, rot: 6 });
        CG.Fita(t, { cx: 1640, cy: 160, w: 190, rot: 28, cor: 'rgba(236,228,206,.88)', sem: 11 });
        const L = CG.Letras(t);
        const tamT = 330, wT = ML.medida('tempo').w100 / 100 * tamT, xT = 800 + wT / 2;
        const a = L.etiqueta({ txt: 'ONDE', tam: 130, cor: '#f3e6cc' }), o = L.etiqueta({ txt: 'O', tam: 130, cor: '#141210', fundo: '#f3e6cc', sem: 4 });
        depois.push(() => { a.poe(640, 370, 'rotate(-3deg)'); o.poe(700, 510, 'rotate(4deg)'); });
        grande(L, 'tempo', tamT, xT, 440, { ry: 30, rz: -3 }, 21, 0);
        const n = L.etiqueta({ txt: 'NÃO', tam: 110, cor: '#141210', fundo: '#f3e6cc', sem: 7 }), v = L.etiqueta({ txt: 'VENCE', tam: 110, cor: '#f3e6cc', fundo: '#d8261c', sem: 8 });
        depois.push(() => { n.poe(xT + wT * 0.5 - 330, 690, 'rotate(-4deg)'); v.poe(xT + wT * 0.5 - 110, 700, 'rotate(3deg)'); });
        const o2 = L.etiqueta({ txt: 'O', tam: 130, cor: '#f3e6cc', fundo: '#141210', sem: 12 }); depois.push(() => o2.poe(640, 880, 'rotate(-6deg)'));
        grande(L, 'amor', 360, 1000, 870, { rx: 58 }, 22, 0);
        CG.Rabisco(t, { cx: 1000, cy: 880, rx: 380, ry: 110, cor: '#d8261c', sem: 7, voltas: 1.1 });
      }
      // ================= TELA 3: VAI FAZER SENTIDO (rasgo revela o vídeo) =================
      {
        const t = div(cena, { inset: '0px' }); telas.push(t);
        const furo = CG.rasgado(1200, 440, 880, 700, -3, 31, 22, 12);
        const uso = { clip: 'vocal-7522', ini: 30, rosto: 300, cx: 1230, cy: 360, box: [740, 70, 1660, 820] };
        const vid = ML.Video(t); vids.push([vid, uso]);
        const fora = (pts) => `path(evenodd, "M-200 -200 H${W + 200} V${H + 200} H-200 Z ${CG.pathD(pts)}")`;
        div(t, { inset: '0px', background: 'rgba(0,0,0,.5)', clipPath: fora(CG.cresce(furo, 1200, 440, -14)), filter: 'blur(12px)' });
        div(t, { inset: '0px', background: '#f6f1e6', clipPath: fora(furo) });
        div(t, { inset: '0px', background: 'url(tex/papel-amassado.jpg) center / cover', clipPath: fora(CG.cresce(CG.rasgado(1200, 440, 880, 700, -3, 32, 22, 12), 1200, 440, 12)) });
        linhas(t, 70, 90, 420, 300, -3);
        CG.Recorte(t, 'guit2', { cx: 260, cy: 600, h: 960, rot: -3 });
        img(t, 'rec/caveira.png', { left: '1610px', top: '20px', width: '290px', opacity: '.9', transform: 'rotate(10deg)', mixBlendMode: 'multiply' });
        CG.Fita(t, { cx: 760, cy: 110, w: 230, rot: -34, sem: 13 });
        const L = CG.Letras(t, { formas: [furo] }); vids.push([L.vInv, uso]);
        const e = L.etiqueta({ txt: 'VAI FAZER', tam: 150, cor: '#f3e6cc', fundo: '#141210', sem: 9 }); depois.push(() => e.poe(470, 560, 'rotate(-4deg)'));
        grande(L, 'sentido', 330, 1160, 790, { rx: 18 }, 31, 5);
      }
      depois.forEach((f) => f());
    },
    seek(t) {
      const k = Math.min(telas.length - 1, Math.floor(t)); const espera = [];
      telas.forEach((el, i) => { el.style.display = i === k ? '' : 'none'; });
      vids.forEach(([v, u]) => ML.poeVideo(v, u, 0, espera));
      return espera.length ? Promise.all(espera) : undefined;
    },
  };
})();
