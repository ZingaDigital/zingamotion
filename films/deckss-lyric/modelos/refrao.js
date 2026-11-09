// Refrão 1 completo (faixa 49,75 a 75,35): "Se cada adeus fosse visível" ... "Vai fazer sentido" + arte do título.
// Uma cena por verso; vídeo e fotos alternam (um vídeo por vez). Colagem em papel amassado, lettering aprovado em 3D,
// apoio em Anton nas etiquetas, negativo onde a letra cruza o vídeo, paralaxe (fotos derivam mais que o papel).
(() => {
  const OFF = 49.75, DUR = 25.6, BT = 60 / 163;
  const BATIDAS = []; for (let k = Math.ceil(OFF / BT); k * BT < OFF + DUR; k++) BATIDAS.push(+(k * BT - OFF).toFixed(3));
  Object.assign(C, { OFF, DUR, BATIDAS });
  const { W, H, div, img } = C;
  const TFIM = 73.55 - OFF;
  const CREME = '#f3e6cc', PRETO = '#141210', VERM = '#d8261c', FITA = 'rgba(236,228,206,.88)';

  // ---------- roteiro ----------
  const CENAS = [
    { linha: 12, tipo: 'papel', recortes: [['vocal2', 1640, 600, 980, 4]],
      deco: [['sucata', 560, 300, 1150, 300, -3, PRETO, 51], ['linhas', 80, 600, 460, 360, -4], ['ret', -260, 560, 860], ['fita', 1500, 120, 200, -30]],
      itens: [{ etq: 'SE CADA', tam: 130, cx: 330, cy: 215, rz: -3 }, { w: 'adeus', tam: 300, cx: 760, cy: 390, ry: -24 },
        { etq: 'FOSSE', tam: 120, cor: PRETO, fundo: CREME, cx: 290, cy: 720, rz: 4 }, { w: 'visível', tam: 280, cx: 840, cy: 790, rx: 40, pingos: 0 }] },
    { linha: 13, tipo: 'lateral', peca: { cx: 1530, cy: 540, w: 700, h: 1000, rot: -2.5, sem: 14 },
      uso: { clip: 'vocal-7501', ini: 120, rosto: 300, cx: 1560, cy: 360, box: [1170, 20, 1890, 1070] },
      deco: [['sucata', 430, 225, 820, 210, 2, PRETO, 52], ['ret', -200, 520, 760], ['fita', 1250, 70, 200, -28], ['fita', 1800, 1010, 200, -20]],
      itens: [{ etq: 'TALVEZ A GENTE', tam: 115, cx: 440, cy: 222, rz: 2 }, { w: 'aprendesse', tam: 225, cx: 930, cy: 480, ry: 18 },
        { etq: 'A', tam: 130, fundo: VERM, cx: 230, cy: 800, rz: -5 }, { w: 'olhar', tam: 300, cx: 860, cy: 810, ry: 18 }] },
    { linha: 14, tipo: 'papel', recortes: [['volcom', 250, 640, 900, -4], ['moletom', 1700, 720, 740, 5]],
      deco: [['sucata', 960, 560, 2300, 360, 3, PRETO, 53], ['linhas', 1250, 120, 480, 280, 4], ['fita', 1580, 340, 190, 25]],
      itens: [{ etq: 'MAS MESMO', tam: 110, cor: PRETO, fundo: CREME, cx: 760, cy: 175, rz: -3 }, { etq: 'QUANDO TUDO', tam: 110, fundo: VERM, cx: 1060, cy: 300, rz: 2 },
        { etq: 'PARECE', tam: 120, cx: 650, cy: 470, rz: -2 }, { w: 'perdido', tam: 310, cx: 1040, cy: 650, ry: -28 }] },
    { linha: 15, tipo: 'papel', recortes: [['guit2', 260, 620, 960, -3], ['tatuado', 1690, 330, 470, 6]],
      deco: [['sucata', 1000, 330, 900, 360, -4, PRETO, 54], ['ret', 1150, 500, 900], ['linhas', 1240, 640, 520, 340, 3], ['fita', 1540, 130, 180, -24]],
      itens: [{ etq: 'AINDA', tam: 140, cx: 760, cy: 250, rz: -4 }, { etq: 'EXISTE UM', tam: 140, cx: 1000, cy: 410, rz: 3 },
        { w: 'lugar', tam: 380, cx: 1060, cy: 760, rx: 46, pingos: 0 }] },
    { linha: 16, tipo: 'lateral', peca: { cx: 1540, cy: 540, w: 690, h: 1000, rot: 2.5, sem: 4 },
      uso: { clip: 'vocal-0342', ini: 50, rosto: 300, cx: 1600, cy: 330, box: [1170, 20, 1900, 1070] }, recortes: [['bateria', 600, 1000, 420, -9]],
      deco: [['linhas', 60, 560, 520, 380, -4], ['sucata', 420, 210, 760, 230, -3, PRETO, 41], ['ret', -240, 480, 820], ['fita', 1270, 70, 210, -28], ['fita', 1810, 1010, 210, -22], ['rabisco', 330, 740, 175, 125, PRETO, -6]],
      itens: [{ etq: 'ONDE AS', tam: 150, cx: 430, cy: 205, rz: -3 }, { w: 'memórias', tam: 250, cx: 960, cy: 440, ry: 20, rz: -2 },
        { etq: 'NÃO', tam: 170, fundo: VERM, cx: 330, cy: 740, rz: 5 }, { w: 'morrem', tam: 280, cx: 1010, cy: 770, ry: 20, rz: 1 }] },
    { linha: 17, tipo: 'papel', recortes: [['baixo', 260, 760, 600, -5], ['bateria', 1740, 640, 820, 6]],
      deco: [['sucata', 960, 440, 2300, 400, -4, PRETO, 21], ['linhas', 1240, 700, 520, 330, 3], ['ret', 1180, -300, 1000], ['fita', 1640, 160, 190, 28], ['rabisco', 1000, 880, 380, 110, VERM, 0]],
      itens: [{ etq: 'ONDE', tam: 130, cx: 560, cy: 370, rz: -3 }, { etq: 'O', tam: 130, cor: PRETO, fundo: CREME, cx: 610, cy: 510, rz: 4 },
        { w: 'tempo', tam: 330, cx: 1220, cy: 440, ry: 30, rz: -3, pingos: 0 }, { etq: 'NÃO', tam: 110, cor: PRETO, fundo: CREME, cx: 1170, cy: 690, rz: -4 },
        { etq: 'VENCE', tam: 110, fundo: VERM, cx: 1400, cy: 700, rz: 3 }, { etq: 'O', tam: 130, fundo: PRETO, cx: 640, cy: 880, rz: -6 },
        { w: 'amor', tam: 360, cx: 1000, cy: 870, rx: 58, pingos: 0 }] },
    { linha: 18, tipo: 'lateral', peca: { cx: 390, cy: 540, w: 700, h: 1000, rot: 2.5, sem: 18 },
      uso: { clip: 'guit-0049', ini: 200, rosto: 280, cx: 380, cy: 330, box: [20, 20, 760, 1070] },
      deco: [['sucata', 1350, 300, 1100, 380, 3, PRETO, 55], ['ret', 1200, 600, 900], ['linhas', 1300, 760, 480, 260, -3], ['fita', 640, 80, 200, 26], ['caveira', 1640, 820, 240, -8]],
      itens: [{ etq: 'E UM DIA', tam: 130, cx: 1290, cy: 200, rz: 3 }, { etq: 'TUDO QUE HOJE É', tam: 110, cor: PRETO, fundo: CREME, cx: 1260, cy: 390, rz: -2 },
        { w: 'pergunta', tam: 270, cx: 1080, cy: 700, ry: -20 }] },
    { linha: 19, tipo: 'furo', furo: { cx: 1200, cy: 440, w: 880, h: 700, rot: -3, sem: 31 }, recortes: [['vocal', 250, 600, 900, -3]],
      uso: { clip: 'vocal-7522', ini: 10, rosto: 300, cx: 1230, cy: 360, box: [740, 70, 1660, 820] },
      deco: [['linhas', 70, 90, 420, 300, -3], ['caveira', 1750, 150, 290, 10], ['fita', 760, 110, 230, -34]],
      itens: [{ etq: 'VAI FAZER', tam: 150, fundo: PRETO, cx: 470, cy: 560, rz: -4 }, { w: 'sentido', tam: 330, cx: 1160, cy: 790, rx: 18 }] },
  ];

  let cenas = [], titulo, grg;
  const decoPoe = (t, d) => {
    const [k, ...a] = d;
    if (k === 'sucata') div(t, { inset: '0px', background: a[5], clipPath: CG.poly(CG.rasgado(a[0], a[1], a[2], a[3], a[4], a[6], 16, 12)), filter: 'drop-shadow(6px 8px 4px rgba(0,0,0,.3))' });
    else if (k === 'linhas') { const [x, y, w, h, r] = a; C.svg(t, W, H, `<g transform="rotate(${r} ${x + w / 2} ${y + h / 2})" stroke="#1d1a17" stroke-width="1.6" opacity=".45">${[0, 1, 2, 3, 4].map((i) => `<line x1="${x}" y1="${y + i * h / 4}" x2="${x + w}" y2="${y + i * h / 4}"/>`).join('')}${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${x + i * w / 5}" y1="${y}" x2="${x + i * w / 5}" y2="${y + h}"/>`).join('')}</g>`, { left: '0px', top: '0px' }); }
    else if (k === 'ret') img(t, 'tex/reticula-disco.png', { left: a[0] + 'px', top: a[1] + 'px', width: a[2] + 'px', opacity: '.45', filter: 'invert(1)', mixBlendMode: 'multiply' });
    else if (k === 'fita') CG.Fita(t, { cx: a[0], cy: a[1], w: a[2], rot: a[3], cor: FITA, sem: a[0] % 97 });
    else if (k === 'caveira') img(t, 'rec/caveira.png', { left: a[0] - a[2] / 2 + 'px', top: a[1] - a[2] / 2 + 'px', width: a[2] + 'px', opacity: '.9', transform: `rotate(${a[3]}deg)`, mixBlendMode: 'multiply' });
    else if (k === 'rabisco') CG.Rabisco(t, { cx: a[0], cy: a[1], rx: a[2], ry: a[3], cor: a[4], sem: a[0] % 13, larg: 5, rot: a[5], voltas: 1.15 });
  };

  window.MODELO = {
    async montar(cena) {
      await ML.carregar(); await document.fonts.load('100px Anton', 'ÃÕÓÉ');
      const letra = await fetch('letra.json').then((r) => r.json());
      for (const cf of CENAS) {
        const pals = letra.find((l) => l.linha === cf.linha).palavras.map((p) => ({ ...p, t: p.t - OFF }));
        const raiz = div(cena, { inset: '0px', transformOrigin: '50% 50%' });
        const S = { cf, raiz, vids: [], recs: [], itens: [], t0: pals[0].t - 0.22 };
        let formas = [];
        if (cf.tipo === 'furo') {
          const f = cf.furo, furo = CG.rasgado(f.cx, f.cy, f.w, f.h, f.rot, f.sem, 22, 12), fora = (pts) => `path(evenodd, "M-200 -200 H${W + 200} V${H + 200} H-200 Z ${CG.pathD(pts)}")`;
          S.vids.push([ML.Video(raiz), cf.uso]);
          div(raiz, { inset: '0px', background: 'rgba(0,0,0,.5)', clipPath: fora(CG.cresce(furo, f.cx, f.cy, -14)), filter: 'blur(12px)' });
          div(raiz, { inset: '0px', background: '#f6f1e6', clipPath: fora(furo) });
          div(raiz, { inset: '0px', background: 'url(tex/papel-amassado.jpg) center / cover', clipPath: fora(CG.cresce(CG.rasgado(f.cx, f.cy, f.w, f.h, f.rot, f.sem + 1, 22, 12), f.cx, f.cy, 12)) });
          formas = [furo];
        } else div(raiz, { inset: '0px', background: 'url(tex/papel-amassado.jpg) center / cover' });
        (cf.deco || []).filter((d) => d[0] !== 'fita' && d[0] !== 'rabisco').forEach((d) => decoPoe(raiz, d));
        const camRec = div(raiz, { inset: '0px' });
        (cf.recortes || []).forEach(([n, cx, cy, h, rot]) => S.recs.push(CG.Recorte(camRec, n, { cx, cy, h, rot })));
        if (cf.tipo === 'lateral') { const pv = CG.PedacoVideo(raiz, cf.peca); S.vids.push([pv.v, cf.uso]); formas = [pv.pts]; }
        (cf.deco || []).filter((d) => d[0] === 'fita' || d[0] === 'rabisco').forEach((d) => decoPoe(raiz, d));
        const L = CG.Letras(raiz, { formas }); if (L.vInv) S.vids.push([L.vInv, cf.uso]);
        S.camRec = camRec;
        // itens consomem as palavras da letra em ordem
        let k = 0;
        cf.itens.forEach((it, i) => {
          if (it.etq) {
            const n = it.etq.split(' ').length, ts = pals.slice(k, k + n).map((p) => p.t); k += n;
            const e = L.etiqueta({ txt: it.etq, tam: it.tam, cor: it.cor || CREME, fundo: it.fundo, sem: cf.linha * 10 + i });
            S.itens.push({ tipo: 'etq', e, ts, it });
          } else {
            const p = L.palavra(it.w, it.tam, cf.linha * 10 + i, it.pingos ?? 3); const a = pals[k++].t;
            S.itens.push({ tipo: 'w', p, a, it });
          }
        });
        cenas.push(S);
      }
      titulo = img(cena, 'rec/titulo-caveira.png', { left: '0px', top: '0px', width: '1150px', transformOrigin: '50% 60%', filter: 'drop-shadow(14px 18px 8px rgba(0,0,0,.45))' });
      grg = ML.Grunge(cena);
    },
    seek(t) {
      const espera = [];
      let ci = 0; cenas.forEach((S, i) => { if (t >= S.t0) ci = i; });
      cenas.forEach((S, i) => {
        const on = i === ci; S.raiz.style.display = on ? '' : 'none';
        if (!on) return;
        const prox = cenas[i + 1], fim = prox ? prox.t0 : DUR, tl = t - S.t0;
        // entrada: papel batido (mola curta); saída: empurrão de câmera nos últimos 0,12 s; deriva lenta no meio
        const p = i === 0 ? 1 : M.spring(tl, 3.6, 0.62), sai = M.E.sai(M.prog(t, fim - 0.12, fim));
        const s = M.lerp(1.12, 1, p) * (1 + 0.035 * tl / (fim - S.t0)) * (1 + 0.22 * sai), r = (1 - p) * (i % 2 ? 2 : -2);
        S.raiz.style.transform = `translate(${M.wiggle(t, 0.5, 4, i).toFixed(1)}px, ${M.wiggle(t, 0.4, 3, i + 9).toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
        S.camRec.style.transform = `translate(${(-tl * 9 * (i % 2 ? 1 : -1)).toFixed(1)}px, ${(-tl * 3).toFixed(1)}px) scale(${(1 + 0.02 * tl).toFixed(4)})`;
        S.vids.forEach(([v, u]) => ML.poeVideo(v, u, Math.max(0, tl), espera));
        const final = t >= TFIM - 0.1 && i === cenas.length - 1;
        S.itens.forEach((o, j) => {
          if (o.tipo === 'etq') {
            const a = o.ts[0]; const vis = t >= a - 0.02 && !final; o.e.vis(vis); if (!vis) return;
            o.e.mostra(o.ts.filter((x) => t >= x - 0.02).length);
            const q = M.spring(t - a, 4, 0.58), sc = M.lerp(1.35, 1, q), rz = (o.it.rz || 0) + (1 - q) * (j % 2 ? 8 : -8);
            o.e.poe(o.it.cx, o.it.cy, `rotate(${rz.toFixed(2)}deg) scale(${sc.toFixed(4)})`);
          } else {
            const a = o.a, vis = t >= a - 0.06 && !final; o.p.vis(vis); if (!vis) return;
            const q = M.spring(t - (a - 0.06), 3.0, 0.62), it = o.it, d = j % 2 ? 1 : -1;
            const ry = (it.ry || 0) + (1 - q) * 50 * d, rx = (it.rx || 0) + (1 - q) * 25, sc = M.lerp(1.55, 1, q);
            o.p.poe((P) => `translate(${(it.cx - P.cx0).toFixed(1)}px, ${(it.cy - P.cy0).toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) rotate(${(it.rz || 0).toFixed(2)}deg) scale(${sc.toFixed(4)})`);
            [o.p.a, o.p.b].forEach((P) => P && ML.escorre(P, t, a + 0.1));
          }
        });
      });
      // título final
      const on = t >= TFIM - 0.08; titulo.style.display = on ? '' : 'none';
      if (on) {
        let y = 560, sq = 0;
        if (t < TFIM) y = M.lerp(-520, 560, M.prog(t, TFIM - 0.08, TFIM) ** 2); else sq = M.kick(t, TFIM, 0.16, 4.2, 0.4);
        titulo.style.transform = `translate(${1060 - 575}px, ${(y - 520).toFixed(1)}px) rotate(-3deg) scale(${(1 + sq + 0.02 * Math.max(0, t - TFIM)).toFixed(4)}, ${(1 - sq + 0.02 * Math.max(0, t - TFIM)).toFixed(4)})`;
      }
      ML.grunge(grg, t);
      return espera.length ? Promise.all(espera) : undefined;
    },
  };
})();
