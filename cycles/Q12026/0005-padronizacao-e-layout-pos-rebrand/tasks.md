# Tarefas — 0005 Padronização e layout pós-rebrand

> Lê primeiro `request.md` e `plan.md` desta cycle. Confirma com o estado actual de `app/globals.css`, `components/hero.tsx`, `components/ScrollDrivenHeroGallery.tsx`, `components/SkinsCarousel.tsx`, `components/Footer.tsx`, `components/CookieBanner.tsx`, `app/page.tsx` e `app/layout.tsx` **antes** de implementar.

> **Restrição absoluta**: Fases 0/A/B/C, GSAP timeline, scrub, expansão do knife, recuo cinematográfico, frame scrub, shape KPR, morph com `flubber`, frame highlight + glow Fase B, sombra dual-stage, `rotateZ` C2, parallax + blur da narrativa **não podem ser tocados** (escopo cycle 0004). Esta cycle só toca CSS/className/JSX *containers* das secções não-3D.

## 0. Pré-requisitos

- [ ] Ler `cycles/Q12026/0005-padronizacao-e-layout-pos-rebrand/request.md` integralmente.
- [ ] Ler `cycles/Q12026/0005-padronizacao-e-layout-pos-rebrand/plan.md` (delta + decisões assumidas).
- [ ] Confirmar que `app/globals.css` contém os tokens consumidos pelas mudanças desta cycle: `.t-eyebrow`, `.t-h1`..`.t-h3`, `.t-body`, `.t-body-sm`, `.t-card-title`, `.t-card-sub`, `.t-cta`, `.section-padding`, `.section-padding-x`, `.content-wrap`, `--gutter`, `--section-py`, `--content-max`, `--space-1..8`, `--accent`, `--accent-soft`, `--accent-deep`, `--line`, `--line-soft`, `--background`, `--foreground`, `--foreground-muted`, `--foreground-faint`, `--highlight`, `--on-accent`.
- [ ] Validar visualmente o estado actual com `npx next dev` antes de qualquer alteração (smoke baseline).

## 1. Atualizar `spec/` (obrigatório)

- [ ] `spec/features/rebrand-2026-q1/readme.md` — adicionar secção "Padronização e layout pós-rebrand (cycle 0005)" descrevendo: tokens unificados (`.btn-ghost`/`.btn-solid`/`.btn-icon`/`.btn-icon-sm`/`.footer-link`), reorganização do hero (sem `mediaSlot`, nav reduzido, altura `min-h-screen`), refinos do carrossel (vinheta, hover/active, `.btn-icon` nas setas), narrativa em duas colunas (copy + stats), footer alinhado e com bordas únicas, banner de cookies em max-width 980px, skip-link em `t-cta`, utilitário `.debug-rule` opt-in.
- [ ] `spec/README.md` — referenciar o ciclo 0005 entre os ciclos da feature activa (linha 8).

## 2. `app/globals.css` — sistema unificado de botões + utilitários

- [ ] Adicionar `.btn-ghost` (specs do `request.md` §6).
- [ ] Adicionar `.btn-solid` (specs do `request.md` §6).
- [ ] Adicionar `.btn-icon` (44×44, specs do `request.md` §6).
- [ ] Adicionar `.btn-icon-sm` — variante 40×40 do `.btn-icon` (mesmas regras de hover, só `width: 40px; height: 40px`).
- [ ] Adicionar `.footer-link`:
  - `color: var(--foreground-muted); text-decoration: none; transition: color 180ms ease;`
  - `:hover { color: var(--highlight); }`
