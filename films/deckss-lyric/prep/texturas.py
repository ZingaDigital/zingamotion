# Texturas dos modelos do lyric video (determinísticas, semente fixa).
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageDraw
import sys, os
os.chdir(sys.argv[1])
R = np.random.default_rng(7)
W, H = 1920, 1080

def ruido(scale, w=W, h=H):
    small = R.random((h // scale + 2, w // scale + 2))
    return np.array(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0

def fbm(w=W, h=H, oct=((4,.5),(16,.25),(64,.15),(200,.1))):
    return sum(a * ruido(s, w, h) for s, a in oct)

# papel claro (creme) com dobras e manchas
n = fbm(); n = (n - n.min()) / (n.max() - n.min())
base = np.array([236, 224, 198], float)
img = base[None, None, :] * (0.86 + 0.16 * n[..., None])
for x in (W // 3, 2 * W // 3):
    img[:, x - 2:x + 2] *= 0.9; img[:, x + 2:x + 5] *= 1.03
img[H // 2 - 2:H // 2 + 2] *= 0.9
fib = ruido(1) ; img *= (0.96 + 0.06 * fib[..., None])
Image.fromarray(img.clip(0, 255).astype(np.uint8)).save('tex/papel-creme.jpg', quality=92)

# muro preto (concreto sujo)
n = fbm(oct=((3,.4),(12,.3),(40,.2),(150,.1))); n = (n - n.min()) / (n.max() - n.min())
g = 14 + 26 * n ** 1.6 + 10 * ruido(1)
mancha = fbm(oct=((300,1),)); g *= 0.75 + 0.5 * mancha
muro = np.stack([g * 1.02, g, g * 0.94], -1)
Image.fromarray(muro.clip(0, 255).astype(np.uint8)).save('tex/muro.jpg', quality=92)

# sujeira / arranhões (PNG transparente, creme)
a = np.zeros((H, W), float)
pts = R.random((900, 2)) * [W, H]
im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
for x, y in pts:
    r = R.random() ** 3 * 4 + 0.6
    d.ellipse([x - r, y - r, x + r, y + r], fill=int(120 + 135 * R.random()))
for _ in range(40):
    x = R.random() * W; y = R.random() * H; L = 40 + R.random() * 300; ang = (R.random() - .5) * 0.5 + np.pi / 2 * (R.random() < .7)
    d.line([x, y, x + L * np.cos(ang), y + L * np.sin(ang)], fill=int(90 + 120 * R.random()), width=1)
rgba = np.zeros((H, W, 4), np.uint8); rgba[..., :3] = [240, 230, 205]; rgba[..., 3] = np.array(im)
Image.fromarray(rgba).save('tex/sujeira.png')

# retícula (halftone) de pontos, PNG transparente creme, tileável 64px
def halftone(src, cell=10, cor=(243, 230, 204), inv=False):
    g = np.array(src.convert('L'), float) / 255.0
    if inv: g = 1 - g
    h, w = g.shape
    out = Image.new('L', (w, h), 0); d = ImageDraw.Draw(out)
    for y in range(0, h, cell):
        for x in range(0, w, cell):
            v = g[y:y + cell, x:x + cell].mean()
            r = cell * 0.62 * np.sqrt(v)
            if r > 0.4: d.ellipse([x + cell / 2 - r, y + cell / 2 - r, x + cell / 2 + r, y + cell / 2 + r], fill=255)
    rgba = Image.new('RGBA', (w, h), cor + (0,)); rgba.putalpha(out); return rgba

# versões xerox (1 bit com retícula) dos recortes e da capa
os.makedirs('tex/xerox', exist_ok=True)
for nome in ['p-garoto', 'p-criancas', 'p-bola', 'p-beco', 'p-polaroid', 'p-mochila', 'p-carrinho', 'p-trofeu', 'capa']:
    src = Image.open(f'rec/{nome}.png').convert('RGBA')
    alpha = src.split()[3]
    g = ImageOps.autocontrast(src.convert('L'), cutoff=2)
    g = ImageOps.equalize(g)
    ht = halftone(g, cell=7)
    blk = Image.new('RGBA', src.size, (12, 11, 10, 255))
    blk.alpha_composite(ht)
    blk.putalpha(alpha)
    blk.save(f'tex/xerox/{nome}.png')

# disco de retícula em degradê radial (spray de fundo)
s = 900; yy, xx = np.mgrid[0:s, 0:s]; rr = np.hypot(xx - s / 2, yy - s / 2) / (s / 2)
grad = Image.fromarray((np.clip(1 - rr, 0, 1) ** 1.3 * 255).astype(np.uint8))
halftone(grad, cell=12).save('tex/retícula-disco.png')
print('ok')
