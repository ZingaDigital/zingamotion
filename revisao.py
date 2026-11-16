# Revisão de diretor de um vídeo pronto: tudo o que precisa ser OLHADO antes de dar nota.
#
# Uso: python3 tools/revisao.py out/filme.mp4 [--saida out] [--beats films/x/beats.json] [--poster 12.5]
#                                              [--de 0] [--ate 99]  (limita a análise a um trecho)
# Gera em --saida:
#   folha-de-contato.png   2 quadros por segundo, com o instante embaixo de cada um
#   tira-acao-rapida.png   12 quadros seguidos em volta da janela de maior movimento
#   teste-celular.png      um quadro a cada 2 s em 360 px de largura REAIS (não reduzir ao abrir)
#   teste-celular.mp4      o vídeo inteiro em 360 px de largura
#   teste-de-loop.mp4      o vídeo duas vezes seguidas (olhar a emenda fim -> começo)
#   emenda-loop.png        6 últimos + 6 primeiros quadros
#   poster.png             quadro cheio no instante --poster (padrão: 40% da duração)
#   revisao.json           janela mais rápida, batidas paradas, salto da emenda
import sys, json, subprocess, argparse, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument('video')
ap.add_argument('--saida', default='out')
ap.add_argument('--beats')
ap.add_argument('--poster', type=float)
ap.add_argument('--de', type=float, default=0)
ap.add_argument('--ate', type=float, default=1e9)
a = ap.parse_args()
os.makedirs(a.saida, exist_ok=True)
S = lambda n: os.path.join(a.saida, n)


def sonda(v):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height,r_frame_rate:format=duration', '-of', 'json', v], capture_output=True, text=True, check=True)
    j = json.loads(r.stdout)
    st = j['streams'][0]
    n, d = st['r_frame_rate'].split('/')
    # a duração do vídeo vem do stream de vídeo (o áudio pode ser mais longo, ex.: assinatura emendada)
    r2 = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', v],
                        capture_output=True, text=True)
    dur = float(r2.stdout.strip() or j['format']['duration'])
    return st['width'], st['height'], float(n) / float(d), dur


def quadros(v, filtro, w, h, extra=(), depois=()):
    """Decodifica com um filtro e devolve um array (n, h, w, 3). extra: opções de entrada; depois: de saída."""
    cmd = ['ffmpeg', '-v', 'error', *extra, '-i', v, '-vf', filtro, *depois, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


def fonte(tam):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSansMono-Bold.ttf',
              '/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf']:
        if os.path.exists(f):
            return ImageFont.truetype(f, tam)
    try:
        return ImageFont.load_default(size=tam)
    except TypeError:
        return ImageFont.load_default()


