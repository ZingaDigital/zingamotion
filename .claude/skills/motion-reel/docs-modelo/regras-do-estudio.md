# Regras do estúdio de motion (copie para o CLAUDE.md da raiz do projeto)

## Contrato de render
- Todo filme é uma função pura do tempo: `window.seek(t)` desenha o quadro do instante t.
- Sem transições de CSS, sem setTimeout, sem requestAnimationFrame no modo de render,
  sem estado carregado de um quadro pro outro. Ruído só com semente (mulberry32), nunca Math.random.
- Renderiza com `node render.mjs`, codifica em H.264 yuv420p, CRF 16.

## Visual
- Padrões proibidos: título centralizado em cima de gradiente, tudo entrando com fade,
  etiquetas nos cantos e molduras no quadro, brilho (glow) em interface, explosão genérica de partículas, easing quicando.
- Uma fonte de título, uma fonte de interface. Uma cor de destaque, a não ser que o briefing diga outra coisa.
- A cada 2 a 4 segundos alguma coisa nova tem que acontecer na tela.

## Som
- Trilha e efeitos são sintetizados em código, a não ser que o cliente forneça uma música.
- Os acertos sonoros caem na grade de batidas medida (beats.json). Volume em -14 LUFS, pico real até -1 dBTP.
