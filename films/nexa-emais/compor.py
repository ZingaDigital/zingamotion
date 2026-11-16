"""Compositor do filme "nexa-emais": função pura do tempo.

quadro(t) = fundo original reamostrado no tempo (cortes da tela do celular cravados na grade de 90 BPM)
            com o título antigo apagado + o novo título "e mais..." desenhado por cima.

Uso:
  python3 compor.py --saida out/nexa-emais-video.mp4          (render completo, 450 quadros)
  python3 compor.py --at 0.8 1.6 2.8 --png out/q               (quadros soltos)
  python3 compor.py --de 2 --ate 4 --saida out/trecho.mp4      (trecho)
Precisa de refs/all.rgb (o vídeo de referência em rgb24 cru) e refs/plate.npy (fundo limpo).
"""
import argparse, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

RAIZ = Path(__file__).resolve().parents[2]
FILME = Path(__file__).resolve().parent
W, H, FPS, DUR = 1080, 1350, 30, 15.0
SRC = np.memmap(RAIZ / 'refs/all.rgb', dtype=np.uint8, mode='r').reshape(-1, H, W, 3)
PLATE = np.load(RAIZ / 'refs/plate.npy')  # média dos 12 primeiros quadros (fundo sem texto)

BATIDA = 60 / 90
# Tempo de saída -> tempo da fonte. Cada início de rolagem do original vai para a colcheia mais próxima.
NOS = [(0.0, 0.0), (4.0, 4.0), (5.0, 4.88), (6.0, 5.83), (6 + 2 / 3, 6.57), (7 + 1 / 3, 7.30), (8.0, 8.03),
       (8 + 2 / 3, 8.68), (9 + 1 / 3, 9.33), (10.0, 10.0), (10 + 2 / 3, 10.63), (11 + 1 / 3, 11.40),
       (12 + 1 / 3, 12.33), (15.0, 15.0)]


def fonte_t(t):
    xs, ys = zip(*NOS)
    return float(np.interp(t, xs, ys))


# ---------- limpeza do título antigo ----------
B0, B1, FEATHER = 0, 850, 24
ROSA = np.array([244, 8, 83], np.float32)
BRANCO = np.array([253, 254, 255], np.float32)


def mistura(frame, plate, cor):
    """Quanto do pixel é 'cor' sobre o fundo (alfa) e o erro de consistência dessa hipótese."""
    den = (cor - plate)
    num = (frame - plate)
    a = (num * den).sum(-1) / np.maximum((den * den).sum(-1), 1)
    a = np.clip(a, 0, 1)
    err = np.abs(num - a[..., None] * den).max(-1)
    return a, err


def lum_(x):
    return x[..., 0] * .3 + x[..., 1] * .5 + x[..., 2] * .2


def caixa(m, k):
    """Média de caixa separável (2k+1) via soma cumulativa."""
    for ax in (0, 1):
        c = np.cumsum(np.pad(m, [(k + 1, k) if a == ax else (0, 0) for a in (0, 1)], mode='edge'), axis=ax)
        if ax == 0: m = (c[2 * k + 1:] - c[:-2 * k - 1]) / (2 * k + 1)
        else: m = (c[:, 2 * k + 1:] - c[:, :-2 * k - 1]) / (2 * k + 1)
    return m


