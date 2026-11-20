# Estado da produção: ferias (aviso de férias Zinga 2026/27)

- Etapa atual: 10 entrega da v3 (pausas de leitura de 1 s nos 3 primeiros takes + logo reveal no estilo de refs/logo/ref-logo.mp4)
- Aprovado pelo cliente: conceito "bateria criativa" e uso das skills motion-reel + zinga-motion (19/11/2026).
  Datas CONFIRMADAS pelo cliente: férias a partir de sábado, 19/12/2026; volta segunda, 04/01/2027.
- Última versão: resultados/ferias-v2-desenhado.mp4 (20,0 s, -14,1 LUFS, pico -1,7 dBTP, pior erro de sincronia 10 ms,
  emenda do loop ok). Capa: resultados/capa-reels-v2.png (18,5 s). Guia de estilo da v2: docs/guia-de-estilo.md.
- Como refazer: copiar design-system-zinga/fonts/Switzer-Variable.woff2 para films/ferias/fonts/; `node render.mjs films/ferias`;
  cortar em 20 s (o áudio tem 1 s de cauda): ffmpeg -t 20 -c:v copy -af afade=t=out:st=19.92:d=0.08.
- Próximos passos: confirmar o sentido do dia 18; versão 4:5 se for postar como foto no feed; engordar o quadro de 2,0 s.
- Decisões que não se discute de novo: 20 s a 120 BPM; 9:16 com informação em y 260 a 1480 (recorte 3:4 do perfil
  + área segura dos Stories); Switzer só local (repo público, licença ITF FFL proíbe redistribuir); logo de
  assets/logo.svg (logo-tokenizado do design system); sem hashtags na arte (vão na legenda); sem brilho em UI.

## v3 (20/11/2026)
- Duração 28 s (56 batidas). Pausas de leitura: o roteiro segura 1 s em 1,5 / 4,0 / 6,0 s do tempo antigo (G.virtual em
  index.html); planos p1 a p5 continuam escritos no tempo antigo, o p6 (logo) em tempo real (p.real). Efeitos sonoros dos
  planos antigos passam por um proxy que empurra cada evento pro tempo real (G.real); a trilha (som.js) é escrita em tempo real.
- Logo reveal p6: 23,0 a 28,0 s. Ligadura gigante, flash navy de contorno (23,375), zoom, letras recolhem no ponto (24,0),
  ponto vai pro lugar (24,5), barra (24,75), logo pousa (25,0), wipe (27,0), rosa encolhe até o 1º dia da grade (27,35).
- Logo centralizado sobre degradê: exceção pedida pelo cliente com a referência do próprio reveal da marca.
