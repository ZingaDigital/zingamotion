// Deckss | "Vai Fazer Sentido" | 30 s, 9:16. Grade 163 BPM (beats.json); compasso começa em k % 4 == 2.
// Marcos da música editada: golpe 5.476 · banda 6.626 (k18) · voz ~7.33 · parada 13.620 (k37) · refrão 13.988 (k38).
(() => {
  const B = (k) => k * (60 / 163), E = M.E;
  const SONG0 = 49.670 - 13.620;            // tempo da faixa = t + SONG0 depois do corte do refrão
  const DUR_FAIXA = 197;                    // 3:17
  const CREME = '#f3e6cc', AMARELO = '#ffc21a';

  // ---------- utilidades ----------
  const img = (pai, src, w, h, css = {}) => Z.img(pai, 'assets/' + src, { position: 'absolute', left: '0px', top: '0px', width: w + 'px', height: h + 'px', transformOrigin: '50% 50%', ...css });
  // põe o centro do elemento (w x h) em (cx, cy) com escala s e rotação r
  const poe = (el, w, h, cx, cy, s = 1, r = 0, extra = '') => {
    el.style.transform = `translate(${(cx - w / 2).toFixed(2)}px, ${(cy - h / 2).toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})${extra}`;
  };
  // tapa: chega de cima (escala maior) e assenta com mola curta, sem quicar
  const tapa = (t, t0, { s0 = 1.45, f = 3.4, z = 0.62 } = {}) => {
    if (t < t0) return null;
    const p = M.spring(t - t0, f, z);
    return { s: M.lerp(s0, 1, p), p };
  };
  const tremor = (t, picos, amp = 18) => {
    let x = 0, y = 0, r = 0;
    picos.forEach((t0, i) => { x += M.kick(t, t0, amp, 9, 0.35); y += M.kick(t, t0 + 0.012, amp * 0.7, 11, 0.35) * (i % 2 ? 1 : -1); r += M.kick(t, t0, amp * 0.06, 7, 0.4); });
    return { x, y, r };
  };
  const texto = (pai, txt, tam, w, css = {}) => {
    const d = Z.div(pai, { left: '0px', top: '0px', width: w + 'px', height: tam + 'px', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: 'Bangers', fontSize: tam + 'px', lineHeight: '1',
      color: CREME, letterSpacing: '0.02em', WebkitTextStroke: `${Math.round(tam * 0.07)}px #0b0a09`, paintOrder: 'stroke fill',
      textShadow: `${Math.round(tam * 0.05)}px ${Math.round(tam * 0.06)}px 0 #0b0a09`, transformOrigin: '50% 50%', ...css });
    d.textContent = txt; return d;
  };
  const fita = (pai, txt, tam, w) => {                    // fita adesiva com ponta rasgada
    const f = Z.div(pai, { left: '0px', top: '0px', width: w + 'px', height: Math.round(tam * 1.35) + 'px', background: 'rgba(236, 226, 204, 0.94)',
      clipPath: 'polygon(1% 8%, 4% 0%, 96% 3%, 99% 0%, 98% 30%, 100% 62%, 97% 100%, 3% 96%, 0% 100%, 2% 60%, 0% 28%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bangers', fontSize: tam + 'px', color: '#0b0a09',
      letterSpacing: '0.04em', transformOrigin: '50% 50%' });
    f.textContent = txt; return f;
  };

  // ---------- medidas das artes (px dos recortes em assets/rec) ----------
  const CAV = { w: 756, h: 729 };                       // caveira: conteúdo centrado em (378, 362)
  const LOGO = { w: 925, h: 660, sk: { cx: 458.5, cy: 132, w: 311 } };
  const TIT = { w: 1219, h: 787, corte: 308 };
  const TC = { w: 1150, h: 1007 };
  const CAPA = 1254;

  // posições na tela
  const CAV0 = { cx: 540, cy: 860, s: 700 / CAV.w };
  const LS = 980 / LOGO.w, LOGO_X = 50, LOGO_Y = 690;
  const CAV_LOGO = { cx: LOGO_X + LOGO.sk.cx * LS, cy: LOGO_Y + LOGO.sk.cy * LS, s: (LOGO.sk.w * LS) / 738 };

  // peças da colagem (abertura): [arquivo, w, h, cx, cy, escala, rot, k da chegada]
  const PECAS_A = [
    ['p-criancas', 752, 692, 790, 470, 0.50, 6, 4],
    ['p-bola', 292, 302, 215, 1230, 0.85, -9, 6],
    ['p-garoto', 472, 472, 250, 500, 0.62, -7, 8],
    ['p-polaroid', 432, 382, 840, 1230, 0.72, 8, 10],
    ['p-carrinho', 302, 212, 150, 870, 0.82, 5, 12],
    ['p-mochila', 432, 432, 930, 860, 0.60, -6, 14],
    ['p-beco', 532, 432, 560, 1350, 0.70, -3, 14.88],     // cai no golpe da intro (5.476)
  ];
  // peças que remontam a capa em cima da capa escura: [arquivo, x0, y0 na capa, k]
  const PECAS_C = [
    ['p-beco', 840, 330, 26], ['p-criancas', 630, 420, 28], ['p-garoto', 370, 390, 30],
    ['p-mochila', 770, 680, 32], ['p-polaroid', 690, 795, 34], ['p-bola', 585, 760, 35], ['p-carrinho', 490, 835, 36],
  ];
  const TAM = { 'p-criancas': [752, 692], 'p-bola': [292, 302], 'p-garoto': [472, 472], 'p-polaroid': [432, 382], 'p-carrinho': [302, 212], 'p-mochila': [432, 432], 'p-beco': [532, 432], 'p-trofeu': [252, 302] };

  // capa na montagem (P6) e no refrão (P7/P8) e no player (P9)
  const CS_M = 1080 / CAPA, CAPA_M = { x: 0, y: 720 };
  const CAPA_R = { cx: 540, cy: 1040, w: 1080 };
  const ARTE = { x: 50, y: 196, w: 979 };                 // arte do álbum no player (print 941 px x 1,1477)

  // player
  const PL = { titulo: 1268, artista: 1352, barra: 1471, bx0: 54, bx1: 1024, tempos: 1504, check: [986, 1331] };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const faixa = (t) => {                                  // tempo mostrado no player
    const real = t + SONG0;
    const a = B(52), b = B(60);                           // de 0:00 até o tempo real em 2 compassos
    if (t < a) return 0;
    if (t < b) return real * E.cruza(M.prog(t, a, b));
    return real;
  };

  // =================================================================================================
  let VIVA_N = 0, vivaAtual = '';
  const vivaSrc = (t) => {
    if (!VIVA_N || t < B(38)) return 'assets/capa.png';
    const i = Math.min(VIVA_N, 1 + Math.floor((t - B(38)) * 30 + 1e-6));
    return `assets/viva/f${String(i).padStart(3, '0')}.jpg`;
  };
  let cam, cav, pecasA, fitaNovo, logo, logoE, logoD, vai, sentido, capaEsc, pecasC, titTopo, capaViva, luz, fita0112, selo,
    player, capaPl, plTit, plArt, barraFundo, barraCheia, bolinha, tIni, tFim, check, toque, fim, tc, data, presave, risco, cavFim;

  Z.plano({
    id: 'filme', inicio: 0, fim: 30.3,
    async montar(el) {
      cam = Z.div(el, { left: '0px', top: '0px', width: Z.W + 'px', height: Z.H + 'px', transformOrigin: '540px 960px' });
      // ---- abertura
      pecasA = PECAS_A.map(([f, w, h]) => img(cam, `rec/${f}.png`, w, h, { filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.55))' }));
      cav = img(cam, 'rec/caveira.png', CAV.w, CAV.h);
      fitaNovo = fita(cam, 'NOVO SINGLE', 78, 560);
      // ---- logo (metades para o rasgo)
      logo = Z.div(cam, { left: '0px', top: '0px', width: LOGO.w + 'px', height: LOGO.h + 'px', transformOrigin: '50% 50%' });
      const rasgo = 'polygon(0 0, 52% 0, 49% 12%, 53% 25%, 48% 38%, 52% 52%, 47% 66%, 51% 80%, 48% 92%, 51% 100%, 0 100%)';
      const rasgoD = 'polygon(52% 0, 100% 0, 100% 100%, 51% 100%, 48% 92%, 51% 80%, 47% 66%, 52% 52%, 48% 38%, 53% 25%, 49% 12%)';
      logoE = img(logo, 'rec/logo.png', LOGO.w, LOGO.h, { clipPath: rasgo });
      logoD = img(logo, 'rec/logo.png', LOGO.w, LOGO.h, { clipPath: rasgoD });
      // ---- montagem da capa
      capaEsc = img(cam, 'capa.png', CAPA, CAPA, { filter: 'brightness(.5) saturate(.65) contrast(1.1)', transformOrigin: '0 0', clipPath: 'inset(36% 0 0 0)' });
      pecasC = PECAS_C.map(([f]) => img(cam, `rec/${f}.png`, TAM[f][0], TAM[f][1], { transformOrigin: '0 0', filter: 'drop-shadow(0 10px 12px rgba(0,0,0,.6))' }));
      // ---- título (duas linhas do mesmo recorte)
      vai = img(cam, 'rec/titulo.png', TIT.w, TIT.h, { clipPath: `inset(0 0 ${TIT.h - TIT.corte}px 0)` });
      sentido = img(cam, 'rec/titulo.png', TIT.w, TIT.h, { clipPath: `inset(${TIT.corte - 6}px 0 0 0)` });
      // ---- refrão
      capaViva = img(cam, 'capa.png', CAPA, CAPA, { zIndex: 5 });
      VIVA_N = await fetch('assets/viva/n.json').then((r) => r.json()).then((j) => j.n).catch(() => 0);
      luz = Z.div(cam, { left: '0px', top: '0px', width: CAPA + 'px', height: CAPA + 'px', transformOrigin: '50% 50%', mixBlendMode: 'screen', zIndex: 6,
        background: 'radial-gradient(38% 30% at 66% 44%, rgba(255,190,90,.55), rgba(255,150,40,0) 70%)' });
      titTopo = img(cam, 'rec/logo.png', LOGO.w, LOGO.h, { zIndex: 7 });
      fita0112 = fita(cam, '01.12', 96, 300); fita0112.style.zIndex = 7;
      selo = img(cam, 'rec/caveira.png', CAV.w, CAV.h, { zIndex: 7, filter: 'drop-shadow(0 0 0 #000) drop-shadow(6px 8px 0 #0b0a09)' });
      // ---- player
      player = Z.div(cam, { left: '0px', top: '0px', width: Z.W + 'px', height: Z.H + 'px', transformOrigin: '540px 1471px', zIndex: 4 });
      img(player, 'rec/player-limpo.png', 1080, 1919);
      capaPl = img(player, 'capa.png', CAPA, CAPA, { transformOrigin: '0 0', borderRadius: '14px' });
      const ui = { fontFamily: 'Figtree', whiteSpace: 'nowrap' };
      plTit = Z.div(player, { ...ui, left: '56px', top: PL.titulo + 'px', fontSize: '66px', fontWeight: '700', color: '#fff', letterSpacing: '-0.01em' }); plTit.textContent = 'Vai fazer sentido';
      plArt = Z.div(player, { ...ui, left: '58px', top: PL.artista + 'px', fontSize: '46px', fontWeight: '500', color: '#b3b3b3' }); plArt.textContent = 'Deckss';
      barraFundo = Z.div(player, { left: PL.bx0 + 'px', top: (PL.barra - 3) + 'px', width: (PL.bx1 - PL.bx0) + 'px', height: '6px', borderRadius: '3px', background: '#5e5e5e' });
      barraCheia = Z.div(player, { left: PL.bx0 + 'px', top: (PL.barra - 3) + 'px', width: '0px', height: '6px', borderRadius: '3px', background: '#fff' });
      bolinha = Z.div(player, { left: '0px', top: '0px', width: '30px', height: '30px', borderRadius: '50%', background: '#fff' });
      tIni = Z.div(player, { ...ui, left: '56px', top: PL.tempos + 'px', fontSize: '31px', fontWeight: '500', color: '#a7a7a7', fontVariantNumeric: 'tabular-nums' });
      tFim = Z.div(player, { ...ui, left: '0px', top: PL.tempos + 'px', width: (PL.bx1) + 'px', textAlign: 'right', fontSize: '31px', fontWeight: '500', color: '#a7a7a7' }); tFim.textContent = mmss(DUR_FAIXA);
      check = Z.div(player, { left: (PL.check[0] - 44) + 'px', top: (PL.check[1] - 44) + 'px', width: '88px', height: '88px', borderRadius: '50%', background: '#1ed760', transformOrigin: '50% 50%' });
      check.innerHTML = '<svg viewBox="0 0 88 88" width="88" height="88"><path d="M25 45 L38 58 L64 31" fill="none" stroke="#000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      toque = Z.div(player, { left: '0px', top: '0px', width: '120px', height: '120px', borderRadius: '50%', border: '6px solid #fff', boxSizing: 'border-box', background: 'rgba(255,255,255,.18)' });
      // ---- assinatura
      fim = Z.div(cam, { left: '0px', top: '0px', width: Z.W + 'px', height: Z.H + 'px', zIndex: 9 });
      tc = img(fim, 'rec/titulo-caveira.png', TC.w, TC.h);
      data = texto(fim, '01.12', 250, 600, { color: AMARELO });
      presave = texto(fim, 'PRÉ-SAVE NA BIO', 104, 900);
      risco = Z.div(fim, { left: '0px', top: '0px', width: '760px', height: '26px', background: AMARELO, transformOrigin: '0 50%',
        clipPath: 'polygon(0 30%, 6% 0, 100% 20%, 98% 100%, 3% 85%)' });
      cavFim = img(fim, 'rec/logo.png', LOGO.w, LOGO.h);
    },

    seek(t) {
      const espera = [];
      // ================= câmera global =================
      const picos = [0, B(18), B(20), B(38), B(68), B(79)];
      const tr = tremor(t, picos, 16);
      let camS = 1, camR = 0, camY = 0;
      if (t < B(18)) { camS = 1 + 0.06 * E.suave(M.prog(t, 0, B(18))) + 0.03 * E.entra(M.prog(t, B(14), B(18))); camR = -1.5 + 3 * E.suave(M.prog(t, 0, B(18))); }
      else if (t < B(38)) { camS = 1.04 - 0.04 * E.suave(M.prog(t, B(18), B(38))); camR = 1.2 - 2.4 * E.suave(M.prog(t, B(24), B(38))); camY = 0; }
      else if (t < B(52)) { camS = 1 + 0.07 * E.suave(M.prog(t, B(38), B(52))); camR = -1 + 2 * E.suave(M.prog(t, B(38), B(52))); }
      else if (t < B(68)) { camS = 1; camR = 0; }
      else { camS = 1.06 - 0.06 * E.suave(M.prog(t, B(68), B(80))); camR = 1.5 - 1.5 * E.suave(M.prog(t, B(68), B(80))); }
      cam.style.transform = `translate(${tr.x.toFixed(2)}px, ${(tr.y + camY).toFixed(2)}px) rotate(${(camR + tr.r).toFixed(3)}deg) scale(${camS.toFixed(4)})`;

      // ================= ABERTURA (k0 a k18) =================
      const naAbertura = t < B(18) + 0.001;
      // caveira: carimbo no quadro 0, pulsa nas batidas, encolhe enquanto a colagem cresce, viaja até o logo
      Z.mostra(cav, t < B(18), 'block');
      if (t < B(18)) {
        let s = CAV0.s * (1 + 0.14 * (1 - M.spring(t + 0.06, 3.6, 0.6)));   // já nasce assentando (quadro 0 forte)
        for (let k = 1; k < 18; k++) s += CAV0.s * M.kick(t, B(k), 0.035, 6, 0.5);
        s *= 1 - 0.1 * E.suave(M.prog(t, B(4), B(16)));
        const ida = E.entra(M.prog(t, B(17), B(18)));
        const cx = M.lerp(CAV0.cx, CAV_LOGO.cx, ida), cy = M.lerp(CAV0.cy, CAV_LOGO.cy, ida);
        poe(cav, CAV.w, CAV.h, cx, cy, M.lerp(s, CAV_LOGO.s, ida), M.lerp(-2 + 4 * M.noise1(t * 0.6, 3) * 0.3, 0, ida));
      }
      // fita NOVO SINGLE
      const fT = tapa(t, B(2), { s0: 1.6 });
      Z.mostra(fitaNovo, fT && t < B(18), 'flex');
      if (fT) poe(fitaNovo, 560, 105, 540, 1420 + 10 * M.kick(t, B(14.88), 1, 6, 0.4), fT.s, M.lerp(-12, -4, fT.p));
      // peças: batem a cada 2 tempos; no golpe da banda voam pra fora
      const fora = M.prog(t, B(18), B(18) + 0.45);
      PECAS_A.forEach(([, w, h, cx, cy, s, r, k], i) => {
        const T = tapa(t, B(k), { s0: 1.7, f: 3.8, z: 0.6 });
        Z.mostra(pecasA[i], T && fora < 1, 'block');
        if (!T) return;
        const pulso = M.kick(t, 5.476, 0.06, 7, 0.4);
        const dx = (cx - 540) * 2.4 * E.sai(fora), dy = (cy - 860) * 2.4 * E.sai(fora);
        poe(pecasA[i], w, h, cx + dx, cy + dy, s * (T.s + pulso), M.lerp(r * 2.2, r, T.p) + 40 * fora * (i % 2 ? 1 : -1));
      });

      // ================= LOGO (k18 a ~k21) =================
      const lT = tapa(t, B(18), { s0: 1.25, f: 3.2, z: 0.6 });
      const rasga = M.prog(t, B(20), B(20) + 0.2);
      Z.mostra(logo, lT && rasga < 1, 'block');
      if (lT) {
        let s = LS * lT.s;
        for (let k = 19; k < 21; k++) s += LS * M.kick(t, B(k), 0.025, 6, 0.5);
        logo.style.transform = `translate(${LOGO_X + (LOGO.w * LS - LOGO.w) / 2}px, ${LOGO_Y + (LOGO.h * LS - LOGO.h) / 2}px) scale(${s.toFixed(4)})`;
        const a = E.sai(rasga);
        logoE.style.transform = `translate(${(-620 * a).toFixed(1)}px, ${(140 * a).toFixed(1)}px) rotate(${(-24 * a).toFixed(2)}deg)`;
        logoD.style.transform = `translate(${(620 * a).toFixed(1)}px, ${(180 * a).toFixed(1)}px) rotate(${(26 * a).toFixed(2)}deg)`;
      }

      // ================= TÍTULO (k20 voz) e MONTAGEM DA CAPA (k24 a k37) =================
      const sobe = E.entra(M.prog(t, B(24), B(25)));          // título sobe pro topo
      const TW0 = 1000, TW1 = 900;
      const tS = M.lerp(TW0, TW1, sobe) / TIT.w;
      const tCx = 540, tCy = M.lerp(880, 500, sobe);
      const vT = tapa(t, B(20) + 0.1, { s0: 1.5 }), sT = tapa(t, B(22), { s0: 1.5 });
      const naMontagem = t < B(38);
      Z.mostra(vai, vT && naMontagem, 'block');
      Z.mostra(sentido, sT && naMontagem, 'block');
      if (vT) poe(vai, TIT.w, TIT.h, tCx, tCy, tS * vT.s, M.lerp(-6, 0, vT.p));
      if (sT) {
        poe(sentido, TIT.w, TIT.h, tCx, tCy, tS * sT.s, M.lerp(5, 0, sT.p));
        const pinga = E.suave(M.prog(t, B(22) + 0.2, B(30)));     // pingos escorrem: revela a base aos poucos
        sentido.style.clipPath = `inset(${TIT.corte - 6}px 0 ${(160 * (1 - pinga)).toFixed(1)}px 0)`;
      }
      // capa escura entra rasgando de baixo pra cima, peças remontam a capa
      const cE = M.spring(t - B(24), 2.6, 0.7);
      Z.mostra(capaEsc, t >= B(24) && naMontagem, 'block');
      const capaY = CAPA_M.y + 700 * (1 - cE) + 30 * Math.sin(t * 0.8);
      if (t >= B(24)) capaEsc.style.transform = `translate(0px, ${capaY.toFixed(2)}px) scale(${CS_M})`;
      PECAS_C.forEach(([f, x0, y0, k], i) => {
        const T = tapa(t, B(k), { s0: 1.6, f: 3.8, z: 0.62 });
        Z.mostra(pecasC[i], T && naMontagem, 'block');
        if (!T) return;
        const sc = CS_M * 0.72 * T.s, par = 1 + 0.02 * (i + 1);
        const [w0, h0] = TAM[f], x = (x0 - 13) * CS_M - w0 * CS_M * 0.11, y = capaY + (y0 - 13) * CS_M - h0 * CS_M * 0.11;
        const [w, h] = TAM[f];
        pecasC[i].style.transform = `translate(${(x + (1 - T.s) * w * CS_M / 4).toFixed(2)}px, ${(y + (1 - T.s) * h * CS_M / 4 - (par - 1) * 600 * M.prog(t, B(k), B(38))).toFixed(2)}px) rotate(${M.lerp(i % 2 ? 8 : -8, (i % 3) - 1, T.p).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      });

      // ================= REFRÃO: capa viva (k38 a k52) =================
      const rT = tapa(t, B(38), { s0: 1.35, f: 3, z: 0.6 });
      const paraPlayer = E.entra(M.prog(t, B(52), B(54)));
      const capaVisivel = rT && t < B(54);
      Z.mostra(capaViva, capaVisivel, 'block'); Z.mostra(luz, capaVisivel, 'block');
      if (rT) {
        const s0 = (CAPA_R.w / CAPA) * rT.s * (1 + 0.05 * E.suave(M.prog(t, B(38), B(52))));
        const cx = M.lerp(CAPA_R.cx, ARTE.x + ARTE.w / 2, paraPlayer), cy = M.lerp(CAPA_R.cy, ARTE.y + ARTE.w / 2, paraPlayer);
        const s = M.lerp(s0, ARTE.w / CAPA, paraPlayer);
        poe(capaViva, CAPA, CAPA, cx, cy, s);
        const src = vivaSrc(t);
        if (src !== vivaAtual) { vivaAtual = src; capaViva.src = src; espera.push(capaViva.decode().catch(() => {})); }
        poe(luz, CAPA, CAPA, cx, cy, s);
        let brilho = 0.55;
        for (let k = 38; k < 52; k += 2) brilho += 0.45 * M.kick(t, B(k), 1, 2.4, 0.9);
        luz.style.opacity = M.clamp(brilho).toFixed(3);
      }
      const ttT = tapa(t, B(39), { s0: 1.6 });
      Z.mostra(titTopo, ttT && t < B(53), 'block');
      if (ttT) poe(titTopo, LOGO.w, LOGO.h, 540, 330 - 900 * E.sai(paraPlayer) + 8 * M.kick(t, B(46), 1, 5, 0.4), (580 / LOGO.w) * ttT.s, M.lerp(-8, -3, ttT.p));
      const f12 = tapa(t, B(42), { s0: 1.8 });
      Z.mostra(fita0112, f12 && t < B(53), 'flex');
      if (f12) poe(fita0112, 300, 130, 230 - 700 * E.sai(paraPlayer), 1430, f12.s, M.lerp(-16, -7, f12.p));
      const sl = tapa(t, B(46), { s0: 2.2, f: 4, z: 0.55 });
      Z.mostra(selo, sl && t < B(53), 'block');
      if (sl) poe(selo, CAV.w, CAV.h, 930 + 700 * E.sai(paraPlayer), 560, 0.26 * sl.s, M.lerp(28, 12, sl.p));

      // ================= PLAYER (k52 a k68) =================
      const pT = M.spring(t - B(52), 2.4, 0.72);
      Z.mostra(player, t >= B(52) && t < B(68), 'block');
      if (t >= B(52)) {
        const sobeP = (1 - pT) * 1400 + 1920 * E.entra(M.prog(t, B(67.25), B(68)));
        // zoom até a barra: k60 a k62, segura; k67 mergulha na bolinha
        const zoom = 1;
        const frac = faixa(t) / DUR_FAIXA;
        const bx = PL.bx0 + (PL.bx1 - PL.bx0) * frac;
        const foco = M.spring(t - B(66.4), 2, 0.8);          // no fim o foco anda até a bolinha
        const ox = M.lerp(48, bx, foco), oy = M.lerp(1943, PL.barra, foco);
        player.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
        player.style.transform = `translate(0px, ${sobeP.toFixed(2)}px) scale(${zoom.toFixed(4)})`;
        Z.mostra(capaPl, t >= B(54), 'block');
        let pc = 1; for (let k = 54; k < 67; k += 2) pc += M.kick(t, B(k), 0.03, 5, 0.5);
        capaPl.style.transformOrigin = '50% 50%';
        capaPl.style.transform = `translate(${ARTE.x + ARTE.w / 2 - CAPA / 2}px, ${ARTE.y + ARTE.w / 2 - CAPA / 2}px) scale(${(pc * ARTE.w / CAPA).toFixed(5)})`;
        barraCheia.style.width = (bx - PL.bx0).toFixed(2) + 'px';
        let bs = 1 + (t > B(60) ? 0.15 : 0); for (let k = 54; k < 67; k++) bs += M.kick(t, B(k), 0.28, 5, 0.5);
        bolinha.style.transform = `translate(${(bx - 15).toFixed(2)}px, ${(PL.barra - 15).toFixed(2)}px) scale(${bs.toFixed(3)})`;
        tIni.textContent = mmss(faixa(t));
        // toque no check (k58) e tela respira
        const ck = 1 + M.kick(t, B(58), 0.35, 4, 0.45);
        check.style.transform = `scale(${ck.toFixed(4)})`;
        const u = M.prog(t, B(58) - 0.25, B(58) + 0.35);
        Z.mostra(toque, u > 0 && u < 1, 'block');
        if (u > 0 && u < 1) {
          const desce = E.entra(M.prog(u, 0, 0.42)), abre = M.prog(u, 0.42, 1);
          const r = 0.75 - 0.15 * desce + 0.7 * E.entra(abre);
          toque.style.transform = `translate(${PL.check[0] - 60}px, ${PL.check[1] - 60 + 40 * (1 - desce)}px) scale(${r.toFixed(3)})`;
          toque.style.opacity = (u < 0.42 ? 1 : 1 - abre).toFixed(3);
        }
      }

      if (t >= B(52) && VIVA_N) { const ult = `assets/viva/f${String(VIVA_N).padStart(3, '0')}.jpg`; if (!capaPl.src.endsWith(ult)) { capaPl.src = ult; espera.push(capaPl.decode().catch(() => {})); } }
      // ================= ASSINATURA (k68 a fim) =================
      Z.mostra(fim, t >= B(68), 'block');
      if (t >= B(68)) {
        const solta = M.prog(t, B(78), B(78) + 0.6);          // tudo cai e sobra a caveira (loop)
        const cai = (i) => E.entra(M.prog(t, B(78) + i * 0.05, B(78) + 0.5 + i * 0.05));
        const tT = tapa(t, B(68), { s0: 1.5, f: 3.2, z: 0.6 });
        Z.mostra(tc, solta < 1, 'block');
        let s = (940 / TC.w) * tT.s;
        for (let k = 69; k < 78; k++) s += (940 / TC.w) * M.kick(t, B(k), 0.02, 6, 0.5);
        poe(tc, TC.w, TC.h, 540, 650 - 1500 * cai(0), s, M.lerp(-7, -2, tT.p) - 20 * cai(0));
        const dT = tapa(t, B(70), { s0: 1.9 });
        Z.mostra(data, dT && solta < 1, 'block');
        if (dT) poe(data, 600, 250, 540 - 1300 * cai(1), 1250, dT.s, M.lerp(9, 3, dT.p) - 25 * cai(1));
        const pT2 = tapa(t, B(72), { s0: 1.9 });
        Z.mostra(presave, pT2 && solta < 1, 'block');
        if (pT2) poe(presave, 900, 104, 540 + 1400 * cai(2), 1430, pT2.s, M.lerp(-6, -2, pT2.p) + 20 * cai(2));
        const rs = E.entra(M.prog(t, B(74), B(74) + 0.3));
        Z.mostra(risco, rs > 0 && solta < 1, 'block');
        if (rs > 0) risco.style.transform = `translate(${160 + 1400 * cai(2)}px, 1492px) rotate(-2deg) scaleX(${rs.toFixed(4)})`;
        // caveira volta pro quadro inicial na batida 80
        const cv = tapa(t, B(79), { s0: 1.4, f: 3.6, z: 0.6 });
        Z.mostra(cavFim, !!cv, 'block');
        if (cv) { let sl = (980 / LOGO.w) * cv.s; sl += (980 / LOGO.w) * M.kick(t, B(81), 0.03, 6, 0.5); poe(cavFim, LOGO.w, LOGO.h, 540, 900, sl, M.lerp(-6, 0, cv.p)); }
      }
      return espera.length ? Promise.all(espera) : undefined;
    },

    som(S) {
      const carimbo = (t, k = 0.35) => S.impact(t, k * 1.8);
      const papel = (t, k = 0.25) => { S.swoosh(t, 0.16, k * 2, false); S.hat(t, 0.25, true); };
      carimbo(0.0, 0.25);
      S.zip(B(2), 0.1, 0.08);
      PECAS_A.forEach(([, , , , , , , k]) => papel(B(k), 0.22));
      S.riser(B(14), B(18), 0.12);
      S.swoosh(B(20), 0.4, 0.6, true);                       // rasgo do logo
      S.zip(B(20) + 0.02, 0.2, 0.06, false);
      PECAS_C.forEach(([, , , k]) => papel(B(k), 0.16));
      S.swoosh(B(52), 0.35, 0.18, true);
      S.click(B(58), 0.4);
            S.riser(B(66), B(68), 0.1);
      S.zip(B(42), 0.1, 0.07); carimbo(B(46), 0.18);
      S.click(B(70), 0.12); S.click(B(72), 0.12);
      S.swoosh(B(78), 0.5, 0.2, false);
      carimbo(B(79), 0.5);
      S.riser(B(33), B(37), 0.3);                         // verso desce, riser leva ao refrão
      carimbo(B(38), 0.55);
      S.swoosh(B(67.25), 0.35, 0.4, false);
    },
  });
})();
