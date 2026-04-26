# Tarefas — 0003 “Continua a narrativa” com background 3D interativo



- [x] **Ler** `request.md` e `plan.md` desta cycle e confirmar alinhamento antes de implementar.

- [x] **Atualizar `spec/` (obrigatório):**

  - [x] Em `spec/features/rebrand-2026-q1/readme.md`, adicionar a secção “Continua a narrativa: ponte interativa” (fundo escuro, background interativo, regras do efeito 3D, `prefers-reduced-motion`, pointer coarse, link a este ciclo).

  - [x] Em `spec/README.md`, referenciar o ciclo 0003 entre os ciclos da feature ativa.

- [x] **Componente novo `components/InteractiveSkinBackground.tsx`:**

  - [x] Renderiza `public/skininterativa.png` em `next/image` com `object-cover`, `sizes="100vw"`, `priority={false}`, `aria-hidden`.

  - [x] Camadas de overlay: glow radial laranja (`#FF5C0A`, ≤ 28% opacidade) que segue o cursor, vinheta preta nas bordas, linha creme superior/inferior em `rgba(238,217,196,0.12)`.

  - [x] Lógica de cursor com `framer-motion`: `useMotionValue` para `mouseX/Y` (normalizados), `useSpring` (~`stiffness: 150, damping: 20`), `useTransform` mapeia para `rotateX/Y` (`±5°`), `translateX/Y` (`±12px` invertido), `scale 1.0 → 1.02`.

  - [x] `onPointerMove` no wrapper, `onPointerLeave` reseta para o estado neutro.

  - [x] Caminho estático: detectar `useReducedMotion()` e `window.matchMedia("(pointer: coarse)")` — quando qualquer for verdadeiro, montar a versão estática (sem listeners; mantém os mesmos overlays + leve `rotateX(-2°)` + sombra interna para preservar profundidade).

  - [x] Comentário no topo a documentar o ciclo de origem e onde trocar o ativo.

- [x] **Refatorar a secção “Continua a narrativa” em `components/ScrollDrivenHeroGallery.tsx`:**

  - [x] Trocar `background: "#eed9c4"` → `#0A0A0A`; `color` para branco/`var(--foreground)`.

  - [x] Inserir `<InteractiveSkinBackground />` em `absolute inset-0` (z-index abaixo do conteúdo).

  - [x] Eyebrow `06 · NARRATIVA` (em `--highlight`); H2 `Continua a história.` (branco/`var(--foreground)`); sub `Cada skin é um novo começo. Bora virar a tua?` (`var(--foreground-muted)`); strings finais a confirmar antes de fechar a cycle.

  - [x] Adicionar CTA primário `Ver mercado` — fundo `#FF5C0A`, texto `#0A0A0A`, hover via `--accent-soft`/`--accent-deep`. Destino real definido na implementação (âncora ou link futuro).

  - [x] Container do texto com legibilidade garantida sobre o background (padding generoso e/ou camada escura suave atrás do texto).

  - [x] Aumentar o `min-height` / `py` da secção para dar respiro ao background.

- [x] **Acessibilidade:**

  - [x] `aria-hidden` nas camadas decorativas; `<h2>`/`<p>` semânticos preservados.

  - [x] Foco visível no CTA; ordem natural de tab; sem captura de teclado.

  - [x] Em `prefers-reduced-motion: reduce`, sem rastreamento ativo de cursor (verificado manualmente em DevTools → Rendering → Emulate CSS media feature).

- [x] **Performance:**

  - [x] Não introduzir `setState` por frame; toda a animação roda em motion values escritas direto no estilo.

  - [x] Verificar que a secção não causa layout-shift acima dela (a galeria pinada já termina antes).

  - [x] `will-change: transform` no wrapper interativo; `perspective: 1200px` no parent.

- [x] **Verificação manual (desktop):**

  - [x] Mover cursor lentamente — tilt e paralax respondem dentro dos limites.

  - [x] Sair da área — retorno suave, sem snap.

  - [x] Emular `prefers-reduced-motion: reduce` — sem motion ativo, profundidade estática preservada.

  - [x] Emular pointer coarse (DevTools) — versão estática com mesmos overlays.

  - [x] CTA navegável por teclado, foco visível.

