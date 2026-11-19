// Kit de síntese offline: instrumentos + foley de motion design. Tudo agendado em tempo absoluto, determinístico.
(function () {
  window.makeSynth = function (ctx, seed = 1) {
    const S = {};
    const SR = ctx.sampleRate;
    const rand = M.mulberry32(seed);
    const ruido = ctx.createBuffer(1, SR * 2, SR);
    const nd = ruido.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = rand() * 2 - 1;

    // Barramentos: música passa por um ganho que o bumbo abaixa (sidechain); foley vai direto.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.15;
    comp.connect(ctx.destination);
    S.master = ctx.createGain(); S.master.gain.value = 0.8; S.master.connect(comp);
    S.musica = ctx.createGain(); S.musica.connect(S.master);
    S.foley = ctx.createGain(); S.foley.connect(S.master);
    S.musica.gain.setValueAtTime(1, 0);

    const env = (g, t, pico, at, queda, sustain = 0) => {
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(pico, t + at);
      if (sustain) g.gain.setValueAtTime(pico, t + at + sustain);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + sustain + queda);
    };
    const pan = (x, bus) => { const p = ctx.createStereoPanner(); p.pan.value = x; p.connect(bus); return p; };
    S.pan = pan;

    const osc = ({ t, tipo = 'sine', f0, f1, glide, dur, ganho, at = 0.003, sustain = 0, saida, detune = 0 }) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = tipo; o.detune.value = detune;
      o.frequency.setValueAtTime(f0, t);
      if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + (glide ?? dur * 0.6));
      env(g, t, ganho, at, dur, sustain);
      o.connect(g).connect(saida || S.foley); o.start(t); o.stop(t + at + sustain + dur + 0.05);
      return o;
    };
    const ruid = ({ t, dur, tipo = 'bandpass', f0, f1, q = 1, ganho, at = 0.002, saida }) => {
      const s = ctx.createBufferSource(); s.buffer = ruido;
      const f = ctx.createBiquadFilter(); f.type = tipo; f.Q.value = q;
      f.frequency.setValueAtTime(f0, t);
      if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + at + dur);
      const g = ctx.createGain(); env(g, t, ganho, at, dur);
      s.connect(f).connect(g).connect(saida || S.foley);
      s.start(t, (t * 0.613) % 1.5); s.stop(t + at + dur + 0.05);
    };
    S.osc = osc; S.ruid = ruid;

    // Instrumentos
    S.kick = (t, k = 1) => {
      osc({ t, f0: 165, f1: 45, glide: 0.09, dur: 0.38, ganho: k, saida: S.master });
      osc({ t, tipo: 'triangle', f0: 1800, f1: 200, glide: 0.01, dur: 0.012, ganho: 0.25 * k, saida: S.master });
      // sidechain: a música abaixa e volta em 180 ms
      S.musica.gain.setValueAtTime(1, t);
      S.musica.gain.linearRampToValueAtTime(0.35, t + 0.01);
      S.musica.gain.linearRampToValueAtTime(1, t + 0.18);
    };
    S.clap = (t, k = 0.5) => {
      for (const d of [0, 0.011, 0.023]) ruid({ t: t + d, dur: d === 0.023 ? 0.16 : 0.02, f0: 1300, q: 1.1, ganho: k, saida: S.musica });
    };
    S.snare = (t, k = 0.5) => {
      osc({ t, tipo: 'triangle', f0: 220, f1: 160, dur: 0.1, ganho: k * 0.6, saida: S.musica });
      ruid({ t, dur: 0.16, tipo: 'highpass', f0: 1800, ganho: k, saida: S.musica });
    };
    S.hat = (t, k = 0.12, aberto = false) => ruid({ t, dur: aberto ? 0.18 : 0.035, tipo: 'highpass', f0: 8000, ganho: k, saida: pan(((t * 4) % 2) ? 0.3 : -0.3, S.musica) });
    S.bass = (t, hz, dur, k = 0.4) => {
      const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o2.type = 'square'; o.frequency.value = hz; o2.frequency.value = hz / 2;
      f.type = 'lowpass'; f.Q.value = 6;
      f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(180, t + dur);
      env(g, t, k, 0.006, dur);
      o.connect(f); o2.connect(f); f.connect(g).connect(S.musica);
      o.start(t); o2.start(t); o.stop(t + dur + 0.1); o2.stop(t + dur + 0.1);
    };
    S.pluck = (t, hz, k = 0.12, p = 0) => {
      const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'square'; o.frequency.value = hz; f.type = 'lowpass';
      f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(400, t + 0.2);
      env(g, t, k, 0.002, 0.22);
      o.connect(f).connect(g).connect(pan(p, S.musica)); o.start(t); o.stop(t + 0.3);
    };
    S.chord = (t, notas, dur, k = 0.06) => notas.forEach((hz, i) => {
      for (const det of [-9, 9]) {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; o.frequency.value = hz; o.detune.value = det; f.type = 'lowpass';
        f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(600, t + dur);
        env(g, t, k, 0.008, dur);
        o.connect(f).connect(g).connect(pan(det > 0 ? 0.45 : -0.45, S.musica)); o.start(t); o.stop(t + dur + 0.1);
      }
    });

    // Foley de motion design
    S.boing = (t, f0 = 300, f1 = 700, k = 0.18) => {   // quique com glissando e vibrato curto
      const o = ctx.createOscillator(), lfo = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + 0.09);
      lfo.frequency.value = 28; lg.gain.value = f1 * 0.04; lfo.connect(lg).connect(o.frequency);
      env(g, t, k, 0.004, 0.22); o.connect(g).connect(S.foley);
      o.start(t); lfo.start(t); o.stop(t + 0.3); lfo.stop(t + 0.3);
    };
    S.pop = (t, hz = 900, k = 0.22, p = 0) => {           // bolha estourando: seno com queda rápida de pitch
      osc({ t, f0: hz * 1.8, f1: hz, glide: 0.03, dur: 0.07, ganho: k, saida: pan(p, S.foley) });
      ruid({ t, dur: 0.015, tipo: 'highpass', f0: 4000, ganho: k * 0.5, saida: pan(p, S.foley) });
    };
    S.click = (t, k = 0.15) => { osc({ t, tipo: 'square', f0: 2400, dur: 0.012, ganho: k }); osc({ t: t + 0.03, tipo: 'square', f0: 1800, dur: 0.012, ganho: k * 0.7 }); };
    S.tick = (t, k = 0.06, hz = 3200) => osc({ t, tipo: 'square', f0: hz, dur: 0.008, ganho: k });
    S.swoosh = (t, dur = 0.3, k = 0.35, sobe = true) =>
      ruid({ t, dur, f0: sobe ? 300 : 5000, f1: sobe ? 5000 : 300, q: 2.2, ganho: k, at: dur * 0.7 });
    S.riser = (t0, t1, k = 0.3) => {
      ruid({ t: t0, dur: t1 - t0, f0: 200, f1: 7000, q: 3, ganho: k, at: (t1 - t0) * 0.96 });
      osc({ t: t0, tipo: 'sawtooth', f0: 110, f1: 880, glide: t1 - t0, dur: 0.05, sustain: t1 - t0 - 0.05, ganho: k * 0.12, at: t1 - t0 - 0.1 });
    };
    S.impact = (t, k = 1) => {
      osc({ t, f0: 90, f1: 30, glide: 0.4, dur: 1.0, ganho: k, saida: S.master });
      ruid({ t, dur: 0.45, tipo: 'lowpass', f0: 3500, f1: 400, ganho: 0.45 * k, saida: S.master });
    };
    S.zip = (t, dur = 0.12, k = 0.12, sobe = true) => osc({ t, tipo: 'sawtooth', f0: sobe ? 400 : 2400, f1: sobe ? 2400 : 400, glide: dur, dur: 0.02, sustain: dur, ganho: k });
    S.ding = (t, hz = 1568, k = 0.12) => { osc({ t, f0: hz, dur: 0.6, ganho: k }); osc({ t, f0: hz * 2.01, dur: 0.3, ganho: k * 0.3 }); };

    // Exporta os canais em base64 com uma cauda curta pra não estalar no corte.
    S.exportar = async function (cauda = 0.25) {
      const buf = await ctx.startRendering();
      const toB64 = (f32) => {
        const u8 = new Uint8Array(f32.buffer); let s = '';
        for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return btoa(s);
      };
      return {
        sampleRate: SR,
        channels: [0, 1].map((c) => {
          const d = buf.getChannelData(c), n = Math.round(SR * cauda);
          for (let i = 0; i < n; i++) d[d.length - 1 - i] *= Math.pow(i / n, 2);
          return toB64(d);
        }),
      };
    };
    return S;
  };
})();
