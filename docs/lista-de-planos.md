# Lista de planos: ferias (aviso de férias Zinga 2026/27)

18 s · 9:16 (1080×1920) · 30 fps · 120 BPM (batida = 0,5 s) · 36 batidas · grade em films/ferias/beats.json
Área segura combinada: Stories escondem o topo e o rodapé, a grade do perfil mostra o recorte 3:4 do centro
(y 240 a 1680). Tudo que é informação fica entre y 260 e y 1480, x 72 a 940.
Material real: logo vetorial `logo-tokenizado.svg`, Switzer variável, tokens de cor e receitas de card do
`ZingaDigital/design-system-zinga`. Nenhuma foto, nenhuma tela inventada: o "escritório" é a própria linguagem
de ícones e cards da marca.

Conceito: **bateria criativa**. A agência é uma bateria que passou o ano descarregando. As férias são o
carregador. A barra que carrega é o próprio período de férias: começa em 18 DEZ e enche em 04 JAN.

## Roteiro de batidas
| Trecho | Batidas | Tempo | O que acontece | Recompensa visual |
|---|---|---|---|---|
| Gancho | 0 a 3 | 0:00 a 0:02 | grade de 365 dias de 2026 enchendo de rosa numa onda, contador "dia 001 → 365" | o ano inteiro preenchido em 2 s |
| Ato 1 | 4 a 7 | 0:02 a 0:04 | a grade vira caixa de entrada; 6 notificações empilham no ritmo | pilha crescendo e tremendo |
| Ato 2 | 8 a 11 | 0:04 a 0:06 | a pilha é sugada pra dentro de uma bateria gigante; 100% → 47% → 12% → 2% | número despencando a cada batida |
| Ato 3 | 12 a 15 | 0:06 a 0:08 | lâmpada das ideias pisca e apaga; cursor cansado arrasta até o botão "Pausa" | silêncio de meia batida antes do clique |
| Virada | 16 a 19 | 0:08 a 0:10 | clique: o botão rosa engole a tela; "Estamos de FÉRIAS." | troca de cor da peça inteira, trilha muda |
| Datas | 20 a 27 | 0:10 a 0:14 | "18 DEZ" cai; a bateria carrega enquanto os dias correm 19, 20 … 03; "04 JAN" cai com impacto | barra cheia = dia da volta |
| Fim | 28 a 35 | 0:14 a 0:18 | lâmpada acende de novo; "Voltamos com a bateria cheia e ideias novas."; logo zinga; segura legível 2 s | quadro final é o post fixado |

## Planos
### P1 · Ano cheio · 0,0 a 2,0 s (b0 a b3)
**Quadros:** fundo navy em degradê (surface → surface-deep). Grade 14 col × 26 lin (364 + 1) de quadradinhos
de 44 px, raio 10, em y 520 a 1480. Onda diagonal pinta de rosa da esquerda alta à direita baixa; no quadro 0
já tem ~30 dias pintados (nada de primeiro quadro vazio). À esquerda, acima da grade: overline "2026" em rosa,
contador "dia 001" → "dia 365" em Switzer Black 120 px.
**Câmera:** dolly-in 1,00 → 1,06 e rotateX 6° → 2°.
**Texto (b1):** "365 dias / de job." (headline bicolor: "de job." em rosa), 96 px, à esquerda.
**Efeito sonoro:** tique a cada semicolcheia acompanhando a onda; bumbo em b0.
**Saída:** a grade inteira se contrai num card (contêiner), que vira a caixa de entrada do P2.

### P2 · Caixa de entrada · 2,0 a 4,0 s (b4 a b7)
**Quadros:** cards no estilo `zg-card` (aresta em degradê) entrando alternados esquerda/direita, rotação ±3°,
cada um com tile de ícone + texto 46 px. Ordem, um por colcheia a partir de b4, acelerando:
"Só mais um ajustezinho" · "Reunião rápida (2h30)" · "arte_FINAL_v9_agora_vai.psd" · "Post pra hoje, 18h" ·
"Briefing novo chegando" · "Campanha de Natal: aprovada".
**Câmera:** cada card que pousa dá um tranco de 8 px na pilha (kick).
**Efeito sonoro:** pop de notificação em cada pouso, na colcheia.
**Saída:** b8, a pilha comprime de lado e entra na bateria.

### P3 · Bateria criativa · 4,0 a 6,0 s (b8 a b11)
**Quadros:** bateria horizontal gigante (contêiner: pilha → corpo da bateria), 860 × 380, contorno branco 10 px,
polo à direita. Preenchimento rosa cai em degraus na batida: b8 100% · b9 47% · b10 12% · b11 2%.
Número em Switzer Black 220 px descendo junto. Rótulo "Bateria criativa" 56 px.
**Efeito sonoro:** zip descendente em cada degrau, cada um mais grave.
**Saída:** a bateria encolhe para o canto esquerdo e vira detalhe do P4.

### P4 · As ideias pediram arrego · 6,0 a 8,0 s (b12 a b15)
**Quadros:** tile de lâmpada (glifo sólido novo na grade de 24 px) que pisca por ruído com semente e apaga em b13.
Headline "Até as ideias / pediram férias." ("pediram férias." em rosa). Pill rosa "Pausa" em y 1300.
Cursor entra devagar, com tremida de cansaço, chega em b15,5 e clica em b16.
**Efeito sonoro:** zumbido curto da lâmpada, trilha some na última colcheia antes de b16, clique seco.

### P5 · Virada · 8,0 a 10,0 s (b16 a b19)
**Quadros:** o pill "Pausa" cresce até ocupar a tela (contêiner pill → tela cheia). A peça vira tema rosa.
"Estamos de" (72 px) + "FÉRIAS." em Switzer Black 250 px, alinhado à esquerda, letra a letra com mola.
A bateria volta pequena, contorno branco, com raio de carga.
**Efeito sonoro:** impacto em b16, trilha nova (maior, mais leve, com guizos) a partir de b16.

### P6 · As datas · 10,0 a 14,0 s (b20 a b27)
**Quadros:** "FÉRIAS." sobe para o topo. Dois blocos à esquerda:
"SAÍMOS" (overline) · **18 DEZ** (Black 200 px) · "sexta · 2026" — cai em b20.
Entre os dois, a bateria vira barra horizontal e carrega; um contador de dias corre 19, 20 … 31, 01, 02, 03
(b21 a b23,5), um tique por dia.
"VOLTAMOS" · **04 JAN** · "segunda · 2027" — cai em b24 com impacto, barra 100%.
**Efeito sonoro:** tiques na grade de semicolcheias durante a contagem, ding + impacto em b24.

### P7 · Assinatura · 14,0 a 18,0 s (b28 a b35)
**Quadros:** a lâmpada acende (ideias novas). "Voltamos com a bateria cheia / e ideias novas." (60 px).
Logo zinga branco com ponto navy em b30. De 16 s a 18 s nada se mexe além de respiração leve: é o quadro que
fica legível no perfil.
**Efeito sonoro:** ding na lâmpada (b28), acorde final em b34.