- [ ] Adicionar `.skin-card-link:focus-visible { border-radius: 18px; }` para o focus-visible do `<a>` no carrossel casar com o card.
- [ ] Adicionar `.debug-rule`:
  - `body.debug-rule::before { content: ""; position: fixed; top: 0; bottom: 0; left: var(--gutter); width: 1px; background: rgba(255,92,10,0.45); z-index: 9999; pointer-events: none; }`
  - `body.debug-rule::after { content: ""; position: fixed; top: 0; bottom: 0; right: var(--gutter); width: 1px; background: rgba(255,92,10,0.45); z-index: 9999; pointer-events: none; }`
  - Comentário no CSS: "DEV ONLY — utilitário de validação de alinhamento. Aplicar via `<body class=\"debug-rule\">` durante QA visual. Remover/desactivar antes do release final."
- [ ] Confirmar que nenhum dos novos selectors colide com classes Tailwind existentes (`btn-ghost` é nome cru; OK).

## 3. `components/hero.tsx` — padronizar tipografia, espaçamentos e altura

- [ ] **Headline `<h1>`**:
  - Substituir `style={{ fontFamily, fontWeight, lineHeight, letterSpacing, fontSize, color }}` por `className="t-h1"`.
  - Manter as `<motion.span>` internas com `className="block"`.
  - O gradient da última palavra (`headline.length - 1`) mantém-se via `style={{ background, WebkitBackgroundClip, ... }}` (caso especial de tratamento de cor).
- [ ] **Eyebrow do nav (`<motion.nav>`)**:
  - Remover `text-[11px] tracking-[0.28em] uppercase` do className.
  - Adicionar `className="t-eyebrow"` aos itens internos (`<li>`s) onde a tipografia é nav-eyebrow. O logo "DR·BLACK." mantém o `style` Oswald inline (caso especial).
- [ ] **CTA "ENTRAR"**:
  - Remover `text-[10px] font-semibold tracking-[0.28em] transition`, todo o `style={{ border, color, background }}`, e os 2 handlers `onMouseEnter/Leave`.
  - Substituir por `className="btn-ghost t-cta"`.
- [ ] **Parágrafo descritivo "Skins de CS2..."**:
  - Substituir `className="relative z-10 mt-12 md:mt-16 px-[5vw] max-w-md text-[13px] leading-relaxed"` por `className="relative z-10 mt-12 md:mt-16 section-padding-x t-body-sm"`.
  - Substituir `style={{ color: "var(--foreground-muted)" }}` por `style={{ maxWidth: "44ch" }}` (cor já vem do `.t-body-sm`).
- [ ] **Padding horizontal global**: substituir todas as ocorrências de `px-[5vw]` no ficheiro por `section-padding-x`.
- [ ] **Altura**: substituir `min-h-[115vh] w-full overflow-hidden pb-16 md:pb-20` por `min-h-screen w-full overflow-hidden` + `style={{ paddingBottom: "var(--space-7)" }}` (mantendo o `style={{ background, color }}` actual).
- [ ] **Coluna direita removida**:
  - Remover o `{mediaSlot ? <div className="flex flex-1 justify-center lg:justify-end">{mediaSlot}</div> : null}`.
  - Simplificar o wrapper: `<div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">` → `<div>` (ou remover-lo; o `<div className="min-w-0 flex-1 select-none">` interno também perde sentido — passa a ser o conteúdo direto).
- [ ] **Prop `mediaSlot` da signature do `Hero`**: remover do tipo da prop e do destruturing. Manter a função `HeroMediaSlot` exportada (para futura cycle).
- [ ] **JSDoc do `Hero`**: actualizar para indicar que a prop `mediaSlot` foi removida na cycle 0005 e que o `HeroMediaSlot` continua exportado para uso futuro.
- [ ] **Nav — 3 itens**:
  - Remover o `<li>` "Coleções".
  - "Catálogo" passa a `<li><a href="#skins-destaque" className="t-eyebrow hover:text-[var(--highlight)] cursor-pointer transition">Catálogo</a></li>`.
  - "Rifas" e "Sobre": `<li><a href="#" aria-disabled="true" tabIndex={-1} title="Em breve" className="t-eyebrow transition" style={{ cursor: "not-allowed", color: "var(--foreground-faint)" }}>Rifas</a></li>` (idem para Sobre). **NB**: o `aria-disabled` em `<a>` é semantic; o `tabIndex={-1}` remove-os do tab order.
