# Marca o tempo de cada palavra da letra inteira.
# Janela de cada verso: definida à mão a partir do mapa de frases da voz separada + âncoras do reconhecimento (Parakeet).
# Dentro da janela, cada palavra cai no onset de voz correspondente à sua primeira sílaba; âncora do ASR (se houver,
# já encaixada no onset mais próximo) tem prioridade. Refrões 2 e 3 = refrão 1 deslocado (mesma melodia).
import json, re, unicodedata, numpy as np, sys, os
os.chdir(sys.argv[1])
ons = np.load('audio/onsets.npy')
anc = {int(k): v for k, v in json.load(open('audio/ancoras.json')).items()}
linhas = [l.split() for l in open('letra.txt').read().strip().split('\n')]
JAN = {0: (15.06, 16.6), 1: (16.68, 19.2), 2: (19.78, 21.5), 3: (21.64, 23.9), 4: (24.20, 28.3), 5: (28.67, 30.9), 6: (31.74, 34.0), 7: (34.1, 37.6),
       8: (38.37, 40.6), 9: (40.8, 43.95), 10: (44.48, 46.5), 11: (46.6, 49.4),
       12: (50.18, 52.7), 13: (53.14, 55.7), 14: (55.94, 58.95), 15: (59.24, 61.9), 16: (62.18, 64.9), 17: (65.30, 67.7), 18: (68.03, 71.6), 19: (72.0, 74.2),
       20: (78.32, 81.2), 21: (81.70, 84.0), 22: (84.2, 87.2), 23: (87.66, 90.1), 24: (90.46, 92.4), 25: (92.6, 95.7), 26: (96.36, 99.2), 27: (99.69, 102.4),
       28: (103.14, 105.9), 29: (106.32, 108.7), 30: (109.46, 111.7), 31: (111.9, 114.8),
       40: (139.25, 141.2), 41: (141.83, 144.4), 42: (145.10, 147.4), 43: (147.90, 151.0), 44: (153.04, 156.6)}
REF1 = list(range(12, 20)); SH2 = 65.1; SH3 = 106.6; SEM_ANC = {5}
sil = lambda w: max(1, len(re.findall(r'[aeiouáéíóúâêôãõà]+', w.lower().replace('qu', 'q').replace('gu', 'g'))))
snap = lambda t, r=0.2: (lambda i: float(ons[i]) if abs(ons[i] - t) <= r else t)(int(np.argmin(np.abs(ons - t))))
base = {}
idx = 0; inicio = []
for li, l in enumerate(linhas): inicio.append(idx); idx += len(l)
def marca(li, a, b):
    ws = linhas[li]; o = [t for t in ons if a - 0.05 <= t <= b]
    if not o: o = list(np.linspace(a, b - 0.3, len(ws)))
    s = [sil(w) for w in ws]; cum = np.cumsum([0] + s[:-1]); tot = sum(s)
    ts = []
    for k, w in enumerate(ws):
        g = inicio[li] + k
        if g in anc and li not in SEM_ANC and a - 0.3 <= anc[g] <= b: t = snap(anc[g], 0.25)
        else: t = o[min(len(o) - 1, int(round(cum[k] / tot * len(o) * min(1, tot / max(1, len(o))) if len(o) < tot else cum[k] / tot * len(o))))]
        ts.append(t)
    ts[0] = max(ts[0], a - 0.05) if li not in (0,) else ts[0]
    for k in range(1, len(ts)): ts[k] = max(ts[k], ts[k - 1] + 0.08)
    return [{'w': w, 't': round(float(t), 3)} for w, t in zip(ws, ts)]
out = []
for li in range(len(linhas)):
    if li in JAN: out.append({'linha': li, 't0': JAN[li][0], 't1': JAN[li][1], 'palavras': marca(li, *JAN[li])})
# refrão 1
for li in REF1: out.append({'linha': li, 't0': JAN[li][0], 't1': JAN[li][1], 'palavras': marca(li, *JAN[li])}) if li not in JAN else None
ref1 = {o['linha']: o for o in out if o['linha'] in REF1}
def copia(li_dst, li_src, sh):
    s = ref1[li_src]; ws = linhas[li_dst]; src = s['palavras']
    pal = []
    for k, w in enumerate(ws):
        t = src[min(k, len(src) - 1)]['t'] + sh if len(ws) == len(src) else s['t0'] + sh + (s['t1'] - s['t0']) * k / len(ws) * 0.8
        pal.append({'w': w, 't': round(snap(t, 0.15), 3)})
    for k in range(1, len(pal)): pal[k]['t'] = max(pal[k]['t'], pal[k - 1]['t'] + 0.08)
    return {'linha': li_dst, 't0': s['t0'] + sh, 't1': s['t1'] + sh, 'palavras': pal}
for k, li in enumerate(range(32, 40)): out.append(copia(li, REF1[k], SH2))
for k, li in enumerate(range(45, 53)):
    o = copia(li, REF1[k], SH3)
    if len(linhas[li]) != len(linhas[REF1[k]]): o = {'linha': li, 't0': o['t0'], 't1': o['t1'], 'palavras': marca(li, o['t0'], o['t1'])}
    out.append(o)
out.sort(key=lambda o: o['t0'])
json.dump(out, open('letra.json', 'w'), ensure_ascii=False, indent=0)
for o in out: print(f"{o['linha']:2d} {o['t0']:7.2f} " + ' '.join(f"{p['w']}@{p['t']:.2f}" for p in o['palavras']))
