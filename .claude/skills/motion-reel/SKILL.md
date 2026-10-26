---
name: motion-reel
description: Faz um vídeo de produto ou showreel em motion graphics renderizado a partir de código. Use quando o usuário pedir vídeo de lançamento, showreel, reel de produto, explicativo animado, apresentação de interface, SAAS ou anúncio em motion. Render próprio (HTML + window.seek(t) + Playwright + ffmpeg), sem Remotion nem Hyperframes.
---

# Motion reel

Você é o diretor, o animador mais exigente de motion design, o designer de som e o engenheiro de render, tudo em
código. O usuário traz referências e um prompt simples; o resto você deduz, pesquisa e propõe.

## Regime de trabalho (vale acima de tudo)

- **Um agente só. Nunca distribua em subagentes.** Custa o dobro de tokens e já fez a produção se perder. Faça direto.
- **Produção de várias sessões.** Não corra para o render final. O estado vive em `docs/ESTADO.md` (modelo em
  `docs-modelo/`): atualize ao fim de cada sessão; a próxima começa lendo só ele, sem re-derivar nada.
- **Gaste pouco.** Leia só o trecho que vai editar (`grep -n`, `sed -n`). Por rodada de crítica, abra UMA folha
  de contato e só as tiras dos trechos que mudaram. Re-renderize só os segundos afetados (`--from/--to` + `emenda.py`).
  Som que mudou: refaça só o áudio (`sfx.mjs`). Render longo: em segundo plano, espere com um laço `until`.
- **Precisão onde importa.** Batida sonora dentro de 1 quadro (33 ms). Fora isso, nada de perseguir milissegundo:
  é imperceptível.
- Mostre progresso em uma linha por etapa. Antes de entregar, diga o que mudou, a duração, LUFS e a sincronia.

## Entradas pra coletar primeiro
Produto + URL, duração, formatos (9:16 / 1:1 / 16:9), cores e fontes da marca,
uma referência (quadro, vídeo ou pasta de imagens), música (arquivo ou "sintetizar").
Pergunte só o que bloqueia (produto/URL). Padrões quando o usuário não diz: 15 s, 9:16, trilha sintetizada a
120 BPM, fundo neutro e quente, cores e fontes tiradas do site.

## Montagem do projeto (uma vez)
```bash
SK=.claude/skills/motion-reel            # ou a pasta onde esta skill está instalada (~/.claude/skills, Cowork...)
cp $SK/motor/* .                          # render.mjs sfx.mjs beats.py revisao.py emenda.py captura.mjs
mkdir -p films docs out resultados && cp -r $SK/modelo films/<filme>
cp $SK/docs-modelo/*.md docs/ && cat docs/regras-do-estudio.md >> CLAUDE.md
npm i -D playwright                       # Chromium: use o do sistema se houver (PLAYWRIGHT_BROWSERS_PATH)
```
Fora da nuvem (computador, Cowork), confira uma vez: `node -v` (20+), `ffmpeg -version`, `python3 -c "import numpy, PIL"`.
O que faltar: `npx playwright install chromium`, ffmpeg pelo gerenciador do sistema (brew, apt, winget),
`pip install numpy pillow`. Sem ffmpeg não há render; diga isso ao usuário em vez de contornar.

## Referências e entradas
- Referência (link ou `./refs/`): `yt-dlp -o refs/ref.mp4 <link>`; quadros a cada 0,5 s com
  `ffmpeg -i refs/ref.mp4 -vf "select='not(mod(n\,15))'" -vsync 0 refs/frames/q%03d.png` (30 fps; ajuste o 15).
  Pega a GRAMÁTICA (ritmo, transições, câmera, tipografia, textura), nunca o conteúdo, os logos ou os personagens.
  Se o proxy bloquear o site (x.com bloqueou), baixe pelo sandbox do Firecrawl e traga em base64 por partes.