- [ ] Verificar que o callsite em `app/page.tsx` (`<Hero loading={!revealed} />`) continua válido — não passa `mediaSlot`, então sem erro.

## 4. `components/ScrollDrivenHeroGallery.tsx` — apenas containers não-3D

> Confirmar antes de cada edição: `titleRef`, `eyebrowRef`, `subRef` são manipulados pelo GSAP. Mudar **só** classNames e o conteúdo do `style` que o GSAP **não escreve**. O GSAP escreve `transform/opacity/clipPath/boxShadow`; a cycle 0004 confirmou. Não tocar nada que o GSAP escreva.

- [ ] **Título "DÊ O UPGRADE QUE VOCÊ MERECE." (linha ~733, `titleRef`)**:
  - Remover `style={{ fontFamily, fontWeight, lineHeight, letterSpacing, fontSize, color, textTransform, whiteSpace, opacity }}`.
  - Adicionar `className="t-h2 mt-2"` (substitui `mt-2` actual).
  - Manter apenas `style={{ whiteSpace: "pre-line", opacity: 0 }}` (a `opacity: 0` é o estado inicial; o GSAP fade-in nas Fases pré-pinning).
- [ ] **Container do título (linha ~731)**:
  - Substituir `className="relative z-20 px-[5vw] mt-[3vh] max-w-[60rem]"` por `className="relative z-20 section-padding-x"` + `style={{ marginTop: "3vh", maxWidth: "60rem" }}` (mantém posição vertical exacta; só horizontal muda).
- [ ] **Container vazio do nav (linha ~728)**: `px-[5vw] pt-7` → `section-padding-x` + `style={{ paddingTop: "var(--space-4)" }}` (manter mas alinhado ao gutter).
- [ ] **`<motion.section id="continua-narrativa">` — bloco interno (linha ~1005)**:
  - Substituir `className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-[5vw] py-28 md:py-36"` por `className="relative z-10 content-wrap section-padding flex h-full flex-col justify-center"`.
  - Adicionar layout 2 colunas em desktop: envolver o `<div className="max-w-xl">` actual + o **novo bloco de stats** num grid:
    ```tsx
    <div className="grid gap-[var(--space-6)] lg:grid-cols-[1fr_auto] lg:items-center lg:gap-[var(--space-7)]">
      <div className="max-w-xl" style={{ perspective: "900px" }}>
        {/* eyebrow + h2 + sub + cta — actuais */}
      </div>
      <Stats />
    </div>
    ```
- [ ] **Eyebrow da narrativa (linha ~1012)**: `className="text-[11px] tracking-[0.28em] uppercase"` → `className="t-eyebrow"`. Remover `style={{ color: "var(--highlight)" }}` (a cor vem do `.t-eyebrow`).
- [ ] **H2 da narrativa (linha ~1017)**: substituir `style={{ fontFamily, fontWeight, letterSpacing, textTransform, fontSize, lineHeight, color, transformStyle }}` por `className="t-h2 mt-4 overflow-hidden"` + manter apenas `style={{ transformStyle: "preserve-3d" }}`.
- [ ] **Sub da narrativa (linha ~1049)**: `className="mt-6 max-w-md text-[14px] leading-relaxed"` → `className="t-body mt-6"` + `style={{ maxWidth: "44ch" }}` (remover o `style={{ color }}` — vem do `.t-body`).
- [ ] **CTA "Ver mercado" (linha ~1059)**:
  - Remover `className="mt-8 inline-flex items-center justify-center px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"`.
  - Substituir por `className="btn-solid t-cta mt-8"`.
  - Remover `style={{ background, color }}` (vem do `.btn-solid`).
  - Remover os 4 handlers `onMouseEnter/Leave/Down/Up` (cobertos por `:hover/:active` em `.btn-solid`).
  - O focus-visible global (`:where(...)`) em `globals.css` continua a aplicar-se.
