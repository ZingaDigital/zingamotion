# Guia de animação: [FILME]

Leia antes de programar qualquer plano. Vale para esta sessão e para as próximas: tudo o que foi decidido está aqui.

## Contrato
- `window.seek(t)` desenha o instante t. Toda posição é função de t; nada acumula de um quadro para o outro.
- Sem Math.random (use `M.mulberry32(semente)`), sem setTimeout/setInterval/requestAnimationFrame no render,
  sem transition/animation de CSS. Medidas de texto só em `montar`, nunca em `seek`.
- Um arquivo por capítulo em `planos/`, envolto em `(() => { ... })();`, registrado com `Z.plano({...})`.

## Movimento
- Entradas: `M.E.entra` (curva 100/50, cubic-bezier(.5,0,0,1)). Saídas: `M.E.sai` (cubic-bezier(1,0,.5,1)).
- Assentamento: `M.spring(t - t0, freq, zeta)` com zeta 0,4 a 0,65 (passa um pouco do ponto e assenta; nada de quicar).
- Impacto: `M.kick(t, t0, amp, freq, zeta)` na batida. Squash & stretch pela velocidade (`M.vel`, `M.stretch`).
- Nada desliza em velocidade constante. Todo movimento acelera e freia.
- Contêiner: `Z.estado(t, estados)` + `Z.poeEstado`. O miolo troca DENTRO dele enquanto a forma assenta.
- Cursor: `Z.cursor` + `Z.cursorSeek(cur, t, caminho)`. Chega uma colcheia antes do clique; o clique cai na batida.
- Legenda: `Z.legenda(pai, partes, { quebra })` + `Z.legendaSeek(L, t, entra, sai)`.

## Tipografia e cor
- Título e interface: Switzer (900 display, 600 títulos, 500 texto). Destaque: rosa #f50953 no tema azul, navy #002140 no tema rosa.
- Corpo mínimo na tela de 1080: 40 px para rótulo, 60 px para legenda (vira 13 e 20 px a 360 px).

## Armadilhas já pagas
- `visibility: visible` num filho aparece com o pai escondido: esconda grupos com `display: none`.
- Camada que nasce com `display: none` no CSS precisa de `display: 'block'` explícito para aparecer.
- z-index dos planos vaza para fora se o contêiner dos planos não tiver contexto próprio (`z-index` no pai).
- `<mask maskUnits="userSpaceOnUse">` sem x/y/width/height corta o que estiver fora da região padrão.
- Captura de site pega no meio de animação: cubra o texto com a cor medida da própria captura e recomponha.
- Som longo (sub, pad) por cima de uma batida esconde o bumbo; efeito que começa antes da batida também.

## Gramática zinga-motion traduzida pro seek(t) (lib/zg.js)
- `G.entra(t, t0, {de, dist, blur, s0, ry, mola})`: entra de uma direção, blur 12 a 0, opacidade só nos 30% iniciais.
- `G.sai(t, t0, {para, dist})`: saída quádrupla (posição in-exp + blur 0 a 20 + escala 0,94 + opacidade a partir de 35%).
- `G.palavrasSeek`: palavra a palavra, stagger 2 a 3 quadros; saída em escadinha de 2 quadros, mesma ordem da entrada.
- Direções: P1 sai pra esquerda, P2 entra da direita; P3 sai pra cima, P4 entra de baixo; P5 entra de baixo, datas da esquerda e de cima.
- Fundo troca em corte seco (G.TROCA = 8,36 s), quando o pill "Pausa" termina de cobrir a tela.
- Conflitos resolvidos a favor do estúdio: nada de glow (o zinga-motion pede), título alinhado à esquerda, nunca centralizado.
