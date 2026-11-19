// P2 · Caixa de entrada · 2,0 a 4,7 s (b4 a b9). O tile que nasceu da grade abre no 1º card; os outros entram em
// 3D alternando direita/esquerda, cada vez mais rápido, e empurram a pilha. Saída: sugados pro centro da bateria.
(() => {
  const B = (n) => Z.b(n);
  const CARDS = [
    ['chat', 'Só mais um ajustezinho', 'Cliente · agora'],
    ['relogio', 'Reunião rápida (2h30)', 'Agenda · 16:00'],
    ['arquivo', 'arte_FINAL_v9_agora_vai.psd', 'Arquivo · Downloads'],
    ['calendario', 'Post pra hoje, 18h', 'Social · urgente'],
    ['email', 'Briefing novo chegando', 'E-mail · 23:47'],
    ['check', 'Campanha de Natal aprovada', 'Cliente · 23:59'],
  ];
  const POUSO = [B(4), B(5), B(6), B(6.5), B(7), B(7.5)];
  const X = 110, Y0 = 372, W = 860, H = 150, PASSO_Y = 170;
  const SUGA = B(8.6);                                 // começa a sugar; a bateria forma em b9
  const CENTRO = { x: 540, y: 940 };
  let over, itens = [];

  Z.plano({
    id: 'p2', inicio: 1.88, fim: B(9.2), z: 2,
    montar(el) {
      over = Z.div(el, { left: '72px', top: '282px', fontSize: '34px', fontWeight: 600, letterSpacing: '0.2em', color: G.COR.rosa });
      over.textContent = 'CAIXA DE ENTRADA';
      CARDS.forEach(([ic, tit, meta], i) => {
        const c = G.card(el, { left: X + 'px', top: '0px', width: W + 'px', height: H + 'px', transformOrigin: '50% 50%' });
        const tile = G.tile(c, ic, { x: 24, y: 25, tam: 96 });
        const T = G.texto(c, [[tit]], { x: 146, y: 26, tam: 46, peso: 600, ls: '-0.005em' });
        const m = Z.div(c, { left: '146px', top: '86px', fontSize: '30px', fontWeight: 500, color: G.COR.mudo });
        m.textContent = meta;
        itens.push({ c, tile, T, m });
      });
    },
    seek(t) {
      G.poe(over, G.soma(G.entra(t, 1.86, { de: 'dir', dist: 240 }), G.sai(t, SUGA, { para: 'cima', dist: 300 })));
      itens.forEach(({ c, tile, T, m }, i) => {
        const ti = POUSO[i];
        // posição na pilha: cada card que pousa depois empurra este pra baixo, com mola
        let y = Y0;
        for (let k = i + 1; k < POUSO.length; k++) y += PASSO_Y * M.spring(t - POUSO[k] + 0.26, 3.6, 0.7);
        const lado = i % 2 ? 'dir' : 'esq';
        let o;
        if (i === 0) {
          // abre a partir do tile (que é a grade colapsada): recorte de máscara da esquerda pra direita
          const pa = G.E.outCubic(M.prog(t, 1.92, 2.24));
          c.style.clipPath = `inset(0px ${((W - 146) * (1 - pa)).toFixed(1)}px 0px 0px round 28px)`;
          o = G.st();
        } else {
          o = G.entra(t, ti - 0.24, { dur: 0.36, de: lado, dist: 760, ry: i % 2 ? -48 : 48, blur: 16 });
        }
        const tranco = M.kick(t, ti, 10, 3.4, 0.4);
        const repouso = (i % 2 ? 1 : -1) * 1.1;
        // sugado: escadinha de 2 quadros, primeiro que entrou é o primeiro que sai
        const ps = G.E.inExp(M.prog(t, SUGA + i * 2 / 30, SUGA + i * 2 / 30 + 0.34));
        const cy = y + H / 2;
        const suga = { x: (CENTRO.x - (X + W / 2)) * ps, y: (CENTRO.y - cy) * ps, s: 1 - 0.8 * ps, blur: 18 * ps, op: 1 - M.prog(ps, 0.5, 1) };
        G.poe(c, G.soma(o, { y: y + tranco, r: repouso * M.prog(t, ti, ti + 0.3) }, suga));
        G.poe(tile, G.entra(t, i === 0 ? ti - 1 : ti - 0.1, { dur: 0.32, s0: 0.6, de: 'baixo', dist: 0, blur: 6, mola: i === 0 ? 0 : 3 }));
        G.palavrasSeek(T, t, i === 0 ? 1.98 : ti - 0.04, { passo: 1 / 30, dur: 0.32, dist: 30, blur: 10 });
        G.poe(m, G.entra(t, ti + 0.06, { dur: 0.3, dist: 20, blur: 8 }));
      });
    },
    som(S) {
      POUSO.forEach((t, i) => S.pop(t, 760 + i * 70, 0.2, i % 2 ? 0.25 : -0.25));
      for (const t of POUSO.slice(1)) S.swoosh(t - 0.24, 0.24, 0.07, true);
      S.swoosh(SUGA, 0.42, 0.2, false);
    },
  });
})();