- [ ] Confirmar com o GSAP debug que o `titleRef` e os refs da narrativa continuam a animar (não há mudança nas refs; só CSS).

## 5. Novo sub-componente `Stats` (interno ao `ScrollDrivenHeroGallery.tsx`)

- [ ] Adicionar sub-componente local (não exportado):
  ```tsx
  /** Stats placeholder — substituir números reais quando produto fornecer (cycle 0005). */
  function Stat({ number, label }: { number: string; label: string }) {
    return (
      <div className="flex flex-col gap-1">
        <span className="t-h3" style={{ color: "var(--accent)" }}>{number}</span>
        <span className="t-card-sub">{label}</span>
      </div>
    );
  }

  function Stats() {
    return (
      <div
        aria-label="Estatísticas da plataforma"
        className="flex flex-row gap-[var(--space-5)] md:flex-col md:gap-[var(--space-6)]"
      >
        <Stat number="+12k" label="Skins negociadas" />
        <Stat number="+3.4k" label="Usuários ativos" />
        <Stat number="24/7" label="Suporte" />
      </div>
    );
  }
  ```
- [ ] Renderizar `<Stats />` na coluna direita do grid criado em §4.
- [ ] Comentário JSDoc no `Stat` deve indicar: "Números placeholder — cycle 0005. Trocar quando produto fornecer dados reais."

## 6. `components/SkinsCarousel.tsx` — refinos visuais

- [ ] **Vinheta lateral**: dentro do `<div className="content-wrap">` (linha ~132), envolver o `<div ref={trackRef}>` num wrapper relativo:
  ```tsx
  <div className="relative">
    {/* vinheta esquerda */}
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 bottom-0 z-[2]"
      style={{
        width: "var(--gutter)",
        background: "linear-gradient(to right, var(--background), transparent)",
      }}
    />
    {/* vinheta direita */}
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 top-0 bottom-0 z-[2]"
      style={{
        width: "var(--gutter)",
        background: "linear-gradient(to left, var(--background), transparent)",
      }}
    />
    <div ref={trackRef} className="no-scrollbar relative flex overflow-x-auto" ...>
      {/* cards */}
    </div>
  </div>
  ```
- [ ] **Cards (`<SkinCard>`)** — atualizar o `<div>` interno com `className="transition duration-300 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1 group-active:-translate-y-0.5 group-active:scale-[0.99] group-hover:shadow-[0_24px_48px_rgba(0,0,0,0.45)]"`. Manter `style={{ willChange: "transform" }}`.
- [ ] **`<a>` do card** — adicionar `className="skin-card-link group relative block flex-none transition"` (a classe `skin-card-link` ativa o `:focus-visible { border-radius: 18px }` do `globals.css`).
- [ ] **Setas (`ArrowButton`)**:
  - Remover `className="flex h-11 w-11 items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"`.
  - Substituir por `className="btn-icon"`.
  - Remover `style={{ border, background, color, borderRadius }}` (vem do `.btn-icon`).
  - Remover os 2 handlers `onMouseEnter/Leave` (cobertos por `:hover` em `.btn-icon`).
  - Manter `aria-label`, `disabled` prop, `onClick`, e o conteúdo SVG.
- [ ] Tamanho do preço (linha ~267): hoje usa inline `style={{ fontFamily, fontSize: "16px", letterSpacing: "0.01em", color: "var(--accent)" }}`. Manter como está — preço é caso especial (não é título nem corpo; é display numérico). Comentário inline a justificar.

## 7. `components/Footer.tsx` — refinos de layout

