// Gramática Zinga em seek(t): tokens da marca (design-system-zinga), fundo por tema, primitivas de entrada e
// saída do zinga-motion (palavra a palavra com blur, saída quádrupla: posição + blur + opacidade + escala),
// glifos sólidos na grade de 24 px e o logo vetorial oficial. Tudo é função pura de t.
(function () {
  const G = {};
  G.COR = {
    navy: '#002140', navyFundo: '#00152a', navyCard: '#052b4f', navySheen: '#0c365c', navyNight: '#001932',
    rosa: '#f50953', rosaFundo: '#c2073f', branco: '#ffffff', mudo: '#a8bcd2', mudoRosa: '#ffe3ec',
    luzAzul: '#2478c9',
  };
  // instante em que a peça vira tema rosa (o pill "Pausa" termina de cobrir a tela)
  G.TROCA = 8.36;
  G.LOOP = 19.5;                                       // o rosa encolhe até virar o 1º dia da grade (o fim prepara o começo)

  // ---------- fundo: degradê do tema + uma luz por canto (azul no azul, branca no rosa). Corte seco entre temas.
  G.fundo = (t) => {
    const f = document.getElementById('fundo'), luz = document.getElementById('luz');
    const rosa = t >= G.TROCA && t < G.LOOP;
    f.style.background = rosa
      ? `linear-gradient(160deg, ${G.COR.rosa} 0%, ${G.COR.rosaFundo} 100%)`
      : `linear-gradient(160deg, ${G.COR.navy} 0%, ${G.COR.navyFundo} 100%)`;
    const r = 760 + 40 * Math.sin(t * 1.3);
    Object.assign(luz.style, {
      width: 2 * r + 'px', height: 2 * r + 'px', left: (Z.W - r * 0.9).toFixed(1) + 'px', top: (-r * 0.85).toFixed(1) + 'px',
      background: rosa ? '#ffffff' : G.COR.luzAzul, opacity: rosa ? '0.28' : '0.38',
    });
  };

  // ---------- curvas ----------
  const inExp = M.bezier(0.7, 0, 0.84, 0);           // saída: começa lento e arremessa
  const outCubic = M.bezier(0.33, 1, 0.68, 1);        // entrada: aterrissa
  G.E = { inExp, outCubic, morph: M.bezier(0.65, 0, 0.35, 1) };

  const DIR = { esq: [-1, 0], dir: [1, 0], cima: [0, -1], baixo: [0, 1] };
  G.st = () => ({ x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0, rx: 0, ry: 0, blur: 0, op: 1 });

  // entrada: vem DE uma direção, com blur alto -> 0, escala s0 -> 1, rotateY opcional (cartão 3D)
  G.entra = (t, t0, { dur = 0.5, de = 'baixo', dist = 60, blur = 12, s0 = 1, ry = 0, rx = 0, mola = 0 } = {}) => {
    const p = M.prog(t, t0, t0 + dur);
    let e = outCubic(p);
    if (mola) e = M.spring(t - t0, mola, 0.55);       // passa um pouco do ponto e assenta
    const [dx, dy] = DIR[de];
    const o = G.st();
    o.x = dx * dist * (1 - e); o.y = dy * dist * (1 - e);
    o.blur = blur * (1 - M.prog(t, t0, t0 + dur * 0.6));
    o.op = t < t0 ? 0 : M.prog(t, t0, t0 + dur * 0.3);
    o.s = s0 + (1 - s0) * e; o.ry = ry * (1 - e); o.rx = rx * (1 - e);
    return o;
  };
  // saída quádrupla: posição (in exp) + blur 0 -> 20 + escala 1 -> 0.94 + opacidade some a partir de 35%
  G.sai = (t, t0, { dur = 0.4, para = 'esq', dist = 1200, blur = 20, s1 = 0.94 } = {}) => {
    const p = M.prog(t, t0, t0 + dur), e = inExp(p);
    const [dx, dy] = DIR[para];
    const o = G.st();
    o.x = dx * dist * e; o.y = dy * dist * e; o.blur = blur * p; o.s = 1 - (1 - s1) * p;
    o.op = 1 - M.prog(p, 0.35, 1);
    return o;
  };
  G.soma = (...l) => l.reduce((a, b) => ({
    x: a.x + (b.x || 0), y: a.y + (b.y || 0), s: a.s * (b.s ?? 1), sx: a.sx * (b.sx ?? 1), sy: a.sy * (b.sy ?? 1),
    r: a.r + (b.r || 0), rx: a.rx + (b.rx || 0), ry: a.ry + (b.ry || 0), blur: a.blur + (b.blur || 0), op: a.op * (b.op ?? 1),
  }), G.st());
  G.poe = (el, o) => {
    const vis = o.op > 0.003;
    el.style.visibility = vis ? 'visible' : 'hidden';
    if (!vis) { el.style.opacity = '0'; return; }   // filho com visibility: visible vazaria; opacidade 0 vale pros filhos
    el.style.opacity = M.clamp(o.op).toFixed(4);
    el.style.transform = `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, 0px) rotateX(${o.rx.toFixed(3)}deg) ` +
      `rotateY(${o.ry.toFixed(3)}deg) rotate(${o.r.toFixed(3)}deg) scale(${(o.s * o.sx).toFixed(4)}, ${(o.s * o.sy).toFixed(4)})`;
    el.style.filter = `blur(${Math.max(0, o.blur).toFixed(2)}px)`;
  };

  // ---------- texto palavra a palavra ----------
  // linhas: [[ 'Até as ', ['ideias', { cor }] ], ...]. Cada palavra vira um span; devolve a ordem de leitura.
  G.texto = (pai, linhas, { x = 72, y = 300, tam = 96, peso = 600, lh = 1.02, cor = '#fff', ls = '-0.01em', largura } = {}) => {
    const box = Z.div(pai, { left: x + 'px', top: y + 'px', fontFamily: 'var(--titulo)', fontSize: tam + 'px', fontWeight: peso,
      lineHeight: lh, letterSpacing: ls, color: cor, whiteSpace: 'nowrap', width: largura ? largura + 'px' : 'auto' });
    const palavras = [];
    for (const linha of linhas) {
      const ln = document.createElement('div');
      ln.style.position = 'relative';
      for (const peca of linha) {
        const [txt, est = {}] = Array.isArray(peca) ? peca : [peca];
        for (const w of txt.split(/(?<=\s)/)) {
          if (!w) continue;
          const s = document.createElement('span');
          s.className = 'w'; s.textContent = w;
          if (est.cor) s.style.color = est.cor;
          if (est.peso) s.style.fontWeight = est.peso;
          if (est.tam) s.style.fontSize = est.tam + 'px';
          ln.append(s); palavras.push(s);
        }
      }
      box.append(ln);
    }
    return { box, palavras };
  };
  // entrada de baixo pra cima, stagger de 2 a 4 quadros; saída em escadinha de 2 quadros
  G.palavrasSeek = (T, t, t0, ent = {}, tSai = 1e9, sai = {}) => {
    const passo = ent.passo ?? 3 / 30, passoSai = sai.passo ?? 2 / 30;
    T.palavras.forEach((w, i) => {
      const a = G.entra(t, t0 + i * passo, { dur: 0.5, de: 'baixo', dist: 56, blur: 12, ...ent });
      const b = G.sai(t, tSai + i * passoSai, { dur: 0.38, para: 'esq', dist: 900, ...sai });
      G.poe(w, G.soma(a, b));
    });
  };

  // ---------- glifos sólidos (grade de 24 px, fill-rule evenodd para os furos) ----------
  const P = {
    chat: 'M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9l-5 4.5V17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM7 8.2h10v1.8H7zM7 11.4h7v1.8H7z',
    relogio: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM11 6h2v5.4l3.8 2.2-1 1.7L11 12.6z',
    arquivo: 'M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM13.5 3.5V8.5h5zM7.5 13h9v1.8h-9zM7.5 16.4h6v1.8h-6z',
    calendario: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM5 9.5V20h14V9.5zM7 2h2.2v4H7zM14.8 2H17v4h-2.2zM7 12h3v3H7z',
    email: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4.2 7l7.8 5.6L19.8 7z',
    check: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM10.4 16.4L6 12l1.6-1.6 2.8 2.8 6-6L18 8.8z',
    lampada: 'M12 1.8a7.2 7.2 0 0 0-4.2 13V17h8.4v-2.2A7.2 7.2 0 0 0 12 1.8zM8.6 18.4h6.8v1.7H8.6zM10 21.2h4V23h-4z',
    raio: 'M13.5 1.5L4 14h7l-1.5 8.5L19 10h-7z',
    pausa: 'M6 4h4.2v16H6zM13.8 4H18v16h-4.2z',
  };
  G.glifo = (nome, cor = '#fff', tam = 48) =>
    `<svg width="${tam}" height="${tam}" viewBox="0 0 24 24"><path fill="${cor}" fill-rule="evenodd" d="${P[nome]}"/></svg>`;

  // tile de ícone (sem brilho: só a aresta em degradê e a sombra de chão)
  G.tile = (pai, nome, { x = 0, y = 0, tam = 96, fundo = 'azulRosa', glifo = '#fff' } = {}) => {
    const fills = {
      azulRosa: `linear-gradient(150deg, #0c365c 0%, #581947 55%, ${G.COR.rosa} 100%)`,
      rosa: `radial-gradient(circle at 22% 18%, #f81a66 0%, ${G.COR.rosa} 60%)`,
      navy: `linear-gradient(215deg, #134372 0%, ${G.COR.navySheen} 20%, #001c38 60%, ${G.COR.navyNight} 100%)`,
    };
    const el = Z.div(pai, { left: x + 'px', top: y + 'px', width: tam + 'px', height: tam + 'px', borderRadius: (tam * 0.24) + 'px',
      border: '2px solid transparent', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${fills[fundo]} padding-box, linear-gradient(45deg, ${G.COR.navy} 0%, ${G.COR.rosa} 50%, ${G.COR.navy} 100%) border-box`,
      boxShadow: '0 14px 26px -10px #000a1ab3' });
    el.innerHTML = G.glifo(nome, glifo, tam * 0.52);
    return el;
  };
  // card padrão do tema azul (receita zg-card, sem o halo)
  G.card = (pai, css = {}) => Z.div(pai, Object.assign({ boxSizing: 'border-box', borderRadius: '28px', border: '2px solid transparent',
    background: 'linear-gradient(215deg, #134372 0%, #0c365c 14%, #001c38 52%, #001932 100%) padding-box, ' +
      `linear-gradient(165deg, #0c365c 0%, #0c2a4d 55%, ${G.COR.rosa} 100%) border-box`,
    boxShadow: '0 24px 60px -20px #00060dcc' }, css));

  // logo vetorial oficial (assets/logo.svg = logo-tokenizado.svg do design system): lettering em ink, ponto em accent
  G.LOGO = '';
  G.carregaLogo = () => fetch('assets/logo.svg').then((r) => r.text()).then((txt) => { G.LOGO = txt; });
  G.logo = (ink = '#fff', ponto = G.COR.rosa, larg = 240) => G.LOGO
    .replace('class="zg-logo"', `width="${larg}"`).replaceAll('var(--ink)', ink).replace('var(--accent)', ponto);

  window.G = G;
})();
