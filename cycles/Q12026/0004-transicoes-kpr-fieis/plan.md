# Plano (delta) — Transições KPR fiéis (Q1 2026)

## Baseline (estado canónico anterior)

- [cycles/Q12026/0001-rebranding-cores-e-copy/](../0001-rebranding-cores-e-copy/) — paleta laranja/creme/preto, tokens em `app/globals.css`.
- [cycles/Q12026/0002-hero-elemento-estatico-e-scroll-contínuo/](../0002-hero-elemento-estatico-e-scroll-contínuo/) — slot de hero, `scrub` 1.45 s e `normalizeScroll(true)` em desktop sem reduced-motion.
- [cycles/Q12026/0003-narrativa-skin-interativa/](../0003-narrativa-skin-interativa/) — secção "Continua a história" inline, fly-through cinematográfico Fase C, timeline pinada em `0.18 / 0.45 / 0.85 / 1.00`.
- `components/ScrollDrivenHeroGallery.tsx` — timeline pinada única, scrub GSAP, 4 fases (`0/A/B/C`), overlay intro com `clip-path: url(#kpr-card-shape)` aplicado via `tl.set` aos 90% do morph e `clipReleaseAt` aos 95% da Fase B; Fase C com sub-fases C1 (recuo 3D) + C2 (saída por cima).
- `components/KprCard.tsx` — `KPR_CARD_PATH` atual com raios `0.08 / 0.14` e variações Bézier quase-simétricas (`<=0.005`); `clipPath: url(#kpr-card-shape)` via `<KprCardClipDefs />` em `objectBoundingBox`.
- `public/animacao-frames/frame_001..101.jpg` — 101 frames pré-renderizados servidos por `ScrollFilmFrames`.
- `public/XCZASD.mp4` — vídeo de referência KPR (cards trocam com leve scale + cross-fade + texto rotacionado lateral; recuo 3D estilo "card-into-window").

## Decisões de produto (confirmadas neste ciclo)

1. **Referência visual de shape** — print **ANIMUS CHARACTER** (copiado para `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png`). O sticker tem cantos generosos, indent subtil no meio do lado esquerdo e tratamento próprio do canto inferior-direito. Validação: comparação lado-a-lado contra esse PNG.
2. **Referência de motion 3D** — vídeo `public/XCZASD.mp4` para coreografia das transições 3D dos cards (Fase A→B) e do recuo fullscreen (Fase B→C). Frames-chave extraídos para `cycles/Q12026/0004-transicoes-kpr-fieis/reference/xczasd-keyframes/` durante implementação.
3. **Refinamento de easing** — substituir `power2.inOut` / `power3.out` / `power3.in` por `expo.inOut` / `expo.out` / `quart.inOut` / `quart.in` na ordem prescrita pela tabela do `request.md` (alvo, com tolerância visual ≤2 unidades de potência mais alta/baixa se quebrar continuidade visual).
4. **Re-fronteiras das fases** — passar de `0 / 0.18 / 0.45 / 0.85 / 1.00` para `0 / 0.18 / 0.40 / 0.85 / 1.00`; sub-fases C1/C2 inalteradas em proporção (C1=55% da C, C2=45%).
5. **Overlap calibrado** — knife começa a escalar em `progress=0.40` (Fase B sobrepõe os últimos 5% da Fase A); shape KPR re-aplica-se a `0.92` da Fase B (não `0.95`); narrativa começa parallax a `progress=0.88` global.
6. **Morph fluido path-to-path** — usar **`flubber`** (npm, MIT, gratuito) para interpolar `clip-path: path("...")` entre o retângulo fullscreen e o shape KPR. Aplica-se à Fase 0 (overlay intro) e à Fase C1 (re-aplicação ao recolher). **Fallback documentado**: cross-fade entre dois layers (`Opção B` do request) — só se `flubber` produzir resultado instável em Safari iOS 16+.
7. **Frame highlight + glow interno** durante a Fase B — dois `<div>` overlays passados via `KprCard.overlay` prop. Border highlight pulsa com `gsap.to(...).yoyo(true).repeat(-1)` em **timeline independente** (não scrub-driven). Glow interior tem opacity tied a `expansionProgress` com fade-in/out nas pontas (`<0.05` e `>0.95`).
8. **Saída cinematográfica refinada** — sombra em duas etapas (cresce até 60% C1, depois diminui), `rotateZ: -1.5°` apenas na C2, e overlay `backdrop-filter: blur(8px)→0` na narrativa governado por **um** ScrollTrigger separado (entra no orçamento de listeners adicionais).
9. **`prefers-reduced-motion`** — caminho atual preservado: `PHASE_INTRO_END=0`, fade simples, **sem** morph, glow, mix-blend-mode, backdrop-filter ou rotateZ. Easings novos só onde há tween a executar.
10. **Sem alteração de copy ou de assets raster** — strings congeladas (cycle 0003), `card1.jpg` / `knife.png` / 101 frames mantidos.