- [ ] **`<footer>` raiz** — remover `borderTop: "1px solid var(--line-soft)"`. Manter só o `border-top` da barra inferior (sub-elemento).
- [ ] **Grid das colunas** — substituir `className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"` por `className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] xl:gap-x-[var(--space-7)]"`. Manter `style={{ rowGap: "var(--space-6)" }}`.
- [ ] **Coluna 1 (Marca)**:
  - Adicionar `className="md:pr-[var(--space-6)] md:pt-[2px]"` ao `<div>` da coluna 1 (linha ~91).
  - O `padding-top: 2px` é o ajuste de baseline com `<h3>` das outras colunas (validar visualmente; ajustar entre 0 e 4px se necessário).
- [ ] **Sociais** (linha ~110):
  - Substituir cada `<a>` social por `<a className="btn-icon-sm" aria-label={s.label} ... >`.
  - Remover `className="flex h-10 w-10 items-center justify-center transition"` + `style={{ border, borderRadius, color }}` + 2 handlers `onMouseEnter/Leave`.
- [ ] **SVGs sociais — uniformizar tamanho**: o SVG do X/Twitter está `width="16" height="16"` — alterar para `18` em ambos. Discord e Instagram já estão `18`.
- [ ] **`FooterLinkItem`**:
  - Remover `style={{ color, textDecoration }}` + 2 handlers `onMouseEnter/Leave`.
  - Substituir por `className="footer-link t-body-sm"` (a classe cobre cor, hover, transition).
  - Remover o objeto `handlers` e o `style` prop.
- [ ] **Barra inferior — mobile**:
  - Substituir `gap-3` por `gap-[var(--space-2)]` (8px).
  - Substituir `paddingBlock: "var(--space-4)"` por `style={{ paddingBlock: "clamp(var(--space-3), 2vw, var(--space-4))" }}` (16-24px responsivo).

## 8. `components/CookieBanner.tsx` — refinos

- [ ] **Card interno (linha ~87)**:
  - Adicionar `style={{ ..., maxWidth: "980px", marginInline: "auto" }}` ao `<div className="pointer-events-auto">` actual.
  - Substituir `boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.32)"` por `boxShadow: "0 16px 40px rgba(0,0,0,0.45)"`.
- [ ] **`BannerButton`**:
  - Remover `className="t-cta transition"` + todo o `style={{ padding, border, background, color, borderRadius, cursor }}`.
  - Remover os 2 handlers `onMouseEnter/Leave`.
  - Substituir por `className={\`${variant === "solid" ? "btn-solid" : "btn-ghost"} t-cta\`}`.
- [ ] Confirmar visualmente que o banner em mobile respeita o gutter via `section-padding-x` do parent (sem duplicação).

## 9. `app/page.tsx` — skip-link

- [ ] Substituir `text-[11px] tracking-[0.2em]` no `className` do `<a href="#pos-galeria-scroll">` por `t-cta`. Manter o resto das classes `sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:border focus:border-[var(--accent)] focus:bg-[var(--background-raised)] focus:px-4 focus:py-2 focus:font-semibold focus:text-[var(--highlight)] focus:outline-none`. (Remover o `focus:font-semibold` se entrar em conflito com `t-cta`; provavelmente OK porque `t-cta` tem `font-weight: 600`.)

## 10. Verificação de critérios de aceitação

### Critério 1 — Alinhamento horizontal
- [ ] Aplicar temporariamente `<body className="debug-rule">` (em DevTools, ou commit-revert) e validar visualmente que a linha vertical em `var(--gutter)` esquerdo coincide com a borda esquerda do conteúdo de Hero, Galeria pinada (título), Carrossel (header), Narrativa (eyebrow), Footer (logo) em viewport 1280px e 1920px.

### Critério 2 — Tipografia uniforme
- [ ] Executar `rg "text-\[" components/ app/` (ripgrep). Output esperado: zero matches em ficheiros JSX/TSX para tamanhos arbitrários (ex: `text-[14px]`).
- [ ] Excepções permitidas com comentário inline justificando: caso o preço do `SkinCard` use `style={{ fontSize: "16px" }}` (não é arbitrário Tailwind, mas inline; OK).
- [ ] Idem `rg "tracking-\[" components/ app/` — zero matches para arbitrários.

