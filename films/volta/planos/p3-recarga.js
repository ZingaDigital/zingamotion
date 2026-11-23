// P3 · Recarga · 6,0 a 10,0 s (b12 a b20), navy. A bateria do filme das férias, em 2%. O plugue encaixa na base da
// lâmpada em b13 e a carga sobe em degraus na batida: 35 (b14), 70 (b15), 100% (b16) — o inverso da descarga.
// O vidro acende junto; em 100% o filamento fica rosa. Segura até b20 pra leitura.
(() => {
  const B = (n) => Z.b(n);
  const NIVEIS = [[B(12), 0.02], [B(14), 0.35], [B(15), 0.7], [B(16), 1]];
  const PLUGA = B(13);
  const BX = 72, BY = 720, BW = 640, BH = 300, BB = 14;
  const LX = 760, LY = 1150, LT = 230;
  const BASE = { x: LX + (100 + 20) * LT / 240, y: LY + (262 + 20) * LT / 240 };     // ponta da rosca da lâmpada
  const TERM = { x: BX + BW + 34, y: BY + BH / 2 };
  let bat, polo, fill, num, pct, rot, lamp, cabo, faisca, rab;

  const nivelEm = (t) => {
    let v = NIVEIS[0][1];
    NIVEIS.forEach(([tn, alvo], i) => { if (i && t >= tn) v = M.lerp(NIVEIS[i - 1][1], alvo, M.clamp(M.spring(t - tn, 3.4, 0.5), 0, 1.06)); });
    return v;
  };

  Z.plano({
    id: 'p3', inicio: B(12), fim: B(20), z: 3,
    montar(el) {
      rab = T.rabiscos(el, [{ f: 'estrela', x: 960, y: 330, s: 0.6 }, { f: 'espiral', x: 120, y: 1600, s: 0.6 }, { f: 'onda', x: 520, y: 1750, s: 1 }],
        { cor: '#ffffff', op: 0.22, semente: 81 });
      num = Z.div(el, { left: '62px', top: '380px', fontSize: '250px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' });
      num.innerHTML = '<span></span><span style="font-size:120px;font-weight:600;color:#f50953">%</span>';
      pct = num.firstChild;
      num.classList.add('legenda');
      rot = G.texto(el, [['Bateria ', ['criativa', { cor: G.COR.rosa }]]], { x: 72, y: 1066, tam: 64, peso: 600 });
      rot.box.classList.add('legenda');
      bat = Z.div(el, { left: BX + 'px', top: BY + 'px', width: BW + 'px', height: BH + 'px', boxSizing: 'border-box', border: `${BB}px solid #fff`, borderRadius: '54px' });
      polo = Z.div(el, { left: (BX + BW + 4) + 'px', top: (BY + BH / 2 - 56) + 'px', width: '38px', height: '112px', background: '#fff', borderRadius: '0 22px 22px 0' });
      fill = Z.div(bat, { left: '20px', top: '20px', bottom: '20px', background: G.COR.rosa, borderRadius: '26px' });
      cabo = T.cabo(el);
      faisca = T.rabiscos(el, [{ f: 'sol', x: BASE.x, y: BASE.y + 40, s: 0.9 }], { cor: G.COR.rosa, op: 1, larg: 7, semente: 3 });
      lamp = T.lampada(el, { x: LX, y: LY, tam: LT });
    },
    seek(t, el) {
      rab.seek(t); faisca.seek(t);
      let sh = 0;
      for (const [tn] of NIVEIS.slice(1)) sh += M.kick(t, tn, 12, 5, 0.32);
      el.style.transform = `translate(0px, ${(-sh).toFixed(2)}px) scale(${(1 + 0.01 * Math.sin(t * 1.7)).toFixed(4)})`;
      // exportação em fundo branco: o contorno branco da bateria sumiria, então vira navy
      if (new URLSearchParams(location.search).get('limpo') === 'branco') { bat.style.borderColor = G.COR.navy; polo.style.background = G.COR.navy; }
      const nv = M.clamp(nivelEm(t), 0, 1);   // a mola não passa de 100% (nem no número nem na barra)
      fill.style.width = Math.max(8, (BW - 2 * BB - 40) * nv).toFixed(1) + 'px';
      pct.textContent = String(Math.max(2, Math.round(nv * 100)));
      const nasce = G.entra(t, B(12), { dur: 0.4, s0: 0.5, dist: 0, blur: 8, mola: 2.6 });
      G.poe(bat, nasce); G.poe(polo, nasce);
      G.poe(num, G.soma(G.entra(t, B(12) + 0.05, { de: 'baixo', dist: 80 }), { s: 1 + M.kick(t, B(16), 0.08, 3, 0.4) }));
      num.style.transformOrigin = '0% 80%';
      G.palavrasSeek(rot, t, B(12.5));

      // plugue: largado no chão; em b13 voa e encaixa na base da lâmpada
      const pp = M.clamp(M.spring(t - (PLUGA - 0.2), 3, 0.62), 0, 1.04);
      const chao = { x: 560, y: 1640 }, alvo = { x: BASE.x, y: BASE.y + 44 };
      const px = M.lerp(chao.x, alvo.x, pp), py = M.lerp(chao.y, alvo.y, pp) - Math.sin(Math.PI * M.clamp(pp)) * 160;
      const ang = M.lerp(10, -90, M.clamp(pp));
      const d = `M${TERM.x} ${TERM.y} C${TERM.x + 150} ${TERM.y + 60}, ${px - 260} ${py + 260}, ${px} ${py + (pp > 0.5 ? 30 : 0)}`;
      cabo.seek(d, px, py, ang);
      cabo.svg.style.opacity = M.prog(t, B(12) + 0.1, B(12) + 0.35).toFixed(3);   // nasce junto com a bateria e a lâmpada
      faisca.svg.style.display = t >= PLUGA && t < PLUGA + 0.25 ? '' : 'none';

      // lâmpada: acordada; acende com a carga; em 100% fica feliz e comemora
      const cheia = t >= B(16);
      G.poe(lamp.el, G.soma(G.entra(t, B(12) + 0.1, { dur: 0.4, de: 'dir', dist: 300, blur: 4, mola: 2.8 }),
        { y: -Math.abs(M.kick(t, B(16), 70, 3, 0.45)), s: 1 + 0.03 * Math.sin(t * 6) * (cheia ? 1 : 0) }));
      const festa = cheia ? 150 + 12 * Math.sin(t * 8) : 25;
      lamp.seek({ humor: cheia ? 'feliz' : 'acordada', oculos: 0, luz: M.lerp(0.25, 1, nv), bracoE: [festa, 20], bracoD: [festa, 20] });
    },
    som(S) {
      S.click(PLUGA, 0.32);
      S.zip(PLUGA, 0.08, 0.06, true);
      NIVEIS.slice(1).forEach(([tn], i) => { S.zip(tn, 0.14, 0.1, true); S.osc({ t: tn, tipo: 'triangle', f0: 220 + i * 110, f1: 440 + i * 220, glide: 0.12, dur: 0.25, ganho: 0.25 }); });
      S.ding(B(16), 2093, 0.14); S.ding(B(16), 1568, 0.08);
    },
  });
})();
