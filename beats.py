# Grade de batidas: mede a música, gera a grade de uma trilha sintetizada e confere a sincronia do vídeo pronto.
#
#   python3 beats.py medir musica.wav|mp3|mp4 [-o beats.json] [--bpm 120] [--min 70] [--max 180]
#       fluxo espectral -> andamento por autocorrelação -> fase pelo pente -> cada batida ajustada ao ataque mais
#       próximo (±40 ms). Com --bpm, procura só perto dele (±8%). Para trilha sintetizada: exporta a trilha pura com
#       sfx.mjs --wav e mede aqui ANTES de animar (confirma que o código toca o que a grade promete).
#   python3 beats.py grade --bpm 120 --duracao 15 [--compassos 4,4,6,4] [--inicio 0] [-o beats.json]
#       grade exata (compassos de tamanhos diferentes viram batidas extras no mesmo andamento)
#   python3 beats.py checar out/filme.mp4 beats.json [--tolerancia 33]
#       acha os ataques no áudio do vídeo e mede o erro de cada batida. Tolerância padrão: 1 quadro a 30 fps.
#       Só a batida precisa dessa precisão; o resto do movimento não precisa de milissegundo.
import sys, json, argparse, subprocess
import numpy as np

SR = 22050


def carrega(arq, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def fluxo(x, hop=256, n=1024, ate_hz=None, log=True):
    """Envelope de ataques: fluxo espectral positivo em escala log, um valor por hop. ate_hz limita a banda."""
    if len(x) < n:
        x = np.pad(x, (0, n - len(x)))
    q = 1 + (len(x) - n) // hop
    idx = np.arange(n)[None, :] + hop * np.arange(q)[:, None]
    mag = np.abs(np.fft.rfft(x[idx] * np.hanning(n), axis=1))
    if ate_hz:
        mag = mag[:, 1:max(2, int(ate_hz * n / SR) + 1)]
    lm = np.log1p(100 * mag) if log else mag
    f = np.maximum(0, np.diff(lm, axis=0)).sum(axis=1)
    f = np.concatenate([[0], f])
    f -= np.convolve(f, np.ones(16) / 16, 'same')          # tira a tendência lenta
    return np.maximum(f, 0), SR / hop


def medir(a):
    x = carrega(a.arquivo)
    env, fr = fluxo(x)
    lo, hi = (a.bpm * 0.92, a.bpm * 1.08) if a.bpm else (a.min, a.max)
    ac = np.correlate(env, env, 'full')[len(env) - 1:]
    lags = np.arange(len(ac))
    bpms = 60 * fr / np.maximum(lags, 1)
    ok = (bpms >= lo) & (bpms <= hi)
    if not ok.any():
        sys.exit('nenhum andamento na faixa pedida')
    lag = lags[ok][np.argmax(ac[ok])]
    # refina o período com interpolação parabólica do pico
    if 1 <= lag < len(ac) - 1:
        y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]
        lag = lag + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
    periodo = lag / fr
    # fase e ajuste fino pelo fluxo LINEAR da banda grave (bumbo). O espectro cheio puxa a grade pro chimbal e as palmas,
    # e o log infla a volta do sidechain (o grave sobe ~200 ms depois de cada bumbo) até ela parecer um ataque.
    grave, _ = fluxo(x, ate_hz=160, log=False)
    if grave.sum() > 0:
        env = grave
    # fase: a que maximiza a soma do envelope nas posições da grade
    fases = np.linspace(0, periodo, 64, endpoint=False)
    dur = len(x) / SR
    def soma(f0):
        ts = np.arange(f0, dur, periodo)
        return env[np.clip((ts * fr).round().astype(int), 0, len(env) - 1)].sum()
    f0 = fases[int(np.argmax([soma(f) for f in fases]))]
    grade = np.arange(f0, dur - 0.05, periodo)
    centro = 512 / SR                                       # o pico do fluxo aparece meia janela antes do ataque
    # cada batida vai para o pico de ataque mais próximo (±40 ms) se ele for forte; senão fica na grade
    w = int(0.04 * fr)
    lim = np.percentile(env, 90)
    beats = []
    for t in grade:
        i = int(round(t * fr)); a0, a1 = max(0, i - w), min(len(env), i + w + 1)
        j = a0 + int(np.argmax(env[a0:a1]))
        beats.append(round(j / fr, 4) if env[j] >= lim else round(float(t), 4))
    conf = float(np.mean([env[int(round(b * fr))] >= lim for b in beats]))
    beats = [round(b + centro, 4) for b in beats]
    if beats[0] - periodo > -0.03:                          # batida no comecinho que a fase deixou de fora
        beats.insert(0, round(max(0.0, beats[0] - periodo), 4))
    out = {'bpm': round(60 / periodo, 2), 'beats': beats, 'origem': f'medido de {a.arquivo}', 'confianca': round(conf, 2)}
    json.dump(out, open(a.o, 'w'))
    print(f"{out['bpm']} BPM, {len(beats)} batidas, primeira em {beats[0]:.3f}s, confiança {conf:.0%} -> {a.o}")


