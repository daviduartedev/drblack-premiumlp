# Feature: Rebranding 2026 Q1 (cores e copy)

**Ciclo de origem:** `cycles/Q12026/0001-rebranding-cores-e-copy/`

## Objetivo

Uniformizar a experiência com uma UI **escura, contraste alto e vibe gamer** (CS2, rifas), com **paleta fixa** e **textos curtos e casuais em pt-BR**, com exclusões explícitas.

## Cores de marca (fixas)

| Papel | Hex | Uso |
|--------|-----|-----|
| Primário / CTA e destaques fortes | `#FF5C0A` | Botão primário, acentos que substituem o antigo dourado |
| Secundário / destaque suave | `#EED9C4` | Badges, labels, subtítulos de suporte, realces de texto |
| Texto em fundo escuro | `#FFFFFF` | Títulos e leitura principal sobre base escura |
| Contra-CTA (texto sobre o laranja) | `#0A0A0A` | Sempre no botão primário e em qualquer superfície cujo fundo seja o laranja de marca (legibilidade mínima) |
| Fundo / contraste com claro | `#0A0A0A` | Base da UI escura, texto sobre creme se necessário |

Não introduzir cores fora desta tabela, exceto **opacidade** (alpha) aplicada a estas mesmas chaves, ou misturas em gradiente **só** entre pares aprovados (ex.: laranja ↔ creme para brilho/metal).

## Tokens derivados (contrasto e interação)

Implementado em `app/globals.css` (`:root` + `@theme inline`). Nomes atuais:

- `--background` #0A0A0A · `--background-raised` #141414
- `--foreground` #FFFFFF · `--foreground-muted` (branco ~68% opacidade)
- `--paper` e `--highlight` #EED9C4 · `--ink` e `--on-accent` #0A0A0A
- `--accent` #FF5C0A · `--accent-soft` #FF7A3D · `--accent-deep` #CC4A08
- Utilitário de título: classe `.accent-shine` (gradiente laranja/creme; antigo `gold-shine` removido)

Diretriz (histórica):

