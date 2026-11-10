// Refrão 1 (faixa 49,75 a 75,35) num cenário 3D: cada verso é um bloco de palavras num plano do espaço; a câmera
// segue a palavra cantada e chicoteia para o próximo bloco, deixando os anteriores recuando em perspectiva.
// Fundos em tela: papel (colagem), vídeo horizontal em tela cheia (+ recortes nas laterais), vídeo vertical numa
// faixa rasgada que divide a tela (negativo onde a letra cruza). Projeção feita à mão (sem preserve-3d): cada elemento
// recebe câmera × grupo × local; o pai só tem `perspective`.
(() => {
  const OFF = 49.75, DUR = 25.6, BT = 60 / 163;
  const BATIDAS = []; for (let k = Math.ceil(OFF / BT); k * BT < OFF + DUR; k++) BATIDAS.push(+(k * BT - OFF).toFixed(3));
  Object.assign(C, { OFF, DUR, BATIDAS });
  window.GRUNGE_SUJ = 0.2; window.VIDEO_TOM = 0.07;
  const { W, H, div, img } = C;
  const P = 1600, TFIM = 73.55 - OFF;
  const CREME = '#f3e6cc', PRETO = '#141210', VERM = '#d8261c';
  const rad = (d) => d * Math.PI / 180;

  // ---------- roteiro: linhas do bloco ([pilha], 'grande', [pilha]); grupo no mundo; fundo ----------
  // fundos: 'cheio' (vídeo em tela cheia), 'faixa' (vertical em faixa rasgada sobre papel), 'furo' (rasgo no papel
  // revela o vídeo), 'cortes' (um integrante por batida). desloc: onde o bloco fica na tela (deixa o rosto livre).
  const CENAS = [
    { linha: 12, g: [0, 0, 0, 0, 0, 0], sway: [-24, 6], desloc: [60, 290], larg: 1300,
      fundo: { tipo: 'cheio', uso: { clip: 'vocal-0342', ini: 3, rosto: 520, cx: 1080, cy: 300 } },
      linhas: [[['Se', 'cada'], 'adeus'], [['fosse'], 'visível']] },
    { linha: 13, g: [2300, -300, -800, -55, 0, 0], sway: [24, -6], desloc: [-280, 0], larg: 1150,
      fundo: { tipo: 'recorte', nome: 'vocal2', cx: 1480, cy: 700, h: 1450, rot: 3 },
      linhas: [[['Talvez', 'a'], 'gente'], ['aprendesse'], [['a'], 'olhar']] },
    { linha: 14, g: [2700, 1500, -2900, -20, 55, 0], sway: [-20, -12], desloc: [300, 0], larg: 1150,
      fundo: { tipo: 'faixa', lado: 'esq', uso: { clip: 'guit-0049', ini: 230, rosto: 190, cy: 210 } },
      linhas: [[['Mas', 'mesmo'], 'quando'], [['tudo', 'parece'], 'perdido']] },
    { linha: 15, g: [600, 2300, -4300, 38, 0, -7], sway: [20, 10], desloc: [0, 300], larg: 1250,
      fundo: { tipo: 'imagem', src: 'magnific/lugar.jpg' },
      linhas: [[['Ainda'], 'existe'], [['um'], 'lugar']] },
    { linha: 16, g: [-1800, 1500, -5800, 72, 0, 0], sway: [-12, 6], desloc: [-330, 200], larg: 980,
      fundo: { tipo: 'moldura', furo: [960, 540, 1830, 1000, 0.6], uso: { clip: 'bateria-1317', rosto: 300, cx: 1250, cy: 330, deriva: 0.02 }, picos: [341, 356, 378, 393, 404, 432, 446, 468, 528, 539, 571, 591] },
      linhas: [[['Onde', 'as'], 'memórias'], [['não'], 'morrem']] },
    { linha: 17, g: [-2500, -600, -7400, 25, -48, 0], sway: [24, 8], desloc: [0, 280], larg: 1150,
      fundo: { tipo: 'cheio', uso: { clip: 'baixo-1252', ini: 150, rosto: 340, cx: 980, cy: 330 } },
      linhas: [[['Onde', 'o'], 'tempo', ['não', 'vence']], [['o'], 'amor']] },
    { linha: 18, g: [-300, -1900, -8900, -35, 0, 6], sway: [-20, -8], desloc: [-320, -15], larg: 900,
      fundo: { tipo: 'faixa', lado: 'dir', uso: { clip: 'guit2-1606', ini: 100, rosto: 220, cy: 260 } },
      linhas: [[['E', 'um'], 'dia'], [['tudo', 'que'], 'hoje'], [['é'], 'pergunta']] },
    { linha: 19, g: [1800, -1200, -10500, 0, 18, 0], sway: [16, 6], desloc: [0, 250], larg: 1350,
      fundo: { tipo: 'ident' },
      linhas: [[['Vai', 'fazer'], 'sentido']] },
  ];
  // ---------- matemática da câmera (convenções do CSS: y para baixo) ----------
  const rotY = ([x, y, z], a) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [x * c + z * s, y, -x * s + z * c]; };
  const rotX = ([x, y, z], a) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [x, y * c - z * s, y * s + z * c]; };
  const rotZ = ([x, y, z], a) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [x * c - y * s, x * s + y * c, z]; };
  const aplica = (v, ry, rx, rz) => rotY(rotX(rotZ(v, rz), rx), ry);                // R = Ry·Rx·Rz
  const desfaz = (v, ry, rx, rz) => rotZ(rotX(rotY(v, -ry), -rx), -rz);
  const camStr = (c) => `rotateZ(${(-c.rz).toFixed(3)}deg) rotateX(${(-c.rx).toFixed(3)}deg) rotateY(${(-c.ry).toFixed(3)}deg) translate3d(${(-c.x).toFixed(1)}px, ${(-c.y).toFixed(1)}px, ${(-c.z).toFixed(1)}px)`;
  const grpStr = (g) => `translate3d(${g[0]}px, ${g[1]}px, ${g[2]}px) rotateY(${g[3]}deg) rotateX(${g[4]}deg) rotateZ(${g[5]}deg)`;
  const prof = (cam, g, l) => { const p = aplica(l, g[3], g[4], g[5]); return desfaz([g[0] + p[0] - cam.x, g[1] + p[1] - cam.y, g[2] + p[2] - cam.z], cam.ry, cam.rx, cam.rz)[2]; };

  // ---------- encaixe do bloco (coordenadas locais, centro 0,0) ----------
  let ANT = null;
  const anton = (w) => { if (!ANT) { const c = document.createElement('canvas').getContext('2d'); c.font = '100px Anton'; const m = c.measureText('H'); ANT = { c, cap: m.actualBoundingBoxAscent / 100, A: m.fontBoundingBoxAscent / 100, D: m.fontBoundingBoxDescent / 100 }; } return ANT.c.measureText(w.toUpperCase()).width / 100; };
  const montaBloco = (linhas, larg = 1500, gapY = 50) => {
    const CAP = 0.86, out = [];
    const rows = linhas.map((ln) => {
      const its = ln.map((it) => {
        if (typeof it === 'string') return { w: it, larg: ML.medida(it).w100, alt: CAP * 100 };
        // largura comum da pilha; cada palavra limitada a 60% da altura (palavra curta não engole a pilha)
        const g = 8, alvo = CAP * 100 - g * (it.length - 1), hMax = alvo * (it.length > 1 ? 0.6 : 1);
        const alt = (Ws) => it.reduce((a, w) => a + Math.min(hMax, Ws * ANT.cap / anton(w)), 0);
        let lo = 1, hi = 2000; for (let n = 0; n < 40; n++) { const m = (lo + hi) / 2; if (alt(m) < alvo) lo = m; else hi = m; }
        return { pilha: it, larg: lo, g, hMax };
      });
      const tot = its.reduce((a, b) => a + b.larg, 0) + 22 * (its.length - 1), k = larg / tot;
      return { its, k, h: CAP * 100 * k };
    });
    const altura = rows.reduce((a, r) => a + r.h, 0) + gapY * (rows.length - 1);
    let y = -altura / 2;
    rows.forEach((r) => {
      let x = -larg / 2;
      r.its.forEach((it) => {
        const L = it.larg * r.k;
        if (it.w) out.push({ w: it.w, tipo: 'grande', tam: 100 * r.k, lx: x + L / 2, ly: y + r.h / 2 });
        else { let yy = y + (r.h - it.pilha.reduce((a, w) => a + Math.min(it.hMax * r.k, ANT.cap * L / anton(w)), 0) - it.g * r.k * (it.pilha.length - 1)) / 2; it.pilha.forEach((w) => { const h = Math.min(it.hMax * r.k, ANT.cap * L / anton(w)), tam = h / ANT.cap; out.push({ w, tipo: 'peq', tam, lx: x + L / 2, ly: yy + h / 2 }); yy += h + it.g * r.k; }); }
        x += L + 22 * r.k;
      });
      y += r.h + gapY;
    });
    return out;
  };

  let cenas = [], titulo, grg, papel, vCheio, faixa, furoL, imgL, identL, recL, mundo, letrasHost;

  window.MODELO = {
    async montar(cena) {
      await ML.carregar(); await document.fonts.load('100px Anton', 'ÃÕÓÉ'); anton('A');
      const letra = await fetch('letra.json').then((r) => r.json());
      // fundos de tela
      papel = div(cena, { left: '-120px', top: '-80px', width: W + 240 + 'px', height: H + 160 + 'px', background: 'url(tex/papel-creme.jpg) center / cover' });
      img(papel, 'tex/reticula-disco.png', { left: '-150px', top: '380px', width: '1100px', opacity: '.35', filter: 'invert(1)', mixBlendMode: 'multiply' });
      vCheio = ML.Video(cena);
      imgL = img(cena, 'magnific/lugar.jpg', { left: '-60px', top: '-40px', width: W + 120 + 'px', height: H + 80 + 'px', objectFit: 'cover', transformOrigin: '50% 50%' });
      identL = div(cena, { inset: '0px' });
      img(identL, 'tex/reticula-disco.png', { left: '560px', top: '-120px', width: '1300px', opacity: '.5', filter: 'invert(1)', mixBlendMode: 'multiply' });
      identL.cav = img(identL, 'rec/caveira.png', { left: '0px', top: '0px', width: '980px', filter: 'invert(1) contrast(1.4)', mixBlendMode: 'multiply', opacity: '.95', transformOrigin: '50% 50%' });
      [[260, 180, 300, 90, -14, '#ffc21a'], [1580, 860, 380, 110, 9, '#e8261c'], [1650, 170, 160, 60, 24, '#ffc21a']].forEach(([x, y, w, h, r, c], k) => div(identL, { inset: '0px', background: c, opacity: '.9', mixBlendMode: 'multiply', clipPath: CG.poly(CG.rasgado(x, y, w, h, r, 90 + k, 14, 10)) }));
      recL = img(cena, 'footage/recorte/vocal2-bit.png', { left: '0px', top: '0px', transformOrigin: '50% 50%', filter: 'drop-shadow(14px 18px 8px rgba(0,0,0,.4))' });
      furoL = { raiz: div(cena, { inset: '0px' }) };
      furoL.sombra = div(furoL.raiz, { inset: '0px', background: 'rgba(0,0,0,.5)', filter: 'blur(12px)' });
      furoL.fibra = div(furoL.raiz, { inset: '0px', background: '#f6f1e6' });
      furoL.papel = div(furoL.raiz, { inset: '0px', background: 'url(tex/papel-creme.jpg) center / cover' });
      img(furoL.papel, 'tex/reticula-disco.png', { left: '-200px', top: '300px', width: '1100px', opacity: '.35', filter: 'invert(1)', mixBlendMode: 'multiply' });
      faixa = { raiz: div(cena, { inset: '0px' }) };
      faixa.sombra = div(faixa.raiz, { inset: '0px', background: 'rgba(0,0,0,.4)', filter: 'blur(8px)' });
      faixa.fibra = div(faixa.raiz, { inset: '0px', background: '#f6f1e6' });
      faixa.caixa = div(faixa.raiz, { inset: '0px' }); faixa.v = ML.Video(faixa.caixa);
      mundo = div(cena, { inset: '0px', perspective: P + 'px', perspectiveOrigin: '50% 50%' });
      letrasHost = div(cena, { inset: '0px' });
      for (const [ci, cf] of CENAS.entries()) {
        const pals = letra.find((l) => l.linha === cf.linha).palavras.map((p) => ({ ...p, t: p.t - OFF }));
        const S = { cf, t0: pals[0].t - 0.25, els: [], itens: [] };
        // faixa rasgada (vertical): polígono em tela
        let formas = [];
        if (cf.fundo.tipo === 'faixa') {
          const dir = cf.fundo.lado === 'dir', cx = dir ? 1520 : 400;
          S.faixaPts = CG.rasgado(cx, 540, 760, 1240, dir ? 2 : -2, 60 + ci, 16, 11);
          S.faixaBox = dir ? [1120, 0, 1920, 1080] : [0, 0, 800, 1080];
          S.faixaCx = cx; formas = [S.faixaPts];
        }
        if (cf.fundo.tipo === 'moldura') {
          const [fx, fy, fw, fh, fr] = cf.fundo.furo; S.furoPts = CG.rasgado(fx, fy, fw, fh, fr, 80 + ci, 14, 11); S.furoC = [fx, fy];
          const bs = BATIDAS.filter((b) => b >= S.t0 - 0.05 && b < S.t0 + 4), pk = cf.fundo.picos;
          S.ancora = [bs[1] - S.t0, pk[0]];   // velocidade natural; só um golpe da caixa cai em cima de uma batida
        }
        if (cf.fundo.tipo === 'furo') { const [fx, fy, fw, fh, fr] = cf.fundo.furo; S.furoPts = CG.rasgado(fx, fy, fw, fh, fr, 80 + ci, 22, 12); S.furoC = [fx, fy]; formas = [S.furoPts]; }
        // colagem do mundo (recortes e sucata)
        for (const it of (cf.itens || [])) {
          if (it[0] === 'rec') {
            const [, n, lx, ly, lz, h, rz] = it, el = img(mundo, `footage/recorte/${n}-bit.png`, { left: '0px', top: '0px', height: h + 'px', filter: 'drop-shadow(10px 14px 6px rgba(0,0,0,.35))' });
            await el.decode().catch(() => {}); const w = el.naturalWidth * h / el.naturalHeight;
            Object.assign(el.style, { left: W / 2 - w / 2 + 'px', top: H / 2 - h / 2 + 'px', width: w + 'px', transformOrigin: '50% 50%' });
            S.itens.push({ el, l: [lx, ly, lz], loc: `rotate(${rz}deg)` });
          } else {
            const [, lx, ly, lz, w, h, rz, cor] = it, el = div(mundo, { left: W / 2 - w / 2 - 20 + 'px', top: H / 2 - h / 2 - 20 + 'px', width: w + 40 + 'px', height: h + 40 + 'px', background: cor, transformOrigin: '50% 50%',
              clipPath: CG.poly(CG.rasgado(w / 2 + 20, h / 2 + 20, w, h, 0, 70 + ci, 16, 12)) });
            S.itens.push({ el, l: [lx, ly, lz], loc: `rotate(${rz}deg)` });
          }
        }
        // letras: camada própria com negativo quando a cena tem faixa
        S.L = CG.Letras(letrasHost, { formas });
        S.L.normal.style.perspective = P + 'px'; S.L.normal.style.perspectiveOrigin = '50% 50%';
        S.clip = S.L.normal.style.clipPath;
        if (S.L.inv) { const silEl = S.L.inv.lastChild; silEl.style.perspective = P + 'px'; silEl.style.perspectiveOrigin = '50% 50%'; }
        const naPapel = ['faixa', 'furo', 'recorte', 'ident'].includes(cf.fundo.tipo);
        const bloco = montaBloco(cf.linhas, cf.larg || 1500);
        bloco.forEach((b, k) => {
          b.t = pals[k] ? pals[k].t : pals[pals.length - 1].t;
          if (b.tipo === 'grande') {
            const p = S.L.palavra(b.w, b.tam, cf.linha * 10 + k, ML.regra(b.w).chave ? 4 : 2);
            [p.a, p.b].forEach((Q) => { if (!Q) return; Object.assign(Q.el.style, { left: (W / 2 - Q.cx0) + 'px', top: (H / 2 - Q.cy0) + 'px' }); });
            b.el = p;
          } else {
            const cor = naPapel ? (k % 3 === 2 ? VERM : PRETO) : CREME;
            const mk = (camada) => { const d = div(camada, { left: '0px', top: '0px', fontFamily: 'Anton', fontSize: b.tam + 'px', lineHeight: '1', whiteSpace: 'nowrap', color: cor, transformOrigin: '50% 50%' }, b.w.toUpperCase());
              const w = d.offsetWidth, hl = (1 - (ANT.A + ANT.D)) / 2, capC = (hl + ANT.A - ANT.cap / 2) * b.tam;
              d.style.left = (W / 2 - w / 2) + 'px'; d.style.top = (H / 2 - capC) + 'px'; d.style.transformOrigin = `${w / 2}px ${capC}px`;
              if (!naPapel) d.style.textShadow = '4px 5px 0 rgba(0,0,0,.6)';
              return d; };
            const a = mk(S.L.normal), bb = S.L.inv ? mk(S.L.inv.lastChild) : null;
            b.el = { a: { el: a }, b: bb ? { el: bb } : null, vis: (v) => [a, bb].forEach((e) => e && (e.style.display = v ? '' : 'none')), peq: true };
          }
        });
        S.bloco = bloco;
        cenas.push(S);
      }
      titulo = img(cena, 'rec/titulo-caveira.png', { left: '0px', top: '0px', width: '1150px', transformOrigin: '50% 60%', filter: 'drop-shadow(14px 18px 8px rgba(0,0,0,.45))' });
      grg = ML.Grunge(cena);
    },
    seek(t) {
      const espera = [];
      let ci = 0; cenas.forEach((S, i) => { if (t >= S.t0) ci = i; });
      // pose da câmera numa cena: segue a palavra cantada (20%), aproxima devagar, olha de lado (sway)
      const pose = (i, tt) => {
        const S = cenas[i], g = S.cf.g, b = S.bloco, tl = tt - S.t0;
        let ox = 0, oy = 0;
        const ativos = b.filter((x) => tt >= x.t);
        if (ativos.length) {
          const cur = ativos[ativos.length - 1], prev = ativos[ativos.length - 2] || cur, e = M.E.cruza(M.prog(tt, cur.t, cur.t + 0.45));
          ox = M.lerp(prev.lx, cur.lx, e) * 0.22; oy = M.lerp(prev.ly, cur.ly, e) * 0.22;
        }
        const dur = (cenas[i + 1] ? cenas[i + 1].t0 : DUR) - S.t0, f = M.clamp(tl / dur);
        const dz = 380 - 260 * M.E.suave(f), esc = P / (P + dz), [sx0, sy0] = S.cf.desloc || [0, 0];
        const o = aplica([ox - sx0 / esc, oy - sy0 / esc, dz], g[3], g[4], g[5]);
        const sy = M.lerp(S.cf.sway[0], S.cf.sway[0] * 0.35, M.E.suave(f)), sx = M.lerp(S.cf.sway[1], S.cf.sway[1] * 0.3, M.E.suave(f));
        return { x: g[0] + o[0], y: g[1] + o[1], z: g[2] + o[2], ry: g[3] + sy, rx: g[4] + sx, rz: g[5] };
      };
      const camEm = (tt) => {
        let k = 0; cenas.forEach((S, i) => { if (tt >= S.t0 - 0.18) k = i; });
        const a = pose(k, tt); if (k === 0) return a;
        const S = cenas[k], e = M.E.cruza(M.prog(tt, S.t0 - 0.18, S.t0 + 0.32));
        if (e >= 1) return a;
        const b = pose(k - 1, tt); const r = {}; for (const key in a) r[key] = M.lerp(b[key], a[key], e); return r;
      };
      const cam = camEm(t), cam2 = camEm(t + 1 / 30);
      const vel = Math.hypot(cam2.x - cam.x, cam2.y - cam.y, cam2.z - cam.z) / 40 + Math.abs(cam2.ry - cam.ry) + Math.abs(cam2.rx - cam.rx);
      const blur = Math.min(9, Math.max(0, vel - 0.6) * 1.6);
      const cs = camStr(cam);
      // fundo da cena ativa (corte seco no meio do chicote)
      const S = cenas[ci], f = S.cf.fundo, tl = Math.max(0, t - S.t0), fim = t >= TFIM - 0.1;
      const ft = t >= TFIM - 0.1 ? 'ident' : f.tipo;
      const usaCheio = ['cheio', 'furo', 'cortes', 'moldura'].includes(ft);
      papel.style.display = usaCheio || ft === 'imagem' ? 'none' : '';
      furoL.raiz.style.display = ft === 'furo' || ft === 'moldura' ? '' : 'none';
      imgL.style.display = ft === 'imagem' ? '' : 'none';
      if (ft === 'imagem') imgL.style.transform = `translate(${(-cam.ry * 4).toFixed(1)}px, ${(cam.rx * 3).toFixed(1)}px) scale(${(1.02 + 0.03 * tl).toFixed(4)})`;
      identL.style.display = ft === 'ident' ? '' : 'none';
      if (ft === 'ident') { const k2 = BATIDAS.filter((b) => b <= t).pop() ?? 0; const kk = M.kick(t, k2, 0.025, 5, 0.4); identL.cav.style.transform = `translate(${960 - 490 + 80}px, ${540 - 490 - 20}px) rotate(${(-6 + 2 * Math.sin(t * 0.8)).toFixed(2)}deg) scale(${(1 + kk).toFixed(4)})`; }
      recL.style.display = ft === 'recorte' ? '' : 'none';
      if (ft === 'recorte') { const e = M.spring(t - S.t0, 3.2, 0.62), w = recL.naturalWidth * f.h / recL.naturalHeight;
        Object.assign(recL.style, { height: f.h + 'px', width: w + 'px' });
        recL.style.transform = `translate(${(f.cx - w / 2 + (1 - e) * 700 - cam.ry * 7).toFixed(1)}px, ${(f.cy - f.h / 2 + cam.rx * 4).toFixed(1)}px) rotate(${f.rot}deg) scale(${(1 + 0.02 * tl).toFixed(4)})`; }
      if (ft === 'moldura') {
        const [fx, fy] = S.furoC, pts = S.furoPts, fora = (q) => `path(evenodd, "M-200 -200 H${W + 200} V${H + 200} H-200 Z ${CG.pathD(q)}")`;
        furoL.papel.style.clipPath = fora(CG.cresce(pts, fx, fy, 10)); furoL.fibra.style.clipPath = fora(pts); furoL.sombra.style.clipPath = fora(CG.cresce(pts, fx, fy, -12));
        const fr = S.ancora[1] + (tl - S.ancora[0]) * 30;
        ML.poeVideo(vCheio, { ...f.uso, ini: Math.round(fr) }, 0, espera);
      }
      if (ft === 'furo') {
        const ab = M.spring(t - S.t0, 2.6, 0.62), [fx, fy] = S.furoC, pts = S.furoPts.map(([x, y]) => [fx + (x - fx) * (0.15 + 0.85 * ab), fy + (y - fy) * (0.15 + 0.85 * ab)]);
        const fora = (q) => `path(evenodd, "M-200 -200 H${W + 200} V${H + 200} H-200 Z ${CG.pathD(q)}")`;
        furoL.papel.style.clipPath = fora(CG.cresce(pts, fx, fy, 12)); furoL.fibra.style.clipPath = fora(pts); furoL.sombra.style.clipPath = fora(CG.cresce(pts, fx, fy, -14));
        ML.poeVideo(vCheio, f.uso, tl, espera);
        if (S.L.vInv) ML.poeVideo(S.L.vInv, f.uso, tl, espera);
        S.L.normal.style.clipPath = fora(pts); S.L.inv.style.clipPath = `path("${CG.pathD(pts)}")`;
      }
      if (ft === 'cortes') {
        const bs = BATIDAS.filter((b) => b >= S.t0 && b < TFIM); let j = 0; bs.forEach((b, k) => { if (t >= b) j = k; });
        ML.poeVideo(vCheio, f.usos[j % f.usos.length], t - (bs[j] ?? S.t0), espera);
      }
      papel.style.transform = `translate(${(-cam.ry * 3).toFixed(1)}px, ${(cam.rx * 3).toFixed(1)}px) rotate(${(cam.rz * 0.3).toFixed(2)}deg)`;
      vCheio.caixa.style.display = usaCheio ? '' : 'none';
      if (ft === 'moldura') vCheio.caixa.style.transform = `translate(${(-cam.ry * 3).toFixed(1)}px, ${(cam.rx * 2).toFixed(1)}px) scale(1.03)`;
      if (usaCheio && ft !== 'cheio' && ft !== 'moldura') vCheio.caixa.style.transform = `translate(${(-cam.ry * 3).toFixed(1)}px, ${(cam.rx * 2).toFixed(1)}px) scale(1.04)`;
      if (f.tipo === 'cheio') { ML.poeVideo(vCheio, { ...f.uso, deriva: 0.05 }, tl, espera); vCheio.caixa.style.transform = `translate(${(-cam.ry * 4).toFixed(1)}px, ${(cam.rx * 3).toFixed(1)}px) scale(1.06)`; }
      faixa.raiz.style.display = f.tipo === 'faixa' ? '' : 'none';
      if (f.tipo === 'faixa') {
        const ent = M.spring(t - S.t0, 3.2, 0.62), dx = (1 - ent) * (f.lado === 'dir' ? 900 : -900);
        const pts = S.faixaPts.map(([x, y]) => [x + dx, y]);
        faixa.caixa.style.clipPath = CG.poly(pts);
        faixa.fibra.style.clipPath = CG.poly(CG.cresce(pts, S.faixaCx + dx, 540, 9));
        faixa.sombra.style.clipPath = CG.poly(CG.cresce(pts, S.faixaCx + dx, 540, 9).map(([x, y]) => [x + (f.lado === 'dir' ? -14 : 14), y + 12]));
        const [x0, y0, x1, y1] = S.faixaBox, cx = (x0 + x1) / 2;
        ML.poeVideo(faixa.v, { ...f.uso, cx: cx + dx, cy: f.uso.cy ?? 380, box: [x0 + dx, y0, x1 + dx, y1] }, tl, espera);
        if (S.L.vInv) ML.poeVideo(S.L.vInv, { ...f.uso, cx: cx + dx, cy: f.uso.cy ?? 380, box: [x0 + dx, y0, x1 + dx, y1] }, tl, espera);
        S.L.normal.style.clipPath = `path(evenodd, "M-200 -200 H${W + 200} V${H + 200} H-200 Z ${CG.pathD(pts)}")`;
        S.L.inv.style.clipPath = `path("${CG.pathD(pts)}")`;
      }
      // mundo: colagem e palavras de todas as cenas (as anteriores ficam no espaço)
      cenas.forEach((C2, i) => {
        const g = C2.cf.g, gs = grpStr(g), ativa = i === ci;
        const temNeg = ativa && (f.tipo === 'faixa' || f.tipo === 'furo');
        if (C2.L.inv) C2.L.inv.style.display = temNeg ? '' : 'none';
        if (!temNeg) C2.L.normal.style.clipPath = 'none';
        C2.L.normal.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none';
        const visCena = i <= ci + 1 && i >= ci - 2 && !fim;
        C2.itens.forEach((it) => {
          const z = prof(cam, g, it.l), vis = visCena && i <= ci && z < P * 0.75 && z > -9000 && (i === ci || f.tipo !== 'cheio');
          it.el.style.display = vis ? '' : 'none'; if (!vis) return;
          it.el.style.zIndex = String(Math.round(5000 + z));
          it.el.style.transform = `${cs} ${gs} translate3d(${it.l[0]}px, ${it.l[1]}px, ${it.l[2]}px) ${it.loc}`;
        });
        C2.bloco.forEach((b, k) => {
          const a = b.t, vis = visCena && t >= a - 0.08;
          b.el.vis(vis); if (!vis) return;
          const q = M.spring(t - (a - 0.08), (b.tipo === 'peq') ? 4 : 3, 0.6);
          const lz = (b.tipo === 'peq') ? M.lerp(500, 0, q) : M.lerp(-900, 0, q), extraY = (1 - q) * (k % 2 ? 40 : -40);
          const z = prof(cam, g, [b.lx, b.ly, lz]);
          if (z > P * 0.8) { b.el.vis(false); return; }
          const loc = `translate3d(${b.lx.toFixed(1)}px, ${b.ly.toFixed(1)}px, ${lz.toFixed(1)}px) rotateY(${extraY.toFixed(2)}deg)`;
          [b.el.a, b.el.b].forEach((Q) => { if (!Q) return; Q.el.style.zIndex = String(Math.round(5000 + z)); Q.el.style.transform = `${cs} ${gs} ${loc}`; });
          if (!(b.tipo === 'peq')) [b.el.a, b.el.b].forEach((Q) => Q && ML.escorre(Q, t, a + 0.1));
        });
      });
      // título final na tela
      const on = t >= TFIM - 0.08; titulo.style.display = on ? '' : 'none';
      if (on) {
        let y = 560, sq = 0;
        if (t < TFIM) y = M.lerp(-520, 560, M.prog(t, TFIM - 0.08, TFIM) ** 2); else sq = M.kick(t, TFIM, 0.16, 4.2, 0.4);
        const s = 1 + 0.025 * Math.max(0, t - TFIM);
        titulo.style.transform = `translate(${960 - 575}px, ${(y - 520).toFixed(1)}px) rotate(-3deg) scale(${(s + sq).toFixed(4)}, ${(s - sq).toFixed(4)})`;
      }
      ML.grunge(grg, t);
      return espera.length ? Promise.all(espera) : undefined;
    },
  };
})();
