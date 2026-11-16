# Estado da produção: nexa-emais

Pedido: refazer o showcase do site Nexa Performance tirando a abertura "Um novo site para a Nexa Performance",
pondo só "e mais..." e seguindo do celular entrando, com música e efeitos.

## Como está feito
- Imagem: `films/nexa-emais/compor.py` (Python, função pura de t). Usa o vídeo de referência decodificado em
  `refs/all.rgb` e o fundo limpo `refs/plate.npy` (média dos 12 primeiros quadros). Regerar:
  `ffmpeg -i refs/ref.mp4 -f rawvideo -pix_fmt rgb24 refs/all.rgb` e o plate (ver histórico).
  - Título antigo apagado: quadros 0-78 trocam a faixa y 0-850 pelo fundo; 79-89 separam texto rosa por
    mínimos quadrados (pixel = alfa*rosa + u*fundo) e protegem o corpo do celular abaixo do bezel.
  - Tempo reamostrado (NOS): cada início de rolagem do original cai na colcheia de 90 BPM.
  - "e mais..." em Outfit 700 132 px, branco + reticências rosa #F40853, mesma gramática do original
    (entra com desfoque e sobe ao sair). e 0.167, mais 0.333, pontos 0.667/0.833/1.0, saída 2.30-2.52.
- Som: `films/nexa-emais/index.html` (window.renderAudio). 90 BPM, Fá menor (Fm Db Ab Eb). Intro sem bateria,
  queda em 2.667 (celular), groove até o corte 12.333, card final com pad + ding em 12.833.
- Render: `python3 films/nexa-emais/compor.py --saida out/video.mp4` e
  `node sfx.mjs films/nexa-emais --video out/video.mp4 --saida out/nexa-emais.mp4`.

## Medições (versão 01)
15,0 s · 1080x1350 · -14 LUFS · pico -1,4 dBTP · batidas com bateria (2.667 a 12.667) entre 2 e 17 ms.
Intro e card final sem bumbo de propósito: o checar acusa essas batidas.

## Próximos passos possíveis
- Formato 9:16 (o original é 4:5).
- Trocar a trilha por música do cliente (sfx.mjs --musica).
