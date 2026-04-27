## Context

A galeria scroll-driven (`components/ScrollDrivenHeroGallery.tsx`) ja implementa o ciclo KPR `card1 fullscreen -> encolhe -> carrossel -> knife expande -> sai`, com pin unico, scrub GSAP, scrub de 101 frames pre-renderizados (`/animacao-frames/frame_001..101.jpg`) e shape sticker via `clip-path: url(#kpr-card-shape)` aplicado pelo `KprCard`. O componente cobre 4 fases (0/A/B/C) e a secao "Continua a historia" emerge por baixo no fim com leve parallax.

Apesar da estrutura estar correta, **as transicoes entre fases ainda nao reproduzem fielmente o ritmo, o easing e a coreografia das transicoes do site KPR** (referencia: `https://kpr.studio/`, videos `x.mp4` peachweb-style e `XCZASD.mp4` KPR-style anexados na conversa). Esta cycle pega cada momento de transicao e refina-o para casar com o estilo KPR — mais peso, mais delay calibrado, mais overlap entre camadas, easing especifico por fase, e shape do sticker mais fiel ao Animus Character.

A intencao e que cada juncao entre fases (intro -> A, A -> B, B -> C, C -> narrativa) deixe de parecer "GSAP padrao" e passe a parecer "mao do designer KPR".

---

## Intent

- Refinar o **ritmo** das 4 fases — KPR usa easing pesado (expo.out/quart.inOut) e tempos calibrados, com micro-pausas entre fases. O scrub atual tem easing genericos (`power2.inOut`, `power3.out`) que precisam ser revistos.
- Refinar o **shape sticker** (`KPR_CARD_PATH`) para casar 1:1 com a referencia ANIMUS CHARACTER — atualmente e um squircle organico generico, falta o "peso" especifico do shape KPR.
- Coreografar **overlap** mais agressivo entre fases — KPR raramente tem cortes secos: cada fase comeca antes da anterior terminar, e o cerebro le como movimento continuo.
- Refinar a **saida da Fase C** (recolhe -> narrativa) — hoje a sombra cresce mas falta o "pop" KPR no momento que o card volta a ganhar shape.
- Refinar o **morph do overlay intro** (Fase 0) — hoje o clip-path aplica abruptamente a 90% do morph; deve ter transicao suave usando `clip-path: path("...")` interpolado ou cross-fade entre dois layers.
- Refinar o **tratamento dos frames durante a Fase B** — durante o scrub o card ja tem shape KPR; o usuario deve sentir que esta vendo "dentro" do sticker, com border highlight e leve glow interior reagindo ao scrub.

---

## Referencia

- **Site oficial KPR**: `https://kpr.studio/` — usar Claude in Chrome ou navegacao manual para inspecionar as transicoes ao vivo (paginas com cards de personagem ANIMUS).
- **Videos anexados**:
  - `x.mp4` (peachweb) — exemplifica o "card recua para tras" e a janela de browser que aparece de baixo. Usado como referencia para o overlap C -> narrativa.
  - `XCZASD.mp4` (KPR) — cards trocam com leve scale + cross-fade + texto rotacionado lateral. Usado como referencia para os cards do carrossel (fase A) e para o estilo de transicao entre slides.
- **Shape do card**: imagem ANIMUS CHARACTER enviada — sticker squircle com cantos generosos, pequenas variacoes de borda quase imperceptiveis, sem notch agressivo.

---

## Requisitos funcionais

### 1. Refinamento do shape `KPR_CARD_PATH` (`components/KprCard.tsx`)

- Re-desenhar o `KPR_CARD_PATH` atual com base na referencia ANIMUS CHARACTER:
  - Cantos arredondados generosos (raio efetivo ~0.07 em X, ~0.12 em Y).
  - Lados quase retos com variacoes de Bezier `<= 0.008` em desvio (assimetria sutil — nao squircle perfeito).
  - **Sem notch agressivo** no canto superior-direito (o atual ja foi removido, mas validar).
  - **Sem mordida grande** no canto inferior-direito.
  - Manter `clipPathUnits="objectBoundingBox"` (escalabilidade).