- [x] **`npm run build`** para garantir compilação antes de fechar o ciclo.

- [x] **Limpeza:** remover `cycles/request.md` (já foi consumido por este ciclo). _(feito durante refine; manter aqui como verificação.)_



**Notas de implementação:**



- Os handlers de ponteiro estão em `onPointerMoveCapture` na `<section>` para que o movimento actualize a skin mesmo quando o cursor passa sobre o texto/CTA; `onPointerLeaveCapture` não existe nos tipos React usados — usou-se `onPointerLeave` na secção.

- `app/page.tsx`: `id="hero-mercado"` no wrapper da hero para o `href` do CTA.

**Pivô tardio (durante implementação):** o modelo inicial usava a imagem como background full-bleed (`object-cover`) com vinheta + linhas creme. Após primeira validação visual, refatorou-se para o modelo final:

- secção em **estilo hero** (gradientes radiais + grade laranja + vinheta nas bordas, sem creme como superfície);
- skin como **elemento flutuante** off-center à direita em `object-contain` com `drop-shadow`, mais uma **camada-eco** desfocada por trás para ambiência;
- glow radial laranja a seguir o cursor entre as duas camadas;
- ativo trocado para PNG transparente (AWP) — mais limpo do que um JPEG full-bleed.

A interação (tilt ±5°, paralax ±12px, scale 1.02), o caminho `static` e os cenários (`scenarios.feature`) mantêm-se válidos. A spec canónica em `spec/features/rebrand-2026-q1/readme.md` reflete o modelo final.

**Polimentos posteriores (mesmo ciclo, sem alterar `scenarios.feature`):**

- **Entry scroll-scrubbed** ao chegar à secção (ritmo inspirado no site da KPR): `rotateX -18° → 0°`, `rotateY 24° → 0°`, `y 80→0`, `scale 0.82→1`, `opacity 0→1`. Driver: `useScroll({ target: skinFrameRef, offset: ["start end", "center center"] })`. Aplicado numa camada exterior `motion.div` com `transform-style: preserve-3d` para compor com o cursor-tilt sem conflito.
- **Modos refinados em três** (substitui o par `interactive` / `static`):
  - `interactive` (desktop, pointer fino) — entry + cursor;
  - `touch-static` (`pointer: coarse`) — entry + pose final levemente rotada (`-2°/-3°`);
  - `reduced-static` (`prefers-reduced-motion`) — pose estática imediata, sem entry, sem cursor.
- **Skin diminuída e deslocada para a esquerda** — frame de `right-[-6%] md:w-[68%] lg:w-[58%] xl:w-[52%]` para `right-[6%] md:w-[56%] lg:right-[10%] lg:w-[46%] xl:right-[14%] xl:w-[40%]`, dando mais ar ao texto e melhorando a nitidez aparente do raster (360×360 cobre menos pixels de ecrã).
- **Animações agressivas (Framer-style) nos textos da “Continua a história.”** — eyebrow desce do topo, H2 entra palavra a palavra desde a direita com `rotateY` 3D (stagger), sub e CTA seguem em cascata. `whileInView` com replay (`once: false`). Variantes reduzidas (só fade) em `prefers-reduced-motion`. Variantes definidas a nível de módulo em `components/ScrollDrivenHeroGallery.tsx` (`NARRATIVA_VARIANTS_FULL` / `NARRATIVA_VARIANTS_REDUCED`).
- **Saída cinematográfica da galeria (Fase C)** — timeline pinada rebalanceada de `0.45 / 1.00` para `0.40 / 0.85 / 1.00`. A nova Fase C (`0.85–1.00`) faz fly-through estilo KPR/peachweb: hero card overscale `×1.18`, `rotateX -12°`, `rotateY 6°`, drift `-110px`, fade para opacidade 0, com frame overlay e label canto a desvanecerem em paralelo. Após o `progress 1.0`, o pin liberta e a secção “Continua a história.” revela-se por baixo. Sem alteração da distância de scroll total (`+=600%` desktop / `+=200%` reduced-motion).

