// Modelo 4: ZINE XEROX. Fotocópia em preto e creme, chapa amarela fora de registro, animação travada a 12 quadros/s
// (stop motion). A palavra cantada bate GIGANTE; o verso inteiro se monta embaixo numa tira. Fonte de título: Knewave.
(() => {
  const { LETRA, BATIDAS, W, H, div, img, COR } = C;
  const DESTAQUE = new Set(['cresceu', 'perceber', 'sentir', 'descalço', 'sorrir']);
  const FPS = 12;
  const IMGS = ['capa', 'p-criancas', 'p-garoto', 'p-bola', 'p-beco', 'p-polaroid', 'p-mochila', 'p-carrinho'];
  let fundo, fotosEl = {}, foto, logo, giga, gigaA, tira, tiraTxt, risco, palavras;
  const q = (t) => Math.floor(t * FPS + 1e-6) / FPS;
  const rnd = (n, k = 0) => M.mulberry32(n * 9973 + k * 31 + 7)();

  window.MODELO = {
    fpsGrao: 12,
    async montar(cena) {
      fundo = div(cena, { inset: '0px' });
      IMGS.forEach((nm) => { fotosEl[nm] = img(cena, `tex/xerox/${nm}.png`, { left: '0px', top: '0px', transformOrigin: '50% 50%', display: 'none' }); });
      logo = img(cena, 'rec/logo.png', { left: '0px', top: '0px', width: '1300px', transformOrigin: '50% 50%' });
      risco = C.svg(cena, W, H, '<polyline fill="none" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" />', { left: '0px', top: '0px' });
      gigaA = div(cena, { left: '0px', top: '0px', fontFamily: 'Knewave', color: COR.amarelo, lineHeight: '1', whiteSpace: 'nowrap', transformOrigin: '50% 50%' });
      giga = div(cena, { left: '0px', top: '0px', fontFamily: 'Knewave', lineHeight: '1', whiteSpace: 'nowrap', transformOrigin: '50% 50%' });
      tira = div(cena, { left: '70px', top: '880px', padding: '14px 34px 8px', transformOrigin: '0 50%',
        clipPath: 'polygon(0% 10%, 3% 0%, 40% 6%, 70% 0%, 100% 8%, 98% 50%, 100% 92%, 60% 100%, 25% 94%, 2% 100%, 1% 55%)' });
      tiraTxt = div(tira, { position: 'relative', fontFamily: 'Knewave', fontSize: '84px', lineHeight: '1', whiteSpace: 'nowrap' });
      palavras = LETRA.flatMap((l, li) => l.palavras.map((p, k) => ({ ...p, li, k })));
    },
    seek(tReal) {
      const t = q(tReal), n = Math.round(t * FPS);
      const li = Math.max(0, C.ativo(t));
      const inv = li % 2 === 1;                                  // verso ímpar: negativo
      const tinta = inv ? COR.creme : COR.preto, papel = inv ? COR.preto : '#ece0c4';
      fundo.style.background = papel;
      // foto xerox: troca a cada 2 batidas (corte seco), posição e giro sorteados por bloco
      const bi = BATIDAS.filter((b) => b <= t).length, bloco = Math.floor(bi / 2);
      const nome = IMGS[bloco % IMGS.length];
      IMGS.forEach((nm) => { fotosEl[nm].style.display = nm === nome ? '' : 'none'; });
      foto = fotosEl[nome];
      const fs = 1.5 + rnd(bloco, 1) * 0.9, fx = 500 + rnd(bloco, 2) * 900, fy = 300 + rnd(bloco, 3) * 500, fr = (rnd(bloco, 4) - 0.5) * 24;
      const fw = nome === 'capa' ? 1254 : 500;
      foto.style.width = fw + 'px';
      foto.style.filter = inv ? 'contrast(1.3)' : 'invert(1) contrast(1.2)';
      foto.style.opacity = nome === 'capa' ? '0.6' : '0.85';
      foto.style.transform = `translate(${fx - fw / 2}px, ${fy - fw / 2}px) rotate(${fr.toFixed(1)}deg) scale(${fs.toFixed(3)})`;
      // abertura: logo DECKSS em fotocópia tremendo até a primeira palavra
      const abre = t < palavras[0].t;
      logo.style.display = abre ? '' : 'none';
      if (abre) {
        logo.style.filter = 'grayscale(1) contrast(2) invert(1)';
        const j = (k) => (rnd(n, k) - 0.5) * 10;
        logo.style.transform = `translate(${310 + j(1)}px, ${(1080 - 924) / 2 - 60 + j(2)}px) rotate(${(-3 + j(3) * 0.2).toFixed(2)}deg) scale(${(1 + (t < 0.15 ? 0.2 : 0)).toFixed(2)})`;
      }
      // palavra gigante = a última que caiu
      let cur = null; palavras.forEach((p) => { if (p.t <= t) cur = p; });
      const vis = cur && !abre;
      giga.style.display = gigaA.style.display = vis ? '' : 'none';
      risco.style.display = 'none';
      if (vis) {
        const id = palavras.indexOf(cur), d = DESTAQUE.has(cur.w);
        const txt = cur.w.toUpperCase();
        const tam = Math.min(d ? 470 : 400, 1700 / (txt.length * 0.66));
        const gx = 960 + (rnd(id, 5) - 0.5) * 520, gy = 430 + (rnd(id, 6) - 0.5) * 220, gr = (rnd(id, 7) - 0.5) * 18;
        const fr0 = Math.round((t - cur.t) * FPS);           // quadros (a 12 fps) desde a batida da palavra
        const s = fr0 === 0 ? 1.22 : fr0 === 1 ? 0.96 : 1;
        const j = (k) => (rnd(n, k + 20) - 0.5) * 6;
        for (const [el, ox, oy, cor] of [[gigaA, 14, 10, COR.amarelo], [giga, 0, 0, tinta]]) {
          el.textContent = txt; el.style.fontSize = tam + 'px'; el.style.color = cor;
          el.style.transform = `translate(${gx + ox + j(ox)}px, ${gy + oy + j(oy + 1)}px) translate(-50%, -50%) rotate(${(gr + j(3) * 0.15).toFixed(2)}deg) scale(${s})`;
        }
        if (d && fr0 >= 1) {                                  // zigue-zague amarelo de marcador embaixo da palavra-chave
          risco.style.display = '';
          const L = Math.min(1, (fr0 - 1) / 3), larg = txt.length * tam * 0.62, pts = [];
          for (let k = 0; k <= 10 * L; k++) pts.push(`${(gx - larg / 2 + k / 10 * larg).toFixed(0)},${(gy + tam * 0.55 + (k % 2 ? 26 : -18) + j(k) * 2).toFixed(0)}`);
          const pl = risco.querySelector('polyline');
          pl.setAttribute('points', pts.join(' ')); pl.setAttribute('stroke', inv ? COR.amarelo : COR.vermelho);
        }
      }
      // tira com o verso até aqui
      const versoAte = cur && !abre ? palavras.filter((p) => p.li === cur.li && p.t <= t).map((p) => p.w).join(' ') : '';
      tira.style.display = versoAte ? '' : 'none';
      tira.style.background = inv ? COR.creme : COR.preto;
      tiraTxt.style.color = inv ? COR.preto : COR.creme;
      tiraTxt.textContent = versoAte;
      tira.style.transform = `rotate(${(li % 2 ? 1.5 : -1.5) + (rnd(n, 40) - 0.5) * 0.4}deg)`;
    },
  };
})();
