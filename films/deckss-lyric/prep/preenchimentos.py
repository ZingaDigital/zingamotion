# Texturas de preenchimento do lettering, tiradas da arte do título: creme com retícula laranja e salpico vermelho,
# e "fogo" (amarelo -> laranja -> vermelho) com retícula. Determinístico (semente fixa).
import numpy as np, sys, os
from PIL import Image, ImageDraw, ImageFilter
os.chdir(sys.argv[1]); R = np.random.default_rng(11)
W, H = 1024, 512
yy, xx = np.mgrid[0:H, 0:W].astype(float); yy /= H; xx /= W
def ret(cell, ang, peso):                     # retícula rotacionada: 1 dentro do ponto
    a = np.deg2rad(ang); u = (xx * W * np.cos(a) - yy * H * np.sin(a)) / cell; v = (xx * W * np.sin(a) + yy * H * np.cos(a)) / cell
    d = np.hypot(u - np.round(u), v - np.round(v)); return d < 0.5 * np.sqrt(np.clip(peso, 0, 1))
def ruido(s):
    sm = R.random((H // s + 2, W // s + 2)); return np.array(Image.fromarray((sm * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)) / 255
def manchas(n, rmax, cor, img):
    d = ImageDraw.Draw(img)
    for _ in range(n):
        x, y, r = R.random() * W, R.random() * H, (R.random() ** 3) * rmax + 0.8
        d.ellipse([x - r, y - r, x + r, y + r], fill=cor)
# creme
c = np.zeros((H, W, 3)); c[:] = [245, 234, 210]
mancha = ruido(60) * 0.6 + ruido(14) * 0.4
c *= (0.93 + 0.08 * ruido(3))[..., None]
dots = ret(6, 22, (mancha - 0.55) * 1.6 + (yy - 0.45) * 1.1)
c[dots] = c[dots] * 0.35 + np.array([232, 130, 70]) * 0.65
cross = (np.abs(np.sin((xx * W + yy * H) / 4.2)) < 0.12) & (ruido(30) > 0.62)
c[cross] = c[cross] * 0.6 + np.array([220, 150, 110]) * 0.4
im = Image.fromarray(c.clip(0, 255).astype(np.uint8))
manchas(260, 2.2, (205, 60, 30), im); manchas(25, 4, (225, 95, 40), im)
im.save('tex/fill-creme.png')
# fogo
f = np.zeros((H, W, 3))
stops = [(0, (255, 214, 30)), (0.42, (255, 200, 20)), (0.62, (255, 130, 25)), (0.82, (232, 40, 28)), (1, (210, 25, 35))]
for (a, ca), (b, cb) in zip(stops, stops[1:]):
    m = (yy >= a) & (yy <= b); k = ((yy - a) / (b - a))[m][..., None]
    f[m] = np.array(ca) * (1 - k) + np.array(cb) * k
dots = ret(6, 30, (yy - 0.35) * 1.6 * (0.7 + 0.6 * ruido(40)))
f[dots] = f[dots] * 0.55 + np.array([200, 20, 30]) * 0.45
dots2 = ret(6, 30, (0.55 - yy) * 1.2 * ruido(25))
f[dots2] = f[dots2] * 0.6 + np.array([255, 235, 120]) * 0.4
im = Image.fromarray(f.clip(0, 255).astype(np.uint8))
manchas(260, 3, (255, 210, 40), im)
im.save('tex/fill-fogo.png')
print('ok')
