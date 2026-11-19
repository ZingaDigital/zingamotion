// P1 · Ano cheio · 0,0 a 2,0 s (b0 a b4). Gancho: 365 dias de 2026 enchendo de rosa numa onda diagonal.
// Saída: o texto arremessa pra esquerda (quádrupla, escadinha) e a grade colapsa no tile do 1º card do P2.
(() => {
  const B = (n) => Z.b(n);
  const COLS = 19, LINS = 20, PASSO = 42, CEL = 34, X0 = 141, Y0 = 720;
  const DMAX = (LINS - 1) + (COLS - 1) * 0.55;
  // quando cada dia pinta: o último cai exatamente em b3 (1,5 s); no quadro 0 já tem dia pintado
  const quando = (i) => { const r = Math.floor(i / COLS), c = i % COLS; return -0.15 + ((r + c * 0.55) / DMAX) * 1.65; };
  const ALVO = { x: 136 + 48, y: 360 + 27 + 48 };      // centro do tile do 1º card do P2
  let grade, celulas = [], num, over, T;

  Z.plano({
    id: 'p1', inicio: 0, fim: B(4),
    montar(el) {
      over = Z.div(el, { left: '72px', top: '292px', fontSize: '34px', fontWeight: 600, letterSpacing: '0.22em', color: G.COR.rosa });
      over.textContent = '2026';
      num = Z.div(el, { left: '64px', top: '318px', fontSize: '236px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums' });
      T = G.texto(el, [['dias ', ['de job.', { cor: G.COR.rosa }]]], { x: 72, y: 560, tam: 92, peso: 600 });
      grade = Z.div(el, { left: X0 + 'px', top: Y0 + 'px', width: COLS * PASSO + 'px', height: LINS * PASSO + 'px', transformOrigin: '0 0' });
      for (let i = 0; i < 365; i++) {
        const r = Math.floor(i / COLS), c = i % COLS;
        celulas.push(Z.div(grade, { left: c * PASSO + 'px', top: r * PASSO + 'px', width: CEL + 'px', height: CEL + 'px', borderRadius: '9px' }));
      }
    },
    seek(t, el) {
      // câmera: aproxima e endireita o plano inclinado
      const ec = G.E.outCubic(M.prog(t, 0, 1.9));
      el.style.transform = `scale(${(1 + 0.045 * ec).toFixed(4)}) rotateX(${(7 * (1 - ec)).toFixed(3)}deg)`;

      let pintados = 0;
      const pc = G.E.morph(M.prog(t, 1.66, 1.94));          // colapso: gap fecha, grade vira um quadrado só
      const cel = M.lerp(CEL, PASSO + 0.6, pc), raio = M.lerp(9, 0, pc);
      celulas.forEach((d, i) => {
        const ti = quando(i), on = t >= ti;
        if (on) pintados++;
        const k = M.kick(t, ti, 0.35, 4, 0.35);
        d.style.background = on ? G.COR.rosa : G.COR.navyCard;
        d.style.width = d.style.height = cel.toFixed(2) + 'px';
        d.style.borderRadius = raio.toFixed(2) + 'px';
        d.style.transform = `scale(${(on ? 1 + k : 0.86).toFixed(3)})`;
      });
      const gw = COLS * PASSO, gh = LINS * PASSO, s = M.lerp(1, 96 / gh, pc);
      const cx = M.lerp(X0 + gw / 2, ALVO.x, pc), cy = M.lerp(Y0 + gh / 2, ALVO.y, pc);
      grade.style.left = (cx - gw * s / 2).toFixed(2) + 'px'; grade.style.top = (cy - gh * s / 2).toFixed(2) + 'px';
      grade.style.transform = `scale(${s.toFixed(4)})`;
      grade.style.borderRadius = (pc * 22 / s).toFixed(1) + 'px';
      grade.style.overflow = pc > 0 ? 'hidden' : 'visible';

      num.textContent = String(Math.max(1, pintados)).padStart(3, '0');
      const pulso = M.kick(t, B(3), 0.06, 3, 0.4);       // 365 bate na batida 3
      const saiNum = G.sai(t, 1.62, { para: 'esq', dist: 1000 });
      G.poe(num, G.soma(saiNum, { s: 1 + pulso }));
      G.poe(over, G.sai(t, 1.58, { para: 'esq', dist: 1000 }));
      G.palavrasSeek(T, t, -0.4, { passo: 2 / 30 }, 1.54, { para: 'esq', dist: 1000 });
    },
    som(S) {
      for (let k = 0; k < 12; k++) S.tick(k * B(0.25), 0.05 + k * 0.004, 2600 + k * 90);
      S.ding(B(3), 1568, 0.11);
      S.swoosh(1.6, 0.32, 0.16, false);
    },
  });
})();
