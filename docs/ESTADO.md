# Estado | deckss-vfs
Sessão 1: roteiro aprovado. Música editada em 3 blocos (films/deckss-vfs/musica-edit.wav, gerada de musica.mp3, não versionadas):
A 8.074-14.700, B 14.700-21.694, C 49.670-66.30 (fade 15.3 s). Grade 163 BPM, compasso em k%4==2. Banda k18 (6.626), voz ~7.33, refrão k38 (13.988).
Filme em planos/filme.js (um plano só, cenas por batida). Recortes: prep/recortes.py e prep/colagem.py -> assets/rec.
Fontes: Bangers (apoio), Figtree (player). Título e logo = arte original recortada.
render.mjs: usa /opt/pw-browsers/chromium e mistura musica-edit.wav automaticamente.
Crítica: docs/registro-de-critica.md (rodada 2: tudo >= 8). Render final: out/deckss-vfs.mp4 -> resultados/.
Magnific: capa animada no Kling 2.5 (2 versões, 650 créditos). Usada a versão B (título intacto); quadros em assets/viva (30 fps, 151), clipe original em assets/capa-viva-kling.mp4. Rede: pikaso.cdnpk.net e ak-data.magnific.com liberados no ambiente.
Sessão 2 (v4): tipografia e câmera do Lyric Deckss (branch ccr-9c2f80cf-a5yd25, films/deckss-lyric).
- lib/lettering.js copiado do lyric (LT.palavra/LT.escorre), fontes Sedgwick, Permanent Marker, Anton; assets/tex/fill-*.png.
- Câmera global: cam gira em rotateX/Y sob a perspective do plano (CAMK + CHICOTES, borrão pela velocidade), escala 1.05.
- Assinatura em mundo 3D (projeção à mão do refrão 3D do lyric): GRUPOS título -> bloco "EM BREVE / EM TODAS /
  PLATAFORMAS / DE STREAMING" (TEXTO, câmera segue a palavra a 12%) -> logo DECKSS (chicote em k78.6).
- Removidos "01.12" e "PRÉ-SAVE NA BIO"; fita do refrão virou "EM BREVE" (Anton). Bangers saiu.