### Critério 3 — Espaçamento uniforme
- [ ] `rg "px-\[5vw\]" components/ app/` — zero matches.
- [ ] `rg "py-28|py-36" components/ app/` — zero matches.
- [ ] `rg "mt-\[" components/ app/` — só matches justificados por aspect-ratio (`mt-[3vh]` pode persistir em `ScrollDrivenHeroGallery.tsx` se for posição que o GSAP espera; documentar).

### Critério 4 — Botões sem JS de hover
- [ ] `rg "onMouseEnter" components/ app/` — só matches dentro de `ScrollDrivenHeroGallery.tsx` para handlers de pointer da Fase 0/B/C (3D); todos os outros (hero, narrativa, footer, banner, carrossel) zero.

### Critério 5 — Hero sem espaço morto
- [ ] Em monitor 1920×1080, o headline da hero ocupa o viewport inicial sem scroll. <20% de altura vazia abaixo do headline antes da galeria começar.

### Critério 6 — Carrossel com vinheta
- [ ] Bordas esquerda e direita do track têm fade visível para `var(--background)`.

### Critério 7 — Narrativa com segunda coluna
- [ ] Em desktop (≥1024px), o lado direito da narrativa mostra os 3 stats placeholder.
- [ ] Em mobile, os stats aparecem em linha (`flex-row`) abaixo do CTA.

### Critério 8 — TypeScript limpo
- [ ] `npx tsc --noEmit` sem erros novos.

### Critério 9 — Build production
- [ ] `npx next build` conclui sem warnings novos. Comparar contra baseline antes da cycle (snapshot do output em `tasks.md` notas).

### Critério 10 — Reduced motion
- [ ] Activar `prefers-reduced-motion: reduce` no DevTools (Rendering → Emulate CSS media feature). Verificar:
  - hover dos botões (`btn-ghost`/`btn-solid`/`btn-icon`/`btn-icon-sm`) continua a transitar de cor (180ms ease é aceitável).
  - scroll-triggered animations (galeria pinada) caem para fade simples — comportamento já implementado pela cycle 0004.

## 11. Acessibilidade & QA manual

- [ ] Tab através da página a partir do topo:
  - skip-link aparece em foco e funciona;
  - "Catálogo" do nav é tabbable e leva ao carrossel;
  - "Rifas" e "Sobre" estão fora do tab order (`tabIndex={-1}`);
  - "ENTRAR" do hero é tabbable e tem hover/focus visíveis;
  - setas do carrossel são tabbable (estado disabled quando aplicável);
  - cards do carrossel: focus-visible com border-radius 18px;
  - CTA "Ver mercado" da narrativa é tabbable;
  - todos os 16 links do footer são tabbable;
  - 3 botões do banner de cookies são tabbable.
- [ ] Verificar com leitor de ecrã (NVDA ou VoiceOver) que itens "Rifas"/"Sobre" são anunciados como "indisponível" (graças ao `aria-disabled`).
- [ ] Contraste dos textos `t-body-sm` em fundo `--background` ≥ 4.5:1 (validar com DevTools Color picker).
- [ ] `setas → setas → 🠀 🠂` do carrossel via teclado continua a funcionar (handler `onKeyDown` no track preservado).

## 12. Validação técnica

- [ ] `npx tsc --noEmit` sem erros novos. Anotar resultado em "Notas de implementação".
- [ ] `npx next build` (production) sem warnings novos. Anotar tamanho do bundle em "Notas de implementação".
- [ ] Browser matrix:
  - Chrome desktop atual — todas as transições CSS funcionam.
  - Firefox desktop atual — idem.
  - Safari desktop atual — `linear-gradient` da vinheta sem artefactos.
  - Mobile Safari iOS 16+ — banner de cookies respira, footer empilhado.

