# Emenda trechos re-renderizados num filme já pronto, com precisão de quadro (só os segundos que mudaram).
#
# Uso: python3 tools/emenda.py out/filme.mp4 out/filme-t1.mp4@0 out/filme-t2.mp4@14.6 [--audio out/x.mp4] -o out/novo.mp4
#   Cada trecho é "arquivo@instante_de_início" (o instante em que o trecho começa no filme, múltiplo de 1/fps).
#   Os trechos saem de: node render.mjs <pasta> --from A --to B --no-audio --nome tN
#   --audio: arquivo de onde vem o áudio (padrão: o próprio filme base). O áudio pode ser mais longo que o vídeo.
import sys, subprocess, json, argparse

ap = argparse.ArgumentParser()
ap.add_argument('base')
ap.add_argument('trechos', nargs='+')
ap.add_argument('--audio')
ap.add_argument('-o', '--saida', required=True)
ap.add_argument('--crf', default='16')
a = ap.parse_args()


def info(v):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                        'stream=r_frame_rate,nb_read_packets', '-of', 'json', v], capture_output=True, text=True, check=True)
    s = json.loads(r.stdout)['streams'][0]
    n, d = s['r_frame_rate'].split('/')
    return float(n) / float(d), int(s['nb_read_packets'])


fps, total = info(a.base)
tr = []
for x in a.trechos:
    arq, t0 = x.rsplit('@', 1)
    f2, n = info(arq)
    if abs(f2 - fps) > 1e-6:
        sys.exit(f'{arq}: fps {f2} diferente do filme ({fps})')
    q0 = round(float(t0) * fps)
    tr.append((q0, n, arq))
tr.sort()
for (q0, n, arq), prox in zip(tr, tr[1:] + [(total, 0, '')]):
    if q0 + n > prox[0]:
        sys.exit(f'{arq} se sobrepõe ao trecho seguinte')

entradas = ['-i', a.base] + sum((['-i', arq] for _, _, arq in tr), [])
partes, filtro, cursor = [], [], 0
for k, (q0, n, _) in enumerate(tr):
    if q0 > cursor:
        filtro.append(f'[0:v]trim=start_frame={cursor}:end_frame={q0},setpts=PTS-STARTPTS[b{k}]')
        partes.append(f'[b{k}]')
    filtro.append(f'[{k + 1}:v]setpts=PTS-STARTPTS[t{k}]')
    partes.append(f'[t{k}]')
    cursor = q0 + n
if cursor < total:
    filtro.append(f'[0:v]trim=start_frame={cursor}:end_frame={total},setpts=PTS-STARTPTS[bf]')
    partes.append('[bf]')
filtro.append(''.join(partes) + f'concat=n={len(partes)}:v=1:a=0[v]')

aud = ['-i', a.audio] if a.audio else []
ia = len(tr) + 1 if a.audio else 0
cmd = ['ffmpeg', '-v', 'error', '-y', *entradas, *aud, '-filter_complex', ';'.join(filtro), '-map', '[v]', '-map', f'{ia}:a?',
       '-c:v', 'libx264', '-preset', 'slow', '-crf', a.crf, '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', a.saida]
subprocess.run(cmd, check=True)
f3, n3 = info(a.saida)
print(f'{a.saida}: {n3} quadros (base {total}); trechos: ' + ', '.join(f'{q0 / fps:.3f}s +{n}q' for q0, n, _ in tr))
