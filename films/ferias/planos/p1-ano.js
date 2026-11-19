// P1 · Ano cheio · 0,0 a 1,62 s, e a folha amassa até 1,95 s e voa pra esquerda. Gancho: folha de caderno com
// os 365 dias de 2026 desenhados à mão enchendo de rosa numa onda; contador e "dias de job." sublinhado a lápis.
(() => {
  const B = (n) => Z.b(n);
  const COLS = 19, LINS = 20, PASSO = 42, CEL = 34, X0 = 141, Y0 = 720;
  const DMAX = (LINS - 1) + (COLS - 1) * 0.55;
  const quando = (i) => { const r = Math.floor(i / COLS), c = i % COLS; return -0.15 + ((r + c * 0.55) / DMAX) * 1.65; };
  const AMASSA = B(3.25);
  let folha, amasso, celulas = [], num, over, T1, eco, rab, sub;

  Z.plano({
    id: 'p1', inicio: 0, fim: AMASSA + 0.8, loopDe: G.LOOP,
    montar(el) {
      folha = T.papel(el);
      eco = T.eco(folha, '2026', { x: 20, y: 1590, tam: 430, cor: G.COR.navy, op: 0.13, copias: 4, passo: -0.19 });
      rab = T.rabiscos(folha, [
        { f: 'espiral', x: 880, y: 380, s: 0.95, r: 10 }, { f: 'estrela', x: 730, y: 560, s: 0.55, r: -12 },
        { f: 'xis', x: 1000, y: 610, s: 0.45 }, { f: 'onda', x: 860, y: 250, s: 0.8, r: -6 },
      ], { op: 0.3, semente: 11 });
      sub = T.rabiscos(folha, [{ f: 'risco', x: 330, y: 678, s: 1.05, r: -2 }], { cor: G.COR.rosa, op: 0.95, larg: 7, semente: 5 });
      over = Z.div(folha, { left: '72px', top: '292px', fontSize: '34px', fontWeight: 600, letterSpacing: '0.22em', color: G.COR.rosa });
      over.textContent = '2026';
      num = Z.div(folha, { left: '64px', top: '318px', fontSize: '236px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums', color: G.COR.navy });
      T1 = G.texto(folha, [['dias ', ['de job.', { cor: G.COR.rosa }]]], { x: 72, y: 560, tam: 92, peso: 600, cor: G.COR.navy });
      const grade = Z.div(folha, { left: X0 + 'px', top: Y0 + 'px', width: COLS * PASSO + 'px', height: LINS * PASSO + 'px' });
      const r = M.mulberry32(77);
      for (let i = 0; i < 365; i++) {
        const lin = Math.floor(i / COLS), c = i % COLS;
        const d = Z.div(grade, { left: c * PASSO + 'px', top: lin * PASSO + 'px', width: CEL + 'px', height: CEL + 'px', boxSizing: 'border-box',
          border: `3.5px solid ${G.COR.navy}`, borderRadius: `${7 + r() * 6}px ${6 + r() * 7}px ${8 + r() * 5}px ${5 + r() * 7}px` });
        d.dataset.r = ((r() - 0.5) * 9).toFixed(2);
        celulas.push(d);
      }
      amasso = T.amassavel(el, folha, 21);
    },
    seek(t, el) {
      const ec = G.E.outCubic(M.prog(t, 0, 1.9));
      el.style.transform = `scale(${(1.05 + 0.03 * ec).toFixed(4)}) rotate(${(-1.2 * (1 - ec)).toFixed(3)}deg)`;   // dolly + leve giro, sem expor a borda da folha
      let pintados = 0;
      celulas.forEach((d, i) => {
        const ti = quando(i), on = t >= ti;
        if (on) pintados++;
        const k = M.kick(t, ti, 0.35, 4, 0.35);
        d.style.background = on ? G.COR.rosa : 'transparent';
        d.style.transform = `rotate(${d.dataset.r}deg) scale(${(on ? 1 + k : 0.9).toFixed(3)})`;
      });
      num.textContent = String(Math.max(1, pintados)).padStart(3, '0');
      num.style.transform = `scale(${(1 + M.kick(t, B(3), 0.06, 3, 0.4)).toFixed(4)})`;
      num.style.transformOrigin = '0% 80%';
      G.palavrasSeek(T1, t, -0.4, { passo: 2 / 30 });
      sub.svg.style.clipPath = `inset(0px ${(Z.W - 240 - 200 * G.E.outCubic(M.prog(t, 0.15, 0.55))).toFixed(1)}px 0px 0px)`;   // risco escrito da esquerda pra direita
      eco.seek(t, -0.3);
      rab.seek(t); sub.seek(t);
      amasso.seek(t, AMASSA, { dur: 0.32, cx: 540, cy: 900, voo: { dur: 0.42, x1: -820, y1: -420, h: 220, giro: -520 } });
    },
    som(S) {
      for (let k = 0; k < 12; k++) S.tick(k * B(0.25), 0.05 + k * 0.004, 2600 + k * 90);
      S.ding(B(3), 1568, 0.11);
      SOM.amassa(S, AMASSA);
      S.swoosh(AMASSA + 0.3, 0.3, 0.14, false);
    },
  });
})();
