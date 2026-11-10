// Nexa Performance · portfólio Zinga (20 s, 9:16, 120 BPM).
// Um iPhone 17 que nunca sai de cena: entra com curva 100/60, gira entre os atos e solta, em cascata,
// os pedaços reais do site (cards de solução, 4 passos, avaliações do Google). Tudo é função de t.
(() => {
  const E = M.E;
  E.v = M.ae(0.6, 1.0);                 // velocity 100/60: chegada 100%, saída 60% -> dispara e freia longo
  E.vSai = M.ae(1.0, 0.6);              // espelho para saídas: sai devagar e acelera até sumir
  const ROSA = '#f50953', NAVY = '#002140', CARD = '#052b4f', MUTED = '#a8bcd2';
  const SITE_NAVY = '#132446';

  // ---------------- iPhone 17 ----------------
  const PW = 560, PH = 1172, RAIO = 96, BORDA = 6, BEZEL = 12;
  const SW = PW - 2 * (BORDA + BEZEL);          // largura da tela (524)
  const SH = PH - 2 * (BORDA + BEZEL);
  const K = SW / 360;                            // captura mobile tem 360 px de largura
  const BARRA = 70;                              // barra de status
  const VIS = (SH - BARRA) / K;                  // altura visível do site em px de captura
  const SITE_H = 6366, MAX_SCROLL = SITE_H - VIS;
  const CX = 540, CY = 1190;                     // centro do celular em repouso

  // cada pose: [início, duração, { x, y, s, rx, ry, rz }] (x, y = deslocamento do centro)
  const POSES = [
    [0, 0, { x: 40, y: 760, s: 0.86, rx: 46, ry: -26, rz: -12 }],
    [0, 1.0, { x: 0, y: 0, s: 1, rx: 7, ry: -14, rz: -3 }],
    [2.5, 0.55, { x: 215, y: 30, s: 0.9, rx: 5, ry: -24, rz: 2 }],
    [5.0, 0.55, { x: -215, y: 20, s: 0.9, rx: 6, ry: 22, rz: -2 }],
    [8.0, 0.55, { x: 330, y: 120, s: 0.74, rx: 8, ry: -30, rz: 3 }],
    [12.5, 0.55, { x: 200, y: 40, s: 0.9, rx: 4, ry: -18, rz: 1 }],
    [15.5, 0.55, { x: 0, y: -10, s: 1.04, rx: 3, ry: 8, rz: -1 }],
    [18.0, 0.55, { x: 270, y: 240, s: 0.62, rx: 10, ry: -26, rz: 4 }],
    [19.25, 0.6, { x: 330, y: -1500, s: 0.6, rx: -30, ry: -40, rz: 14 }, E.vSai],
  ];
  const pose = (t) => {
    const cur = { ...POSES[0][2] };
    for (let i = 1; i < POSES.length; i++) {
      const [t0, d, alvo, ease = E.v] = POSES[i];
      if (t < t0) break;
      const p = ease(M.prog(t, t0, t0 + d));
      for (const k of Object.keys(alvo)) cur[k] = M.lerp(cur[k], alvo[k], p);
    }
    // respiração: o celular nunca para
    cur.ry += M.wiggle(t, 0.35, 2.2, 3); cur.rx += M.wiggle(t, 0.3, 1.4, 5); cur.y += M.wiggle(t, 0.4, 8, 7);
    return cur;
  };
  // rolagem do site dentro da tela: [início, duração, scrollY]
  const ROLA = [
    [0, 0, 0], [4.0, 0.5, 1090], [5.25, 0.55, 1560], [8.0, 0.5, 2420], [9.5, 0.45, 2830], [10.5, 0.45, 3360],
    [11.5, 0.45, 3880], [12.5, 0.6, MAX_SCROLL], [15.5, 0.6, 0],
  ];
  const rola = (t) => {
    let y = ROLA[0][2];
    for (let i = 1; i < ROLA.length; i++) {
      const [t0, d, alvo] = ROLA[i];
      if (t < t0) break;
      y = M.lerp(y, alvo, E.v(M.prog(t, t0, t0 + d)));
    }
    return y;
  };

  const tr3 = (el, o) => {
    el.style.transform = `translate(${(o.x || 0).toFixed(2)}px, ${(o.y || 0).toFixed(2)}px) perspective(2200px) ` +
      `rotateX(${(o.rx || 0).toFixed(3)}deg) rotateY(${(o.ry || 0).toFixed(3)}deg) rotateZ(${(o.rz || 0).toFixed(3)}deg) scale(${(o.s ?? 1).toFixed(4)})`;
  };

  // ---------------- textos (só o que está no site) ----------------
  const TITULOS = [
    { a: 0.55, b: 2.25, partes: [{ t: 'Novo site da' }, { t: 'Nexa Performance.', chave: true }], quebra: 2, over: 'PORTFÓLIO ZINGA DIGITAL' },
    { a: 2.65, b: 4.75, partes: [{ t: 'Diferenciais' }, { t: 'na primeira dobra.', chave: true }], quebra: 0 },
    { a: 5.15, b: 7.75, partes: [{ t: 'Uma jornada' }, { t: 'para cada perfil.', chave: true }], quebra: 1 },
    { a: 8.15, b: 12.25, partes: [{ t: 'Método em' }, { t: '4 passos.', chave: true }], quebra: 1 },
    { a: 12.65, b: 15.25, partes: [{ t: 'Prova social' }, { t: 'direto do Google.', chave: true }], quebra: 1 },
    { a: 15.65, b: 17.6, partes: [{ t: 'Um toque' }, { t: 'até o WhatsApp.', chave: true }], quebra: 1 },
  ];
  const CHIPS = [
    ['Consultoria', 'especializada em seguros'],
    ['+30 anos', 'de experiência no mercado'],
    ['Orçamento', 'direto no WhatsApp'],
  ];

  let cena, fundo, blooms, sombra, fone, borraFone, tela, site, toque, chat, titulos, chips, sols, passos, revs, assin;

  const card = (pai, src, w, raio = 16) => {
    const c = Z.div(pai, { left: '0px', top: '0px', width: w + 'px', transformOrigin: '0 0', borderRadius: raio + 'px',
      overflow: 'hidden', boxShadow: '0 30px 60px -18px rgba(0, 6, 13, .8)' });
    Z.img(c, src, { width: w + 'px' });
    return c;
  };

  Z.plano({
    id: 'nexa', inicio: 0, fim: 20,
    montar(el) {
      // fundo Zinga: degradê navy + dois blooms azul (luz de fundo é glow-tint, nunca rosa)
      fundo = Z.div(el, { inset: '0px', background: `linear-gradient(160deg, ${NAVY} 0%, #00152a 100%)` });
      blooms = [[-260, 80, 820, '#2478c9', 0.42], [560, 1250, 900, '#2478c9', 0.3]].map(([x, y, d, c, o]) =>
        Z.div(fundo, { left: x + 'px', top: y + 'px', width: d + 'px', height: d + 'px', borderRadius: '50%', background: c, filter: 'blur(140px)', opacity: o }));
      cena = Z.div(Z.encaixe(el), { inset: '0px', transformOrigin: '50% 55%' });

      sombra = Z.div(cena, { left: '0px', top: '0px', width: '520px', height: '90px', borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(0,4,10,.75), rgba(0,4,10,0))' });

      // ---- celular ----
      fone = Z.div(cena, { left: CX - PW / 2 + 'px', top: CY - PH / 2 + 'px', width: PW + 'px', height: PH + 'px', transformStyle: 'preserve-3d', zIndex: 5 });
      borraFone = Z.borrao(fone);
      for (let i = 1; i <= 9; i++) {           // espessura: fatias do aro de alumínio
        Z.div(fone, { inset: '0px', borderRadius: RAIO + 'px', background: i === 9 ? '#15181d' : (i % 2 ? '#3b4049' : '#32363e'), transform: `translateZ(${-i * 3.4}px)` });
      }
      [[-4, 250, 120], [-4, 400, 120], [-4, 175, 50], [PW - 2, 330, 190]].forEach(([x, y, h]) =>
        Z.div(fone, { left: x + 'px', top: y + 'px', width: '6px', height: h + 'px', borderRadius: '3px', background: '#4a505a', transform: 'translateZ(-16px)' }));
      const aro = Z.div(fone, { inset: '0px', borderRadius: RAIO + 'px',
        background: 'linear-gradient(135deg, #8a909b 0%, #2c3037 22%, #1b1e23 55%, #3a3f48 80%, #8a909b 100%)' });
      const bezel = Z.div(aro, { left: BORDA + 'px', top: BORDA + 'px', right: BORDA + 'px', bottom: BORDA + 'px', borderRadius: RAIO - BORDA + 'px', background: '#040507' });
      tela = Z.div(bezel, { left: BEZEL + 'px', top: BEZEL + 'px', width: SW + 'px', height: SH + 'px', borderRadius: RAIO - BORDA - BEZEL + 'px', overflow: 'hidden', background: SITE_NAVY });
      site = Z.img(tela, 'mobile', { position: 'absolute', left: '0px', top: BARRA + 'px', width: SW + 'px', transformOrigin: '0 0' });
      // barra de status do iOS + Dynamic Island
      const barra = Z.div(tela, { left: '0px', top: '0px', width: SW + 'px', height: BARRA + 'px', background: SITE_NAVY, zIndex: 3 });
      barra.innerHTML = `<div style="position:absolute;left:52px;top:22px;font:700 25px Switzer,sans-serif;color:#fff;letter-spacing:-.3px">9:41</div>
        <svg style="position:absolute;right:40px;top:26px" width="96" height="22" viewBox="0 0 96 22">
          <g fill="#fff"><rect x="0" y="13" width="5" height="7" rx="1.5"/><rect x="7.5" y="9" width="5" height="11" rx="1.5"/><rect x="15" y="5" width="5" height="15" rx="1.5"/><rect x="22.5" y="1" width="5" height="19" rx="1.5"/>
          <path d="M44 8.5a12 12 0 0 1 16 0l-2 2.2a9 9 0 0 0-12 0z M47.5 12.3a7 7 0 0 1 9 0L52 17z"/>
          <rect x="66" y="3" width="26" height="15" rx="4.5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/><rect x="68.5" y="5.5" width="19" height="10" rx="2.5"/><rect x="93.2" y="8" width="2" height="5" rx="1" fill-opacity=".5"/></g></svg>`;
      Z.div(tela, { left: (SW - 150) / 2 + 'px', top: '14px', width: '150px', height: '42px', borderRadius: '21px', background: '#000', zIndex: 4 });
      // reflexo do vidro (luz de superfície, não brilho de interface)
      Z.div(tela, { inset: '0px', zIndex: 6, background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 32%)' });
      // toque (dedo) e janela do WhatsApp real do site (Joinchat)
      toque = Z.div(tela, { left: '0px', top: '0px', width: '96px', height: '96px', borderRadius: '50%', zIndex: 7,
        background: 'rgba(255,255,255,.55)', border: '3px solid #fff', boxSizing: 'border-box', display: 'none' });
      chat = Z.div(tela, { left: '22px', width: SW - 44 + 'px', bottom: '36px', zIndex: 5, borderRadius: '26px', overflow: 'hidden',
        background: '#efeae2', boxShadow: '0 20px 40px rgba(0,0,0,.35)', display: 'none' });
      chat.innerHTML = `<div style="background:#075e54;color:#fff;padding:22px 26px;font:700 26px Switzer,sans-serif">WhatsApp</div>
        <div style="padding:22px 22px 10px"><div style="background:#fff;border-radius:6px 20px 20px 20px;padding:18px 22px;font:500 23px/1.35 Switzer,sans-serif;color:#111">
        Olá, boas-vindas ao <b>Nexa Performance | Consultoria em Seguros</b><br><br>Podemos ajudar você?</div></div>
        <div style="margin:14px 22px 24px;background:#25d366;color:#fff;border-radius:40px;padding:18px;text-align:center;font:700 25px Switzer,sans-serif">Abrir bate-papo</div>`;

      // ---- títulos ----
      titulos = TITULOS.map((d) => {
        const L = Z.legenda(cena, d.partes, { x: 64, y: d.over ? 290 : 250, tam: 88, largura: 900, cor: '#fff', corChave: ROSA, quebra: d.quebra });
        L.box.style.zIndex = 20; L.box.style.letterSpacing = '-1.5px';
        L.palavras.forEach((s) => { s.style.fontWeight = '800'; s.style.fontStyle = 'normal'; });
        if (d.over) {
          L.over = Z.div(cena, { left: '66px', top: '236px', font: '700 26px Switzer, sans-serif', letterSpacing: '6px', color: ROSA, zIndex: 20 });
          L.over.textContent = d.over;
        }
        return L;
      });

      // ---- chips de diferenciais (cards Zinga: aresta em degradê navy/rosa/navy) ----
      chips = CHIPS.map(([a, b], i) => {
        const c = Z.div(cena, { left: '0px', top: '0px', width: '540px', height: '150px', borderRadius: '28px', boxSizing: 'border-box', zIndex: 10,
          border: '2px solid transparent', transformOrigin: '50% 0%',
          background: `linear-gradient(150deg, ${CARD}, #031d38) padding-box, linear-gradient(45deg, ${NAVY} 0%, ${ROSA} 50%, ${NAVY} 100%) border-box`,
          boxShadow: '0 24px 60px -20px #00060dcc' });
        const n = Z.div(c, { left: '28px', top: '34px', width: '80px', height: '80px', borderRadius: '22px',
          background: `linear-gradient(150deg, ${ROSA} 0%, #b50f4e 100%)`, font: '900 38px Switzer, sans-serif', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center' });
        n.textContent = String(i + 1);
        const tx = Z.div(c, { left: '132px', top: '30px', width: '390px', font: '800 42px/1.1 Switzer, sans-serif', color: '#fff', letterSpacing: '-.5px' });
        tx.innerHTML = `${a}<div style="font:500 25px/1.3 Switzer,sans-serif;color:${MUTED};letter-spacing:0;margin-top:6px">${b}</div>`;
        return c;
      });

      // ---- cascatas com recortes reais do site ----
      sols = ['sol-empresas', 'sol-familia'].map((s) => card(cena, s, 600, 18));
      passos = [1, 2, 3, 4].map((n) => card(cena, 'passo-' + n, 305, 10));
      revs = [1, 2, 3, 4].map((n) => card(cena, 'rev-' + n, n === 4 ? 300 : 320, 12));
      [...sols, ...passos, ...revs].forEach((c) => { c.style.zIndex = 12; });

      // ---- assinatura ----
      assin = Z.div(cena, { left: '64px', top: '560px', width: '700px', zIndex: 20 });
      assin.logo = Z.img(assin, 'assets/logo-branco.png', { width: '470px' });
      assin.l1 = Z.div(assin, { position: 'relative', marginTop: '46px', font: '800 84px/1.04 Switzer, sans-serif', color: '#fff', letterSpacing: '-1px' });
      assin.l1.innerHTML = 'Mais um site<br>no ar.';
      assin.l2 = Z.div(assin, { position: 'relative', marginTop: '22px', font: '700 34px Switzer, sans-serif', color: ROSA });
      assin.l2.textContent = 'nexaperformanceseguros.com.br';
    },

    seek(t) {
      // câmera: dolly lento + impulso em cada troca de ato
      const trocas = [1.0, 2.5, 5.0, 8.0, 12.5, 15.5, 18.0];
      let kick = 0; for (const c of trocas) kick += M.kick(t, c, 0.018, 2.4, 0.5);
      const dolly = 1.0 + 0.025 * Math.sin(t * 0.32) + kick;
      cena.style.transform = `scale(${dolly.toFixed(4)}) rotate(${(M.wiggle(t, 0.25, 0.5, 11)).toFixed(3)}deg)`;
      blooms[0].style.transform = `translate(${(40 * Math.sin(t * 0.3)).toFixed(1)}px, ${(30 * Math.cos(t * 0.25)).toFixed(1)}px)`;
      blooms[1].style.transform = `translate(${(-50 * Math.sin(t * 0.22)).toFixed(1)}px, ${(-40 * Math.sin(t * 0.3)).toFixed(1)}px)`;

      // celular
      const P = pose(t);
      tr3(fone, P);
      const vy = M.vel((u) => pose(u).y, t), vx = M.vel((u) => pose(u).x, t);
      borraFone.set(Math.min(Math.abs(vx) * 0.004, 10), Math.min(Math.abs(vy) * 0.004, 14));
      const s = P.s;
      sombra.style.transform = `translate(${(CX - 260 + P.x * 0.9).toFixed(1)}px, ${(CY + PH / 2 * s + 20 + Math.max(0, P.y) * 0.2).toFixed(1)}px) scale(${(s * (1 - M.clamp(Math.abs(P.y) / 1500))).toFixed(3)}, 1)`;
      sombra.style.opacity = (1 - M.clamp(Math.abs(P.y) / 900)).toFixed(3);

      // rolagem com borrão vertical proporcional à velocidade
      const sy = rola(t), vs = M.vel(rola, t);
      site.style.transform = `translateY(${(-sy * K).toFixed(2)}px)`;
      site.style.filter = Math.abs(vs) > 400 ? `blur(${Math.min(Math.abs(vs) * 0.0012, 6).toFixed(2)}px)` : 'blur(0px)';

      // toque no "Solicitar orçamento" (16.5) e janela do WhatsApp (17.0)
      const tq = M.prog(t, 16.3, 16.9);
      Z.mostra(toque, tq > 0 && tq < 1, 'block');
      if (tq > 0 && tq < 1) {
        const bx = 165 * K, by = BARRA + 604 * K;
        const desce = E.v(M.prog(t, 16.3, 16.5)), solta = M.prog(t, 16.5, 16.9);
        const r = t < 16.5 ? 1.4 - 0.5 * desce : 0.9 + 0.9 * E.entra(solta);
        toque.style.transform = `translate(${(bx - 48).toFixed(1)}px, ${(by - 48).toFixed(1)}px) scale(${r.toFixed(3)})`;
        toque.style.opacity = t < 16.5 ? (0.4 + 0.6 * desce).toFixed(3) : (1 - solta).toFixed(3);
      }
      const ch = M.spring(t - 17.0, 2.2, 0.68);
      Z.mostra(chat, t >= 17.0 && t < 18.0, 'block');
      chat.style.transform = `translateY(${((1 - ch) * 520).toFixed(1)}px) scale(${(0.92 + 0.08 * ch).toFixed(4)})`;

      // títulos: entram palavra a palavra, saem desfocando
      TITULOS.forEach((d, i) => {
        Z.legendaSeek(titulos[i], t, d.a, d.b, { passo: 0.06, dur: 0.28 });
        if (titulos[i].over) {
          const p = E.v(M.prog(t, d.a - 0.15, d.a + 0.25)), q = E.vSai(M.prog(t, d.b, d.b + 0.25));
          titulos[i].over.style.clipPath = `inset(0 ${(100 - 100 * p).toFixed(1)}% 0 0)`;
          titulos[i].over.style.transform = `translateY(${(-30 * q).toFixed(1)}px)`;
          titulos[i].over.style.opacity = (1 - q).toFixed(3);
        }
      });

      // chips: caem em cascata (uma batida cada), saem para a esquerda em cascata
      chips.forEach((c, i) => {
        const t0 = 3.0 + i * 0.5, sai = 4.7 + i * 0.07;
        const p = M.spring(t - t0, 2.0, 0.62), q = E.vSai(M.prog(t, sai, sai + 0.4));
        Z.mostra(c, t >= t0 - 0.02 && q < 1, 'block');
        c.style.left = '64px'; c.style.top = 700 + i * 178 + 'px';
        tr3(c, { x: -640 * (1 - p) - 900 * q, y: 0, ry: -55 * (1 - p), rz: (i - 1) * 0.6, s: 1 });
      });

      // cards de solução: saltam de dentro da tela do celular para a direita
      sols.forEach((c, i) => {
        const t0 = 6.0 + i * 0.5, p = M.spring(t - t0, 1.9, 0.66), q = E.vSai(M.prog(t, 7.75 + i * 0.07, 8.15 + i * 0.07));
        Z.mostra(c, t >= t0 && q < 1, 'block');
        const de = { x: CX - 215 - 150, y: CY - 200 + i * 120, s: 0.35, ry: 40, rz: 0 };
        const para = { x: 372 - i * 24, y: 620 + i * 370, s: 0.94, ry: -10, rz: i ? 3 : -3 };
        tr3(c, { x: M.lerp(de.x, para.x, p) + 900 * q, y: M.lerp(de.y, para.y, p), s: M.lerp(de.s, para.s, p),
          ry: M.lerp(de.ry, para.ry, p), rz: M.lerp(de.rz, para.rz, p), rx: 4 });
      });

      // 4 passos: cada um cai grande (legível) e, na batida seguinte, encaixa na fileira em degraus
      passos.forEach((c, i) => {
        const t0 = 8.5 + i, tFila = i < 3 ? t0 + 1 : 12.0;
        const p = M.spring(t - t0, 2.0, 0.64), f = E.v(M.prog(t, tFila, tFila + 0.5));
        const q = E.vSai(M.prog(t, 12.3 + i * 0.05, 12.65 + i * 0.05));
        Z.mostra(c, t >= t0 && q < 1, 'block');
        const grande = { x: M.lerp(CX + 200, 64, p), y: M.lerp(980, 530, p), s: M.lerp(0.45, 1.5, p), rx: 0 };
        const giro = 38 * (1 - p);
        const fila = { x: 64 + i * 214, y: 1215 + [0, 46, 0, 70][i], s: 0.64, rx: 0 };
        tr3(c, { x: M.lerp(grande.x, fila.x, f), y: M.lerp(grande.y, fila.y, f) + 1100 * q, s: M.lerp(grande.s, fila.s, f),
          rx: M.lerp(grande.rx, fila.rx, f), ry: giro, rz: (i % 2 ? 1.5 : -1.5) * f });
        c.style.zIndex = 12 + (t < tFila ? 10 : i);
      });

      // avaliações do Google: saem do celular e empilham em cascata à esquerda
      revs.forEach((c, i) => {
        const t0 = 13.0 + i * 0.5, p = M.spring(t - t0, 2.0, 0.64), q = E.vSai(M.prog(t, 15.3 + i * 0.05, 15.65 + i * 0.05));
        Z.mostra(c, t >= t0 && q < 1, 'block');
        const de = { x: CX + 200 - 120, y: 900, s: 0.4 };
        const para = { x: 64, y: 560 + i * 215, s: 1.42 };
        tr3(c, { x: M.lerp(de.x, para.x, p) - 900 * q, y: M.lerp(de.y, para.y, p), s: M.lerp(de.s, para.s, p),
          ry: 30 * (1 - p), rz: (i % 2 ? 2 : -2) * p });
      });

      // assinatura
      const la = 0, sai = E.vSai(M.prog(t, 19.35, 19.8));
      Z.mostra(assin, t >= 18.0 && sai < 1, 'block');
      [assin.logo, assin.l1, assin.l2].forEach((e, i) => {
        const p = M.spring(t - 18.0 - i * 0.12, 2.0, 0.66), q = E.vSai(M.prog(t, 19.35 + i * 0.06, 19.8 + i * 0.06));
        e.style.transform = `translateY(${((1 - p) * 140 - q * 900).toFixed(1)}px)`;
        e.style.opacity = Math.min(1, p * 2.5).toFixed(3);
        e.style.clipPath = i === 0 ? `inset(0 ${(100 - 100 * E.v(M.prog(t, 18.0, 18.4))).toFixed(1)}% 0 0)` : 'none';
      });
      void la; void sai;
    },

    som(S) {
      S.swoosh(0.0, 0.9, 0.3, true);
      S.impact(1.0, 0.75);
      for (const t of [2.5, 5.0, 8.0, 12.5, 15.5, 18.0]) S.swoosh(t, 0.35, 0.22, true);
      [3.0, 3.5, 4.0].forEach((t, i) => { S.pop(t, 700 + i * 180, 0.22); S.tick(t, 0.05); });
      [6.0, 6.5].forEach((t, i) => { S.pop(t, 620 + i * 200, 0.24); S.swoosh(t, 0.25, 0.12, false); });
      [8.5, 9.5, 10.5, 11.5].forEach((t, i) => { S.pop(t, 600 + i * 150, 0.24); S.tick(t + 0.5 * (i < 3), 0.05); });
      [13.0, 13.5, 14.0, 14.5].forEach((t, i) => S.pop(t, 760 + i * 160, 0.2));
      S.zip(15.5, 0.3, 0.08, true);
      S.click(16.5, 0.2);
      S.ding(17.0, 1568, 0.12);
      S.riser(17.0, 18.0, 0.16);
      S.impact(18.0, 0.6);
      S.swoosh(19.0, 0.5, 0.2, false);
    },
  });
})();