- **Laranja:** além de `#FF5C0A`, manter `accent-soft` / `accent-deep` (ou nomes finais) como **tints** do laranja para estados *hover* / *pressed* e gradientes (ex. scan do loader, brilho no título) — nunca reintroduzir dourado #c9a24b como eixo cromático.
- **Creme #EED9C4:** pode aparecer em **bordas**, *icons* em monotonal secundária, *hover* de link “muted” (ex. branco 100% → creme) e linhas; para bordas, preferir EED9C4 com alfa (ex. 0.2–0.45) em fundo #0A0A0A.
- **Texto secundário** sobre escuro: preferir `rgba(255,255,255,0.65–0.72)` a cinzas genéricos fora do sistema.
- **Fundo** da página: `#0A0A0A`; leves variações de camada (cards, *elevations*) com cinzas muito escuros (ex. #141414) se necessário, sem chamar atenção mais que o laranja/creme.

## Regras de uso (UI)

- **Botão primário:** fundo `#FF5C0A`, texto/ícones `#0A0A0A`.
- **Texto principal** em seções com fundo escuro: `#FFFFFF` (e secundário via token *muted*).
- **Destaques/labels** (pílulas, *eyebrow*, *badges*): creme #EED9C4, ou branco com ênfase tipográfica conforme o layout, sem competir com o laranja do CTA.
- **Backgrounds:** base escuro; *hero* e loader podem usar gradientes e malhas, desde que leiam como laranja/creme/preto, não dourado.
- **Legibilidade e performance:** evitar efeito visual excessivo; *motion* alinhada ao existente, só recolorido.
- **Mobile:** mesma árvore de prioridade: contraste e tamanho tocável adequados (sem mudar mecânica, só aplicação visual).

## Copy (pt-BR)

- **Direção:** frases **curtas**, **casual**, **sem tom formal** nem *copy* de persuasão tradicional, alinhada ao posicionamento “skins, rifa, CS2, direto ao ponto”. Exemplos de referência no `request.md` do ciclo.
- **Exclusões (não forçar o tom casual** — linguagem clara, neutra ou informativa é OK): **notícias**, **termos/legais**, **blocos de rodapé** institucional. Nesses trechos, priorize precisão e *tone* informativo.
- **Metadados** (título/descrição do *browser*): pt-BR, alinhado ao rebranding, sem o slogan antigo por obrigação — ajuste conforme título/claim final aprovado na implementação; documentar a string final abaixo quando congelar.

**Strings congeladas (metadata `app/layout.tsx`):**

- Título: `DR Black Skins | Skins de CS2, rifa, direto`
- Descrição: `Seu ponto de skins e rifas. Compra, vende, concorre — sem enrolação.`

## Ativos (imagens)

- **Código, SVG, gradientes, cores parametrizadas** (incl. constantes de *shader* e `envColor` na galeria): **devem** migrar para a paleta.
- **Arquivos raster** em `public/gallery` (JPG, PNG) **não** são reprocessados em lote nesta feature: podem reter cromia das fotos; backlog opcional trocar artes. Evitar *design* do site a depender de *mockups* que ainda concentrem o dourado antigo como se fosse interfaced — preferir ajuste via CSS onde possível.

## Hero: slot de mídia e scroll (ciclo 0002)

**Ciclo:** `cycles/Q12026/0002-hero-elemento-estatico-e-scroll-contínuo/`

- **Slot substituível:** a hero inclui um **único** ponto de integração para mídia de destaque (imagem, vídeo silencioso em loop, ou 3D leve). O conteúdo concreto é **provisório** até troca de produção; a API (componente/prop) deve permitir substituir o ativo sem refator da composição.
- **Estaticidade relativa ao carrossel:** esse elemento **não** é filho nem co-movedor da faixa horizontal de cards em `ScrollDrivenHeroGallery` — não acompanha o `transform` da fileira.
- **Composição e vida útil na viewport:** o slot pertence à **capa** (hero). Quando o usuário entra na **seção seguinte** (galeria scroll-driven), o destaque da capa **deixa** de fazer parte dessa composição inicial; pode alargar-se ligeiramente a altura da hero se o enquadramento o exigir.
- **Referência de ritmo:** `public/video.mp4` permanece **referência only** no repositório (sem obrigação de embed na UI para cumprir esta feature).
- **Plataforma alvo da cycle:** critérios de aceitação **desktop** (roda/trackpad). Comportamento em mobile/touch não faz parte do âmbito da cycle 0002.
- **Scroll contínuo vs saltos:** a progressão scroll-scrub está otimizada para **delta contínuo**; **saltos grandes** (ex. trilha da barra, *page up/down*) não devem ser o caminho que replica a mesma sensação de controle fino — mitigação documentada no `plan.md` do ciclo (p.ex. ajuste do `scrub` do GSAP `ScrollTrigger`, sem desativar scroll nativo).
- **Movimento reduzido:** respeitar `prefers-reduced-motion` com caminho mais curto ou estado final legível, conforme implementação do ciclo.
- **Acessibilidade:** não bloquear navegação por teclado nem a barra de scroll; *skip link* “Pular animação da galeria” em `app/page.tsx` aponta para `#pos-galeria-scroll` (wrapper em `app/page.tsx` que envolve `ScrollDrivenHeroGallery`); conteúdo linear após a seção pinada permanece acessível por rolagem.

## Continua a narrativa: ponte interativa (ciclo 0003)

**Ciclo:** `cycles/Q12026/0003-narrativa-skin-interativa/`

- **Localização:** secção “Continua a narrativa” renderizada inline no fim de `components/ScrollDrivenHeroGallery.tsx`, **depois** da galeria pinada.
- **Fundo da secção (estilo hero):** a secção segue o mesmo padrão visual da hero — base `var(--background)` com stack de gradientes radiais (gradiente principal + dois blobs laranja desfocados em `top-right` / `bottom-left` + grade laranja sub-tile + vinheta preta nas bordas). Sem creme `#EED9C4` como superfície.
- **Skin interativa (elemento, não full-bleed):** `public/skininterativa.png` (PNG com fundo transparente, recomendado) é renderizada como **elemento flutuante** posicionado off-center à direita da secção, em `object-contain`. Encapsulada em `components/InteractiveSkinBackground.tsx` (criado nesta cycle; o nome do componente é histórico — comporta-se como elemento de destaque, não como fundo). Em mobile (`<md`) o elemento é ocultado para preservar leitura do texto.
- **Tratamento da skin (CSS, sem reprocessar o raster):**
  - **camada-foco:** imagem em `object-contain`, `quality={100}`, `drop-shadow(0 30px 60px rgba(0,0,0,0.55))`,
  - **camada-eco:** mesma imagem em `blur(60px) saturate(1.3)` por trás, `opacity 0.55`, dá ambiência laranja sem mostrar fundo chapado,
  - **glow radial laranja `#FF5C0A`** (≤ 32% opacidade) que **segue o cursor** entre as duas camadas; estático em `prefers-reduced-motion` / pointer coarse.
- **Animações compostas na skin (em camadas separadas, `transform-style: preserve-3d`):**
  - **Entry scroll-scrubbed** — ao entrar na viewport, a skin roda em 3D (`rotateX -18° → 0°/-2°`, `rotateY 24° → 0°/-3°`), sobe (`y 80px → 0`), cresce (`scale 0.82 → 1`) e ganha opacidade (`0 → 1`). Driver: `useScroll({ target, offset: ["start end", "center center"] })` (framer-motion). Ritmo inspirado no site da KPR.
  - **Cursor tilt** — tilt em `rotateX/rotateY` no intervalo `[-5°, +5°]`, paralax `translateX/Y` `±12px` em sentido oposto ao tilt, `scale 1.0 → 1.02` ao entrar com o cursor, retorno suave (spring) ao estado neutro. Lib: `framer-motion` (`useMotionValue` + `useSpring` + `useTransform`); sem `setState` por frame.
- **Animações agressivas dos textos (Framer-style, `whileInView` com replay no scroll):**
  - **Eyebrow** desce do topo (`y -50 → 0`, fade);
  - **H2** entra **palavra a palavra** desde a direita com `rotateY` 3D (`x 160 → 0`, `rotateY 32° → 0°`, fade), com stagger (`staggerChildren: 0.12s`, `delayChildren: 0.1s`); o `<h2>` é container `transform-style: preserve-3d` com `perspective: 900px` no parent;
  - **Sub** entra da direita (`x 90 → 0`, fade) com `delay: 0.4s`;
  - **CTA** sobe e escala (`y 50 → 0`, `scale 0.85 → 1`, fade) com `delay: 0.6s`.
  - Trigger: `viewport={{ once: false, margin: "-15%" }}` — replay quando o utilizador rola de volta. Easing: cúbica `[0.16, 1, 0.3, 1]` (out-expo). Em `prefers-reduced-motion: reduce`, todas as variantes degradam para fade simples (`opacity 0 → 1`, sem deslocação nem rotação).
- **Saída cinematográfica da galeria (Fase C, `ScrollDrivenHeroGallery`):**
  - Adiciona-se uma fase final ao timeline pinado da galeria (rebalanceada a `0.40 / 0.85 / 1.00` em vez de `0.45 / 1.00`):
    - Fase A `0.00–0.40` — carrossel desliza direita → centro;
    - Fase B `0.40–0.85` — hero card expande a fullscreen + frame scrub;
    - **Fase C `0.85–1.00`** — fly-through estilo KPR/peachweb: a card faz overscale `×1.18`, `rotateX -12°`, `rotateY 6°`, drift `y -110px` e `opacity 1 → 0`, com o frame overlay e a label canto a desvanecerem em paralelo. Após o `progress 1.0`, o pin liberta e a secção “Continua a história.” revela-se por baixo.
  - Sem alteração da distância de scroll total (`+=600%` em desktop, `+=200%` em reduced-motion).
- **Modos de interação (auto-detectados):**
  - `interactive` (desktop, pointer fino): entry + cursor.
  - `touch-static` (`pointer: coarse`): entry + pose ligeiramente rotada como pose final (sem cursor).
  - `reduced-static` (`prefers-reduced-motion: reduce`): pose estática imediata (perspective + `rotateX(-2°)` + `rotateY(-3°)` + glow laranja estático), sem entry e sem cursor — preserva profundidade sem violar a preferência.
- **Composição e copy:**
  - eyebrow em `--highlight`, H2 em `var(--foreground)`, sub em `var(--foreground-muted)` (sem creme como cor de superfície),
  - CTA primário em `#FF5C0A` com texto `#0A0A0A`, alinhado à regra de uso da paleta,
  - **Strings congeladas (UI — secção “Continua a narrativa”, `ScrollDrivenHeroGallery`):**
    - Eyebrow: `06 · NARRATIVA`
    - Título (H2): `Continua a história.`
    - Subtítulo: `Cada skin é um novo começo. Bora virar a tua?`
    - CTA: `Ver mercado` (âncora `#hero-mercado` na capa em `app/page.tsx`)
- **Limites de comportamento:**
  - a secção **não** fixa o ecrã (sem pin) e **não** captura scroll/teclado,
  - foco visível no CTA, ordem natural de tab,
  - performance: `will-change: transform`, `perspective` no parent, escrita direta de transformações via motion values.

## Transições KPR fiéis (ciclo 0004)

**Ciclo:** `cycles/Q12026/0004-transicoes-kpr-fieis/`

- **Referências canónicas de fidelidade:**
  - **Shape** (sticker dos cards): `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png` — print ANIMUS CHARACTER serve como ground truth do contorno do `KPR_CARD_PATH`. Comparação lado a lado guardada em `reference/shape-comparison.png`.
  - **Motion 3D** (Fases A→B e B→C): `public/XCZASD.mp4` — referência primária para timing, scale, tilt e overlap das transições 3D dos cards e do recuo fullscreen. Frames-chave extraídos em `reference/xczasd-keyframes/`.
  - `https://kpr.studio/` permanece referência live secundária para inspeção de easings.
- **Shape `KPR_CARD_PATH` (`components/KprCard.tsx`)** — cantos efetivos `~0.07` em X / `~0.12` em Y (tolerância visual `±0.01 / ±0.02`), indent subtil no meio do lado esquerdo, tratamento próprio no canto inferior-direito; **sem** notch agressivo ou mordida grande. Mantém `clipPathUnits="objectBoundingBox"`.
- **Fronteiras de fase atualizadas (`components/ScrollDrivenHeroGallery.tsx`)** — passa de `0 / 0.18 / 0.45 / 0.85 / 1.00` para `0 / 0.18 / 0.40 / 0.85 / 1.00`. Sub-fases C1/C2 mantêm proporção interna (C1 ≈ 55% da Fase C, C2 ≈ 45%). `scrollEnd` (`+=700%` desktop / `+=200%` reduced-motion) inalterado.
- **Easings por fase (alvo, com tolerância visual ≤1 unidade de potência):**

  | Fase | Trecho | Easing |
  |------|--------|--------|
  | 0 — morph intro | `0.00..0.18` | `expo.inOut` |
  | A — slide carrossel | `0.18..0.40` | `expo.out` |
  | B — scale knife | `0.40..0.85` | `quart.inOut` |
  | C1 — recuo 3D | `0.85..0.93` (≈) | `expo.out` |
  | C2 — saída fade | `0.93..1.00` (≈) | `quart.in` |

- **Morph fluido path-to-path** — biblioteca **`flubber`** (npm, MIT, ~14kB gz) interpola `clip-path: path("...")` entre o retângulo fullscreen e o `KPR_CARD_PATH` em duas situações:
  1. **Fase 0** — overlay intro encolhe, e nos últimos ~40% do morph o contorno deforma-se continuamente até ao shape KPR (substitui o `tl.set` abrupto a 90% do morph).
  2. **Fase C1** — ao recolher para a saída cinematográfica, o card volta a "ganhar borda" pelo mesmo mecanismo (substitui o `tl.set` a 95% da Fase B).

  Utilitário interno em `lib/path-morph.ts` (`getKprMorphInterpolator`). **Fallback documentado**: cross-fade entre dois layers (`clipPath: none` + `clipPath: url(#kpr-card-shape)`) caso `flubber` apresente jitter em Safari iOS 16+.
- **Frame highlight + glow interno (Fase B):**
  - **Border highlight** — `box-shadow: inset 0 0 0 2px rgba(255,255,255,0.04)` que pulsa entre `0.04` e `0.08` de opacidade via timeline GSAP **independente** (`yoyo: true, repeat: -1, ease: "sine.inOut", duration: 1.4s`). Ativada/parada via callbacks `onEnter`/`onLeave` de um `ScrollTrigger` discreto (não conta como listener de update).
  - **Glow interior** — `radial-gradient(closest-side, rgba(255,92,10,0.04), transparent 60%)` com `mix-blend-mode: screen`, opacity tied a `expansionProgress` (fade-in `0.05..0.10`, segura `0.10..0.90`, fade-out `0.90..0.95`).
  - Ambos passados ao `KprCard` via `overlay` prop, `aria-hidden`, `pointer-events: none`.
- **Saída cinematográfica refinada (Fase C):**
  - **Sombra dual-stage** — cresce até `0 60px 140px rgba(0,0,0,0.65)` em 60% da C1 e depois reduz para `0 40px 100px rgba(0,0,0,0.55)` até ao fim da C1 (simula fonte de luz a afastar-se).
  - **`rotateZ: -1.5°`** aplicado **apenas na C2** em paralelo com `scaleX/Y`, `y` e `opacity` existentes (a torção KPR no momento de sair do palco).
  - **Overlay de blur na narrativa** — `backdrop-filter: blur(8px)→0` num `<div>` decorativo dentro da `<motion.section id="continua-narrativa">`, governado por **um** `ScrollTrigger` separado (`start: "top bottom"`, `end: "top 30%"`, `scrub: 1`). Esse mesmo trigger conduz o parallax `translateY: 30px → 0` da section wrapper.
- **Orçamento de listeners adicionais** — máximo de 2 listeners `ScrollTrigger.update` extra; este ciclo usa **1** (parallax + blur da narrativa). Os callbacks `onEnter`/`onLeave` do trigger discreto da Fase B não contam.
- **`prefers-reduced-motion: reduce`** — desliga integralmente: morph path-to-path (mantém `PHASE_INTRO_END=0`), border highlight pulse, glow interno, `mix-blend-mode`, `backdrop-filter`, `rotateZ` C2, sombra dual-stage (mantém apenas a sombra final estática). Easings novos aplicam-se onde haja tween residual.
- **Sem alteração de copy ou de assets raster** — strings congeladas (cycle 0003), `card1.jpg`, `knife.png`, 101 frames pré-renderizados e `skininterativa.png` mantidos.

## Dependências técnicas

- *Tokens* canônicos em `app/globals.css` e mapeamento Tailwind `@theme inline` onde usado.
- Componentes conhecidos: `Loader3D`, `Hero`, `ScrollDrivenHeroGallery`, `app/page.tsx`, `app/layout.tsx`.
- Utilitário interno: `lib/path-morph.ts` (introduzido pela cycle 0004).
- Bibliotecas externas relevantes: `gsap` + `ScrollTrigger`, `framer-motion`, `next/image`, **`flubber`** (cycle 0004).

## Critério de conclusão

- Nenhum dourado #c9a24b (ou família) como eixo cromático principal; *spotlight* e CTA lêem laranja/creme.
- Cenários em `cycles/.../scenarios.feature` satisfeitos em *review* humano.
- Título/descrição do layout preenchidos e copiados para “Strings congeladas” acima.
