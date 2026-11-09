# Recorta pessoas (u2net_human_seg via onnxruntime) e gera: recorte/<n>.png (RGBA, cor) e recorte/<n>-bit.png
# (P&B bitmap estilo xerox com borda branca de adesivo). Uso: python3 recorta.py <pasta footage> <modelo.onnx>
import sys, os, numpy as np, onnxruntime as ort
from PIL import Image, ImageFilter, ImageOps, ImageChops
os.chdir(sys.argv[1]); s = ort.InferenceSession(sys.argv[2])
def mascara(im):
    x = np.array(im.convert('RGB').resize((320, 320), Image.LANCZOS)) / 255.0
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    x = x.transpose(2, 0, 1)[None].astype(np.float32)
    y = s.run(None, {s.get_inputs()[0].name: x})[0][0, 0]
    y = (y - y.min()) / (y.max() - y.min() + 1e-6)
    return Image.fromarray((y * 255).astype(np.uint8)).resize(im.size, Image.LANCZOS)
for f in sorted(os.listdir('recorte/src')):
    n = f[:-4]; im = Image.open(f'recorte/src/{f}').convert('RGB')
    m = mascara(im).point(lambda v: 255 if v > 110 else 0).filter(ImageFilter.MedianFilter(7))
    import cv2
    a = np.array(m); k, lab, st, _ = cv2.connectedComponentsWithStats((a > 0).astype(np.uint8))
    if k > 1: big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); m = Image.fromarray(((lab == big) * 255).astype(np.uint8))
    rgba = im.copy(); rgba.putalpha(m); bb = m.getbbox(); rgba = rgba.crop(bb); m = m.crop(bb)
    rgba.save(f'recorte/{n}.png')
    # bitmap: P&B, contraste alto, posterizado em 3 tons + grão
    g = ImageOps.autocontrast(rgba.convert('L'), cutoff=2)
    g = g.point(lambda v: 0 if v < 70 else (150 if v < 150 else 245))
    ruido = Image.effect_noise(g.size, 40).point(lambda v: v // 8)
    g = ImageChops.subtract(g, ruido)
    pad = 26; W, H = g.size[0] + 2 * pad, g.size[1] + 2 * pad
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    borda = Image.new('L', (W, H), 0); borda.paste(m, (pad, pad)); borda = borda.filter(ImageFilter.MaxFilter(31)).filter(ImageFilter.GaussianBlur(2)).point(lambda v: 255 if v > 100 else 0)
    out.paste(Image.new('RGBA', (W, H), (246, 240, 228, 255)), (0, 0), borda)
    gm = Image.new('L', (W, H), 0); gm.paste(m, (pad, pad))
    out.paste(Image.merge('RGBA', (g, g, g, Image.new('L', g.size, 255))), (pad, pad), m)
    out.save(f'recorte/{n}-bit.png'); print(n, rgba.size)
