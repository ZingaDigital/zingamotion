// P4 · Maestria · 10,0 a 15,2 s (b20 a b30), papel. A lâmpada rege com um lápis (compasso 4/4: um gesto por batida).
// A cada gesto uma folha das quatro frentes do site (zinga.digital: "Quatro frentes. Uma direção.") entra pelo lado
// apontado e pousa na grade; o carimbo de ✓ cai no contratempo. Depois a orquestra pulsa na batida até o carimbo da
// última folha crescer e virar o rosa do P5 (íris).
(() => {
  const B = (n) => Z.b(n);
  const FRENTES = [['chat', 'Social', 'Media'], ['pincel', 'Branding', 'e Design'], ['camera', 'Vídeo e', 'Fotografia'], ['grafico', 'Tráfego', 'Pago']];
  const CW = 440, CH = 250, POS = [[72, 560], [568, 560], [72, 850], [568, 850]];
  const DE = ['esq', 'dir', 'esq', 'dir'];
  const POUSO = [B(21), B(22), B(23), B(24)];
  const IRIS = B(29.5);
  const LX = 420, LY = 1190, LT = 240;
  const vb = (p) => ({ x: LX + (p.x + 20) * LT / 240, y: LY + (p.y + 20) * LT / 240 });
  // gesto de regência por batida (ângulo do ombro direito, dobra do cotovelo)
  const GESTO = [[150, 30], [70, 50], [125, 15], [168, 20]];
  let H, eco, rab, cards = [], lamp, lapis, disco;

  Z.plano({
    id: 'p4', inicio: B(20), fim: B(30.6), z: 4,
    montar(el) {
      eco = T.eco(el, 'MAESTRIA', { x: 24, y: 1580, tam: 250, cor: G.COR.navy, op: 0.12, copias: 4, passo: -0.22 });
      rab = T.rabiscos(el, [{ f: 'espiral', x: 960, y: 250, s: 0.7 }, { f: 'estrela', x: 990, y: 1260, s: 0.55 }, { f: 'onda', x: 160, y: 1300, s: 0.8 }],
        { op: 0.3, semente: 91 });
      H = G.texto(el, [['Cada cliente,'], [['com maestria.', { cor: G.COR.rosa }]]], { x: 72, y: 300, tam: 100, peso: 600, lh: 1.04, cor: G.COR.navy });
      FRENTES.forEach(([ic, l1, l2], i) => {
        const [x, y] = POS[i];
        const c = Z.div(el, { left: x + 'px', top: y + 'px', width: CW + 'px', height: CH + 'px', background: '#fff', borderRadius: '12px',
          boxShadow: `10px 12px 0 ${G.COR.navy}`, border: `4px solid ${G.COR.navy}`, boxSizing: 'border-box' });
        Z.div(c, { left: (i % 2 ? 250 : 120) + 'px', top: '-20px', width: '120px', height: '34px', background: 'rgba(245, 9, 83, .38)', transform: `rotate(${i % 2 ? 4 : -5}deg)` });
        G.tile(c, ic, { x: 26, y: 26, tam: 96 });
        const t = G.texto(c, [[l1], [l2]], { x: 28, y: 132, tam: 46, peso: 700, lh: 1.05, cor: G.COR.navy });
        const st = T.carimbo(el, { tam: 116 });
        cards.push({ c, t, st, x, y });
      });
      lamp = T.lampada(el, { x: LX, y: LY, tam: LT });
      lapis = T.lapis(el, { tam: 200 });
      disco = Z.div(el, { background: `linear-gradient(160deg, ${G.COR.rosa} 0%, ${G.COR.rosaFundo} 100%)`, borderRadius: '50%', zIndex: 90 });
    },
    seek(t, el) {
      eco.seek(t, B(20)); rab.seek(t);
      G.palavrasSeek(H, t, B(20) + 0.1, { passo: 3 / 30 });
      // regência: mola entre os gestos, um por batida a partir de b20,5
      const kb = Math.floor((t - B(20.5)) / Z.BATIDA);
      let ang = 30, dobra = 40;
      if (t >= B(20.5)) {
        const [a0, d0] = GESTO[((kb - 1) % 4 + 4) % 4], [a1, d1] = GESTO[kb % 4];
        const m = M.clamp(M.spring(t - B(20.5) - kb * Z.BATIDA, 3.4, 0.6), 0, 1.1);
        ang = M.lerp(a0, a1, m); dobra = M.lerp(d0, d1, m);
      }
      const bob = Math.abs(Math.sin((t - B(20)) * Math.PI * 2)) * 10;
      G.poe(lamp.el, G.soma(G.entra(t, B(20) + 0.05, { dur: 0.4, de: 'baixo', dist: 300, blur: 4, mola: 2.6 }), { y: -bob }));
      const { maoD } = lamp.seek({ humor: 'feliz', oculos: 0, luz: 1, bracoE: [60 + 20 * Math.sin(t * Math.PI * 2), 40], bracoD: [ang, dobra] });
      const h = vb(maoD), dir = (ang + dobra) * Math.PI / 180;
      const rotL = Math.atan2(Math.sin(dir), -Math.cos(dir)) * 180 / Math.PI;
      const entraL = G.entra(t, B(20) + 0.25, { dur: 0.3, s0: 0.4, dist: 0, blur: 3 });
      lapis.style.left = '0px'; lapis.style.top = '0px';
      G.poe(lapis, G.soma(entraL, { x: h.x - 16.7, y: h.y - bob - 184, r: rotL }));

      // folhas: entram pelo lado apontado, pousam na batida, pulsam a cada batida depois
      cards.forEach(({ c, t: tx, st, x, y }, i) => {
        const ti = POUSO[i];
        const o = G.entra(t, ti - 0.22, { dur: 0.32, de: DE[i], dist: 700, ry: DE[i] === 'esq' ? 50 : -50, blur: 16 });
        o.r = (DE[i] === 'esq' ? -10 : 10) * (1 - G.E.outCubic(M.prog(t, ti - 0.22, ti + 0.1)));
        let pulso = 0;
        for (let b = 25; b < 30; b++) pulso += M.kick(t, B(b) + i * 0.03, 0.035, 4, 0.45);
        G.poe(c, G.soma(o, { y: M.kick(t, ti, 10, 3.4, 0.4), s: 1 + pulso }));
        G.palavrasSeek(tx, t, ti - 0.02, { passo: 1 / 30, dur: 0.3, dist: 24, blur: 8 });
        const ts = ti + 0.25;
        const sc = t < ts ? 0 : M.clamp(M.spring(t - ts, 4, 0.5), 0, 1.2);
        st.style.left = (x + CW - 92) + 'px'; st.style.top = (y - 44) + 'px';
        st.style.transformOrigin = '50% 50%';
        st.style.visibility = t >= ts ? 'visible' : 'hidden';
        st.style.transform = `scale(${(M.lerp(2.2, 1, sc) * (t >= ts ? 1 : 0)).toFixed(3)}) rotate(${(-14 + i * 7).toFixed(1)}deg)`;
        st.style.opacity = M.clamp((t - ts) * 12).toFixed(3);
      });
      // íris: o carimbo da última folha vira o rosa da próxima cena
      const [x4, y4] = POS[3];
      const cx = x4 + CW - 34, cy = y4 + 14;
      const pi = G.E.inExp(M.prog(t, IRIS, B(30.4)));
      const R = 2400 * pi + 58 * (pi > 0 ? 1 : 0);
      Object.assign(disco.style, { left: (cx - R) + 'px', top: (cy - R) + 'px', width: 2 * R + 'px', height: 2 * R + 'px', display: pi > 0 ? 'block' : 'none' });
    },
    som(S) {
      POUSO.forEach((tp, i) => {
        S.swoosh(tp - 0.22, 0.22, 0.08, true);
        S.pluck(tp, [523.25, 659.25, 783.99, 1046.5][i], 0.16);
        S.pluck(tp, [261.63, 329.63, 392, 523.25][i], 0.12);
        S.osc({ t: tp + 0.25, tipo: 'triangle', f0: 180, f1: 90, glide: 0.06, dur: 0.12, ganho: 0.3 });
        S.ruid({ t: tp + 0.25, dur: 0.05, tipo: 'lowpass', f0: 1800, ganho: 0.14 });
      });
      S.swoosh(IRIS, 0.4, 0.2, true);
    },
  });
})();
