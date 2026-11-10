// Nexa Performance · versão desktop · portfólio Zinga (24 s, 9:16, 120 BPM).
// Um MacBook Pro 16 abre, a câmera mergulha na tela e o site sai dela em vista explodida: 7 camadas (uma por seção)
// que avançam uma de cada vez para contar um diferencial. No fim tudo volta pra tela e a tampa fecha (loop).
(() => {
  const E = M.E;
  E.v = M.ae(0.6, 1.0);
  E.vSai = M.ae(1.0, 0.6);
  const NAVY = '#002140', ROSA = '#f50953', FUNDO = '#f5f5f7';

  // ---------------- MacBook Pro 16 (medidas em px do modelo) ----------------
  const LW = 980, LH = 683, BD = 683;                     // tampa, base (profundidade)
  const SX = 22, SY = 24, SW = 936, SH = 605;             // tela dentro da tampa
  const BARRA = 64;                                       // barra de menu (26) + barra do Safari (38)
  const PS = SW / 1440;                                   // escala do site dentro da tela
  const FRENTE = { cx: 540, cy: 1404, S: 1.12, rx: 0, ry: 0, tampa: 0 };

  const POSES = [
    [0, 0, { cx: 730, cy: 1260, S: 0.7, rx: -34, ry: -40, tampa: -90 }],
    [0, 2.9, { cx: 560, cy: 1150, S: 0.82, rx: -22, ry: -14 }, E.suave],
    [0.35, 1.1, { tampa: 12 }],
    [3.0, 1.15, { ...FRENTE }],
    [6.05, 0.7, { cy: 2950 }, E.vSai],
    [21.0, 0.6, { cy: FRENTE.cy }],
    [22.0, 0.8, { cx: 610, cy: 1200, S: 0.8, rx: -24, ry: -16, tampa: 12 }],
    [23.0, 1.0, { cx: 730, cy: 1260, S: 0.7, rx: -34, ry: -40 }, E.suave],
    [23.0, 0.5, { tampa: -90 }],
  ];
  const pose = (t) => {
    const c = { ...POSES[0][2] };
    for (let i = 1; i < POSES.length; i++) {
      const [t0, d, alvo, ease = E.v] = POSES[i];
      if (t < t0) break;
      const p = d ? ease(M.prog(t, t0, t0 + d)) : 1;
      for (const k of Object.keys(alvo)) c[k] = M.lerp(c[k], alvo[k], p);
    }
    // respiração só fora dos instantes em que a página precisa casar com a tela
    const calma = 1 - Math.max(M.prog(t, 2.8, 3.4) * (1 - M.prog(t, 6.0, 6.6)), M.prog(t, 20.8, 21.0) * (1 - M.prog(t, 21.8, 22.6)));
    c.ry += M.wiggle(t, 0.3, 2.0, 3) * calma; c.rx += M.wiggle(t, 0.25, 1.2, 5) * calma; c.cy += M.wiggle(t, 0.35, 6, 7) * calma;
    return c;
  };

  // ---------------- camadas (seções reais do site, captura desktop 1440 px) ----------------
  const CAMADAS = [['hero', 900], ['sobre', 542], ['solucoes', 626], ['como', 844], ['areas', 606], ['clientes', 448], ['contato', 534]];
  const TOPO_SITE = FRENTE.cy + (-LH - 4 + SY + BARRA) * FRENTE.S;
  const sPag = PS * FRENTE.S;
  const PAGINA = { cx: 540, cy: TOPO_SITE + 450 * sPag, s: sPag, rx: 0, rz: 0 };   // todas nascem atrás do hero
  const ISO = (k) => ({ cx: 540, cy: 600 + k * 178, s: 0.56, rx: 56, rz: -34 });
  const MINI = (k) => ({ cx: 540, cy: 1560 + k * 50, s: 0.2, rx: 56, rz: -34 });
  const FOCO = (k) => ({ cx: 540, cy: 770, s: Math.min(0.72, 460 / CAMADAS[k][1]), rx: 0, rz: 0 });
  const CAP = [null, [8.75, 11.0], [11.0, 13.0], [13.0, 15.5], [15.5, 17.5], [17.5, 19.5], [19.5, 21.0]];
  const chavesCamada = (k) => {
    const L = [[0, 0, PAGINA], [6.0 + k * 0.07, 0.9, ISO(k)], [8.3 + k * 0.05, 0.55, MINI(k)]];
    if (CAP[k]) { L.push([CAP[k][0], 0.6, FOCO(k)]); if (k < 6) L.push([CAP[k][1], 0.55, MINI(k)]); }
    L.push([21.0 + (6 - k) * 0.03, 0.6, PAGINA]);
    return L;
  };
  const CHAVES = CAMADAS.map((_, k) => chavesCamada(k));
  const estadoCamada = (k, t) => {
    const L = CHAVES[k], c = { ...L[0][2] };
    for (let i = 1; i < L.length; i++) {
      const [t0, d, alvo] = L[i];
      if (t < t0) break;
      const p = E.v(M.prog(t, t0, t0 + d));
      for (const key of Object.keys(alvo)) c[key] = M.lerp(c[key], alvo[key], p);
    }
    return c;
  };
  const poeCamada = (el, h, c, w = 1440) => {
    el.style.transform = `translate(${(c.cx - w / 2).toFixed(2)}px, ${(c.cy - h / 2).toFixed(2)}px) perspective(5200px) ` +
      `rotateX(${c.rx.toFixed(3)}deg) rotateZ(${c.rz.toFixed(3)}deg) scale(${c.s.toFixed(4)})`;
  };

  // ---------------- textos (só o que está no site) ----------------
  const TITULOS = [
    { a: 3.4, b: 5.75, partes: [{ t: 'Proposta clara' }, { t: 'na primeira dobra.', chave: true }], quebra: 1 },
    { a: 6.4, b: 8.35, partes: [{ t: 'Cada seção,' }, { t: 'uma decisão.', chave: true }], quebra: 1 },
    { a: 8.9, b: 10.8, partes: [{ t: '+30 anos', chave: true }, { t: 'de mercado segurador.' }], quebra: 1 },
    { a: 11.15, b: 12.8, partes: [{ t: 'Uma jornada' }, { t: 'para cada perfil.', chave: true }], quebra: 1 },
    { a: 13.15, b: 15.3, partes: [{ t: 'Método em' }, { t: '4 passos.', chave: true }], quebra: 1 },
    { a: 15.65, b: 17.3, partes: [{ t: 'Empresas, famílias' }, { t: 'e riscos técnicos.', chave: true }], quebra: 1 },
    { a: 17.65, b: 19.3, partes: [{ t: 'Avaliações reais' }, { t: 'no Google.', chave: true }], quebra: 1 },
    { a: 19.65, b: 20.85, partes: [{ t: 'Um clique' }, { t: 'até o WhatsApp.', chave: true }], quebra: 1 },
  ];

  // primeira frase (em aprovação): linhas que sobem de dentro de uma máscara
  const ABERTURA = [['Versão desktop:', '#002140'], ['tudo a um clique.', '#f50953']];

  // elementos que saltam em cascata em cada capítulo: [arquivo, cx, cy, s, rz, t0, saída]
  const SALTOS = [
    ['sol-empresas', 330, 1200, 0.74, -3, 11.5, 12.85], ['sol-familia', 750, 1300, 0.74, 3, 12.0, 12.9],
    ...[0, 1, 2, 3].map((i) => ['passo-' + (i + 1), 174 + i * 236, 1200 + [0, 40, 0, 60][i], 0.72, 0, 13.5 + i * 0.5, 15.35 + i * 0.04]),
    ...[0, 1, 2].map((i) => ['area-' + (i + 1), 209 + i * 318, 1180 + (i === 2 ? 17 : 0), 0.7, 0, 16.0 + i * 0.5, 17.35 + i * 0.04]),
    ...[0, 1, 2, 3].map((i) => ['rev-' + (i + 1), [372, 708][i % 2], [1100, 1325][i >> 1], 0.95, i % 2 ? 1.5 : -1.5, 18.0 + i * 0.25, 19.35 + i * 0.04]),
  ];
  const PILULAS = ['Conhecimento técnico', 'Atendimento consultivo', 'Relacionamento de longo prazo'];
  const BOTAO = { x: 540 + (266 - 720) * 0.72, y: 770 + (426 - 267) * 0.72 };   // "Solicitar uma análise" no foco
  const CURSOR = [[19.5, 900, 1560], [20.5, BOTAO.x, BOTAO.y, true], [21.2, BOTAO.x + 60, BOTAO.y + 120]];

  let luz, chaoLuz, abre, reflexo, cena, sombra, mac, tampa, apaga, camadas, saltos, pilulas, titulos, cur, assin;

  const face = (pai, css) => Z.div(pai, Object.assign({ backfaceVisibility: 'hidden' }, css));

  Z.plano({
    id: 'desktop', inicio: 0, fim: 24,
    montar(el) {
      // fundo: degradê cinza com profundidade (luz suave no alto, chão mais denso, vinheta fria nas bordas)
      Z.div(el, { inset: '0px', background: 'linear-gradient(180deg, #f7f7f5 0%, #eeeeec 38%, #e2e2e4 72%, #d3d4d8 100%)' });
      luz = Z.div(el, { left: '-260px', top: '-520px', width: '1600px', height: '1600px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(255,255,255,.95), rgba(255,255,255,.55) 45%, rgba(255,255,255,0))' });
      chaoLuz = Z.div(el, { left: '-200px', top: '1180px', width: '1480px', height: '900px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(255,255,255,.55), rgba(255,255,255,0))' });
      Z.div(el, { inset: '0px', background: 'radial-gradient(140% 95% at 50% 38%, rgba(0,0,0,0) 55%, rgba(18,26,40,.13) 100%)' });
      cena = Z.div(el, { inset: '0px', transformOrigin: '50% 50%' });
      sombra = Z.div(cena, { left: '0px', top: '0px', width: '1000px', height: '120px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,20,40,.28), rgba(0,20,40,0))' });

      // ---- MacBook ----
      mac = Z.div(cena, { left: '0px', top: '0px', width: '0px', height: '0px', transformStyle: 'preserve-3d', zIndex: 5 });
      const base = Z.div(mac, { left: -LW / 2 + 'px', top: '0px', width: LW + 'px', height: BD + 'px', transformOrigin: '50% 0%',
        transform: 'rotateX(90deg)', borderRadius: '0 0 26px 26px', background: 'linear-gradient(180deg, #34353a 0%, #2a2b2f 100%)' });
      Z.div(base, { left: '96px', top: '40px', width: LW - 192 + 'px', height: '300px', borderRadius: '10px', background: '#0d0d0f',
        backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 50px, #2a2b2f 50px 54px), repeating-linear-gradient(0deg, transparent 0 46px, #2a2b2f 46px 50px)' });
      [24, LW - 72].forEach((x) => Z.div(base, { left: x + 'px', top: '40px', width: '48px', height: '300px',
        backgroundImage: 'radial-gradient(circle, #121214 1.2px, transparent 1.6px)', backgroundSize: '7px 7px' }));
      Z.div(base, { left: (LW - 440) / 2 + 'px', top: '380px', width: '440px', height: '270px', borderRadius: '14px',
        background: '#303136', boxShadow: 'inset 0 0 0 1.5px #3d3e44' });
      Z.div(mac, { left: -LW / 2 + 'px', top: '0px', width: LW + 'px', height: '18px', borderRadius: '0 0 14px 14px',
        background: 'linear-gradient(180deg, #45464c, #1f2023)', transform: `translateZ(${BD}px)` });
      tampa = Z.div(mac, { left: -LW / 2 + 'px', top: -LH - 4 + 'px', width: LW + 'px', height: LH + 'px', transformStyle: 'preserve-3d', transformOrigin: '50% 100%' });
      face(tampa, { inset: '0px', borderRadius: '26px 26px 6px 6px', transform: 'rotateY(180deg)', background: 'linear-gradient(160deg, #3b3c41 0%, #2b2c30 60%, #232427 100%)' });
      const frente = face(tampa, { inset: '0px', borderRadius: '26px 26px 6px 6px', background: '#0a0a0b', boxShadow: 'inset 0 0 0 2px #3a3b40' });
      const tela = Z.div(frente, { left: SX + 'px', top: SY + 'px', width: SW + 'px', height: SH + 'px', overflow: 'hidden', borderRadius: '10px', background: '#132446' });
      Z.img(tela, 'camada-0-hero', { position: 'absolute', left: '0px', top: BARRA + 'px', width: SW + 'px' });
      Z.img(tela, 'camada-1-sobre', { position: 'absolute', left: '0px', top: BARRA + 900 * PS + 'px', width: SW + 'px' });
      const menu = Z.div(tela, { left: '0px', top: '0px', width: SW + 'px', height: '26px', background: '#0f0f10' });
      menu.innerHTML = `<div style="position:absolute;left:18px;top:5px;font:600 13px Switzer,sans-serif;color:#e8e8ea">Safari&nbsp;&nbsp;&nbsp;Arquivo&nbsp;&nbsp;&nbsp;Editar&nbsp;&nbsp;&nbsp;Visualizar</div>
        <div style="position:absolute;right:18px;top:5px;font:600 13px Switzer,sans-serif;color:#e8e8ea">qua 9:41</div>`;
      const nav = Z.div(tela, { left: '0px', top: '26px', width: SW + 'px', height: '38px', background: '#1d1d1f', borderBottom: '1px solid #000' });
      nav.innerHTML = `<div style="position:absolute;left:16px;top:13px;display:flex;gap:8px">${['#ff5f57', '#febc2e', '#28c840'].map((c) => `<i style="display:block;width:12px;height:12px;border-radius:50%;background:${c}"></i>`).join('')}</div>
        <div style="position:absolute;left:${SW / 2 - 170}px;top:7px;width:340px;height:24px;border-radius:7px;background:#2c2c2e;font:500 13px/24px Switzer,sans-serif;color:#d0d0d4;text-align:center">nexaperformanceseguros.com.br</div>`;
      Z.div(frente, { left: (LW - 170) / 2 + 'px', top: '0px', width: '170px', height: SY + 26 + 'px', borderRadius: '0 0 14px 14px', background: '#0a0a0b' });
      reflexo = Z.div(frente, { left: SX + 'px', top: SY + 'px', width: SW + 'px', height: SH + 'px', overflow: 'hidden', borderRadius: '10px', zIndex: 3 });
      reflexo.faixa = Z.div(reflexo, { left: '0px', top: '-300px', width: '260px', height: '1300px',
        background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.22), rgba(255,255,255,0))' });
      apaga = Z.div(frente, { left: SX + 'px', top: SY + 'px', width: SW + 'px', height: SH + 'px', borderRadius: '10px', background: '#050506' });

      // ---- camadas ----
      camadas = CAMADAS.map(([n, h], k) => {
        const c = Z.div(cena, { left: '0px', top: '0px', width: '1440px', height: h + 'px', borderRadius: '18px', overflow: 'hidden', zIndex: 30 - k,
          boxShadow: '0 40px 80px -30px rgba(0, 33, 64, .45), 0 0 0 1px rgba(0, 33, 64, .06)' });
        Z.img(c, `camada-${k}-${n}`, { width: '1440px' });
        return c;
      });
      saltos = SALTOS.map(([src]) => {
        const c = Z.div(cena, { left: '0px', top: '0px', borderRadius: '14px', overflow: 'hidden', zIndex: 60,
          boxShadow: '0 30px 60px -24px rgba(0, 33, 64, .5)' });
        const i = Z.img(c, src, {});
        return { c, i };
      });
      pilulas = PILULAS.map((txt) => {
        const p = Z.div(cena, { left: '64px', top: '0px', height: '96px', padding: '0 40px 0 34px', borderRadius: '48px', background: '#fff', zIndex: 60,
          display: 'flex', alignItems: 'center', gap: '22px', font: '700 40px Switzer, sans-serif', color: NAVY, whiteSpace: 'nowrap',
          boxShadow: '0 24px 50px -24px rgba(0, 33, 64, .45)', transformOrigin: '0% 50%' });
        p.innerHTML = `<i style="display:block;width:18px;height:18px;border-radius:50%;background:${ROSA}"></i>${txt}`;
        return p;
      });

      titulos = TITULOS.map((d) => {
        const L = Z.legenda(cena, d.partes, { x: 64, y: 230, tam: 88, largura: 950, cor: NAVY, corChave: ROSA, quebra: d.quebra });
        L.box.style.zIndex = 80; L.box.style.letterSpacing = '-2px';
        L.palavras.forEach((s) => { s.style.fontWeight = '800'; s.style.fontStyle = 'normal'; });
        return L;
      });
      abre = Z.div(cena, { left: '64px', top: '214px', width: '960px', zIndex: 80 });
      abre.over = Z.div(abre, { position: 'relative', overflow: 'hidden', height: '40px', marginBottom: '14px' });
      abre.over.in = Z.div(abre.over, { position: 'relative', font: '700 28px Switzer, sans-serif', letterSpacing: '7px', color: NAVY, opacity: 0.55 });
      abre.over.in.textContent = 'NEXA PERFORMANCE';
      abre.linhas = ABERTURA.map(([txt, cor]) => {
        const m = Z.div(abre, { position: 'relative', overflow: 'hidden', height: '102px' });
        m.in = Z.div(m, { position: 'relative', font: '800 92px/1.08 Switzer, sans-serif', letterSpacing: '-2.5px', color: cor, whiteSpace: 'nowrap' });
        m.in.textContent = txt;
        return m;
      });
      cur = Z.cursor(cena);
      cur.c.style.zIndex = 90;

      assin = Z.div(cena, { left: '64px', top: '250px', width: '900px', zIndex: 80 });
      assin.logo = Z.img(assin, 'assets/logo-navy.png', { width: '330px' });
      assin.l1 = Z.div(assin, { position: 'relative', marginTop: '34px', font: '800 64px/1.05 Switzer, sans-serif', color: NAVY, letterSpacing: '-1.5px' });
      assin.l1.textContent = 'Site por Zinga Digital.';
      assin.l2 = Z.div(assin, { position: 'relative', marginTop: '16px', font: '700 34px Switzer, sans-serif', color: ROSA });
      assin.l2.textContent = 'nexaperformanceseguros.com.br';
    },

    seek(t) {
      const trocas = [1.5, 3.0, 6.0, 9.0, 11.0, 13.0, 15.5, 17.5, 19.5, 21.0, 22.0, 23.5];
      let kick = 0; for (const c of trocas) kick += M.kick(t, c, 0.012, 2.4, 0.5);
      cena.style.transform = `scale(${(1 + 0.018 * Math.sin(t * 0.3) + kick).toFixed(4)})`;

      // MacBook
      const P = pose(t);
      mac.style.transform = `translate(${P.cx.toFixed(2)}px, ${P.cy.toFixed(2)}px) perspective(3200px) rotateX(${P.rx.toFixed(3)}deg) ` +
        `rotateY(${P.ry.toFixed(3)}deg) scale(${P.S.toFixed(4)})`;
      tampa.style.transform = `rotateX(${P.tampa.toFixed(3)}deg)`;
      apaga.style.opacity = (1 - E.suave(M.prog(t, 1.1, 1.6))) + (t >= 23.0 ? M.prog(t, 23.0, 23.3) : 0);
      const chao = P.cy + (BD * 0.42 + 30) * P.S * Math.sin(-P.rx * Math.PI / 180 + 0.0001) + 26 * P.S;
      sombra.style.transform = `translate(${(P.cx - 500).toFixed(1)}px, ${(chao - 40).toFixed(1)}px) scale(${(P.S * 1.05).toFixed(3)}, ${(0.6 + Math.abs(P.rx) / 30).toFixed(3)})`;
      sombra.style.opacity = (1 - M.clamp((P.cy - 1450) / 500)).toFixed(3);

      // camadas
      camadas.forEach((c, k) => {
        Z.mostra(c, t >= 6.0 && t < 21.62, 'block');
        poeCamada(c, CAMADAS[k][1], estadoCamada(k, t));
        const foco = CAP[k] && t >= CAP[k][0] && t < CAP[k][1] + 0.3;
        c.style.zIndex = foco ? 50 : 30 - k;
      });

      // saltos em cascata
      SALTOS.forEach(([, cx, cy, s, rz, t0, sai], i) => {
        const { c, i: img } = saltos[i];
        const w = img.naturalWidth, h = img.naturalHeight;
        c.style.width = w + 'px'; c.style.height = h + 'px';
        const p = M.spring(t - t0, 2.0, 0.66), q = E.vSai(M.prog(t, sai, sai + 0.35));
        Z.mostra(c, t >= t0 && q < 1, 'block');
        poeCamada(c, h, { cx, cy: cy + 260 * (1 - p) + 900 * q, s: s * (0.85 + 0.15 * p), rx: -38 * (1 - p), rz: rz * p }, w);
      });
      pilulas.forEach((p, i) => {
        const t0 = 9.5 + i * 0.5, e = M.spring(t - t0, 2.0, 0.66), q = E.vSai(M.prog(t, 10.85 + i * 0.05, 11.2 + i * 0.05));
        Z.mostra(p, t >= t0 && q < 1, 'flex');
        p.style.top = 1060 + i * 128 + 'px';
        p.style.transform = `translate(${(-500 * (1 - e) - 1100 * q).toFixed(1)}px, 0px) scale(${(0.9 + 0.1 * e).toFixed(4)})`;
      });

      // títulos
      TITULOS.forEach((d, i) => Z.legendaSeek(titulos[i], t, d.a, d.b, { passo: 0.06, dur: 0.28 }));
      [abre.over, ...abre.linhas].forEach((m, i) => {
        const e = E.v(M.prog(t, 1.25 + i * 0.14, 1.95 + i * 0.14)), q = E.vSai(M.prog(t, 2.6 + i * 0.06, 3.0 + i * 0.06));
        Z.mostra(abre, t >= 1.2 && t < 3.2, 'block');
        m.in.style.transform = `translateY(${((1 - e) * 110 - q * 110).toFixed(2)}%)`;
      });
      luz.style.transform = `translate(${(120 * Math.sin(t * 0.21) - 60 * M.E.suave(M.prog(t, 0, 3))).toFixed(1)}px, ${(40 * Math.cos(t * 0.17)).toFixed(1)}px)`;
      chaoLuz.style.transform = `translate(${(-90 * Math.sin(t * 0.19)).toFixed(1)}px, 0px)`;
      const rf = E.suave(M.prog(t, 1.15, 2.1));
      Z.mostra(reflexo, rf > 0 && rf < 1, 'block');
      reflexo.faixa.style.transform = `translateX(${(-300 + 1500 * rf).toFixed(1)}px) rotate(18deg)`;

      // cursor no CTA
      Z.mostra(cur.c, t >= 19.6 && t < 21.1, 'block');
      if (t >= 19.6 && t < 21.1) Z.cursorSeek(cur, t, CURSOR);
      else Z.mostra(cur.anel, false);

      // assinatura
      [assin.logo, assin.l1, assin.l2].forEach((e, i) => {
        const p = M.spring(t - 22.1 - i * 0.12, 2.0, 0.66), q = E.vSai(M.prog(t, 23.0 + i * 0.05, 23.35 + i * 0.05));
        e.style.visibility = t >= 22.1 + i * 0.12 && q < 1 ? 'visible' : 'hidden';
        e.style.transform = `translateY(${((1 - p) * 120 - q * 700).toFixed(1)}px)`;
        e.style.clipPath = i === 0 ? `inset(0 ${(100 - 100 * E.v(M.prog(t, 22.1, 22.5))).toFixed(1)}% 0 0)` : 'none';
      });
    },

    som(S) {
      S.swoosh(0.0, 1.2, 0.12, true);
      S.click(1.5, 0.16); S.impact(1.5, 0.28);
      S.chord(1.5, [523.25, 659.25, 783.99], 1.4, 0.045);
      S.swoosh(3.0, 0.6, 0.18, true);
      S.riser(5.0, 6.0, 0.14);
      S.swoosh(6.0, 0.5, 0.24, true);
      for (let k = 0; k < 7; k++) S.tick(6.0 + k * 0.25, 0.07, 2600 + k * 180);
      S.swoosh(8.5, 0.3, 0.14, false); S.pop(9.0, 560, 0.16);
      [9.5, 10.0, 10.5].forEach((t, i) => S.pluck(t, [784, 880, 988][i], 0.12));
      S.pop(11.5, 620, 0.22, -0.5); S.pop(12.0, 820, 0.22, 0.5);
      [13.5, 14.0, 14.5, 15.0].forEach((t, i) => S.pluck(t, [523, 659, 784, 1047][i], 0.13));
      [16.0, 16.5, 17.0].forEach((t, i) => S.pop(t, 700 + i * 160, 0.18));
      [18.0, 18.25, 18.5, 18.75].forEach((t, i) => S.tick(t, 0.06, 3000 + i * 200));
      S.ding(19.0, 1568, 0.08);
      S.click(20.5, 0.2);
      S.swoosh(21.0, 0.5, 0.22, false);
      S.impact(22.0, 0.5);
      S.click(23.5, 0.16); S.impact(23.5, 0.25);
    },
  });
})();
