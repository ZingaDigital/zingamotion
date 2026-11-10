// Lettering no estilo da arte do título: borda áspera (deslocamento por ruído), preenchimento texturizado (creme com
// retícula e salpico, ou fogo amarelo->vermelho), contorno preto grosso, filete creme por fora e pingos que saem das
// letras. Tudo montado uma vez; o seek só move/escala. Filtros com semente fixa (determinísticos).
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  let defs, n = 0;
  const garanteDefs = () => {
    if (defs) return defs;
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('width', '0'); s.setAttribute('height', '0'); s.style.position = 'absolute';
    defs = document.createElementNS(NS, 'defs'); s.append(defs); document.body.append(s); return defs;
  };
  // filtro por tamanho: espessuras proporcionais ao corpo da letra
  const filtro = (tam, { aspero = 1, borda = '#f3e6cc', sombra = true } = {}) => {
    const id = 'lt' + (n++), k = tam / 100;
    const f = document.createElementNS(NS, 'filter');
    f.setAttribute('id', id); f.setAttribute('x', '-20%'); f.setAttribute('y', '-30%'); f.setAttribute('width', '140%'); f.setAttribute('height', '170%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    f.innerHTML = `
      <feTurbulence type="fractalNoise" baseFrequency="${(0.06 / k).toFixed(4)}" numOctaves="2" seed="${(n * 7) % 97}" result="ruido"/>
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="${(5.5 * k * aspero).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="letra"/>
      <feTurbulence type="fractalNoise" baseFrequency="${(0.5 / k).toFixed(4)}" numOctaves="1" seed="${(n * 13) % 89}" result="fino"/>
      <feDisplacementMap in="letra" in2="fino" scale="${(2.2 * k * aspero).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="letra2"/>
      <feMorphology in="letra2" operator="dilate" radius="${(1.1 * k).toFixed(2)}" result="fio"/>
      <feFlood flood-color="#2a1a12"/><feComposite in2="fio" operator="in" result="fioCor"/>
      <feMorphology in="letra2" operator="dilate" radius="${(7.5 * k).toFixed(2)}" result="grosso"/>
      <feDisplacementMap in="grosso" in2="ruido" scale="${(4 * k).toFixed(2)}" xChannelSelector="G" yChannelSelector="R" result="grossoA"/>
      <feFlood flood-color="#0b0a09"/><feComposite in2="grossoA" operator="in" result="preto"/>
      <feMorphology in="grossoA" operator="dilate" radius="${(1.6 * k).toFixed(2)}" result="ext"/>
      <feFlood flood-color="${borda}"/><feComposite in2="ext" operator="in" result="filete"/>
      <feMorphology in="grossoA" operator="dilate" radius="${(3.4 * k).toFixed(2)}" result="ext2"/>
      <feFlood flood-color="#0b0a09"/><feComposite in2="ext2" operator="in" result="fora"/>
      ${sombra ? `<feOffset in="ext2" dx="${(5 * k).toFixed(1)}" dy="${(7 * k).toFixed(1)}" result="sOff"/><feFlood flood-color="#000" flood-opacity=".55"/><feComposite in2="sOff" operator="in" result="sombra"/>` : ''}
      <feMerge>${sombra ? '<feMergeNode in="sombra"/>' : ''}<feMergeNode in="fora"/><feMergeNode in="filete"/><feMergeNode in="preto"/><feMergeNode in="fioCor"/><feMergeNode in="letra2"/></feMerge>`;
    garanteDefs().append(f); return id;
  };
  // colunas (em fração da largura) onde a letra encosta na linha de base: de onde os pingos podem sair
  const pontosDeBase = (txt, fonte, tam) => {
    const c = document.createElement('canvas'), ctx = c.getContext('2d');
    ctx.font = `${tam}px "${fonte}"`; const m = ctx.measureText(txt), A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent;
    const w = Math.ceil(m.width) + 4, h = Math.ceil(A + D + tam * 0.3);
    c.width = w; c.height = h; ctx.font = `${tam}px "${fonte}"`; ctx.textBaseline = 'alphabetic'; ctx.fillText(txt, 0, A);
    const d = ctx.getImageData(0, 0, w, h).data, cols = [];
    for (let x = 1; x < w - 1; x += 2) {
      let yb = -1; for (let y = h - 1; y >= 0; y--) if (d[(y * w + x) * 4 + 3] > 180) { yb = y; break; }
      if (yb >= A - tam * 0.05) cols.push({ fx: x / m.width, y: yb - tam * 0.06 });
    }
    const topo = (tam - (A + D)) / 2;                       // deslocamento da caixa de linha (line-height 1) no DOM
    return cols.map((c2) => ({ fx: c2.fx, y: topo + c2.y }));
  };
  // palavra pronta: { caixa, el, pingos[] }. tipo: 'creme' | 'fogo'
  const palavra = (pai, txt, { fonte, tam, tipo = 'creme', semente = 1, pingos = 3, aspero = 1, borda } = {}) => {
    const R = M.mulberry32(semente * 7919 + 3);
    const caixa = document.createElement('div'); Object.assign(caixa.style, { position: 'absolute', left: '0px', top: '0px', transformOrigin: '50% 55%' });
    pai.append(caixa);
    const corpo = document.createElement('div'); caixa.append(corpo);
    corpo.style.filter = `url(#${filtro(tam, { aspero, borda: borda || (tipo === 'fogo' ? '#ffd23a' : '#f3e6cc') })})`;
    Object.assign(corpo.style, { position: 'relative', padding: `${tam * 0.12}px ${tam * 0.14}px ${tam * 0.2}px` });
    const el = document.createElement('div'); corpo.append(el);
    Object.assign(el.style, { fontFamily: fonte, fontSize: tam + 'px', lineHeight: '1', whiteSpace: 'nowrap', color: 'transparent', padding: '0.32em 0 0.12em', margin: '-0.32em 0 -0.12em',
      backgroundImage: `url(${window.TEX || 'tex/'}fill-${tipo}.png)`, backgroundSize: tipo === 'fogo' ? '100% 100%' : `${tam * 4}px ${tam * 2}px`,
      backgroundPosition: `${Math.floor(R() * 500)}px ${tipo === 'fogo' ? 0 : Math.floor(R() * 200)}px`, WebkitBackgroundClip: 'text', backgroundClip: 'text' });
    el.textContent = txt;
    // pingos: tubinho com contorno e gota na ponta, saindo de onde a letra toca a base
    const cols = pontosDeBase(txt, fonte, tam), lista = [];
    const cor = tipo === 'fogo' ? 'linear-gradient(180deg, #e8261c, #ff7a1a 55%, #ffc21a)' : '#f3e6cc';
    for (let k = 0; k < pingos && cols.length; k++) {
      const pc = cols[Math.floor(R() * cols.length)], fx = pc.fx, larg = tam * (0.05 + R() * 0.04), len = tam * (0.12 + R() * 0.38);
      const p = document.createElement('div');
      Object.assign(p.style, { position: 'absolute', top: `${tam * 0.12 + pc.y}px`, left: `${tam * 0.14 + fx * el.offsetWidth - larg / 2}px`, width: larg + 'px', height: '0px',
        background: cor, borderRadius: `${larg / 2}px ${larg / 2}px ${larg}px ${larg}px`, transformOrigin: '50% 0' });
      const gota = document.createElement('div');
      Object.assign(gota.style, { position: 'absolute', left: `${-larg * 0.22}px`, bottom: `${-larg * 0.55}px`, width: `${larg * 1.44}px`, height: `${larg * 1.6}px`,
        borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', background: tipo === 'fogo' ? '#ffc21a' : '#f3e6cc' });
      p.append(gota);
      corpo.insertBefore(p, el); lista.push({ p, len, atraso: R() * 0.3 });
    }
    return { caixa, corpo, el, pingos: lista, tam };
  };
  const escorre = (pal, t, t0, dur = 1.4) => pal.pingos.forEach((q) => { const p = M.E.entra(M.prog(t, t0 + q.atraso, t0 + q.atraso + dur)); q.p.style.height = (q.len * p).toFixed(1) + 'px'; });
  window.LT = { palavra, escorre, filtro };
})();