def limpa(i):
    f = SRC[min(i, len(SRC) - 1)].astype(np.float32)
    if i > 90:
        return f
    p = PLATE
    out = f.copy()
    band = f[B0:B1]
    pb = p[B0:B1]
    if i <= 78:
        m = np.ones(band.shape[:2], np.float32)
    else:
        # pixel = alfa*ROSA + u*fundo (u < 1 = sombra do celular). Linear em (alfa, u): mínimos quadrados.
        P = ROSA[None, None, :]
        pp = (P * P).sum(-1); pq = (P * pb).sum(-1); qq = (pb * pb).sum(-1)
        xp = (band * P).sum(-1); xq = (band * pb).sum(-1)
        det = pp * qq - pq * pq
        alfa = (xp * qq - xq * pq) / det
        u = (pp * xq - pq * xp) / det
        res = np.abs(band - alfa[..., None] * P - u[..., None] * pb).max(-1)
        texto = (alfa > 0.02) & (res < 14) & ((u > 0.12) | (alfa > 0.6))
        # protege o corpo do celular: abaixo da borda escura (bezel) no topo de cada coluna
        escuro = lum_(band) < 0.38 * lum_(pb)
        corrida = escuro & np.roll(escuro, -1, 0) & np.roll(escuro, -2, 0) & np.roll(escuro, -3, 0)
        tem = corrida.any(0)
        topo = np.where(tem, corrida.argmax(0), band.shape[0])
        linhas = np.arange(band.shape[0])[:, None]
        celular = linhas >= (topo[None, :] + 4)
        texto &= ~celular
        # texto rosa por cima da barra de status do celular: R sobe acima do G mantendo B > G (madeira tem B < G)
        perto_topo = celular & (linhas < topo[None, :] + 70)
        rosa_cel = perto_topo & (band[..., 0] - band[..., 1] > 14) & (band[..., 2] > band[..., 1] + 4)
        rosa_cel = caixa(rosa_cel.astype(np.float32), 2) > 0.05
        w2 = (~rosa_cel).astype(np.float32)
        viz = np.stack([caixa(band[..., c] * w2, 8) for c in range(3)], -1) / np.maximum(caixa(w2, 8), 1e-3)[..., None]
        band = np.where(rosa_cel[..., None], viz, band)
        m = (texto * np.clip(alfa / 0.08, 0, 1)).astype(np.float32)
        # sombra por baixo do texto: interpola a razão pixel/fundo dos vizinhos que não são texto
        lum = lambda x: x[..., 0] * .3 + x[..., 1] * .5 + x[..., 2] * .2
        S0 = np.clip(lum(band) / np.maximum(lum(pb), 1), 0.1, 1.0)
        tx = caixa(texto.astype(np.float32), 4) > 0.01
        w = (~tx).astype(np.float32)
        s_ = np.where(tx, caixa(S0 * w, 18) / np.maximum(caixa(w, 18), 1e-3), 1.0)
        s_ = np.clip(np.where(caixa(w, 18) < 0.05, 1.0, s_), 0.1, 1.0)
        pb = pb * s_[..., None]
        # o "a" branco que ainda sobe no canto direito, acima do topo do celular
        topo_cel = {79: 830, 80: 830, 81: 790, 82: 720, 83: 660, 84: 600, 85: 540}.get(i)
        if topo_cel:
            a_w, e_w = mistura(band, PLATE[B0:B1], BRANCO)
            r = slice(0, topo_cel - B0)
            m[r] = np.maximum(m[r], ((a_w[r] > 0.015) & (e_w[r] < 20)).astype(np.float32))
            pb[r] = PLATE[B0:B1][r]
        # amacia a borda da máscara (sem scipy: média de caixas separável)
        k = 3
        for ax in (0, 1):
            m = sum(np.roll(m, s, axis=ax) for s in range(-k, k + 1)) / (2 * k + 1)
        m = np.clip(m * 1.6, 0, 1)
    ramp = np.ones(B1 - B0, np.float32)
    pass  # topo do quadro: sem degradê, o fundo ali é estático
    ramp[-FEATHER:] = np.linspace(1, 0, FEATHER)
    m = m * ramp[:, None]
    out[B0:B1] = band * (1 - m[..., None]) + pb * m[..., None]
    return out


def fundo(t):
    s = fonte_t(t) * FPS
    i = int(round(s))
    return limpa(min(i, len(SRC) - 1))