## Delta funcional (o que muda no produto)

### 1. `components/KprCard.tsx`

- Re-desenho do `KPR_CARD_PATH` baseado no print ANIMUS CHARACTER:
  - cantos com raio efetivo **`0.07` em X / `0.12` em Y** (±0.01/±0.02 calibração visual);
  - indent muito subtil no meio do lado esquerdo (`<=0.008` desvio Bézier);
  - canto inferior-direito com tratamento próprio (raio ligeiramente diferente, capturado do print);
  - **sem notch agressivo** topo-direita, **sem mordida grande** inferior-direita;
  - mantém `clipPathUnits="objectBoundingBox"`.
- Path validado em comparação lado-a-lado contra `reference/animus-character.png` (entregue como screenshot dentro de `reference/shape-comparison.png`).

### 2. `components/ScrollDrivenHeroGallery.tsx` — timeline & easings

- Re-fronteiras das fases:
  ```
  PHASE_INTRO_END = 0.18  (inalterado)
  PHASE_A_END     = 0.40  (era 0.45)
  PHASE_B_END     = 0.85  (inalterado)
  ```
- Easings por fase (alvo):

  | Fase | Trecho | Easing alvo |
  |------|--------|-------------|
  | 0 — morph intro | `0.00..0.18` | `expo.inOut` (era `power2.inOut`) |
  | A — slide carrossel | `0.18..0.40` | `expo.out` (era `power3.out`) |
  | B — scale knife | `0.40..0.85` | `quart.inOut` (era `power2.inOut`) |
  | C1 — recuo 3D | `0.85..0.93` (≈) | `expo.out` (mantém) |
  | C2 — saída fade | `0.93..1.00` (≈) | `quart.in` (era `power3.in`) |

- Micro-tweens internos (sway dos cards laterais, fade-in/out de textos e HUD) **mantêm** os easings atuais salvo conflito visual claro detetado em QA.
- `scrollEnd` (`+=700%` desktop / `+=200%` reduced-motion) **inalterado**.

### 3. Morph fluido com `flubber` (Fase 0 e Fase C1)

- Novo utilitário `lib/path-morph.ts`:
  - importa `flubber.interpolate(fromPath, toPath, { maxSegmentLength: 2 })`;
  - exporta `getKprMorphInterpolator()` que devolve a função `t -> pathString` da forma retangular fullscreen para o `KPR_CARD_PATH` (em coordenadas `objectBoundingBox` 0..1, escaladas para `path()` user-space conforme o consumo);
  - rectângulo fullscreen normalizado para o mesmo número de comandos via `flubber.toPathString` para garantir interpolação estável.
- Em **Fase 0**:
  - substituir o `tl.set({ clipPath: "url(#kpr-card-shape)" })` aos 90% por `tl.to({ clipPath: "path('...')" }, ...)` com `onUpdate` chamando o interpolator (ou usar GSAP attribute plugin com proxy `{ progress: 0..1 }` que reescreve `clipPath: path(\`${interp(progress)}\`)` no overlay).
  - quando o morph completa (`t=1`) e o overlay é fade-out, troca-se para `clipPath: url(#kpr-card-shape)` antes do fade para libertar o `clip-path: path()` (cheap CPU).
- Em **Fase C1**:
  - substituir o `tl.set` aos 95% da Fase B (que reaplica o shape KPR ao recolher) pelo mesmo mecanismo: começa em `clip-path: none`, anima `path()` interpolado até o KPR shape no início da C1; daí em diante volta a `clip-path: url(#kpr-card-shape)`.
