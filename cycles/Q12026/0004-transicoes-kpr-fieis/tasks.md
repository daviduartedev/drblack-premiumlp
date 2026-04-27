# Tarefas — 0004 Transições KPR fiéis

> Lê primeiro `request.md` e `plan.md` desta cycle. Confirma com o `reference/animus-character.png` (shape) e `public/XCZASD.mp4` (motion 3D) **antes** de implementar.

## 0. Pré-requisitos

- [ ] Confirmar que `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png` existe e é o ground truth do shape.
- [ ] Extrair 4–6 frames-chave de `public/XCZASD.mp4` para `cycles/Q12026/0004-transicoes-kpr-fieis/reference/xczasd-keyframes/` (`ffmpeg -ss <t> -frames:v 1 frame_<t>.jpg`). Cobrir: card centrado, transição entre cards, knife centrado, knife em expansão, recuo 3D, saída.
- [ ] Inspeção live de `https://kpr.studio/` (via Playwright MCP ou navegação manual) para validar timing/easing.

## 1. Atualizar `spec/` (obrigatório)

- [ ] `spec/features/rebrand-2026-q1/readme.md` — adicionar secção "Transições KPR fiéis (cycle 0004)" descrevendo: shape KPR refinado, fronteiras de fase atualizadas, morph fluido com `flubber`, frame highlight + glow Fase B, saída cinematográfica refinada, parallax+blur da narrativa, comportamento em `prefers-reduced-motion`.
- [ ] `spec/README.md` — referenciar o ciclo 0004 entre os ciclos da feature ativa.

## 2. Dependência nova

- [ ] `npm install flubber` — adicionar a `package.json` (MIT, ~14kB gz, tipos próprios).
- [ ] Verificar `package-lock.json` commit junto.
- [ ] `npx tsc --noEmit` continua limpo após o install.

## 3. Utilitário de path morph (`lib/path-morph.ts`, novo)

- [ ] Criar `lib/path-morph.ts` exportando:
  - [ ] `KPR_CARD_PATH_NORMALIZED` — versão do path do `KprCard` em coordenadas user-space (`0..1`) compatíveis com `clip-path: path("...")`.
  - [ ] `getRectPathNormalized()` — devolve a string do retângulo fullscreen com **o mesmo número de comandos** do `KPR_CARD_PATH_NORMALIZED` (para `flubber` interpolar sem warnings).
  - [ ] `getKprMorphInterpolator(direction: "rect-to-shape" | "shape-to-rect"): (t: number) => string` — cria uma vez (no scope da timeline) e devolve a função pura.
- [ ] Comentário no topo a referenciar este ciclo e os pontos de uso (Fase 0 e Fase C1).

## 4. `components/KprCard.tsx` — redesenho do `KPR_CARD_PATH`

- [ ] Re-desenhar `KPR_CARD_PATH` com base em `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png`:
  - [ ] cantos efetivos `~0.07` em X, `~0.12` em Y (tolerância visual `±0.01 / ±0.02`);
  - [ ] indent subtil no meio do lado esquerdo (`<=0.008` desvio Bézier);
  - [ ] tratamento próprio do canto inferior-direito (capturado do print);
  - [ ] **sem** notch agressivo top-right e **sem** mordida grande bottom-right;
  - [ ] manter `clipPathUnits="objectBoundingBox"`.
- [ ] Validar que o shape escala identicamente em `aspect-ratio` 16:9 e em containers fullscreen (sem distorção).
- [ ] Atualizar o JSDoc do `KprCard` para mencionar a referência `cycles/Q12026/0004-transicoes-kpr-fieis/reference/animus-character.png`.
- [ ] Salvar comparação visual em `cycles/Q12026/0004-transicoes-kpr-fieis/reference/shape-comparison.png` (antes/depois lado a lado).

## 5. `components/ScrollDrivenHeroGallery.tsx` — fronteiras e easings

- [ ] Atualizar fronteiras de fase:
  - `PHASE_INTRO_END = 0.18` (inalterado)
  - `PHASE_A_END = 0.40` (era `0.45`)
  - `PHASE_B_END = 0.85` (inalterado)
- [ ] Substituir easings principais por fase conforme tabela do `plan.md` (`expo.inOut`, `expo.out`, `quart.inOut`, `expo.out`, `quart.in`).
- [ ] Manter `scrollEnd` (`+=700%` desktop / `+=200%` reduced-motion).
- [ ] Manter `scrub: 1.45` (desktop) / `0.35` (reduced-motion).

## 6. Morph fluido na Fase 0 (intro overlay)