def folha(imgs, rotulos, cols, saida, pad=10):
    h, w = imgs[0].shape[:2]
    rows = (len(imgs) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (w + pad) + pad, rows * (h + pad) + pad), (128, 128, 128))
    d = ImageDraw.Draw(sheet)
    f = fonte(max(12, w // 14))
    for i, (im, r) in enumerate(zip(imgs, rotulos)):
        x, y = pad + (i % cols) * (w + pad), pad + (i // cols) * (h + pad)
        sheet.paste(Image.fromarray(im), (x, y))
        tb = d.textbbox((0, 0), r, font=f)
        d.rectangle([x, y + h - (tb[3] - tb[1]) - 10, x + tb[2] - tb[0] + 10, y + h], fill=(255, 255, 0))
        d.text((x + 5, y + h - (tb[3] - tb[1]) - 7 - tb[1]), r, fill=(0, 0, 0), font=f)
    sheet.save(saida)


W, H, FPS, DUR = sonda(a.video)
fim = min(DUR, a.ate)
rel = {'video': a.video, 'largura': W, 'altura': H, 'fps': FPS, 'duracao': round(DUR, 3)}
esc = lambda larg: (larg, int(round(H * larg / W / 2)) * 2)

# ---------- folha de contato: 2 quadros por segundo ----------
fw, fh = esc(240)
# seleção por número de quadro (o filtro fps pega o quadro do meio do intervalo e desloca os rótulos)
def cada(seg):
    passo = round(seg * FPS)
    n0, n1 = round(a.de * FPS), round(fim * FPS) - 1
    ns = [n for n in range(n0, n1 + 1) if n % passo == 0]
    return f"select='between(n\\,{n0}\\,{n1})*not(mod(n\\,{passo}))'", ns
filt, ns = cada(0.5)
fq = quadros(a.video, f"{filt},scale={fw}:{fh}", fw, fh, (), ('-vsync', '0'))
folha(list(fq), [f'{n / FPS:.1f}s' for n in ns], 10 if W < H else 6, S('folha-de-contato.png'))

# ---------- energia de movimento por quadro (90 px de largura, cinza) ----------
mw, mh = esc(90)
mq = quadros(a.video, f'scale={mw}:{mh}', mw, mh).astype(np.float32).mean(axis=3)
dif = np.abs(np.diff(mq, axis=0)).mean(axis=(1, 2))           # dif[i] = mudança do quadro i para o i+1
t_q = lambda i: i / FPS
dentro = np.array([a.de <= t_q(i) < fim for i in range(len(dif))])
# janela de 12 quadros com mais movimento somado (favorece ação rápida sustentada, não um corte isolado)
jan = np.convolve(np.where(dentro, dif, 0), np.ones(12), 'valid')
i0 = int(np.argmax(jan))
rel['acao_mais_rapida'] = {'de': round(t_q(i0), 3), 'ate': round(t_q(i0 + 12), 3), 'energia': round(float(jan[i0]), 2)}
tw, th = esc(270)
tq = quadros(a.video, f'scale={tw}:{th}', tw, th, ('-ss', f'{t_q(i0):.4f}'), ('-frames:v', '12'))
folha(list(tq), [f'{t_q(i0 + k):.3f}s' for k in range(len(tq))], 6, S('tira-acao-rapida.png'))

# ---------- teste de celular: 360 px de largura reais ----------
cw, ch = esc(360)
filt, ns = cada(2)
cq = quadros(a.video, f"{filt},scale={cw}:{ch}", cw, ch, (), ('-vsync', '0'))
folha(list(cq), [f'{n / FPS:.0f}s' for n in ns], 5, S('teste-celular.png'), pad=6)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-vf', f'scale={cw}:{ch}', '-c:v', 'libx264', '-crf', '20',
                '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', S('teste-celular.mp4')], check=True)

# ---------- teste de loop: duas voltas + a emenda ----------
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-stream_loop', '1', '-i', a.video, '-c', 'copy', S('teste-de-loop.mp4')], check=True)
n = len(mq)
ult = quadros(a.video, f"select='gte(n\\,{n - 6})',scale={tw}:{th}", tw, th, (), ('-vsync', '0'))[-6:] if n > 6 else []
pri = quadros(a.video, f"select='lt(n\\,6)',scale={tw}:{th}", tw, th, (), ('-vsync', '0'))[:6]
folha(list(ult) + list(pri), [f'fim-{6 - k}' for k in range(len(ult))] + [f'início+{k}' for k in range(len(pri))], 6, S('emenda-loop.png'))
salto = float(np.abs(mq[-1] - mq[0]).mean())
med = float(np.median(dif))
rel['emenda_loop'] = {'salto': round(salto, 2), 'mediana_entre_quadros': round(med, 2),
                      'veredito': 'tranco' if salto > max(6 * med, 8) else 'ok'}

# ---------- batidas paradas ----------
if a.beats:
    b = json.load(open(a.beats))['beats']
    paradas = []
    por_batida = []
    for k in range(len(b)):
        t0, t1 = b[k], (b[k + 1] if k + 1 < len(b) else min(b[k] + (b[1] - b[0]), DUR))
        i, j = int(t0 * FPS), int(t1 * FPS)
        e = float(dif[i:j].sum()) if j > i else 0
        por_batida.append(e)
    m = float(np.median(por_batida)) if por_batida else 0
    for k, e in enumerate(por_batida):
        if a.de <= b[k] < fim and e < 0.12 * m:
            paradas.append({'batida': k, 't': b[k], 'energia': round(e, 2)})
    rel['batidas_paradas'] = paradas
    rel['mediana_por_batida'] = round(m, 2)

# ---------- pôster ----------
tp = a.poster if a.poster is not None else 0.4 * DUR
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tp:.3f}', '-i', a.video, '-frames:v', '1', S('poster.png')], check=True)
rel['poster'] = tp

json.dump(rel, open(S('revisao.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(rel, ensure_ascii=False, indent=1))
