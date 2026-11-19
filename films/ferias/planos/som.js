// Trilha original a 120 BPM, em duas metades que contam a história:
// A (0 a 8 s, b0 a b16): Am F C G apertada, hats em semicolcheia; no compasso 4 (bateria em 2%) ela "cansa":
//   bumbo só na 1 e na 3, filtro fechando; silêncio total na última colcheia antes do clique (b15,5).
// B (8 a 20 s, b16 a b40): C G Am F leve, pluck em colcheias, guizo em semicolcheia, acorde final em b38.
(() => {
  const B = (n) => Z.b(n);
  const N = { C3: 130.81, E3: 164.81, G3: 196, A3: 220, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B3: 246.94, F3: 174.61 };
  window.SOM = {
    trilha(S) {
      // ---------- metade A ----------
      const A_ACORDE = [[110, 130.81, 164.81], [87.31, 110, 130.81], [130.81, 164.81, 196], [98, 123.47, 146.83]];
      const A_BAIXO = [55, 43.65, 65.41, 49];
      for (let bar = 0; bar < 4; bar++) {
        const m0 = bar * 4, cansado = bar === 3;
        S.chord(B(m0), A_ACORDE[bar], B(cansado ? 3.4 : 3.6), cansado ? 0.018 : 0.026);
        for (let i = m0; i < m0 + 4; i++) {
          const t = B(i);
          if (!cansado || i % 2 === 0) S.kick(t, i === m0 ? 1 : 0.85);
          if (i % 2 === 1 && !cansado) S.clap(t, 0.34);
          if (!(cansado && i === 15)) S.bass(t, A_BAIXO[bar], B(0.45), cansado ? 0.22 : 0.32);
          if (!cansado) S.bass(t + B(0.75), A_BAIXO[bar] * 2, B(0.2), 0.18);
          const subd = bar >= 1 && !cansado ? 4 : 2;
          for (let k = 0; k < subd; k++) {
            const th = t + k * B(1 / subd);
            if (th < B(15.5)) S.hat(th, k % 2 ? 0.1 : 0.06);
          }
        }
      }
      // ---------- metade B ----------
      const B_ACORDE = [[N.C4, N.E4, N.G4], [N.B3, N.D4, N.G4], [N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4], [N.C4, N.E4, N.G4], [N.B3, N.D4, N.G4]];
      const B_BAIXO = [65.41, 49, 55, 43.65, 65.41, 49];
      const PADRAO = [0, 1, 2, 1, 0, 2, 1, 2];
      for (let bar = 0; bar < 6; bar++) {
        const m0 = 16 + bar * 4, ultimo = bar === 5;
        S.chord(B(m0), B_ACORDE[bar], B(ultimo ? 1.8 : 3.6), 0.022);
        for (let i = m0; i < m0 + 4; i++) {
          if (ultimo && i >= 38) break;
          const t = B(i);
          S.kick(t, i === m0 ? 0.95 : 0.75);
          if (i % 2 === 1) S.clap(t, 0.28);
          S.bass(t, B_BAIXO[bar], B(0.4), 0.28);
          S.bass(t + B(0.5), B_BAIXO[bar] * 2, B(0.2), 0.14);
          for (let k = 0; k < 4; k++) S.hat(t + k * B(0.25), k === 2 ? 0.11 : 0.045, k === 2);
          for (let k = 0; k < 2; k++) {
            const n = (i - m0) * 2 + k;
            S.pluck(t + k * B(0.5), B_ACORDE[bar][PADRAO[n]] * 2, 0.07, k ? 0.3 : -0.3);
          }
        }
      }
      // final: acorde de C aberto que segura até o fim
      S.kick(B(38), 0.9);
      S.chord(B(38), [N.C3, N.G3, N.C4, N.E4, N.G4], B(4), 0.03);
      S.pluck(B(38), 1046.5, 0.08);
    },
  };
})();
