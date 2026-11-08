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