- Logo, cores, fontes e capturas de interface reais do produto: `node captura.mjs <url> --saida films/<filme>/assets`.
  Abra as capturas: slider pego no meio da animação → recapture ou recomponha o texto por cima com a cor medida.
  Nunca redesenhe a interface de imaginação. Logo oficial em vetor quando existir (manual da marca, Drive).
- Reaproveita o motor `seek(t)`, as molas de `lib/motion.js`, o `beats.py` e o `sfx.mjs`.
- Música: sintetiza uma trilha original de 120 BPM em código (`Z.trilha`). Mede com `beats.py` primeiro.

## Visual
Fundo neutro e quente, as cores da marca, uma cor de destaque. Interface real do produto, recortada e animada.
Um contêiner que nunca corta: ele se transforma de estado em estado (`Z.estado`) e um cursor conduz cada mudança
(`Z.cursorSeek`), clicando na batida. Câmera nunca parada: dolly leve, rotação 3D de 2 a 6 graus, impulso nos picos.
Proibido: texto centralizado em gradiente, tudo entrando com fade, brilhos, explosão de partículas, easing quicando,
tempo morto, etiquetas nos cantos e molduras.

## Roteiro de batidas (preencha em docs/lista-de-planos.md)
gancho (0:00 a 0:02): [A IMAGEM MAIS FORTE DO FILME]
ato 1 a ato 4: [O QUE ACONTECE], cada ato com sua recompensa visual
fim: assinatura com o logo + "[CHAMADA FINAL]"; o último quadro prepara o primeiro (loop)
Uma recompensa visual nova a cada 3 a 5 segundos; alguma coisa nova a cada 2 a 4.

## Pipeline
1. Coleta os materiais da URL com Playwright (`captura.mjs`) em `assets/`. Lista o que achou.
2. Se existe referência, escreve `docs/guia-de-estilo.md` a partir dela: paleta medida em pixels, tipografia,
   ritmo (BPM medido com `beats.py medir`), catálogo de transições com instante, câmera, textura, entrada/saída de
   texto, conflitos com as regras do estúdio e a tradução para a marca.
3. Mede ou sintetiza a música. `beats.py` → `beats.json`.
   Sintetizada: `node sfx.mjs films/<filme> --opcoes '{"foley":false}' --wav out/trilha.wav`, depois
   `python3 beats.py medir out/trilha.wav --bpm 120`. Música do cliente: `python3 beats.py medir musica.mp3`.
   Grade exata, se preferir: `python3 beats.py grade --bpm 120 --duracao 15`.
4. Escreve `docs/lista-de-planos.md` na grade de batidas (todo plano: quadros, câmera, texto, efeito sonoro, saída).
   Mostra e espera o OK. Se houver lembrete agendável (send_later / ScheduleWakeup), agenda 10 min; sem resposta
   até lá, segue. Escreve `docs/GUIA-DE-ANIMACAO.md` antes de programar.
5. Constrói `index.html` com `window.seek(t)` usando as molas de `lib/motion.js` e o núcleo (`lib/nucleo.js`).
   Segue o CLAUDE.md. Ordem: quadro parado de cada plano (`render.mjs --at`, um instante por plano) → folha →
   crítica → animático (`render.mjs --rascunho`: metade da resolução, 15 fps, trilha provisória) → acerta o ritmo →
   animação completa → acabamento → som (o foley de cada plano em `som(S)`, na grade) → `--verify`.
6. Folha de contato → passada de crítica (`prompts/critica.txt`) → correção. No mínimo 3 rodadas; cada rodada cobre
   todos os planos numa folha só. Material da rodada: `python3 revisao.py out/<filme>.mp4 --saida out/revisao-rN
   --beats films/<filme>/beats.json` (folha a 2 quadros/s, 12 quadros seguidos da ação mais rápida, teste de celular
   a 360 px, emenda do loop, batidas paradas). Notas e os 3 maiores problemas em `docs/registro-de-critica.md`,
   tabela por rodada. Corrige, re-renderiza só os segundos afetados:
   `node render.mjs films/<filme> --from A --to B --no-audio --nome t1` e
   `python3 emenda.py out/<filme>.mp4 out/<filme>-t1.mp4@A --audio <fonte do som> -o out/<filme>-rN.mp4`.
   Repete até toda nota ser 8 ou mais.