- [ ] Importar `getKprMorphInterpolator` de `lib/path-morph.ts`.
- [ ] No bloco `if (!prefersReducedMotion && introOverlay)`, substituir:
  - [ ] o `tl.set({ clipPath: "url(#kpr-card-shape)" }, clipApplyAt)` por uma anim path-to-path:
    - cria proxy `{ p: 0 }` antes do tween;
    - `tl.to(proxy, { p: 1, duration: morphDur*0.4, ease: "expo.inOut", onUpdate: () => { introOverlay.style.clipPath = \`path("${interp(proxy.p)}")\`; } }, morphDur*0.6)`;
    - no fim (`onComplete`), troca para `clipPath: "url(#kpr-card-shape)"` antes do fade-out (CPU cheap).
- [ ] Adicionar `will-change: clip-path` ao overlay durante o morph; remover no `onComplete`.
- [ ] **Fallback Opção B**: se durante QA o morph apresentar jitter ou cair < 50fps em desktop:
  - [ ] criar segundo `<div>` overlay irmão com `clipPath: url(#kpr-card-shape)` e opacity 0;
  - [ ] cross-fade entre os dois overlays nos últimos 15% do morph;
  - [ ] documentar a decisão nas notas finais do `tasks.md` e atualizar `plan.md`.

## 7. Morph fluido na Fase C1 (re-aplicação ao recolher)

- [ ] No bloco da Fase C1, substituir:
  - [ ] o `tl.set({ clipPath: "url(#kpr-card-shape)" }, PHASE_B_END)` por uma anim path-to-path equivalente, durando os primeiros ~30% da C1 (~0.024 do progresso global).
  - [ ] tween começa a `progress = PHASE_B_END * 0.92` (em vez de `PHASE_B_END * 0.95`) para alinhar com o overlap calibrado do request.
  - [ ] no `onComplete`, voltar a `clipPath: "url(#kpr-card-shape)"`.
- [ ] Mesmo fallback Opção B documentado no ponto 6.

## 8. Frame highlight + glow interno (Fase B)

- [ ] No `KprCard` do hero (via `overlay` prop), adicionar dois novos `<div>`:
  - [ ] **Border highlight** — `<div ref={borderHighlightRef} className="absolute inset-0 pointer-events-none" aria-hidden style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.04)" }} />`.
  - [ ] **Glow interior** — `<div ref={glowRef} className="absolute inset-0 pointer-events-none" aria-hidden style={{ background: "radial-gradient(closest-side, rgba(255,92,10,0.04), transparent 60%)", mixBlendMode: "screen", opacity: 0 }} />`.
- [ ] Pulso do border highlight (timeline GSAP **independente**):
  - [ ] criar `gsap.to(borderHighlightRef.current, { boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.08)", duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut", paused: true })` no `useIsoLayoutEffect`.
  - [ ] ScrollTrigger discreto (callbacks `onEnter` / `onLeave`, **não conta** como listener de update): `ScrollTrigger.create({ trigger: pinRef.current, start: \`top top+=${PHASE_A_END*100}%\`, end: \`top top+=${PHASE_B_END*100}%\`, onEnter: () => pulse.play(), onLeave: () => pulse.pause(), onEnterBack: () => pulse.play(), onLeaveBack: () => pulse.pause() })`.
- [ ] Glow tied a `expansionProgress`:
  - [ ] novo `useEffect([expansionProgress])` que computa `glowOpacity` (`0` para `<0.05`, ramp `0.05..0.10` → `1`, segura `0.10..0.90`, ramp `0.90..0.95` → `0`, `0` para `>0.95`) e escreve direto em `glowRef.current!.style.opacity`.
- [ ] Em `prefers-reduced-motion: reduce` os dois overlays não são montados.

## 9. Saída cinematográfica refinada (Fase C)

- [ ] **Sombra dual-stage** no `heroCardEl` — substituir o `tl.to` único da Fase C1 por dois sequenciais:
  - [ ] cresce até `boxShadow: "0 60px 140px rgba(0,0,0,0.65), 0 20px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.06)"` em `PHASE_B_END → PHASE_B_END + C1_DUR*0.6` (`expo.out`);
  - [ ] reduz para `boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 16px 32px rgba(0,0,0,0.40), inset 0 0 0 1px rgba(255,255,255,0.06)"` em `PHASE_B_END + C1_DUR*0.6 → PHASE_B_END + C1_DUR` (`power2.inOut`).
- [ ] **`rotateZ: -1.5°`** no `heroWrap` apenas durante a C2 (`tl.to(heroWrap, { rotationZ: -1.5, ease: "quart.in", duration: C2_DUR }, C2_START)`), em paralelo com os tweens existentes da C2.
- [ ] Em `prefers-reduced-motion: reduce`, sombra fica numa única etapa (a final reduzida) e `rotateZ` não é aplicado.

## 10. Parallax + blur da narrativa (1 ScrollTrigger novo)

