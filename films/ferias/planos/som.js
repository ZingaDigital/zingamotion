// Trilha original a 120 BPM, em duas metades que contam a história:
// A (0 a 8 s, b0 a b16): Am F C G apertada, hats em semicolcheia; no compasso 4 (bateria em 2%) ela "cansa":
//   bumbo só na 1 e na 3, filtro fechando; silêncio total na última colcheia antes do clique (b15,5).
// B (8 a 20 s, b16 a b40): C G Am F leve, pluck em colcheias, guizo em semicolcheia, acorde final em b38.
(() => {
  const B = (n) => Z.b(n);
  const N = { C3: 130.81, E3: 164.81, G3: 196, A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B3: 246.94, F3: 174.61 };
  window.SOM = {
    // papel amassando: rajada de estalos filtrados; o primeiro cai exatamente em t (na grade)
    amassa(S, t, k = 1) {
      for (let i = 0; i < 10; i++) S.ruid({ t: t + i * 0.028 + (i % 3) * 0.006, dur: 0.035, tipo: 'bandpass', f0: 1800 + ((i * 733) % 2400), q: 0.9, ganho: 0.11 * k });
    },
    // bolinha de papel batendo no chão
    toc(S, t, k = 1) {
      S.osc({ t, tipo: 'triangle', f0: 320, f1: 140, glide: 0.05, dur: 0.09, ganho: 0.25 * k });
      S.ruid({ t, dur: 0.04, tipo: 'lowpass', f0: 1500, ganho: 0.12 * k });
    },
    // trilha no TEMPO REAL. As pausas de leitura entram como 2 batidas a mais nos compassos 1, 2 e 3 (6 tempos).
    trilha(S) {
      // ---------- metade A: Am F C G, b0 a b22 ----------
      const A_ACORDE = [[110, 130.81, 164.81], [87.31, 110, 130.81], [130.81, 164.81, 196], [98, 123.47, 146.83]];
      const A_BAIXO = [55, 43.65, 65.41, 49];
      const A_COMP = [6, 6, 6, 4];
      let m0 = 0;
      A_COMP.forEach((len, bar) => {
        const cansado = bar === 3;
        S.chord(B(m0), A_ACORDE[bar], B(len - (cansado ? 0.6 : 0.4)), cansado ? 0.018 : 0.026);
        for (let i = m0; i < m0 + len; i++) {
          const t = B(i), ult = i === m0 + len - 1;
          if (!cansado || (i - m0) % 2 === 0) S.kick(t, i === m0 ? 1 : 0.85);
          if ((i - m0) % 2 === 1 && !cansado) S.clap(t, 0.34);
          if (!(cansado && ult)) S.bass(t, A_BAIXO[bar], B(0.45), cansado ? 0.22 : 0.32);
          if (!cansado) S.bass(t + B(0.75), A_BAIXO[bar] * 2, B(0.2), 0.18);
          const subd = bar >= 1 && !cansado ? 4 : 2;
          for (let k = 0; k < subd; k++) {
            const th = t + k * B(1 / subd);
            if (th < B(21.5)) S.hat(th, k % 2 ? 0.1 : 0.06);   // silêncio na última colcheia antes do clique (b22)
          }
        }
        m0 += len;
      });
      // ---------- metade B: C G Am F C G | Am (sobe pro logo) | C (logo pousa) | cauda ----------
      const B_ACORDE = [[N.C4, N.E4, N.G4], [N.B3, N.D4, N.G4], [N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.C4, N.E4, N.G4], [N.B3, N.D4, N.G4],
        [N.A3, N.C4, N.E4], [N.C4, N.E4, N.G4]];
      const B_BAIXO = [65.41, 49, 55, 43.65, 65.41, 49, 55, 65.41];
      const PADRAO = [0, 1, 2, 1, 0, 2, 1, 2];
      for (let bar = 0; bar < 8; bar++) {
        const m = 22 + bar * 4, sobe = bar === 6, pousa = bar === 7;
        S.chord(B(m), B_ACORDE[bar], B(pousa ? 3.8 : 3.6), pousa ? 0.03 : 0.022);
        for (let i = m; i < m + 4; i++) {
          const t = B(i);
          S.kick(t, i === m ? 0.95 : 0.75);
          if ((i - m) % 2 === 1) S.clap(t, sobe ? 0.34 : 0.28);
          S.bass(t, B_BAIXO[bar], B(0.4), 0.28);
          S.bass(t + B(0.5), B_BAIXO[bar] * 2, B(0.2), 0.14);
          for (let k = 0; k < 4; k++) S.hat(t + k * B(0.25), sobe ? 0.05 + k * 0.015 : (k === 2 ? 0.11 : 0.045), !sobe && k === 2);
          if (!sobe) for (let k = 0; k < 2; k++) {
            const n = (i - m) * 2 + k;
            S.pluck(t + k * B(0.5), B_ACORDE[bar][PADRAO[n]] * 2, pousa ? 0.08 : 0.07, k ? 0.3 : -0.3);
          }
        }
      }
      S.riser(B(46), B(50), 0.1);
      // cauda (b54 a b56): acorde aberto + pulso leve; o loop volta pro Am em b0
      S.kick(B(54), 0.8); S.kick(B(55), 0.55);
      S.chord(B(54), [N.C3, N.G3, N.C4, N.E4, N.G4], B(1.9), 0.026);
      S.pluck(B(54), 1046.5, 0.07); S.pluck(B(55), 783.99, 0.05);
      S.hat(B(54.5), 0.06); S.hat(B(55.5), 0.06);
    },
  };
})();
