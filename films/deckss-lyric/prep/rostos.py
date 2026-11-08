# Rastreia o rosto em cada sequência footage/pb/<clipe>: Haar frontal + perfil (dos dois lados), a cada 3 quadros,
# maior rosto, buracos interpolados, suavizado. Saída footage/rostos.json: {clipe: {n, w, h, cx[], cy[], s[]}} (px).
import cv2, numpy as np, os, json, sys
os.chdir(sys.argv[1])
D = cv2.data.haarcascades
fr = cv2.CascadeClassifier(D + 'haarcascade_frontalface_default.xml'); pf = cv2.CascadeClassifier(D + 'haarcascade_profileface.xml')
out = {}
for n in sorted(os.listdir('footage/pb')):
    fs = sorted(os.listdir(f'footage/pb/{n}')); N = len(fs); h, w = cv2.imread(f'footage/pb/{n}/{fs[0]}', 0).shape
    cx = np.full(N, np.nan); cy = np.full(N, np.nan); ss = np.full(N, np.nan)
    for i in range(0, N, 3):
        g = cv2.imread(f'footage/pb/{n}/{fs[i]}', 0); sc = 0.5; gs = cv2.resize(g, None, fx=sc, fy=sc); gs = cv2.equalizeHist(gs)
        cand = []
        for c, flip in ((fr, False), (pf, False), (pf, True)):
            img = cv2.flip(gs, 1) if flip else gs
            for (x, y, ww, hh) in c.detectMultiScale(img, 1.1, 5, minSize=(int(min(w, h) * sc * 0.07),) * 2):
                if flip: x = img.shape[1] - x - ww
                cand.append((ww * hh, (x + ww / 2) / sc, (y + hh / 2) / sc, ww / sc))
        if cand:
            a, x, y, s = max(cand); cx[i], cy[i], ss[i] = x, y, s
    ok = ~np.isnan(cx)
    if ok.sum() < 2:
        cx[:] = w / 2; cy[:] = h * 0.3; ss[:] = min(w, h) * 0.3; achou = 0
    else:
        idx = np.arange(N); achou = int(ok.sum())
        for arr in (cx, cy, ss): arr[:] = np.interp(idx, idx[ok], arr[ok])
        # descarta saltos (detecção errada): mediana móvel, depois média móvel
        k = 9
        for arr in (cx, cy, ss):
            med = np.array([np.median(arr[max(0, i - k):i + k + 1]) for i in range(N)])
            arr[:] = np.convolve(np.pad(med, 7, mode='edge'), np.ones(15) / 15, 'valid')
    out[n] = {'n': N, 'w': w, 'h': h, 'cx': [round(v, 1) for v in cx], 'cy': [round(v, 1) for v in cy], 's': [round(v, 1) for v in ss]}
    print(f'{n:14s} {N:4d} quadros, rosto em {achou}/{(N + 2) // 3} amostras, centro médio ({np.mean(cx):.0f},{np.mean(cy):.0f}) tam {np.mean(ss):.0f}')
json.dump(out, open('footage/rostos.json', 'w'))