7. `node render.mjs films/<filme>` (vídeo + `sfx.mjs` embutido: trilha, efeitos, música opcional, -14 LUFS,
   pico ≤ -1 dBTP) → `out/final.mp4`, em todos os formatos (`--formato 1x1`, `--formato 16x9`; a página lê
   `?formato=` e recompõe). Confere: `python3 beats.py checar out/final.mp4 films/<filme>/beats.json`.
8. Entrega `final.mp4`, `folha-de-contato.png`, `poster.png`, `teste-de-loop.mp4` e `README.md`. Versões numeradas
   em `resultados/` (ex.: `09-diretor.mp4` antes da crítica final, `10-depois-da-critica.mp4` depois). Diz o que
   melhoraria em seguida.

## Revisão de diretor (antes de toda entrega)
Gera a folha de contato (2 quadros por segundo), a tira de 12 quadros seguidos em volta da ação mais rápida e o teste
de celular (360 px de largura) do último vídeo (`revisao.py`). Abre os três e olha de verdade. Nota de 1 a 10 em:
gancho nos 2 primeiros segundos · leitura em tela de celular · qualidade do movimento (molas, nenhum quadro morto) ·
variedade · composição · profundidade · fidelidade à marca · sincronia do som · acabamento. Lista os 3 maiores
problemas com o tempo exato. Procura especificamente: texto se sobrepondo nas trocas, coisa deslizando em vez de
acelerar e frear, etiquetas nos cantos e molduras, planos centralizados em gradiente, texto borrado por escala,
batida morta sem nada acontecendo, tranco na emenda do loop. Corrige, re-renderiza só os segundos afetados, mostra a
folha nova e as notas numa tabela por rodada. Seja um diretor exigente, não um autor orgulhoso.

## Regras duras
- Só interface real do produto. Nunca inventa tela. Nenhum logo de terceiro sem o usuário pedir.
- Nenhum número de resultado inventado: só o que está no site ou o que o usuário der.
- Sem Math.random, sem timers, sem transições de CSS no modo de render (o `render.mjs` reprova).
- Proibido: etiquetas nos cantos, título centralizado em gradiente, tudo entrando com fade.
- Texto essencial dentro da área segura do formato (`Z.SEGURO`) e legível a 360 px.
- Toda batida sonora na grade medida, dentro de 1 quadro. -14 LUFS, pico real até -1 dBTP.
- Interface real, mas tipografia legível: se a captura for densa demais para o celular, recorta e aproxima a câmera.

## Arquivos da skill
- `motor/render.mjs` render determinístico (contato, tira, verify, rascunho, formatos, trechos) · `motor/sfx.mjs` som,
  música, loudness e mux · `motor/beats.py` medir/grade/checar · `motor/revisao.py` material da crítica ·
  `motor/emenda.py` emenda de trechos · `motor/captura.mjs` coleta do site.
- `modelo/` filme inicial: `index.html` (FILM, ready, seek, renderAudio com opções), `lib/motion.js` (molas, curvas
  100/50, kick, stretch, mulberry32), `lib/audio.js` (síntese: kick, clap, hat, bass, chord, pluck, pop, click,
  swoosh, riser, impact, zip, ding), `lib/nucleo.js` (planos, contêiner, cursor, legenda, grão, borrão, trilha por
  compassos), `planos/exemplo.js` (gramática do contêiner + cursor).
- `prompts/critica.txt` passada de crítica · `docs-modelo/` lista de planos, guia de animação, estado, regras.
- Respiro de leitura sem quebrar a música: insira batidas inteiras (estique um compasso) e desloque os planos
  seguintes; nunca desacelere a imagem sozinha.
