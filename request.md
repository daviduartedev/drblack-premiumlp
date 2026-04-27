# Request — Animação de transição "card1 fullscreen → carrossel" estilo KPR

> Documento de **planejamento**. Descreve o que vai mudar, onde, e por quê.
> **Nada é implementado aqui** — este arquivo é a especificação que vai
> orientar a próxima alteração do código.

---

## 1. Estado atual (resumo do que está no repo hoje)

### 1.1 Estrutura da página (`app/page.tsx`)

Ordem de renderização (top → bottom):

1. **Skip-link** (`<a href="#pos-galeria-scroll">`) para acessibilidade.
2. **Hero** (`components/hero.tsx`) — primeira viewport, `min-height: 100vh`.
   Renderizada dentro de `<div id="hero-mercado">`.
3. **Loader3D** (`components/Loader3D.tsx`) — overlay de boot, faz a
   transição 3D (cortinas duplas) e dispara `onRequestFlip`, que troca
   `revealed` para `true`.
4. **`<div id="pos-galeria-scroll">`** envolvendo o
   **ScrollDrivenHeroGallery**, montado só quando `revealed === true`.
5. **Dragon3D** (componente Three.js, montado quando `revealed`).

### 1.2 `ScrollDrivenHeroGallery.tsx` — animação atual

Layout temporal **única timeline pinada** (`gsap.timeline + ScrollTrigger`)
com `start: "top top"`, `end: "+=600%"`, `pin: true`, `scrub: 0.8`.

Constantes-chave (linhas 167–180):

```ts
const CARDS = [
  { src: "/gallery/card1.jpg", index: "01 · COMUNIDADE", title: "Comunidade ativa", ... },
  { src: "/gallery/knife.png", index: "02 · CARTA FORTE", title: "Carta forte", ... },
];
const TOTAL_CARDS = CARDS.length; // 2
const HERO_INDEX = TOTAL_CARDS - 1; // 1 → knife.png é o "hero" da expansão
```

**Fase A** (`progress 0.00 .. 0.45`): faixa de cards começa empurrada
para a direita; o **último card** (`knife.png`) entra do canto direito
e a faixa desliza até centralizá-lo. Cards anteriores fazem
sway escalonado.

**Fase B** (`progress 0.45 .. 1.00`): o último card **expande
anisotropicamente** (`scaleX/Y` independentes) até preencher a viewport
inteira (cover absoluto, +12% em cada eixo de margem).
Em paralelo, dentro do mesmo card, é renderizado
`<ScrollFilmFrames firstIndex={1} lastIndex={101}/>` que faz o scrub
de 101 frames pré-renderizados (`/animacao-frames/frame_001..101.jpg`).

Resumindo, hoje o `knife.png` é quem **vira fullscreen** com scrub.
O `card1.jpg` é apenas um card lateral que entra no carrossel.

### 1.3 Assets disponíveis em `public/`

```
public/gallery/
  Dragon-Lore_LR.webp
  card-2.jpg
  card1.jpg            ← este é o que precisa virar fullscreen primeiro
  knife.png            ← este é o que continua expandindo no fim
public/animacao-frames/
  frame_001.jpg ... frame_101.jpg   (scrub do segundo card)
```

### 1.4 Referência do exemplo.mp4 (KPR)

Frames analisados (`/.frames/exemplo/`):

- **Frame 01–03**: imagem de personagem ocupa **fullscreen**, headline
  ("KEEP. PROTECT. REIMAGINE.") sobreposta.
- **Frame 05**: a mesma imagem **encolhe** para cantos arredondados,
  centralizada, isolada num fundo claro — vira um **card flutuante**.
- **Frame 07**: o card encolhido se posiciona no **carrossel** com
  vários outros cards laterais; texto "A FAMILIAR WORLD..." aparece à
  esquerda.
- **Frame 09–11**: outro card (céu/nuvens) **expande pra fullscreen** e
  começa novo scrub com headline "YOU ARE A KEEPER...".

**Padrão da KPR**: cada card faz um ciclo
`fullscreen → encolhe → vira card no carrossel → próximo card expande
de volta pra fullscreen`. As transições são **scrub-based**
(controladas pelo scroll, não por clique), com pin do bloco inteiro.

---

## 2. O que muda nesta iteração

### 2.1 Objetivo único

Antes da Fase A do carrossel, **inserir uma Fase 0** onde:

> `card1.jpg` aparece **fullscreen** logo após o final da hero. Conforme
> o usuário rola, ele **encolhe e ganha bordas arredondadas** até
> assumir a posição-tamanho do primeiro card no carrossel atual.

