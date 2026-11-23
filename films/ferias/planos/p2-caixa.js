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
  let over, itens = [], eco, rab;
  // folha de papel: branca, orelha dobrada, fita rosa, sombra chapada (adesivo, sem brilho)
  const folhaCard = (pai, i) => {
    const c = Z.div(pai, { left: X + 'px', top: '0px', width: W + 'px', height: H + 'px', background: '#ffffff', borderRadius: '10px',
      boxShadow: '10px 12px 0 rgba(0, 8, 20, .5)', transformOrigin: '50% 50%' });
    Z.div(c, { right: '0px', top: '0px', width: '44px', height: '44px', borderRadius: '0 10px 0 8px',
      background: `linear-gradient(225deg, ${G.COR.navy} 50%, #d9e1ea 50%)` });
    Z.div(c, { left: (i % 2 ? 560 : 300) + 'px', top: '-16px', width: '130px', height: '34px', background: 'rgba(245, 9, 83, .38)',
      transform: `rotate(${i % 2 ? 4 : -5}deg)` });
    return c;
  };

  Z.plano({
    id: 'p2', inicio: 1.88, fim: B(9.2), z: 2,
    montar(el) {
      eco = T.eco(el, 'JOBS', { x: 30, y: 1500, tam: 400, cor: '#ffffff', op: 0.12, copias: 4, passo: -0.2, fundo: '#00172f' });
      rab = T.rabiscos(el, [
        { f: 'espiral', x: 990, y: 300, s: 0.7 }, { f: 'xis', x: 1010, y: 1440, s: 0.5 }, { f: 'estrela', x: 70, y: 1450, s: 0.5, r: 14 },
      ], { cor: '#ffffff', op: 0.25, semente: 23 });
      over = Z.div(el, { left: '72px', top: '282px', fontSize: '34px', fontWeight: 600, letterSpacing: '0.2em', color: G.COR.rosa });
      over.textContent = 'CAIXA DE ENTRADA';
      CARDS.forEach(([ic, tit, meta], i) => {
        const c = folhaCard(el, i);
        const tile = G.tile(c, ic, { x: 24, y: 25, tam: 96 });
        const T = G.texto(c, [[tit]], { x: 146, y: 26, tam: 46, peso: 600, ls: '-0.005em', cor: G.COR.navy });
        const m = Z.div(c, { left: '146px', top: '86px', fontSize: '30px', fontWeight: 500, color: '#55708c' });
        m.textContent = meta;
        itens.push({ c, tile, T, m });
      });
    },
    seek(t) {
      eco.seek(t, 1.9, SUGA); rab.seek(t);
      G.poe(over, G.soma(G.entra(t, 1.9, { de: 'dir', dist: 240 }), G.sai(t, SUGA, { para: 'cima', dist: 300 })));
      itens.forEach(({ c, tile, T, m }, i) => {
        const ti = POUSO[i];
        // posição na pilha: cada card que pousa depois empurra este pra baixo, com mola
        let y = Y0;
        for (let k = i + 1; k < POUSO.length; k++) y += PASSO_Y * M.spring(t - POUSO[k] + 0.26, 3.6, 0.7);
        const lado = i % 2 ? 'esq' : 'dir';
        // folha arremessada: chega girando em 3D e assenta com o passo além da mola
        const o = G.entra(t, ti - 0.24, { dur: 0.36, de: lado, dist: 760, ry: i % 2 ? 48 : -48, blur: 16 });
        o.r = (i % 2 ? -14 : 14) * (1 - G.E.outCubic(M.prog(t, ti - 0.24, ti + 0.1)));
        const tranco = M.kick(t, ti, 10, 3.4, 0.4);
        const repouso = (i % 2 ? 1 : -1) * 1.8;
        // sugado: escadinha de 2 quadros, primeiro que entrou é o primeiro que sai
        const ps = G.E.inExp(M.prog(t, SUGA + i * 2 / 30, SUGA + i * 2 / 30 + 0.34));
        const cy = y + H / 2;
        const suga = { x: (CENTRO.x - (X + W / 2)) * ps, y: (CENTRO.y - cy) * ps, s: 1 - 0.8 * ps, blur: 18 * ps, op: 1 - M.prog(ps, 0.5, 1) };
        G.poe(c, G.soma(o, { y: y + tranco, r: repouso * M.prog(t, ti, ti + 0.3) }, suga));
        G.poe(tile, G.entra(t, ti - 0.1, { dur: 0.32, s0: 0.6, de: 'baixo', dist: 0, blur: 6, mola: 3 }));
        G.palavrasSeek(T, t, ti - 0.04, { passo: 1 / 30, dur: 0.32, dist: 30, blur: 10 });
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