- Validar que o shape escala identicamente em qualquer aspect ratio razoavel (16:9 para os cards, 1:1 para variantes futuras).

### 2. Easing e timing por fase (`components/ScrollDrivenHeroGallery.tsx`)

| Fase | Trecho | Easing atual | Easing alvo (KPR) | Justificativa |
|------|--------|--------------|-------------------|---------------|
| 0 — morph intro | `0.00 .. 0.18` | `power2.inOut` | `expo.inOut` | Mais "snap" no fim |
| A — slide carrossel | `0.18 .. 0.45` | `power3.out` | `expo.out` | KPR tem desaceleracao mais pesada |
| B — scale knife | `0.45 .. 0.85` | `power2.inOut` | `quart.inOut` | Curva mais suave nos extremos |
| C1 — recuo 3D | `0.85 .. 0.93` | `expo.out` | `expo.out` (manter) | Ja correto |
| C2 — saida fade | `0.93 .. 1.00` | `power3.in` | `quart.in` | Aceleracao mais suave |

- Substituir os easings na ordem indicada.
- Validar com gravacao do scroll (60fps) que cada juncao entre fases nao tem "salto" de velocidade (ie. derivada da posicao continua).

### 3. Overlap entre fases (sobreposicao calibrada)

- **Fase A → Fase B**: o knife comeca a escalar **15% antes** do fim da Fase A (em `progress = 0.40`, nao `0.45`). Os cards laterais ainda estao a desvanecer enquanto o knife ja cresce — overlap de 5% do progresso.
- **Fase B → Fase C**: o card_el comeca a recuperar shape (clip-path `none → kpr-card-shape`) **a 92%** da Fase B (nao a 95% como hoje). Da uns 3% a mais de "ja recolhendo" antes da Fase C oficialmente comecar.
- **Fase C → Narrativa**: a secao "Continua a historia" comeca a aparecer **a 88%** do progresso global (hoje espera o `whileInView` dela), via parallax dedicado num ScrollTrigger separado. Quando o hero ainda esta recolhendo, a narrativa ja sobe `30%` do seu percurso final.

### 4. Morph fluido do clip-path no intro overlay (Fase 0)

Hoje o clip-path e aplicado abruptamente via `tl.set` aos 90% do morph. Substituir por:

- **Opcao A (preferida)**: usar `clip-path: path("...")` interpolado com GSAP — definir dois paths (retangulo fullscreen e shape KPR) e animar a string de path. Requer paths com **mesmo numero de comandos** para interpolacao funcionar nativamente.
- **Opcao B (fallback)**: cross-fade entre dois layers — um com `clip-path: none` (retangulo) e outro com `clip-path: url(#kpr-card-shape)` — animando opacity entre eles na ultima fracao do morph.

A escolha entre A/B depende da viabilidade — testar A primeiro; se o GSAP nao interpolar de forma estavel, cair para B.

### 5. Re-aplicacao suave do shape ao recolher (Fase C1)

Hoje o `tl.set({ clipPath: "url(#kpr-card-shape)" })` re-aplica o shape instantaneamente no inicio da Fase C. Substituir pelo mesmo mecanismo da Fase 0 (interpolacao path-to-path ou cross-fade) para que a "borda" volte a se formar de forma continua.

### 6. Frame highlight durante a Fase B

Durante a Fase B (scrub do knife com shape KPR), adicionar:

- **Border highlight** animado: `box-shadow: inset 0 0 0 2px rgba(255,255,255,0.04)` que pulsa sutilmente (`opacity 0.04 -> 0.08 -> 0.04`) ao longo do scrub — da a sensacao de "card vivo".
- **Glow interno** sutil: `radial-gradient(closest-side, rgba(255,92,10,0.04), transparent 60%)` como overlay dentro do shape, com `mix-blend-mode: screen`. Apenas durante a fase B; some na fase C.

