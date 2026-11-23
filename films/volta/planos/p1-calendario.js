// P1 · Gancho · 0,0 a 3,15 s (b0 a b6). Bolinha de papel treme na batida e DESAMASSA (o inverso do amasso das férias)
// numa folha de calendário de janeiro de 2027. Dias 1 a 3 riscados a lápis (férias), o 4 ganha um círculo rosa
// desenhado na batida. A câmera mergulha no círculo e o rosa toma a tela (íris) pro P2.
(() => {
  const B = (n) => Z.b(n);
  const FX = 110, FY = 420, FW = 860, FH = 1000;
  const COL0 = 60, COLW = 740 / 7, LIN0 = 262, LINH = 116;
  // 1º de janeiro de 2027 é sexta (coluna 5, semana começando no domingo)
  const pos = (dia) => { const k = dia - 1 + 5; return { x: COL0 + (k % 7) * COLW + COLW / 2, y: LIN0 + Math.floor(k / 7) * LINH + LINH / 2 }; };
  const ABRE = B(1), RISCOS = [B(2), B(2.5), B(3)], CIRCULO = B(3.5), IRIS = B(5.75);
  const C4 = pos(4), C4T = { x: FX + C4.x, y: FY + C4.y };
  let bola, folha, desam, xs = [], circ, circLen, eco, rab, disco;

  Z.plano({
    id: 'p1', inicio: 0, fim: B(6.4), loopDe: G.FECHA,
    montar(el) {
      eco = T.eco(el, '2027', { x: 20, y: 1560, tam: 430, cor: G.COR.navy, op: 0.13, copias: 4, passo: -0.19 });
      rab = T.rabiscos(el, [
        { f: 'espiral', x: 900, y: 330, s: 0.9, r: 10 }, { f: 'estrela', x: 150, y: 330, s: 0.6, r: -12 },
        { f: 'sol', x: 540, y: 300, s: 0.75 }, { f: 'onda', x: 860, y: 1520, s: 0.9 },
      ], { op: 0.3, semente: 61 });
      folha = Z.div(el, { left: FX + 'px', top: FY + 'px', width: FW + 'px', height: FH + 'px', background: '#ffffff', borderRadius: '18px',
        boxShadow: `12px 14px 0 ${G.COR.navy}`, transformOrigin: '50% 50%' });
      Z.div(folha, { left: '360px', top: '-18px', width: '150px', height: '40px', background: 'rgba(245, 9, 83, .38)', transform: 'rotate(-4deg)' });
      const cab = Z.div(folha, { left: '58px', top: '52px', fontSize: '84px', fontWeight: 900, letterSpacing: '-0.01em', color: G.COR.navy, whiteSpace: 'nowrap' });
      cab.innerHTML = 'JANEIRO <span style="color:#f50953;font-weight:600">2027</span>';
      'DSTQQSS'.split('').forEach((d, i) => {
        const e = Z.div(folha, { left: (COL0 + i * COLW) + 'px', top: '186px', width: COLW + 'px', textAlign: 'center', fontSize: '34px', fontWeight: 600, color: '#55708c' });
        e.textContent = d;
      });
      for (let dia = 1; dia <= 31; dia++) {
        const p = pos(dia);
        const e = Z.div(folha, { left: (p.x - COLW / 2) + 'px', top: (p.y - 34) + 'px', width: COLW + 'px', textAlign: 'center', fontSize: '54px',
          fontWeight: dia === 4 ? 900 : 600, color: dia === 4 ? G.COR.rosa : G.COR.navy, fontVariantNumeric: 'tabular-nums' });
        e.textContent = dia;
      }
      const s = T.svg(folha, FW, FH, { left: '0px', top: '0px' });
      for (const dia of [1, 2, 3]) {
        const p = pos(dia);
        const g = T.el(s, 'g', {});
        for (const [a, b] of [[[-38, -38], [38, 38]], [[38, -38], [-38, 38]]]) {
          const path = T.el(g, 'path', { d: `M${p.x + a[0]} ${p.y + a[1]} Q${p.x + 4} ${p.y - 6} ${p.x + b[0]} ${p.y + b[1]}`, fill: 'none', stroke: G.COR.navy, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.8 });
          xs.push({ path, dia });
        }
      }
      // círculo à mão em volta do 4: elipse que passa do ponto de partida (traço de caneta, não compasso)
      const pts = [];
      for (let i = 0; i <= 40; i++) { const a = -2.2 + i / 40 * Math.PI * 2.25; pts.push([C4.x + Math.cos(a) * (62 + i * 0.5), C4.y + Math.sin(a) * (50 + i * 0.3)]); }
      circ = T.el(s, 'path', { d: 'M' + pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L'), fill: 'none', stroke: G.COR.rosa, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      circLen = circ.getTotalLength();
      desam = T.desamassavel(el, folha, { w: FW, h: FH, semente: 7 });
      bola = T.bola(el, 300, 12);
      disco = Z.div(el, { background: `linear-gradient(160deg, ${G.COR.rosa} 0%, ${G.COR.rosaFundo} 100%)`, borderRadius: '50%', zIndex: 80 });
    },
    seek(t, el) {
      // câmera: respira; depois do círculo aproxima do 4 e mergulha nele
      const mergulho = G.E.inExp(M.prog(t, CIRCULO + 0.6, B(6.2)));
      const zoom = 1 + 0.03 * G.E.outCubic(M.prog(t, ABRE, CIRCULO)) + 2.2 * mergulho;
      el.style.transformOrigin = `${C4T.x}px ${C4T.y}px`;
      el.style.transform = `scale(${zoom.toFixed(4)})`;
      eco.seek(t, -0.3); rab.seek(t);

      // bolinha tremendo na batida até desamassar
      const treme = M.kick(t, 0, 10, 6, 0.3) + M.kick(t, B(0.5), 14, 6, 0.3);
      bola.style.visibility = t < ABRE ? 'visible' : 'hidden';
      bola.style.transform = `translate(${390 + treme}px, ${820 - Math.abs(treme) * 0.6}px) rotate(${(-10 + treme * 1.5).toFixed(2)}deg)`;
      const pa = M.clamp(M.spring(t - ABRE, 2.4, 0.7), 0, 1.04);
      folha.style.visibility = t >= ABRE ? 'visible' : 'hidden';
      desam.seek(pa);

      // riscos dos dias 1 a 3 (traço escrito) e o círculo do 4
      xs.forEach(({ path, dia }, i) => {
        const t0 = RISCOS[dia - 1] + (i % 2) * 0.06, len = 120;
        const p = G.E.outCubic(M.prog(t, t0, t0 + 0.14));
        path.setAttribute('stroke-dasharray', `${len} ${len}`);
        path.setAttribute('stroke-dashoffset', (len * (1 - p)).toFixed(1));
      });
      const pc = G.E.outCubic(M.prog(t, CIRCULO, CIRCULO + 0.4));
      circ.setAttribute('stroke-dasharray', `${circLen} ${circLen}`);
      circ.setAttribute('stroke-dashoffset', (circLen * (1 - pc)).toFixed(1));

      // íris: o rosa nasce de dentro do círculo e toma a tela
      const pi = G.E.inExp(M.prog(t, IRIS, B(6.25)));
      const R = 2400 * pi;
      Object.assign(disco.style, { left: (C4T.x - R) + 'px', top: (C4T.y - R) + 'px', width: 2 * R + 'px', height: 2 * R + 'px', display: pi > 0 ? 'block' : 'none' });
    },
    som(S) {
      S.pop(0, 500, 0.12); S.pop(B(0.5), 560, 0.12);
      SOM.amassa(S, ABRE, 0.8);
      for (const t of RISCOS) { S.ruid({ t, dur: 0.12, tipo: 'bandpass', f0: 3200, f1: 1800, q: 1.5, ganho: 0.1 }); S.ruid({ t: t + 0.06, dur: 0.1, tipo: 'bandpass', f0: 2800, f1: 1600, q: 1.5, ganho: 0.08 }); }
      S.ruid({ t: CIRCULO, dur: 0.38, tipo: 'bandpass', f0: 2400, f1: 3600, q: 1.2, ganho: 0.08 });
      S.ding(CIRCULO + 0.375, 1568, 0.1);
      S.swoosh(IRIS, 0.25, 0.2, true);
    },
  });
})();