- **Fallback documentado**: se `flubber` apresentar jitter em Safari iOS 16+ ou degradar performance abaixo de 50 fps em desktop, cair para Opção B do request (cross-fade entre dois layers — `clipPath: none` e `clipPath: url(#kpr-card-shape)` — animando opacity).

### 4. Frame highlight + glow interno na Fase B

- Novos overlays passados ao `KprCard` (hero) via `overlay` prop, montados condicionalmente quando `expansionProgress > 0`:
  1. **Border highlight** — `<div>` `absolute inset-0 pointer-events-none` com `box-shadow: inset 0 0 0 2px rgba(255,255,255,0.04)`. Pulsação via timeline GSAP **independente** (`gsap.to(el, { boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.08)", duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" })`), iniciada `onEnter` da Fase B (`progress >= 0.40`) e parada `onLeave` (`progress >= 0.85`). Não scrub-driven.
  2. **Glow interno** — `<div>` `absolute inset-0` com `background: radial-gradient(closest-side, rgba(255,92,10,0.04), transparent 60%)` e `mix-blend-mode: screen`. Opacity controlada por `expansionProgress`: `0` para `<0.05`, ramp linear para `1` em `0.05..0.10`, segura em `1` até `0.90`, ramp linear para `0` em `0.90..0.95`. Some na transição B→C.
- Ambos `aria-hidden`, `pointer-events: none`.

### 5. Saída cinematográfica refinada (Fase C)

- **Sombra dual-stage** no `heroCardEl`:
  - dois `tl.to` sequenciais — o primeiro (`PHASE_B_END → PHASE_B_END + C1_DUR*0.6`) cresce até `0 60px 140px rgba(0,0,0,0.65)`; o segundo (`PHASE_B_END + C1_DUR*0.6 → PHASE_B_END + C1_DUR`) reduz para `0 40px 100px rgba(0,0,0,0.55)`.
  - simula o efeito da fonte de luz a afastar-se.
- **`rotateZ: -1.5°`** aplicado **só na C2** (`C2_START → 1.0`), em paralelo com `scaleX/Y`, `y` e `opacity` já existentes; o `rotationX: -14` da C2 mantém-se.
- **Overlay de blur na narrativa**:
  - novo `<div aria-hidden>` `absolute inset-0 pointer-events-none` dentro da `<motion.section id="continua-narrativa">` com `backdrop-filter: blur(8px)` inicial.
  - **Um** ScrollTrigger separado (`start: "top bottom"`, `end: "top 30%"`, scrub) anima `--narrativa-blur` (CSS var) de `8px → 0`. Esse mesmo ScrollTrigger conduz também o `translateY: 30px → 0` parallax da `<motion.section>` (substitui o `whileInView` atual da section wrapper, mantém-no nos textos internos).
  - **NB**: este é o **único** listener `ScrollTrigger.update` adicional permitido (orçamento de 2 do request — reservamos o segundo para evolução futura).

### 6. Acessibilidade & reduced-motion

- `prefers-reduced-motion: reduce` desliga **integralmente**: morph (`PHASE_INTRO_END=0`), border highlight pulse, glow, `mix-blend-mode`, `backdrop-filter`, parallax do ScrollTrigger novo, `rotateZ` C2, sombra dual-stage (mantém apenas a sombra final estática).
- Easings novos aplicam-se onde há tween residual (Fase A/B/C continuam a executar com curva `none` no scrub, então o impacto é pequeno).
- Nenhum dos novos elementos é focável; todos `aria-hidden` e `pointer-events: none`.

### 7. Validação visual

- Pasta `cycles/Q12026/0004-transicoes-kpr-fieis/reference/`:
  - `animus-character.png` — print enviado pelo utilizador (já copiado).
  - `xczasd-keyframes/` — frames-chave do `public/XCZASD.mp4` extraídos durante implementação (`ffmpeg -ss <t> -frames:v 1`), referência para timing e tilt 3D.
  - `shape-comparison.png` — screenshot before/after do shape `KPR_CARD_PATH`.
  - `transition-comparison.mp4` (opcional) — gravação de scroll do estado refinado para comparação com `XCZASD.mp4`.