### 7. Saida cinematografica refinada (Fase C → narrativa)

- A sombra do card durante o recuo cresce em duas etapas: ate 60% da Fase C1 chega ao maximo (`0 60px 140px`) e depois **diminui** ligeiramente (`0 40px 100px`) ate o fim, simulando o efeito da fonte de luz se afastar.
- Adicionar leve **rotacao em Z** (`rotateZ: -1.5deg`) no final da C2 — KPR tipicamente da uma "torcao" no momento que o card sai do palco.
- A narrativa por baixo deve ter um overlay de blur sutil (`backdrop-filter: blur(8px)`) que diminui de 8 → 0 conforme o hero termina de sair, dando a sensacao de profundidade.

### 8. Acessibilidade

- Manter `prefers-reduced-motion: reduce` respeitado: todas as adicoes acima desativadas, mantendo apenas fade simples entre estados.
- Validar que nenhum elemento adicionado (`box-shadow`, `mix-blend-mode`, `backdrop-filter`) prejudica leitores de tela ou navegacao por teclado.

---

## Requisitos nao-funcionais

- **Performance**: nao adicionar mais de 2 listeners adicionais de `ScrollTrigger.update` — todos os efeitos novos devem rodar dentro da timeline pinada existente.
- **TypeScript**: `npx tsc --noEmit` deve passar sem novos erros.
- **Browser support**: testar Chrome/Firefox/Safari atuais; Safari iOS 16+ tem quirks com `clip-path: path()` animado — validar Opcao B fallback.
- **Sem dependencias novas**: usar apenas `gsap`, `framer-motion`, `next/image` — ja no `package.json`.

---

## Fora de escopo

- Mudancas na hero (`components/hero.tsx`) ou no Loader3D.
- Mudancas no conteudo textual de qualquer fase.
- Mudancas na narrativa (`<motion.section id="continua-narrativa">`) alem do parallax/blur descritos.
- Adicionar novos cards ao carrossel (continua com 2: card1 + knife).
- Substituir os 101 frames pre-renderizados.

---

## Criterios de aceitacao

1. **Visual**: ao rolar lentamente do topo da galeria ate a narrativa, **cada juncao entre fases parece continua** — nao e possivel apontar onde uma fase termina e outra comeca.
2. **Shape**: o sticker dos cards e indistinguivel do shape ANIMUS CHARACTER de referencia em comparacao lado-a-lado.
3. **Frame congelado**: o ultimo frame (101) permanece visivel durante toda a Fase C ate a opacidade do hero chegar a 0.
4. **Reverso**: rolando para cima, todas as transicoes funcionam em sentido inverso sem flickers ou snaps visuais.
5. **Reduced motion**: com `prefers-reduced-motion: reduce`, a animacao cai para fade simples entre fases sem perder a sequencia narrativa.
6. **TypeScript limpo**: `npx tsc --noEmit` sem erros.
7. **Build production**: `npx next build` conclui sem warnings novos.

---

## Notas de implementacao (sugestoes — nao prescritivo)

- Para a **Opcao A** do morph fluido de clip-path, considerar a tecnica de "path morphing" usando `MorphSVGPlugin` do GSAP (premium) ou implementacao manual interpolando os pontos de controle das curvas Bezier.
- Para o **glow interno** da Fase B, usar um `<div>` overlay dentro do KprCard com `mix-blend-mode: screen` e `pointer-events: none`. A pulsacao pode ser feita via `gsap.to(...).repeat(-1).yoyo(true)` num timeline separado pinado a Fase B.
- Para o **parallax da narrativa**, criar uma `ScrollTrigger` adicional com `start: "top 80%"` e `end: "top 30%"` ligada apenas a translacao Y da `<motion.section>`. Nao usar `whileInView` para isso — o framer-motion tem latencia maior que o GSAP scrub.
