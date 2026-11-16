// Biblioteca de movimento: tudo é função pura do tempo. Nada guarda estado entre quadros.
(function () {
  const M = {};

  M.mulberry32 = function (a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  };

  M.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.lerp = (a, b, x) => a + (b - a) * x;
  M.prog = (t, a, b) => M.clamp((t - a) / (b - a));
  M.remap = (x, a, b, c, d) => c + (d - c) * M.clamp((x - a) / (b - a));

  // Bézier cúbica no formato CSS/After Effects. Resolve x->t por Newton com bisseção de reserva.
  M.bezier = function (x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (u) => ((ax * u + bx) * u + cx) * u;
    const sy = (u) => ((ay * u + by) * u + cy) * u;
    const dx = (u) => (3 * ax * u + 2 * bx) * u + cx;
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      let u = x;
      for (let i = 0; i < 8; i++) {
        const e = sx(u) - x, d = dx(u);
        if (Math.abs(e) < 1e-6) return sy(u);
        if (Math.abs(d) < 1e-6) break;
        u -= e / d;
      }
      let lo = 0, hi = 1; u = x;
      for (let i = 0; i < 40; i++) {
        const v = sx(u);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = u; else hi = u;
        u = (lo + hi) / 2;
      }
      return sy(u);
    };
  };

  // "Velocity 100/50" do After Effects: influência vira ponto de controle da Bézier.
  // Entrada: 50% na saída do 1º keyframe, 100% na chegada do 2º -> arranca rápido, freia longo.
  // Saída: o espelho -> sai devagar e acelera até sumir.
  M.ae = (outInfluence, inInfluence) => M.bezier(outInfluence, 0, 1 - inInfluence, 1);
  M.E = {
    linear: (x) => M.clamp(x),
    entra: M.ae(0.5, 1.0),
    sai: M.ae(1.0, 0.5),
    cruza: M.ae(0.75, 0.75),
    suave: M.ae(0.33, 0.33),
  };

  // Mola amortecida analítica (oscilador sub-amortecido), de 0 para 1. t em segundos desde o disparo.
  // freq em Hz, zeta = amortecimento (0.2 bem elástico, 0.5 quase sem quique, 1 crítico).
  M.spring = function (t, freq = 2.4, zeta = 0.32) {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * freq;
    if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
  };
  // Mola entre dois valores, disparada em t0.
  M.springTo = (t, t0, from, to, freq, zeta) => M.lerp(from, to, M.spring(t - t0, freq, zeta));
  // Impulso: começa em 0, chuta e volta pra 0 oscilando (bom pra "pancada" na batida).
  M.kick = function (t, t0, amp = 1, freq = 3, zeta = 0.3) {
    if (t < t0) return 0;
    const dt = t - t0, w = 2 * Math.PI * freq;
    return amp * Math.exp(-zeta * w * dt) * Math.sin(w * Math.sqrt(1 - zeta * zeta) * dt);
  };

  // Tween simples com easing.
  M.tween = (t, t0, dur, from, to, ease = M.E.entra) => M.lerp(from, to, ease(M.prog(t, t0, t0 + dur)));

  // Keyframes: [[t, valor, easing da chegada], ...]. Antes do 1º e depois do último, segura.
  M.keys = function (t, frames) {
    if (t <= frames[0][0]) return frames[0][1];
    for (let i = 1; i < frames.length; i++) {
      const [t1, v1, e = M.E.entra] = frames[i];
      if (t <= t1) {
        const [t0, v0] = frames[i - 1];
        return M.lerp(v0, v1, e(M.prog(t, t0, t1)));
      }
    }
    return frames[frames.length - 1][1];
  };

  // Derivada numérica de qualquer f(t): velocidade pra squash & stretch e motion blur direcional.
  M.vel = (f, t, h = 1 / 240) => (f(t + h) - f(t - h)) / (2 * h);

  // Squash & stretch preservando área: estica na direção do movimento conforme a velocidade.
  M.stretch = function (speed, k = 0.0009, max = 0.45) {
    const s = 1 + Math.min(Math.abs(speed) * k, max);
    return { along: s, across: 1 / Math.sqrt(s) };
  };

  // Arco parabólico entre dois pontos (pulo). Retorna {x, y}.
  M.hop = function (p, x0, y0, x1, y1, h) {
    const x = M.lerp(x0, x1, p);
    const y = M.lerp(y0, y1, p) - 4 * h * p * (1 - p);
    return { x, y };
  };

  // Ruído suave determinístico 1D (value noise com interpolação cúbica), pra wiggle e respiração.
  M.noise1 = function (x, seed = 1) {
    const h = (i) => { const r = M.mulberry32((i * 374761393) ^ (seed * 668265263)); return r() * 2 - 1; };
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return M.lerp(h(i), h(i + 1), u);
  };
  M.wiggle = (t, freq, amp, seed) => amp * M.noise1(t * freq, seed);

  // Quebra o texto de um elemento em spans por letra (montagem estática, uma vez só).
  M.splitChars = function (el) {
    const txt = el.textContent; el.textContent = '';
    return [...txt].map((ch) => {
      const s = document.createElement('span');
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.display = 'inline-block';
      el.append(s);
      return s;
    });
  };

  // Aplica transform com valores nomeados (ordem fixa: translate, rotate, scale).
  M.tf = (el, o) => {
    el.style.transform =
      `translate(${o.x || 0}px, ${o.y || 0}px) rotate(${o.r || 0}deg) scale(${o.sx ?? o.s ?? 1}, ${o.sy ?? o.s ?? 1})`;
  };
  M.svgTf = (o) => `translate(${o.x || 0} ${o.y || 0}) rotate(${o.r || 0}) scale(${o.sx ?? o.s ?? 1} ${o.sy ?? o.s ?? 1})`;

  window.M = M;
})();
