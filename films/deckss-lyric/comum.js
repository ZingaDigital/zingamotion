// Comum aos 5 modelos do lyric video "Vai Fazer Sentido" (Deckss). 16:9, 1920x1080, 30 fps.
// Trecho da música: 14,30 s a 24,60 s da faixa (versos 1 a 4). Tempo do modelo t = tempo da faixa - OFF.
// Palavras cronometradas pelas sílabas da voz separada (Spleeter) em audio/vocals.wav.
(() => {
  const OFF = 14.30, DUR = 10.3, BT = 60 / 163;
  const s = (x) => +(x - OFF).toFixed(3);
  const L = (pares, fim) => ({ palavras: pares.map(([w, t]) => ({ w, t: s(t) })), t0: s(pares[0][1]), t1: s(fim) });
  const LETRA = [
    L([['A', 15.06], ['gente', 15.24], ['cresceu', 15.59], ['sem', 15.95], ['perceber', 16.05]], 16.62),
    L([['Como', 16.68], ['quem', 17.00], ['troca', 17.26], ['a', 17.62], ['pele', 17.72], ['sem', 18.19], ['sentir', 18.36]], 19.5),
    L([['Ontem', 19.78], ['eu', 19.98], ['corria', 20.18], ['na', 20.51], ['rua', 20.75], ['descalço', 21.09]], 21.6),
    L([['Hoje', 21.64], ['mal', 21.97], ['lembro', 22.26], ['como', 22.77], ['era', 23.30], ['sorrir', 23.68]], 24.6),
  ];
  // batidas da grade (163 BPM) no tempo do modelo
  const BATIDAS = [];
  for (let k = Math.ceil(OFF / BT); k * BT < OFF + DUR; k++) BATIDAS.push(s(k * BT));

  const W = 1920, H = 1080;
  const div = (pai, css = {}, txt) => { const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute' }, css); if (txt != null) d.textContent = txt; pai.append(d); return d; };
  const img = (pai, src, css = {}) => { const i = document.createElement('img'); i.src = src; Object.assign(i.style, { position: 'absolute', display: 'block' }, css); pai.append(i); return i; };
  const svg = (pai, w, h, html, css = {}) => { const d = div(pai, { width: w + 'px', height: h + 'px', ...css }); d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="overflow:visible">${html}</svg>`; return d; };
  // centro (cx, cy), escala s, rotação r
  const poe = (el, cx, cy, s = 1, r = 0, extra = '') => { el.style.transform = `translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) translate(-50%, -50%) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})${extra}`; };
  // revelação de pincel: máscara em degradê que varre da esquerda pra direita (p de 0 a 1)
  const pincel = (el, p, ang = 90, borda = 14) => {
    if (p >= 1) { el.style.webkitMaskImage = el.style.maskImage = 'none'; return; }
    const a = p * (100 + borda) - borda;
    const m = `linear-gradient(${ang}deg, #000 ${a.toFixed(1)}%, transparent ${(a + borda).toFixed(1)}%)`;
    el.style.webkitMaskImage = el.style.maskImage = m;
  };
  const ativo = (t) => { let i = -1; LETRA.forEach((l, k) => { if (t >= l.t0 - 0.25) i = k; }); return i; };
  const ultimaBatida = (t) => { let b = -1; for (const x of BATIDAS) if (x <= t) b = x; return b; };
  // tremor por impulso nas batidas dadas
  const tranco = (t, ts, amp = 10) => { let x = 0, y = 0, r = 0; ts.forEach((t0, i) => { x += M.kick(t, t0, amp, 8, 0.35) * (i % 2 ? 1 : -1); y += M.kick(t, t0 + 0.01, amp * 0.7, 10, 0.35); r += M.kick(t, t0, amp * 0.05, 6, 0.4); }); return { x, y, r }; };
  // grão determinístico
  const ladrilhos = [];
  const montaGrao = () => { const r = M.mulberry32(0x6a2e); for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = c.height = 256; const ctx = c.getContext('2d'), im = ctx.createImageData(256, 256); for (let i = 0; i < im.data.length; i += 4) { const v = Math.floor(r() * 255); im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } ctx.putImageData(im, 0, 0); ladrilhos.push(c.toDataURL()); } };
  const grao = (el, t, fps = 30) => { const n = Math.round(t * fps), r = M.mulberry32(n * 7919 + 13); el.style.backgroundImage = `url(${ladrilhos[n % 6]})`; el.style.backgroundPosition = `${Math.floor(r() * 256)}px ${Math.floor(r() * 256)}px`; };
  const COR = { creme: '#f3e6cc', preto: '#0b0a09', amarelo: '#ffc21a', laranja: '#ff7a1a', vermelho: '#e8261c' };
  // degradê da marca (SENTIDO): amarelo em cima, vermelho embaixo
  const GRAD = `linear-gradient(180deg, ${COR.amarelo} 0%, ${COR.amarelo} 52%, ${COR.laranja} 68%, ${COR.vermelho} 88%)`;
  window.C = { OFF, DUR, BT, LETRA, BATIDAS, W, H, div, img, svg, poe, pincel, ativo, ultimaBatida, tranco, montaGrao, grao, COR, GRAD };
})();
