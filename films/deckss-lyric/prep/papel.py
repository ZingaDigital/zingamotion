# Papel amassado (vincos por Voronoi + relevo por ruído) com faixas de luz de janela, 1920x1080. Semente fixa.
import numpy as np, sys, os
from PIL import Image, ImageFilter
os.chdir(sys.argv[1]); R = np.random.default_rng(23); W, H = 1920, 1080
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
pts = R.random((70, 2)) * [W, H]
d = np.full((H, W), 1e9, np.float32); d2 = np.full((H, W), 1e9, np.float32); idx = np.zeros((H, W), np.int32)
for i, (px, py) in enumerate(pts):
    di = np.hypot(xx - px, yy - py); m = di < d
    d2 = np.where(m, d, np.minimum(d2, di)); idx = np.where(m, i, idx); d = np.where(m, di, d)
vinco = np.exp(-((d2 - d) / 5.0) ** 2)                     # linhas entre células
ang = R.random(len(pts)) * 2 * np.pi; inc = 0.05 + 0.08 * R.random(len(pts))
face = np.cos(ang[idx]) * inc[idx] * 2 + np.sin(ang[idx]) * inc[idx]   # cada faceta com uma inclinação
def ruido(s):
    sm = R.random((H // s + 2, W // s + 2)).astype(np.float32); return np.array(Image.fromarray((sm * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
luz = 0.9 + face - 0.12 * vinco + 0.05 * (ruido(3) - 0.5) + 0.06 * (ruido(40) - 0.5)
luz = np.array(Image.fromarray(np.clip(luz * 160, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 160
base = np.array([232, 226, 214], np.float32)
img = base * luz[..., None]
# faixas de luz/sombra de janela (diagonal)
u = (xx * 0.8 + yy) / 260.0
faixa = 0.5 + 0.5 * np.sin(u * 2 * np.pi + 0.6 * np.sin(u * 0.7))
faixa = np.clip((faixa - 0.35) * 2.2, 0, 1)
img *= (0.80 + 0.22 * faixa)[..., None]
# vinheta suave
r = np.hypot((xx - W / 2) / W, (yy - H / 2) / H)
img *= (1 - 0.35 * r ** 2)[..., None]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save('tex/papel-amassado.jpg', quality=92)
print('ok')
