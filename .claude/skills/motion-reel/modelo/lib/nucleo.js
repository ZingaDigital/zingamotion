// Núcleo do filme: formato, grade de batidas, registro de planos, contêiner que muda de estado, cursor que conduz,
// legenda padrão, grão, borrão direcional e trilha base. Monta uma vez em ready; depois só responde a seek(t).
// Nada guarda estado entre quadros: toda posição é função de t.
(function () {
  const q = new URLSearchParams(location.search);
  const FORMATOS = { '9x16': [1080, 1920], '1x1': [1080, 1080], '16x9': [1920, 1080] };
  const [W, H] = FORMATOS[q.get('formato')] || FORMATOS['9x16'];
  const BPM = 120, BATIDA = 60 / BPM;                 // trocar se a música medida pedir outro andamento
  const Z = {
    W, H, BPM, BATIDA, formato: q.get('formato') || '9x16',
    b: (n) => n * BATIDA,
    // área segura: Reels/TikTok escondem o topo, o rodapé e a coluna da direita
    SEGURO: H > W ? { x0: 64, x1: W - 140, y0: 220, y1: H - 420 } : { x0: 80, x1: W - 80, y0: 60, y1: H - 60 },
    COR: { fundo: '#f4efe8', tinta: '#1d1a17', destaque: '#ff5a1f', cartao: '#ffffff', sombra: 'rgba(40, 25, 10, .22)' },
    planos: [],
  };
  // cores reais da marca: preencha a partir de assets/marca.json (captura.mjs) antes de montar
  Z.marca = (cores) => Object.assign(Z.COR, cores);

  // ---------- registro de planos ----------
  // Z.plano({ id, inicio, fim, z, montar(el, Z), seek(t, el, Z), som(S, Z) }); só é desenhado em [inicio, fim)
  Z.plano = (def) => { def.z = def.z ?? Z.planos.length; Z.planos.push(def); };

  // ---------- DOM ----------
  Z.div = (pai, css = {}, cls) => {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    Object.assign(d.style, { position: 'absolute' }, css);
    if (pai) pai.append(d);
    return d;
  };
  Z.img = (pai, src, css = {}) => {
    const i = document.createElement('img');
    i.src = src.includes('.') ? src : `assets/${src}.png`; i.draggable = false;
    Object.assign(i.style, { display: 'block' }, css);
    if (pai) pai.append(i);
    return i;
  };
  Z.tf = (el, o = {}) => {
    el.style.transform = `translate3d(${o.x || 0}px, ${o.y || 0}px, ${o.z || 0}px) rotateX(${o.rx || 0}deg) ` +
      `rotateY(${o.ry || 0}deg) rotateZ(${o.r || 0}deg) scale(${o.sx ?? o.s ?? 1}, ${o.sy ?? o.s ?? 1})`;
  };
  // display explícito: 'block' para camadas que nascem escondidas no CSS
  Z.mostra = (el, sim, como = '') => { el.style.display = sim ? como : 'none'; };

  // ---------- contêiner que nunca corta ----------
  // estados: [[t, { x, y, w, h, r }], ...] (x, y = canto superior esquerdo). Entre dois estados a transição é uma
  // mola que parte no instante do estado novo (acelera e freia com um leve passo além, sem quicar).
  Z.estado = (t, estados, { freq = 2.2, zeta = 0.62 } = {}) => {
    let atual = { ...estados[0][1] };
    for (let i = 1; i < estados.length; i++) {
      const [ti, alvo] = estados[i];
      if (t < ti) break;
      const p = M.spring(t - ti, freq, zeta);
      const de = { ...atual };
      for (const k of Object.keys(alvo)) atual[k] = M.lerp(de[k] ?? alvo[k], alvo[k], p);
    }
    return atual;
  };
  Z.poeEstado = (el, s) => {
    el.style.left = s.x.toFixed(2) + 'px'; el.style.top = s.y.toFixed(2) + 'px';
    el.style.width = s.w.toFixed(2) + 'px'; el.style.height = s.h.toFixed(2) + 'px';
    if (s.r !== undefined) el.style.borderRadius = s.r.toFixed(2) + 'px';
  };

  // ---------- cursor que conduz ----------
  // caminho: [[t, x, y, clica?], ...]. Vai de ponto a ponto com a curva 100/50 (chega antes do clique),
  // e o clique afunda a seta (squash) e solta um anel sólido. Desenho: seta preta com contorno branco, sem brilho.
  Z.cursor = (pai) => {
    const c = Z.div(pai, { left: '0px', top: '0px', width: '72px', height: '72px', zIndex: 50, transformOrigin: '8px 5px' });
    c.innerHTML = '<svg width="72" height="72" viewBox="0 0 28 28"><path d="M5 3 L5 22 L10 17 L13.5 25 L17 23.5 L13.6 15.8 L20.5 15.8 Z" ' +
      'fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const anel = Z.div(pai, { left: '0px', top: '0px', width: '0px', height: '0px', border: '4px solid', borderRadius: '50%', zIndex: 49, display: 'none' });
    return { c, anel };
  };
  Z.cursorSeek = (cur, t, caminho, { voo = 0.32 } = {}) => {
    let [, x, y] = caminho[0];
    for (let i = 1; i < caminho.length; i++) {
      const [ti, xi, yi] = caminho[i];
      const p = M.E.entra(M.prog(t, ti - voo, ti));
      x = M.lerp(x, xi, p); y = M.lerp(y, yi, p);
    }
    let sq = 0, anel = null;
    for (const [ti, xi, yi, clica] of caminho) {
      if (!clica) continue;
      sq += M.kick(t, ti, 0.16, 3.4, 0.45);
      const u = M.prog(t, ti, ti + 0.4);
      if (u > 0 && u < 1) anel = { x: xi, y: yi, u };
    }
    cur.c.style.transform = `translate(${(x - 8).toFixed(2)}px, ${(y - 5).toFixed(2)}px) scale(${(1 - sq).toFixed(4)}, ${(1 - sq * 0.6).toFixed(4)})`;
    Z.mostra(cur.anel, !!anel, 'block');
    if (anel) {
      const r = 10 + 46 * M.E.entra(anel.u);
      Object.assign(cur.anel.style, { left: (anel.x - r).toFixed(2) + 'px', top: (anel.y - r).toFixed(2) + 'px', width: 2 * r + 'px', height: 2 * r + 'px',
        borderWidth: (4 * (1 - anel.u)).toFixed(2) + 'px', borderColor: Z.COR.destaque, boxSizing: 'border-box' });
    }
  };

  // ---------- borrão direcional (desvio só em x ou só em y) ----------
  let nFiltro = 0;
  Z.borrao = (el) => {
    const id = 'bz' + (++nFiltro), ns = 'http://www.w3.org/2000/svg';
    const f = document.createElementNS(ns, 'filter');
    f.id = id; f.setAttribute('x', '-50%'); f.setAttribute('y', '-50%'); f.setAttribute('width', '200%'); f.setAttribute('height', '200%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    const g = document.createElementNS(ns, 'feGaussianBlur'); g.setAttribute('stdDeviation', '0 0'); f.append(g);
    document.getElementById('filtros').append(f);
    return {
      set(dx, dy) {
        if (dx < 0.05 && dy < 0.05) { el.style.filter = ''; return; }
        g.setAttribute('stdDeviation', `${Math.max(0, dx).toFixed(2)} ${Math.max(0, dy).toFixed(2)}`);
        el.style.filter = `url(#${id})`;
      },
    };
  };

  // ---------- legenda padrão ----------
  // partes: [{ t: 'Frase ' }, { t: 'palavra-chave.', chave: true }]. Uma fonte de título; a chave em itálico/cor de destaque.
  // quebra: índice da palavra depois da qual a linha quebra (a caixa termina nela).
  Z.legenda = (pai, partes, { x = 64, y, tam = 68, largura = 860, cor, corChave, quebra } = {}) => {
    const box = Z.div(pai, { left: x + 'px', top: (y ?? Z.H * 0.69) + 'px', width: largura + 'px', lineHeight: '1.08',
      fontFamily: 'var(--titulo)', fontSize: tam + 'px', fontWeight: '600', wordSpacing: '0.02em' });
    const palavras = [];
    for (const p of partes) for (const w of p.t.split(/(\s+)/)) {
      if (!w) continue;
      if (/^\s+$/.test(w)) { box.append(document.createTextNode(' ')); continue; }
      const s = document.createElement('span');
      s.textContent = w;
      Object.assign(s.style, { display: 'inline-block', fontFamily: 'var(--titulo)', fontSize: tam + 'px',
        fontWeight: p.chave ? '300' : '600', fontStyle: p.chave ? 'italic' : 'normal',
        color: p.chave ? (corChave || Z.COR.destaque) : (cor || Z.COR.tinta), transformOrigin: '0% 80%' });
      box.append(s); palavras.push(s);
    }
    if (quebra !== undefined) {                       // quebra de linha forçada depois da palavra (o resto segue na largura cheia)
      const w = palavras[quebra], depois = w.nextSibling;
      if (depois && depois.nodeType === 3) depois.remove();
      w.after(document.createElement('br'));
    }
    return { box, palavras };
  };
  // entra por foco + escala + subida, palavra a palavra; sai desfocando e subindo
  Z.legendaSeek = (L, t, entra, sai = 1e9, { passo = 0.045, dur = 0.2 } = {}) => {
    L.palavras.forEach((s, i) => {
      const pe = M.E.entra(M.prog(t, entra + i * passo, entra + i * passo + dur));
      const ps = M.E.sai(M.prog(t, sai + i * passo * 0.6, sai + i * passo * 0.6 + dur * 0.8));
      s.style.visibility = t >= entra + i * passo && ps < 1 ? 'visible' : 'hidden';
      const blur = 14 * (1 - pe) + 16 * ps;
      s.style.filter = blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : 'blur(0px)';   // mesmo caminho de pintura sempre
      s.style.opacity = Math.min(1, pe * 3) * (1 - ps);
      s.style.transform = `translate(0px, ${(1 - pe) * 34 - ps * 26}px) scale(${0.9 + 0.1 * pe})`;
    });
  };

  // ---------- grão determinístico ----------
  const ladrilhos = [];
  Z.montaGrao = () => {
    const r = M.mulberry32(0x6a2e);
    for (let k = 0; k < 6; k++) {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const ctx = c.getContext('2d'), im = ctx.createImageData(256, 256);
      for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(r() * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      ctx.putImageData(im, 0, 0); ladrilhos.push(c.toDataURL());
    }
  };
  Z.grao = (el, t) => {
    const n = Math.round(t * FILM.fps), r = M.mulberry32(n * 7919 + 13);
    el.style.backgroundImage = `url(${ladrilhos[n % ladrilhos.length]})`;
    el.style.backgroundPosition = `${Math.floor(r() * 256)}px ${Math.floor(r() * 256)}px`;
  };

  // ---------- trilha base (por compassos; dá pra esticar um compasso para um respiro de leitura) ----------
  // compassos: tamanhos em batidas, ex.: [4, 4, 6, 4]. silencios: batidas antes das quais cai uma colcheia de silêncio.
  Z.trilha = (S, { compassos = [4, 4, 4, 4, 4, 4, 4, 4], silencios = [], viradas = [] } = {}) => {
    const B = BATIDA, C = B / 2, SC = B / 4;
    const ACORDE = [[110, 130.81, 164.81], [87.31, 110, 130.81], [130.81, 164.81, 196], [98, 123.47, 146.83]]; // Am F C G
    const BAIXO = [55, 43.65, 65.41, 49];
    const N = compassos.reduce((a, b) => a + b), FIM = N * B;
    const silencio = (t) => silencios.some((m) => t >= m * B - C - 0.001 && t < m * B);
    let m0 = 0;
    compassos.forEach((len, bar) => {
      const comp = bar % 4;
      S.chord(m0 * B, ACORDE[comp], B * (len - 0.4), 0.028);
      for (let i = m0; i < m0 + len; i++) {
        const t = i * B;
        if (!silencio(t)) S.kick(t, i === m0 ? 1 : 0.85);
        if (i % 2 === 1 && !silencio(t)) S.clap(t, 0.36);
        if (!silencio(t)) S.bass(t, BAIXO[comp], C * 0.9, 0.34);
        if (!silencio(t + C * 1.5)) S.bass(t + C * 1.5, BAIXO[comp] * 2, C * 0.4, 0.2);
        for (let k = 0; k < 2; k++) { const th = t + k * C; if (!silencio(th) && th < FIM - 0.1) S.hat(th, k ? 0.13 : 0.07); }
      }
      m0 += len;
    });
    for (const m of viradas) for (let k = 1; k <= 4; k++) S.hat(m * B - k * SC, 0.05 + k * 0.02);
    S.chord((N - 1) * B, [220, 261.63, 329.63, 440], 0.9, 0.05);
  };

  window.Z = Z;
})();