A partir daí, a Fase A já existente toma conta (carrossel desliza,
último card vira fullscreen com scrub das `animacao-frames`).

### 2.2 Resultado final (timeline temporal)

```
progress  0.00 ─────── 0.20 ─────── 0.50 ─────── 1.00
          │             │             │             │
          │ Fase 0      │ Fase A      │ Fase B      │
          │ card1       │ carrossel   │ knife       │
          │ fullscreen  │ desliza     │ expande +   │
          │ → encolhe   │ direita →   │ frame scrub │
          │ vira card   │ centro      │             │
```

- **Fase 0 (0.00 .. 0.20)** — NOVA. Card1 começa em
  `position: fixed, inset: 0, border-radius: 0, scale: 1` (cover).
  Termina em `position` e `scale` que combinam exatamente com a
  posição/tamanho do card-1 dentro da faixa do carrossel
  (`border-radius: 28px`, mesmo aspect-ratio do `KprCard`).
  É o equivalente reverso da Fase B atual — em vez de expandir,
  encolhe.

- **Fase A (0.20 .. 0.50)** — atual, mas começa com o card1 já
  posicionado no carrossel. O knife entra do canto direito até centro.

- **Fase B (0.50 .. 1.00)** — atual, intacta. Knife expande, frame
  scrub roda em paralelo.

### 2.3 Detalhamento técnico da Fase 0

#### Layout DOM

Adicionar **antes** do `<div ref={pinRef}>` (que faz pin do carrossel
inteiro) um novo wrapper:

```tsx
<div ref={card1ShrinkPinRef} className="relative h-[100svh]">
  <div ref={card1FullRef} style={{ position: "fixed", inset: 0, ... }}>
    {/* card1 em modo fullscreen, com headline opcional sobreposta */}
    <Image src="/gallery/card1.jpg" fill priority className="object-cover" />
    <h2>DÊ O UPGRADE QUE VOCÊ MERECE.</h2>  {/* ou outro texto */}
  </div>
</div>
```

#### Timeline GSAP

Nova `ScrollTrigger` separada (não pode ser a mesma do carrossel
porque o pin aqui dura `+=100%` apenas, enquanto o carrossel dura
`+=600%`):

```ts
gsap.timeline({
  scrollTrigger: {
    trigger: card1ShrinkPinRef.current,
    start: "top top",
    end: "+=100%",
    pin: true,
    scrub: 0.8,
    invalidateOnRefresh: true,
  },
})
  // 1. Encolhe scaleX/Y de 1 → (cardW/vw, cardH/vh)
  .to(card1FullRef.current, {
    width: () => measureCard1WidthInCarousel(),
    height: () => measureCard1HeightInCarousel(),
    top: () => measureCard1TopInCarousel(),
    left: () => measureCard1LeftInCarousel(),
    borderRadius: 28,
    duration: 1,
    ease: "power2.inOut",
  });
```

A medição do tamanho/posição do card-1 dentro do carrossel é feita
chamando `getBoundingClientRect()` no card-1 do `cardRefs.current[0]`
**antes da Fase A começar a animar**. Como a Fase A é uma
ScrollTrigger separada, posso medir o estado inicial com o carrossel
ainda em sua posição de start (HERO empurrado para a direita).

#### Critério de conclusão da Fase 0

Quando termina, o `card1FullRef` precisa ficar exatamente sobreposto
(mesmas coordenadas/tamanho/borda) ao `cardRefs.current[0]` do
carrossel. Aí faz-se um swap visual: esconde o `card1FullRef` e
torna visível o `cardRefs.current[0]` (que estava `opacity: 0` até
agora). Sem swap, o usuário veria duas cópias do card-1.

Na prática, o swap é instantâneo (1 frame) e imperceptível porque
ambos estão exatamente na mesma posição com o mesmo conteúdo.

### 2.4 Restrição importante — sem clique no skip-link

O skip-link `<a href="#pos-galeria-scroll">` atual funciona via
hash — quando clicado, o navegador faz `window.scrollTo` instantâneo
até o ID, **pulando** todas as ScrollTriggers no caminho. Isso é
incompatível com o pedido:

> "Não é possível que o usuário role a página clicando (scroll
> rápido), apenas rolando o scroll mesmo e assim, dando certo a
> animação"

**Decisão:** o skip-link permanece (acessibilidade WCAG), mas seu
destino muda — em vez de pular para o **fim** do carrossel, pula
para o **início da Fase 0** (`#hero-mercado` ou um novo ID
`#card1-shrink`). Assim o usuário com leitor de tela ainda pode
saltar entradas decorativas, mas não consegue **pular a animação
inteira** com um clique. Quem rola o scroll vê todas as fases na
ordem certa.