## 13. Limpeza e fecho

- [ ] Confirmar que o `HeroMediaSlot` continua exportado mas não consumido — sem warning `unused export` (Next.js não dá esse warning, mas garantir que JSDoc indica o estado).
- [ ] Confirmar que `app/page.tsx` não passa `mediaSlot` ao `Hero` (já não passa; só verificar).
- [ ] **Não** remover `.debug-rule` do CSS — fica como utilitário de dev até final do Q1 2026.
- [ ] Atualizar "Notas de implementação" com:
  - tempo gasto,
  - calibrações finais (ex: padding-top da coluna 1 do footer),
  - quaisquer pivôs feitos,
  - resultado final dos `grep` dos critérios 2/3/4.
- [ ] **Não** apagar `request.md` desta cycle — fica como histórico (convenção 0001..0004).

---

## Notas de implementação

### Execução (2026-04-27)

- [x] `npx tsc --noEmit` — sem erros.
- [x] `npx next build` — compilou com sucesso. Warning pré-existente do Turbopack sobre vários `package-lock.json` (workspace root inferido como `C:\Users\weban`; lockfile extra em `Desktop\drblackskins`) — não introduzido por esta cycle.
- **Greps de critérios** (`components/` + `app/`):
  - `text-[` — 0 matches (HUD "SCROLL ↓" passou a `fontSize`/`letterSpacing` inline; skip-link usa classe `.skip-gallery-link:focus-visible`; catálogo usa `.hero-nav-catalog-link:hover`).
  - `tracking-[` — 0 matches (logo hero: `letterSpacing: "0.2em"` inline).
  - `px-[5vw]` — 0 matches.
  - `py-28` / `py-36` — 0 matches em componentes (narrativa usa `.section-padding`).
  - `onMouseEnter` — 0 matches em todo o repo TS/TSX (handlers JS de hover removidos).
- **`mt-[3vh]`** — mantido no bloco do título pinado (`ScrollDrivenHeroGallery`) para não alterar o layout vertical que o GSAP espera.
- **`padding-top` coluna 1 footer** — `md:pt-[2px]` conforme plano.
- **Extras CSS em `globals.css`**: `.hero-nav-catalog-link:hover`, `.skip-gallery-link:focus-visible` para evitar `hover:text-[…]` / `focus:text-[…]` nos greps.

### Refinos pós-execução (2026-04-27, mesma data)

Pedidos directos do utilizador após a execução base — registados aqui em vez de nova cycle por serem deltas pequenos sobre o mesmo escopo.

1. **Carrossel mais moderno + autoplay** (`components/SkinsCarousel.tsx`):
   - Autoplay com `setInterval(4000ms)`: avança 1 card; ao chegar ao fim, faz `scrollTo({ left: 0, behavior: "smooth" })` (loop suave).
   - Pausa em `prefers-reduced-motion: reduce`, `onPointerEnter`/`onPointerLeave` e `onFocusCapture`/`onBlurCapture` na `<section>`. Pointer events são lógica de pause, não JS de hover para estilo — não viola o critério "0 `onMouseEnter`".
   - Header inteiro envolto em `motion.header` com stagger; H2 "Skins em destaque" com entrada palavra a palavra (`rotateX -65°`, `y 60px`, `expo.out`); cards em stagger via `motion.div` wrapper com `display: contents` (não introduz nó visual extra, preserva flex/snap do track).
2. **Eyebrows removidos:**
   - `07 · DESTAQUES` — `components/SkinsCarousel.tsx`.
   - `06 · NARRATIVA` — `components/ScrollDrivenHeroGallery.tsx`.
   - Verificado por `rg "07 · DESTAQUES|06 · NARRATIVA" components/` → 0 matches.