## Decisões técnicas

- **Nova dependência**: `flubber` (~14kB gz; MIT). Adicionar a `package.json` via `npm install flubber`. Tipos: `flubber` traz `index.d.ts` próprio (sem necessidade de `@types/flubber`).
- **Sem dependências GSAP premium** (`MorphSVGPlugin` evitado) — `flubber` cobre o caso e fica no bundle público.
- **`clip-path: path()`** vs `clipPath: url(#...)` — durante o morph usa-se `path()` (animável), no estado estável volta-se ao `url(#kpr-card-shape)` (cacheable e SVG-renderizado).
- **Performance**:
  - Border highlight pulse roda em timeline GSAP independente, ativada/desativada via `ScrollTrigger.create({ onEnter, onLeave })` da Fase B — **não** conta como listener de update (são callbacks discretos).
  - O ScrollTrigger novo da narrativa tem `scrub: 1` (ligeiramente mais rápido que o `1.45` da galeria, para responsividade do blur).
  - `will-change: clip-path` no overlay intro durante o morph; removido após `t=1`.
  - `mix-blend-mode: screen` é caro em GPU — confinado ao glow interior (Fase B) e desligado fora dela.
- **TypeScript**: o utilitário `lib/path-morph.ts` exporta tipo `KprMorphInterpolator = (t: number) => string`. `npx tsc --noEmit` valida.
- **Browser support** — `clip-path: path()` animado: Chrome/Firefox 100%, Safari iOS 16+ tem quirks (já documentado no request); Opção B fallback testada em Safari nativo via `@supports not (clip-path: path("M0 0 L1 0 L1 1 L0 1 Z"))` (raro retornar false hoje, mas existe).

## Riscos e mitigação

- **`flubber` instabilidade no Safari iOS** — mitigação: fallback Opção B documentado e validado em QA (cross-fade entre dois layers `clipPath`). Se ativada, perda mínima de continuidade visual.
- **Performance do `clip-path: path()` animado** — mitigação: mantém-se só nos ~150 ms da transição (Fase 0 morph + Fase C1 reapply); fora disso `clipPath: url(#...)` cacheável.
- **Excesso de movimento na Fase B** (border pulse + glow + frame scrub simultâneos) — mitigação: opacidades muito baixas (`0.04..0.08` border, `0.04` glow), sem competir com os frames da animação principal.
- **`backdrop-filter` em Firefox** — suporte recente mas estável em FF 103+. Se faltar, degradação graciosa para `background: rgba(10,10,10,0.5)` no overlay (sem blur).
- **Re-cálculo de `flubber.interpolate` por frame** — mitigação: instanciar o interpolator **uma vez** no `useIsoLayoutEffect` e cachear; cada frame só chama `interp(t)` que devolve string.
- **Subjetividade do "fiel ao KPR"** — mitigação: pasta `reference/` com PNG + frames de vídeo + comparativos before/after; QA documentada nas notas de implementação do `tasks.md`.

## Fora de escopo

- Mudanças na hero (`components/hero.tsx`), `Loader3D` ou `app/page.tsx`.
- Alterações no conteúdo textual de qualquer fase ou nas strings congeladas (cycle 0003).
- Adicionar/remover cards do carrossel (mantém-se 2: `card1` + `knife`).
- Substituir os 101 frames pré-renderizados ou o ativo `card1.jpg`.
- Suporte a gyroscope ou interações táteis novas; mobile/touch herda o caminho atual.
- Migração da feature para tokens dinâmicos no `app/globals.css` (mantém-se o que já está).

## Referências

- `cycles/Q12026/0004-transicoes-kpr-fieis/request.md`
- `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png` (shape ground truth)
- `public/XCZASD.mp4` (motion ground truth para 3D)
- `https://kpr.studio/` (referência live secundária — inspeção via Playwright/WebFetch)
- `components/KprCard.tsx`, `components/ScrollDrivenHeroGallery.tsx`, `lib/path-morph.ts` (novo)
- `spec/features/rebrand-2026-q1/readme.md` — secção "Transições KPR fiéis" (a adicionar nesta cycle)
- Cycles 0001 / 0002 / 0003 — paleta, scroll contínuo, fly-through Fase C