def grade(a):
    p = 60 / a.bpm
    if a.compassos:
        n = sum(int(c) for c in a.compassos.split(','))
    else:
        n = int(np.floor((a.duracao - a.inicio) / p + 1e-9))
    beats = [round(a.inicio + k * p, 4) for k in range(n)]
    out = {'bpm': a.bpm, 'beats': beats, 'origem': 'grade sintetizada' + (f' (compassos {a.compassos})' if a.compassos else '')}
    json.dump(out, open(a.o, 'w'))
    print(f'{a.bpm} BPM, {n} batidas de {p:.4f}s -> {a.o}')


def checar(a):
    sr = 48000
    x = carrega(a.video, sr)
    hop = 240
    q = len(x) // hop
    e = (x[:q * hop].reshape(q, hop) ** 2).mean(axis=1)
    L = 10 * np.log10(e * 32768 ** 2 + 1)
    on = []
    for i in range(2, q):
        t = i * hop / sr
        if L[i] - L[i - 2] > 8 and L[i] > 50 and (not on or t - on[-1] > 0.08):
            on.append(t)
    beats = json.load(open(a.beats))['beats']
    dur = len(x) / sr
    on = np.array(on)
    erros = [float(np.min(np.abs(on - b))) if len(on) else 9 for b in beats if b < dur - 0.3]
    ms = [round(v * 1000) for v in erros]
    print(f'ataques detectados: {len(on)}')
    print('erro por batida (ms):', ms)
    ruins = [(k, m) for k, m in enumerate(ms) if m > a.tolerancia]
    pior = max(ms) if ms else 0
    print(f'pior erro: {pior} ms (tolerância {a.tolerancia} ms) -> {"OK" if not ruins else "FORA"}')
    for k, m in ruins:
        print(f'  batida {k} ({beats[k]:.3f}s): {m} ms. Olhe se um efeito começa antes da batida e mascara o bumbo,'
              ' ou se um som longo (sub, pad) cobre o ataque.')
    sys.exit(1 if ruins else 0)


ap = argparse.ArgumentParser()
sub = ap.add_subparsers(dest='modo', required=True)
m = sub.add_parser('medir'); m.add_argument('arquivo'); m.add_argument('-o', default='beats.json')
m.add_argument('--bpm', type=float); m.add_argument('--min', type=float, default=70); m.add_argument('--max', type=float, default=180)
g = sub.add_parser('grade'); g.add_argument('--bpm', type=float, default=120); g.add_argument('--duracao', type=float, default=15)
g.add_argument('--compassos'); g.add_argument('--inicio', type=float, default=0); g.add_argument('-o', default='beats.json')
c = sub.add_parser('checar'); c.add_argument('video'); c.add_argument('beats'); c.add_argument('--tolerancia', type=int, default=33)
a = ap.parse_args()
{'medir': medir, 'grade': grade, 'checar': checar}[a.modo](a)