Alternativa mais radical: remover o skip-link. Não recomendo —
quebra acessibilidade. A solução acima preserva.

### 2.5 Comportamento esperado em mobile / reduced-motion

- **`prefers-reduced-motion: reduce`**: pular a Fase 0 inteira
  (renderiza card1 já no carrossel desde o início). O componente
  `useReducedMotion` do framer-motion já está importado no
  ScrollDrivenHeroGallery — usar o mesmo hook.
- **Mobile (< 768px)**: Fase 0 funciona, mas a duração reduz para
  `+=70%` (mais curta). O carrossel mobile já tem layout próprio.

---

## 3. Arquivos que serão tocados

### 3.1 `components/ScrollDrivenHeroGallery.tsx`

Mudanças:

- Importa `card1.jpg` num overlay novo posicionado em `position: fixed`.
- Cria `card1ShrinkPinRef`, `card1FullRef`.
- Adiciona uma **segunda ScrollTrigger** (separada da timeline atual)
  responsável só pela Fase 0.
- Faz medições com `getBoundingClientRect` no card1 do carrossel para
  saber o destino do shrink.
- Esconde `cardRefs.current[0]` no estado inicial (`opacity: 0`) e
  revela quando o overlay fullscreen completa o shrink.

Linhas estimadas a alterar: ~40 a 80 (intervalo do `useEffect`),
mais ~15 linhas de JSX.

### 3.2 `app/page.tsx`

- Trocar o `href` do skip-link de `#pos-galeria-scroll` para
  `#card1-shrink` (ou semelhante).
- Adicionar `id="card1-shrink"` no novo wrapper (que vive **dentro**
  do `ScrollDrivenHeroGallery`).

### 3.3 `components/KprCard.tsx`

Provavelmente **nenhuma** mudança. O card1 fullscreen vai usar
`<Image fill>` direto (não `KprCard`), porque ele precisa começar sem
border-radius e sem aspect-ratio fixo — só na chegada vira o formato
do KprCard.

Alternativa elegante: refatorar o card1 fullscreen para ser um
`KprCard` com props `fullscreen={true}` e animar `borderRadius`,
`aspectRatio`, `boxShadow` ao longo do scroll. Mais limpo, mas exige
mexer no `KprCard.tsx`. Decisão fica para a implementação.

---

## 4. Riscos / coisas que podem dar errado

1. **Conflito de pins** — duas ScrollTriggers com `pin: true`
   adjacentes podem se sobrepor se o `pinSpacing` não estiver certo.
   Mitigação: `pinSpacing: true` em ambas + testar com layout shifter
   ativado no DevTools.
2. **Medições antes do layout estabilizar** — `getBoundingClientRect`
   pode retornar 0 se chamado antes do CSS aplicar. Mitigação: usar
   `ScrollTrigger.refresh()` no `onRefresh` callback após carregar
   imagens, e fazer as medições dentro de funções
   `width: () => ...` (lazy, GSAP recalcula).
3. **Salto visual no swap** — se as coordenadas finais do
   `card1FullRef` divergirem por 1px do `cardRefs.current[0]`, vai
   piscar. Mitigação: usar exatamente o mesmo `borderRadius`,
   `boxShadow` e `aspect-ratio` no overlay e no `KprCard`.
4. **Performance** — adicionar mais uma timeline com pin aumenta o
   custo do scroll. Ainda assim, são apenas transformações CSS,
   não há reflow. Deve manter 60fps.

---

## 5. Critério de aceitação

- Ao rolar a partir do final da hero, **card1 ocupa fullscreen**.
- Conforme rola mais, o card1 **encolhe suavemente** e seus cantos
  arredondam até virar exatamente o primeiro card do carrossel.
- A faixa do carrossel **só começa a deslizar depois que o card1
  terminou de encolher**.
- O knife continua expandindo no fim como já faz hoje.
- Sem flicker no swap fullscreen→card.
- Skip-link (Tab no teclado) leva ao início da Fase 0, não pula a
  animação.
- `prefers-reduced-motion: reduce` desliga só a Fase 0, mantém o
  resto.

---

## 6. Próximo passo

Após sua aprovação deste plano, a implementação procede em três
commits sugeridos:

1. **commit 1**: adiciona overlay fullscreen do card1 + pin separado
   sem animação (estado inicial visível, fade-out no fim).
2. **commit 2**: ativa o shrink real (medição + `gsap.to`) e faz o
   swap com o `cardRefs.current[0]`.
3. **commit 3**: ajusta skip-link, suporte a reduced-motion, e
   testa em viewports mobile.
