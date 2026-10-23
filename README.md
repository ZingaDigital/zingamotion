# zingamotion
Skills de Motion Design Profissionais

## motion-reel
Vídeo de produto, lançamento ou showreel em motion graphics renderizado a partir de código: cada filme é uma página
HTML em que `window.seek(t)` desenha o quadro do instante t; o Chromium (Playwright) fotografa quadro a quadro e o
ffmpeg codifica (H.264, CRF 16). Trilha e efeitos sintetizados em código, mixados em -14 LUFS, batidas na grade medida.

A skill fica em `.claude/skills/motion-reel/` e carrega sozinha em qualquer sessão do Claude Code aberta com este
repositório. Para usar em outro lugar: copie a pasta para `~/.claude/skills/` (local) ou envie o zip dela nas
Skills da conta do claude.ai.

Como acionar: traga as referências e um prompt simples ("vídeo de lançamento de 15 s em 9:16 para <produto>, <url>").

| Pasta | O que tem |
|---|---|
| `SKILL.md` | papel, regime econômico (um agente só), pipeline com portões, revisão de diretor, regras duras |
| `motor/` | `render.mjs` (render, contato, tira, verify, rascunho, formatos, trechos), `sfx.mjs` (som e loudness), `beats.py` (medir, grade, checar), `revisao.py` (folha de contato, ação mais rápida, teste de celular, loop, pôster), `emenda.py` (re-render por trecho), `captura.mjs` (logo, cores, fontes e capturas do site) |
| `modelo/` | filme inicial: contêiner que muda de estado, cursor que conduz, legenda, grão, trilha por compassos a 120 BPM |
| `prompts/critica.txt` | passada de crítica com notas e os 3 maiores problemas |
| `docs-modelo/` | lista de planos, guia de animação, estado da produção, regras do estúdio |

`CLAUDE.md` na raiz traz as regras do estúdio que valem para todo filme deste repositório.
