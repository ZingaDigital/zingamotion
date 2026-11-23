// Trilha original da volta, 120 BPM, tempo real. O inverso das férias: começa sonolenta e acorda.
// b0–b8: pad abafado (Fmaj7, Em7) + tique-taque do relógio na grade. b8: despertador (foley do P2). b9–b12: o groove
// acorda (bumbo, palma, riser). b12–b42: C G Am F com pluck; na regência (b20–b30) os pizzicatos vêm do P4.
// b38–b42 sobe pra chamada. b42–b46: logo sobe (riser, sem pluck). b46: acorde de C quando o logo pousa. b50–b52: cauda.
(() => {
  const B = (n) => Z.b(n);
  const N = { C3: 130.81, E3: 164.81, G3: 196, A3: 220, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F3: 174.61, G4: 392, A4: 440 };
  window.SOM = {
    amassa(S, t, k = 1) {
      for (let i = 0; i < 10; i++) S.ruid({ t: t + i * 0.028 + (i % 3) * 0.006, dur: 0.035, tipo: 'bandpass', f0: 1800 + ((i * 733) % 2400), q: 0.9, ganho: 0.11 * k });
    },
    trilha(S) {
      // ---------- sono (b0–b8) ----------
      S.chord(0, [N.F3, N.A3, N.C4, N.E4], B(3.8), 0.02);
      S.chord(B(4), [N.E3, N.G3, N.B3, N.D4], B(3.8), 0.02);
      S.bass(0, 43.65, B(3.5), 0.16); S.bass(B(4), 41.2, B(3.5), 0.16);
      for (let i = 0; i < 16; i++) S.tick(B(i * 0.5), i % 2 ? 0.05 : 0.08, i % 2 ? 1500 : 2400);
      // ---------- acorda (b9–b12) ----------
      S.kick(B(9), 1); S.kick(B(10), 0.8); S.kick(B(11), 0.85); S.clap(B(11), 0.34);
      S.riser(B(10), B(12), 0.1);
      for (let k = 0; k < 8; k++) S.hat(B(10) + k * B(0.25), 0.03 + k * 0.01);
      // ---------- groove (b12–b52) ----------
      const AC = [[N.C4, N.E4, N.G4], [N.B3, N.D4, N.G4], [N.A3, N.C4, N.E4], [N.F3, N.A3, N.C4]];
      const BX = [65.41, 49, 55, 43.65];
      const PADRAO = [0, 1, 2, 1, 0, 2, 1, 2];
      for (let bar = 0; bar < 10; bar++) {
        const m = 12 + bar * 4, c = bar % 4;
        const sobe = m === 38 || m === 42, pousa = m === 46, cauda = m === 50;
        const ac = pousa ? [N.C4, N.E4, N.G4] : AC[c], bx = pousa ? 65.41 : BX[c];
        S.chord(B(m), ac, B(cauda ? 1.9 : 3.6), pousa ? 0.03 : 0.022);
        for (let i = m; i < m + (cauda ? 2 : 4); i++) {
          const t = B(i);
          S.kick(t, i === m ? 0.95 : 0.75);
          if ((i - m) % 2 === 1) S.clap(t, sobe ? 0.34 : 0.28);
          S.bass(t, bx, B(0.4), 0.28);
          S.bass(t + B(0.5), bx * 2, B(0.2), 0.14);
          for (let k = 0; k < 4; k++) S.hat(t + k * B(0.25), sobe ? 0.05 + k * 0.015 : (k === 2 ? 0.11 : 0.045), !sobe && k === 2);
          if (!sobe && !cauda) for (let k = 0; k < 2; k++) {
            const n = (i - m) * 2 + k;
            S.pluck(t + k * B(0.5), ac[PADRAO[n]] * 2, 0.065, k ? 0.3 : -0.3);
          }
        }
      }
      S.riser(B(38), B(42), 0.08);
      S.riser(B(42), B(46), 0.1);
      S.chord(B(50), [N.C3, N.G3, N.C4, N.E4, N.G4], B(1.9), 0.026);
      S.pluck(B(50), 1046.5, 0.07); S.pluck(B(51), 783.99, 0.05);
    },
  };
})();