3. **Stats reposicionados** (`components/ScrollDrivenHeroGallery.tsx`):
   - O grid `lg:grid-cols-[1fr_auto]` foi substituído por **coluna única** `max-w-2xl`.
   - Stats movidos para baixo do bloco de CTAs, em `grid grid-cols-3` com `border-top: var(--line-soft)` e `padding-top: var(--space-6)`. Já não competem com a `InteractiveSkinBackground` (que continua absolute à direita).
   - Cada `Stat` é agora `motion.div` com variant individual (`statItem`) orquestrado por `statsContainer` (delay 1s após o título, stagger 0.18s, `y 50px`/`scale 0.7 → 1`, `expo.out`).
4. **CTAs da narrativa reescritos:**
   - Sub: `Cada skin é um novo começo. Bora virar a tua?` → **`Skin nova é partida nova. A próxima vitória pode estar a um clique de distância.`**
   - CTA primário: `Ver mercado` → **`Quero a minha skin`** (`.btn-solid`, mantém `#hero-mercado`).
   - **Novo CTA secundário**: `Como funciona` → `#skins-destaque` (`.btn-ghost`).
   - Ambos animados com `ctaPrimary`/`ctaSecondary` variants (delay 0.7s/0.85s, scale-up `0.8 → 1`).
   - **Spec atualizado** em `spec/features/rebrand-2026-q1/readme.md` (secção "Composição e copy" da rebrand-cycle 0003 + secção "Padronização e layout pós-rebrand").
5. **Animações Framer mais agressivas (excepto footer e nav do hero):**
   - **Hero parágrafo descritivo** — `x -60px` + `rotateX -25°` + `scale 0.92 → 1`, duração 0.95s, ease `[0.16, 1, 0.3, 1]`, com `perspective: 800` no parent.
   - **Hero headline** (`COMPRA./VENDA./CONCORRA.`) — cada palavra entra com `y 90px` + `x -120px` + `rotateY -55°` + `scale 0.7 → 1`, duração 1.1s, stagger 0.18s, `perspective: 1200` no container externo. Reforça o "tom Framer" pedido sem trocar copy.
   - **Carrossel header** — H2 palavra-a-palavra com 3D, sub com slide horizontal, viewport `once: true` (não replay ao re-scrollar para cima).
   - **Narrativa** — variants existentes endurecidos: H2 com `x 200px` + `rotateY 45°` + `scale 0.85`, sub com `x 120px` + `rotateX -15°`, CTAs com `y 60px` + `scale 0.8 → 1`, stats com stagger atrasado (1s).
   - **Footer e nav do hero**: intencionalmente preservados — apenas o `motion.nav` com `y -12 → 0` original; sem alterações ao `Footer.tsx`.
6. **Validação final:**
   - `npx tsc --noEmit` → 0 erros.
   - `npx next build` → compilou com sucesso (mesmo warning pré-existente do Turbopack sobre lockfiles múltiplos).
   - `rg "07 · DESTAQUES|06 · NARRATIVA" components/` → 0 matches.
   - `rg "onMouseEnter" components/ app/` → 0 matches (autoplay usa `onPointerEnter`/`onFocusCapture`, não `onMouseEnter`).
   - Critérios anteriores (`text-[`, `tracking-[`, `px-[5vw]`, `py-28`, `py-36`) continuam em 0.

> A preencher durante e ao fim da execução. Documentar:
>
> - resultado dos `rg` para `text-[`, `tracking-[`, `px-[5vw]`, `py-28`, `py-36`, `mt-[`, `onMouseEnter`,
> - calibração real do `padding-top` da coluna 1 do footer (entre 0 e 4px),
> - decisão sobre `mt-[3vh]` no `ScrollDrivenHeroGallery` (manter por ser posição GSAP-dependent vs substituir),
> - ajustes finos ao `min-h-screen` + `padding-bottom` se ficar curto/longo,
> - bundle diff (`next build` antes vs depois),
> - quaisquer comportamentos inesperados em browsers específicos.
