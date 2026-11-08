# Recortes das artes do cliente (rodar da pasta do filme): python3 prep/recortes.py
import numpy as np, cv2
from PIL import Image
from scipy import ndimage as nd

def L(p): return np.asarray(Image.open(p).convert('L')).astype(np.float32)
def salva(rgba, p): Image.fromarray(rgba.astype(np.uint8), 'RGBA').save(p); print(p, rgba.shape)
def crop_alpha(rgba, pad=8):
    ys, xs = np.where(rgba[..., 3] > 8)
    y0, y1, x0, x1 = max(ys.min()-pad,0), ys.max()+pad, max(xs.min()-pad,0), xs.max()+pad
    return rgba[y0:y1, x0:x1], (x0, y0)

def tinta_branca(src, thr=140, abre=9, minarea=4000):
    g = L(src)
    m = g > thr
    m = nd.binary_closing(m, np.ones((5, 5)))
    nucleo = nd.binary_opening(m, np.ones((abre, abre)))          # mata vincos finos do papel
    lab, n = nd.label(nucleo); areas = nd.sum(nucleo, lab, range(1, n + 1))
    nucleo = np.isin(lab, 1 + np.where(areas > minarea)[0])
    m = m & nd.binary_dilation(nucleo, np.ones((abre + 4, abre + 4)))
    a = np.clip((g - 50) / 150, 0, 1) * nd.gaussian_filter(m.astype(np.float32), 0.8)
    rgba = np.zeros(g.shape + (4,), np.float32)
    rgba[..., :3] = 244; rgba[..., 3] = a * 255
    return rgba, m

# caveira
cav, mcav = tinta_branca('assets/caveira.png')
c, o = crop_alpha(cav); salva(c, 'assets/rec/caveira.png'); print('caveira origem', o)
# papel limpo (sem caveira), para o fundo
img = cv2.imread('assets/caveira.png')
mm = nd.binary_dilation(mcav, np.ones((15, 15))).astype(np.uint8) * 255
papel = cv2.inpaint(img, mm, 9, cv2.INPAINT_TELEA)
cv2.imwrite('assets/rec/papel.png', papel)
# logo DECKSS (inclui caveira, raios e retícula)
logo, mlogo = tinta_branca('assets/logo-deckss.png', thr=120, abre=5, minarea=600)
janela = np.zeros(logo.shape[:2], bool); janela[330:1130, 90:1010] = True; logo[..., 3] *= janela
c, o = crop_alpha(logo); salva(c, 'assets/rec/logo.png'); print('logo origem', o)
# títulos: fundo preto puro some por inundação a partir da borda
for nome in ['titulo', 'titulo-caveira']:
    im = np.asarray(Image.open(f'assets/{nome}.png').convert('RGB')).astype(np.float32)
    g = im.max(2)
    fundo = g < 10
    lab, n = nd.label(fundo)
    borda = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fora = np.isin(lab, list(borda))
    a = 1 - nd.gaussian_filter(fora.astype(np.float32), 0.7)
    lab2, n2 = nd.label(a > 0.5); ar = nd.sum(a > 0.5, lab2, range(1, n2 + 1))
    a *= np.isin(lab2, 1 + np.where(ar > 300)[0])
    rgba = np.dstack([im, a * 255])
    c, o = crop_alpha(rgba, 4); salva(c, f'assets/rec/{nome}.png'); print(nome, 'origem', o)
