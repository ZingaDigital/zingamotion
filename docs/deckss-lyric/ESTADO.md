# Estado | deckss-lyric (lyric video "Vai Fazer Sentido", 16:9)

Sessão 1: 5 modelos de estilo para aprovação, cada um com 10,3 s no mesmo trecho (faixa 14,30 a 24,60 s, versos 1 a 4).
- Pastas: films/lyric-m1..m5 (links para films/deckss-lyric; só muda modelo.js -> modelos/mN.js). Render: node render.mjs films/lyric-mN.
- Música do cliente em films/deckss-lyric/audio/musica.mp3 (3:17,4, 163 BPM). Não versionada.
- Voz separada localmente com Spleeter 2 stems (audio/vocals.wav). Upload pro Magnific foi negado pelo controle de permissão.
- Tempo das palavras: onsets da voz separada (comum.js, LETRA). Voz entra em 15,06 s; 13,5 a 14,9 é guitarra vazando.
  Versos 1-8 começam em ~15,06 · 16,68 · 19,78 · 21,64 · 24,20 · 27,00 · 31,74 · ~33,6. Refrão ~49,9.
- Fontes (Google Fonts, latin): M1 Permanent Marker, M2 Sedgwick Ave Display, M3 Caveat Brush, M4 Knewave, M5 Rubik Wet Paint.
- Texturas: prep/texturas.py -> tex/ (papel creme, muro, sujeira, retícula, xerox dos recortes).
- Referência (blink-182 "More Than You Know" lyric video): YouTube bloqueado no proxy, não foi possível baixar quadros.
- Drive do cliente: pasta não visível pela conta conectada (pede login). Aguardando os vídeos.
- Armadilha paga: perspective/preserve-3d no Chromium gera quadro diferente conforme o histórico (verify falha). Use skew+scaleX.
Próximo: cliente escolhe o modelo -> cronometrar a música inteira (versos e refrões) e montar o filme completo (3:17).

Sessão 2: cliente escolheu o 5 misturado com tipografia/fundo do 1 e do 2, várias fontes, lettering encaixado em bloco
na tela toda, palavras na vertical. Modelo 6 (films/lyric-m6, modelos/m6.js): 15,45 s do refrão (faixa 58,95 a 74,40),
de "Ainda existe um lugar" até "Vai fazer sentido" + arte do título na nota longa (73,25). Quatro fontes por pedido do
cliente (exceção à regra de uma fonte de título). Bloco: linhas justificadas + coluna vertical, escolha automática da
quebra (mascara força uma quebra), esticado em Y até 1,7x para fechar a tela. Aguardando aprovação e os vídeos do cliente.

Sessão 3: cliente achou o lettering amador e pediu TODA letra igual à arte do título. Novo motor lettering.js:
borda áspera (feTurbulence+feDisplacementMap), fio escuro, contorno preto grosso, filete creme/amarelo, sombra,
preenchimento tex/fill-creme.png ou tex/fill-fogo.png (prep/preenchimentos.py) e pingos ancorados no pé real das letras.
Fontes: Sedgwick (principal) + Permanent Marker (~28%). Acento: o preenchimento precisa de padding em cima (0.32em).
Letra inteira marcada em letra.json (prep/marca_letra.py): janelas por verso à mão + âncoras do Parakeet v3
(sherpa-onnx, modelo do GitHub, voz separada) + onsets. Refrão 2 = refrão 1 + 65,1 s; refrão 3 = + 106,6 s.
Correção: "Vai" do 1º refrão em 72,08 (não 71,23).
Material da banda: films/deckss-lyric/footage (vídeos do cliente, quadros em footage/q/<nome>, fotos/ recortes da selfie).
Vocal de preto (3 vídeos), guitarrista Volcom (4 vídeos + foto), cantor de moletom verde (1 vídeo de 2 s);
baixista, camisa do Grêmio, jaqueta e quem fez a selfie só aparecem na foto de grupo.
Aprovação v2: films/lyric-m7 (modelos/m7.js), mesmos 15 s do refrão.

Sessão 4: cliente mandou 6 vídeos novos (vocal camiseta cinza, baixista, baterista, guitarrista 2, estúdio, guitarra).
Pediu: só vídeo (nada de foto parada), rosto como fundo de lettering, prioridade a rostos, animação como a referência
do blink-182 (vista pelo embed do YouTube via Firecrawl: P&B alto contraste, papel com buraco rasgado, palavras
gigantes estourando a tela, cortes secos), texturas grunge e ruído.
- footage/pb/<clip>: 14 vídeos em P&B (prep/extrai_pb.sh). Rostos: footage/rostos-manual.json [cx, cy, tamanho] por clipe
  (Haar falhou nos perfis; centros marcados à mão e conferidos). Sem rosto: guit-0043, guit-1006, vocal-7503.
- Lettering pré-renderizado: node films/deckss-lyric/prep/letras.mjs -> letras/<hash>.png + indice.json (144 palavras,
  6 min). Render do filme virou ~19 s por segundo de vídeo em 1 processo (antes 150 s/s).
- motor-lyric.js: Video (rosto enquadrado), furo (papel rasgado evenodd), Palavra/bloco/escorre, Grunge.
- Aprovação v3: films/lyric-m8 (modelos/m8.js).

Sessão 5: nova direção (colagem). Refs: artifact "Biblioteca de Motion Zinga" > collage.mp4 (recortes P&B bitmap com borda
branca, papel amassado com faixas de luz, etiquetas, caneta) + Punk Goes Pop 5 (Memphis May Fire "Grenade", We Came As
Romans "Glad You Came"): encaixe de palavras pequenas empilhadas na altura da grande, palavra em perspectiva, palavra no chão.
Regras do cliente: vídeo nunca o tempo todo, intercalar fotos, um vídeo por vez (nunca dois juntos), vídeo na lateral
sempre com rosto, borda rasgada de verdade (nada de estrela), negativo onde a letra cruza o vídeo, lettering aprovado.
- footage/recorte/<n>-bit.png: recortes (u2net_human_seg do GitHub do rembg, prep/recorta.py).
- tex/papel-amassado.jpg (prep/papel.py). colagem.js: rasgado, PedacoVideo, Recorte, Fita, Rabisco, Letras (negativo:
  camada clipada no vídeo com cópia do vídeo + letras em grayscale/difference; mix-blend precisa do vídeo no mesmo contexto).
- ML.poeVideo aceita uso.box (caixa que o vídeo cobre). Fonte de apoio: Anton (etiquetas).
- 3 telas estáticas: films/lyric-telas (modelos/telas.js), shot-telas.mjs -> out/tela-N.png. Aguardando aprovação.

Sessão 6: refrão 1 aprovado na linguagem de colagem; cliente pediu câmera 3D seguindo as palavras (refs Punk Goes Pop),
horizontais em tela cheia como a v3 com menos textura (+ recortes nas laterais), verticais em faixa rasgada dividindo a tela.
- modelos/refrao3d.js (films/lyric-3d): mundo 3D com projeção à mão (camera × grupo × local, pai só com perspective, sem
  preserve-3d), um grupo por verso (montaBloco: pilhas em Anton na altura da palavra grande), câmera segue a palavra (22%),
  aproxima, olha de lado (sway) e chicoteia entre grupos com borrão pela velocidade. --verify acusa diferença de ~500 px
  (máx 42/765) por rasterização 3D: invisível, sem estado entre quadros.
- poeVideo: uso.vaivem (ida e volta para clipes curtos). window.GRUNGE_SUJ / VIDEO_TOM controlam textura.
