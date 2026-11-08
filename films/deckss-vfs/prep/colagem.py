# Recortes rasgados da capa para a colagem: python3 prep/colagem.py
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
capa = Image.open('assets/capa.png').convert('RGB')
PECAS = {   # nome: (x0, y0, x1, y1) na capa 1254 px
    'criancas': (630, 420, 980, 740), 'bola': (585, 760, 705, 885), 'polaroid': (690, 795, 880, 960),
    'carrinho': (490, 835, 615, 915), 'mochila': (770, 680, 960, 870), 'garoto': (370, 390, 580, 600),
    'trofeu': (1150, 545, 1250, 670), 'beco': (840, 330, 1080, 520),
}
def rnd(seed):
    s = seed & 0xffffffff
    def f():
        nonlocal s
        s = (s + 0x6D2B79F5) & 0xffffffff; t = s
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xffffffff
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xffffffff)) & 0xffffffff
        return ((t ^ (t >> 14)) & 0xffffffff) / 4294967296
    return f
def rasgado(w, h, r, amp=7, passo=9):
    pts = []; d = 0
    for (ax, ay, bx, by) in [(0, 0, w, 0), (w, 0, w, h), (w, h, 0, h), (0, h, 0, 0)]:
        n = max(2, int(np.hypot(bx - ax, by - ay) / passo))
        for i in range(n):
            u = i / n; x = ax + (bx - ax) * u; y = ay + (by - ay) * u
            nx, ny = (by - ay), -(bx - ax); l = np.hypot(nx, ny); nx /= l; ny /= l
            d = max(-amp, min(amp, d + (r() - 0.5) * amp * 0.9)) if pts else 0
            if r() < 0.04: d -= amp * 0.8 * r()
            pts.append((x + nx * d, y + ny * d))
    return pts
for k, (nome, (x0, y0, x1, y1)) in enumerate(PECAS.items()):
    r = rnd(0x51 + k * 977)
    foto = capa.crop((x0, y0, x1, y1)).resize(((x1 - x0) * 2, (y1 - y0) * 2), Image.LANCZOS)
    w, h = foto.size; B = 26                               # borda de papel branco rasgado
    W, H = w + 2 * B, h + 2 * B
    mpapel = Image.new('L', (W, H), 0); ImageDraw.Draw(mpapel).polygon(rasgado(W, H, r, 16, 6), fill=255)
    mfoto = Image.new('L', (w, h), 0); ImageDraw.Draw(mfoto).polygon(rasgado(w, h, r, 6, 6), fill=255)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    papel = Image.new('RGBA', (W, H), (238, 230, 214, 255))
    ruido = Image.fromarray((np.array([[r() for _ in range(W // 4 + 1)] for _ in range(H // 4 + 1)]) * 40).astype(np.uint8)).resize((W, H))
    papel.putalpha(mpapel.filter(ImageFilter.GaussianBlur(0.6)))
    out.alpha_composite(papel)
    fl = foto.convert('RGBA'); fl.putalpha(mfoto)
    out.alpha_composite(fl, (B, B))
    a = np.asarray(out).astype(np.float32); a[..., :3] -= np.asarray(ruido)[..., None] * (np.asarray(mpapel)[..., None] > 0) * 0.5
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(f'assets/rec/p-{nome}.png')
    print(nome, W, H)