- [ ] Na `<motion.section id="continua-narrativa">`:
  - [ ] adicionar `<div aria-hidden ref={narrativaBlurRef} className="absolute inset-0 pointer-events-none" style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />` antes do `InteractiveSkinBackground`.
  - [ ] adicionar CSS var `--narrativa-blur: 8px` no style inline da section, e usar `backdrop-filter: blur(var(--narrativa-blur))` no overlay.
- [ ] Substituir o `whileInView` da section wrapper (no que respeita a `y/scale` da própria section) por **um** ScrollTrigger novo:
  - [ ] `ScrollTrigger.create({ trigger: narrativaSectionRef.current, start: "top bottom", end: "top 30%", scrub: 1, onUpdate: (self) => { const p = self.progress; section.style.setProperty("--narrativa-blur", \`${(1-p)*8}px\`); section.style.setProperty("--narrativa-y", \`${(1-p)*30}px\`); } })`.
  - [ ] usar `transform: translateY(var(--narrativa-y))` no wrapper interno da section.
- [ ] Manter as variantes Framer-motion dos textos (`NARRATIVA_VARIANTS_FULL`/`REDUCED`) intocadas.
- [ ] Em `prefers-reduced-motion: reduce`, este ScrollTrigger **não** é criado e o `--narrativa-blur` fica em `0px`.

## 11. Acessibilidade & QA manual

- [ ] Todos os novos `<div>` overlays decorativos com `aria-hidden` e `pointer-events: none`.
- [ ] Verificar com leitor de ecrã (NVDA ou VoiceOver) que nenhum dos overlays é anunciado.
- [ ] Tab através da página: focus continua a chegar ao CTA `Ver mercado` e a links posteriores sem ficar preso.
- [ ] Emular `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature) — nenhum dos efeitos novos deve aparecer.
- [ ] Gravação 60fps de scroll (Chrome DevTools → Performance → record + scroll lento) — derivada da posição contínua, sem saltos visíveis.
- [ ] Comparação lado-a-lado: gravação do estado refinado vs `public/XCZASD.mp4` para Fases A→B e B→C.

## 12. Validação técnica

- [ ] `npx tsc --noEmit` sem erros novos.
- [ ] `npx next build` (production) sem warnings novos.
- [ ] Bundle size do `flubber` confirmado (~14kB gz; reportar no PR se exceder muito).
- [ ] Browser matrix:
  - [ ] Chrome/Firefox/Safari desktop atuais — morph path-to-path estável.
  - [ ] Safari iOS 16+ — se `clip-path: path()` jitter-ar, ativar fallback Opção B (cross-fade).

## 13. Limpeza e fecho

- [ ] Atualizar `plan.md` com decisão final entre Opção A (flubber) e Opção B (cross-fade), se aplicável.
- [ ] Adicionar nota nas "Notas de implementação" deste `tasks.md` documentando descobertas (timing real do scrub, comportamento do `clip-path: path()` em Safari, ajustes finos aos easings).
- [ ] **Não** apagar `request.md` desta cycle — fica como histórico (convenção dos cycles 0001/0002/0003).

---

## Notas de implementação

> A preencher durante e ao fim da execução. Documentar:
>
> - decisão final A vs B do morph,
> - calibrações reais dos raios do shape contra o print,
> - ajustes ±2% das fronteiras de fase em QA visual,
> - frames de `XCZASD.mp4` mais úteis para a referência (timecode + descrição),
> - quaisquer pivôs feitos durante a implementação.

### Execução (2026-04-27)

- [x] Dependência instalada: `flubber` (+ `@types/flubber`).
- [x] `lib/path-morph.ts` criado com interpolador `rect-to-shape` / `shape-to-rect`.
- [x] `components/KprCard.tsx` atualizado com novo `KPR_CARD_PATH` calibrado pelo print ANIMUS.
- [x] `components/ScrollDrivenHeroGallery.tsx` atualizado com:
  - [x] fronteira `PHASE_A_END = 0.40`,
  - [x] easings por fase (`expo.inOut`, `expo.out`, `quart.inOut`, `quart.in`),
  - [x] morph fluido na Fase 0 e no recolher da C1 via `clip-path: path(...)`,
  - [x] border highlight + glow interno na Fase B,
  - [x] sombra dual-stage + `rotateZ: -1.5deg` na C2,
  - [x] parallax + blur da narrativa via 1 `ScrollTrigger` adicional.
- [x] `npx tsc --noEmit` sem erros novos.
- [x] `npx next build` concluído.
- [ ] Extração automática de keyframes com `ffmpeg` bloqueada (binário ausente no ambiente).
- [ ] Inspeção live de `https://kpr.studio/` bloqueada via `WebFetch` (HTTP 503).
- [ ] QA manual (screen reader, matrix Safari/iOS, gravação 60fps, comparação lado a lado) pendente de validação local no browser.