# ---------- título "e mais..." ----------
FONTE = ImageFont.truetype(str(FILME / 'fonts/Outfit-700.ttf'), 132)
CY = 640                     # centro óptico do bloco de título do original
PAD = 70
PALAVRAS = [  # texto, cor, entra, sai
    ('e', (253, 254, 255), 1 / 6, 2.30),
    (' mais', (253, 254, 255), 1 / 3, 2.37),
    ('.', tuple(ROSA.astype(int)), 2 / 3, 2.44),
    ('.', tuple(ROSA.astype(int)), 2 / 3 + 1 / 6, 2.48),
    ('.', tuple(ROSA.astype(int)), 1.0, 2.52),
]
TEXTO = ''.join(p[0] for p in PALAVRAS)
LARG = FONTE.getlength(TEXTO)
X0 = (W - LARG) / 2
asc, desc = FONTE.getmetrics()
Y0 = CY - (asc - desc * 0.2) / 2 - asc * 0.08
CAMADAS = []
acum = ''
for txt, cor, ent, sai in PALAVRAS:
    x = X0 + FONTE.getlength(acum)
    acum += txt
    s = txt.lstrip()
    x += FONTE.getlength(txt) - FONTE.getlength(s)
    wpx = int(FONTE.getlength(s)) + 2 * PAD
    im = Image.new('RGBA', (wpx, asc + desc + 2 * PAD), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((PAD, PAD), s, font=FONTE, fill=cor + (255,))
    CAMADAS.append((im, x - PAD, Y0 - PAD, ent, sai))


def bez(x1, y1, x2, y2):
    def f(x):
        x = min(max(x, 0), 1)
        lo, hi = 0.0, 1.0
        for _ in range(40):
            u = (lo + hi) / 2
            bx = 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3
            if bx < x: lo = u
            else: hi = u
        u = (lo + hi) / 2
        return 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3
    return f


ENTRA = bez(0.5, 0, 0.0, 1)   # 50/100: arranca, freia longo
SAI = bez(1.0, 0, 0.5, 1)     # espelho: sai devagar e acelera


def titulo(img, t):
    for im, x, y, ent, sai in CAMADAS:
        if t < ent or t > sai + 0.4:
            continue
        e = ENTRA((t - ent) / 0.42)
        q = SAI((t - sai) / 0.36) if t > sai else 0.0
        alfa = e * (1 - q)
        borrao = 13 * (1 - e) + 15 * q
        dy = 16 * (1 - e) - 64 * q
        camada = im
        if borrao > 0.3:
            camada = im.filter(ImageFilter.GaussianBlur(borrao))
        if alfa < 0.999:
            a = np.asarray(camada.getchannel('A'), np.float32) * alfa
            camada = camada.copy(); camada.putalpha(Image.fromarray(a.astype(np.uint8)))
        img.alpha_composite(camada, (int(round(x)), int(round(y + dy))))


def quadro(t):
    base = fundo(t)
    img = Image.fromarray(np.clip(base + 0.5, 0, 255).astype(np.uint8)).convert('RGBA')
    if t < 3.0:
        titulo(img, t)
    return img.convert('RGB')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--saida')
    ap.add_argument('--at', nargs='*', type=float)
    ap.add_argument('--png', default='out/q')
    ap.add_argument('--de', type=float, default=0)
    ap.add_argument('--ate', type=float, default=DUR)
    a = ap.parse_args()
    if a.at:
        Path(a.png).parent.mkdir(parents=True, exist_ok=True)
        for t in a.at:
            quadro(t).save(f'{a.png}-{t:05.2f}.png')
        sys.exit()
    n0, n1 = round(a.de * FPS), round(a.ate * FPS)
    Path(a.saida).parent.mkdir(parents=True, exist_ok=True)
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
                           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', a.saida], stdin=subprocess.PIPE)
    for n in range(n0, n1):
        ff.stdin.write(quadro(n / FPS).tobytes())
        if n % 30 == 0:
            print(f'{n / FPS:5.1f}s', end=' ', flush=True)
    ff.stdin.close(); ff.wait()
    print('\nok', a.saida)
