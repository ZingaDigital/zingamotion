// Plano de exemplo (8 s, 120 BPM): mostra a gramática do contêiner que nunca corta e do cursor que conduz.
// Troque os blocos cinza pelas capturas reais (Z.img(..., 'secao-1440-03')) recortadas; nunca invente tela.
(() => {
  const B = (n) => Z.b(n), E = M.E;
  let caixa, miolos, cur, L;
  // cada estado: onde o contêiner está e qual miolo mostra. O cursor clica UMA batida antes de cada mudança.
  const ESTADOS = [
    [0, { x: 140, y: 760, w: 120, h: 120, r: 60 }],        // ponto
    [B(1), { x: 90, y: 640, w: 900, h: 420, r: 34 }],      // abre em painel
    [B(5), { x: 260, y: 420, w: 560, h: 980, r: 48 }],     // vira tela de celular
    [B(9), { x: 64, y: 560, w: 952, h: 640, r: 28 }],      // vira painel largo
    [B(13), { x: 440, y: 860, w: 200, h: 200, r: 100 }],   // volta ao ponto (o fim prepara o começo)
  ];
  const CURSOR = [[0, 900, 1500], [B(1) - 0.02, 300, 900, true], [B(5) - 0.02, 700, 900, true], [B(9) - 0.02, 540, 1250, true],
    [B(13) - 0.02, 540, 880, true], [B(15.5), 900, 1500]];

  Z.plano({
    id: 'exemplo', inicio: 0, fim: 8,
    montar(el) {
      caixa = Z.div(el, { background: Z.COR.cartao, overflow: 'hidden', boxShadow: `0 40px 80px ${Z.COR.sombra}` });
      miolos = ['#d9d2c8', '#cfe3ff', '#ffe1d1'].map((c, i) => {
        const m = Z.div(caixa, { inset: '0px', display: 'none' });
        for (let k = 0; k < 3 + i; k++) Z.div(m, { left: '6%', top: `${12 + k * 22}%`, width: `${88 - k * 12}%`, height: '14%', borderRadius: '12px', background: c });
        return m;
      });
      cur = Z.cursor(el);
      L = Z.legenda(el, [{ t: 'Um contêiner, ' }, { t: 'muitos estados.', chave: true }], { y: 1500, quebra: 1 });
    },
    seek(t) {
      const s = Z.estado(t, ESTADOS);
      Z.poeEstado(caixa, s);
      // miolo troca DENTRO do contêiner: o novo sobe da base enquanto a forma ainda assenta (nada de fade)
      const fase = t < B(5) ? 0 : t < B(9) ? 1 : 2;
      miolos.forEach((m, i) => {
        const ini = [B(1), B(5), B(9)][i];
        Z.mostra(m, i === fase && t >= ini + 0.05 && t < B(13), 'block');
        m.style.transform = `translateY(${(60 * (1 - E.entra(M.prog(t, ini + 0.05, ini + 0.35)))).toFixed(2)}px)`;
      });
      Z.cursorSeek(cur, t, CURSOR);
      Z.legendaSeek(L, t, B(2), B(12));
    },
    som(S) {
      for (const [t, , , clica] of CURSOR) if (clica) S.click(t, 0.16);
      for (const [t] of ESTADOS.slice(1)) S.swoosh(t, 0.22, 0.12, true);
    },
  });
})();
