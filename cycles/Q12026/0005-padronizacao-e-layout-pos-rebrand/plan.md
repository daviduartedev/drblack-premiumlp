# Plano (delta) — Padronização e layout pós-rebrand (Q1 2026)

## Baseline (estado canónico anterior)

- [cycles/Q12026/0001-rebranding-cores-e-copy/](../0001-rebranding-cores-e-copy/) — paleta laranja/creme/preto, tokens em `app/globals.css` (`:root` + `@theme inline`).
- [cycles/Q12026/0002-hero-elemento-estatico-e-scroll-contínuo/](../0002-hero-elemento-estatico-e-scroll-contínuo/) — slot de mídia opcional na hero (`HeroMediaSlot`), `min-h-[115vh]`, scroll contínuo desktop.
- [cycles/Q12026/0003-narrativa-skin-interativa/](../0003-narrativa-skin-interativa/) — secção "Continua a história." inline em `ScrollDrivenHeroGallery`, com strings congeladas e CTA `Ver mercado` para `#hero-mercado`.
- [cycles/Q12026/0004-transicoes-kpr-fieis/](../0004-transicoes-kpr-fieis/) — fronteiras de fase `0 / 0.18 / 0.40 / 0.85 / 1.00`, easings por fase, morph fluido com `flubber`, frame highlight + glow Fase B, saída cinematográfica refinada.
- **Intervenção manual recente (fora do sistema de cycles)** — adicionou tokens tipográficos (`.t-eyebrow`, `.t-h1`..`.t-h3`, `.t-body`, `.t-body-sm`, `.t-card-title`, `.t-card-sub`, `.t-cta`), tokens de layout (`.section-padding`, `.section-padding-x`, `.content-wrap`, `--gutter`, `--section-py`, `--content-max`, escala `--space-1..8`), o carrossel `SkinsCarousel`, o `Footer` institucional, o `CookieBanner` LGPD, três rotas legais (`/termos`, `/privacidade`, `/cookies`) e atualizou o `KprCard` para consumir `.t-card-title`/`.t-card-sub`. **Os tokens estão corretos**, mas o *consumo* nos componentes legacy (hero, partes não-3D do `ScrollDrivenHeroGallery`) ainda usa `text-[Npx]`, `tracking-[Nem]`, `px-[5vw]`, e há desalinhamentos visuais entre as secções pós-integração.

## Decisões de produto (assumidas neste ciclo, registadas para reverter facilmente)

> O `request.md` desta cycle é altamente prescritivo. As decisões abaixo cobrem áreas onde o request deixou ambiguidade ou alternativas. **Defaults assumidos sem confirmação humana** (questões de refinamento foram skipadas pelo utilizador) — todas reversíveis sem refator estrutural.

1. **Segunda coluna da narrativa "Continua a história."** — preenchida com **3 stats em coluna** com números placeholder: `+12k SKINS NEGOCIADAS`, `+3.4k USUÁRIOS ATIVOS`, `24/7 SUPORTE`. Numbers explicitamente marcados como provisórios; trocar quando o produto fornecer reais. Layout: vertical em desktop (`md:`), horizontal em mobile (`flex-row` com wrap), número em `.t-h3` cor `--accent`, label em `.t-card-sub` cor `--foreground-muted`. Render como children dentro do `<motion.section id="continua-narrativa">`, **a seguir** ao bloco de copy actual, partilhando o mesmo `content-wrap`.
2. **`HeroMediaSlot`** — a prop `mediaSlot` do `Hero` é **removida** (a coluna direita não se monta nesta cycle). O componente `HeroMediaSlot` permanece exportado em `components/hero.tsx` como utilitário standalone para futuras cycles que reintroduzam mídia; comentário JSDoc actualizado a indicar que **não está actualmente consumido**.
3. **Nav do hero — itens sem destino real** — "Catálogo" → `#skins-destaque`. "Rifas" e "Sobre" mantêm `href="#"` mas recebem `aria-disabled="true"`, `tabIndex={-1}`, `title="Em breve"` e `cursor: not-allowed` para sinalizar UX. "Coleções" é **removido** até existir destino. Resultado: 3 itens visíveis (1 funcional, 2 marcados "Em breve").
4. **Vinheta lateral do carrossel** — dois `<div aria-hidden>` absolutos **bound ao track** (não full-bleed), largura = `var(--gutter)` cada, gradiente `linear-gradient(to right, var(--background), transparent)` (esquerda) e mirror (direita), `pointer-events: none`, `z-index: 2`. Sem `mask-image` (Safari iOS quirks).
5. **Cookie banner — largura em desktop** — o card interno recebe `max-width: 980px` (mais estreito que o `--content-max=1240px`), centrado dentro do `content-wrap` por `margin-inline: auto`. Em mobile herda o gutter do parent (`section-padding-x`) — sem `margin-inline: var(--gutter)` adicional (seria duplicar). Sombra reduz para `0 16px 40px rgba(0,0,0,0.45)`.
6. **Footer — alinhamento vertical da coluna 1 (Marca)** — adicionar `padding-top` na coluna 1 para que o **topo do logo "DR·BLACK."** caia visualmente na baseline do `<h3>` (`.t-eyebrow`) das outras colunas. Implementação: `padding-top: 2px` (calibração pelo line-height residual do `<h3>` 11px / 1 = ~14px vs logo 20px / 1 = ~20px). Validar em devtools.
7. **`.debug-rule` (utilitário de validação de alinhamento)** — adicionar classe opt-in em `globals.css` que, quando aplicada ao `<body>`, pinta uma linha vertical fixa em `left: var(--gutter)` cobrindo `100vh`. Uso: `<body class="debug-rule">` para activar, remover para desactivar. Sem JS, sem toggle de teclado. Comentário no CSS sinaliza que é utilitário de dev e **deve ser removido antes do release final** (esta cycle não remove — fica até final do Q1 2026).
8. **Skip-link "Pular animação da galeria"** — actualizado para consumir `.t-cta` (não tracking arbitrário). Mantém `sr-only` + `focus:not-sr-only` actuais para visibilidade só em foco por teclado.
9. **CTA "Ver mercado" da narrativa** — mantém `href="#hero-mercado"` (string congelada pela cycle 0003). Não é alvo desta cycle alterar.
10. **Validação técnica executada pelo agente** — `npx tsc --noEmit` + `npx next build` antes de fechar a cycle, com resultados anotados nas "Notas de implementação" do `tasks.md`.

## Delta funcional (o que muda no produto)

### 1. `app/globals.css` — sistema unificado de botões + utilitário de debug

Adicionar três classes utilitárias que substituem handlers JS de hover espalhados pelos componentes (CTA do hero, CTA "Ver mercado", botões do cookie banner, links sociais do footer, setas do carrossel):

- **`.btn-ghost`** — pílula transparente com border `var(--line)`, hover preenche com `var(--accent)`. Specs no `request.md` §6 (padding `10px 20px`, transição `180ms ease`).
- **`.btn-solid`** — pílula sólida `var(--accent)`, hover `var(--accent-soft)`, active `var(--accent-deep)`. Padding `12px 24px`.
- **`.btn-icon`** — círculo 44×44 com border `var(--line)`, hover preenche com `var(--accent)`. Specs no `request.md` §6. Estado disabled (`:disabled`): opacidade `0.25` + `cursor: not-allowed`.

Adicionar também:
- **`.debug-rule`** — opt-in vertical line em `var(--gutter)` esquerdo, `position: fixed; top: 0; bottom: 0; width: 1px; background: rgba(255,92,10,0.45); z-index: 9999`. Aplica via `body.debug-rule::before`. Comentário sinaliza dev-only.

Nenhum dos novos selectors interfere com classes existentes; só adiciona capacidades.

### 2. `components/hero.tsx` — padronizar tipografia, espaçamentos e altura

- **Headline `<h1>`** — substituir o bloco `style={{ fontFamily, fontWeight, lineHeight, letterSpacing, fontSize, color }}` por `className="t-h1"`. As `<motion.span>` mantêm a animação stagger framer-motion intacta (só perdem o size inline; gradient da última palavra mantém-se via `style`).
- **Eyebrow do nav** — substituir `text-[11px] tracking-[0.28em] uppercase` por `className="t-eyebrow"` no `<motion.nav>` ou nos itens internos conforme estrutura. Logo "DR·BLACK." mantém `font-family: var(--font-oswald)` inline (logo é um caso especial, não compete com tipografia narrativa).
- **CTA "ENTRAR"** — remover `style={{ border, color, background }}` + `onMouseEnter/Leave` JS. Trocar para `className="btn-ghost t-cta"` e remover `text-[10px] font-semibold tracking-[0.28em]`. O `.btn-ghost` cobre o estado de hover via CSS puro.
- **Paragrafo descritivo "Skins de CS2..."** — substituir `text-[13px] leading-relaxed` + `max-w-md` por `className="t-body-sm section-padding-x"` + `style={{ maxWidth: "44ch" }}`. O `section-padding-x` substitui `px-[5vw]`.
- **Padding horizontal global do hero** — substituir todas as ocorrências de `px-[5vw]` (no nav, no parágrafo, no bloco do headline) por `className="section-padding-x"`.
- **Altura do hero** — `min-h-[115vh] pb-16 md:pb-20` → `min-h-screen` + `style={{ paddingBottom: "var(--space-7)" }}`. Elimina o "espaço morto" em monitores grandes (critério 5).
- **Coluna direita removida** — remover o bloco `{mediaSlot ? <div className="flex flex-1 justify-center lg:justify-end">{mediaSlot}</div> : null}`. Remover a prop `mediaSlot` da signature do `Hero`. Remover o `flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12` da `<div>` do headline (passa a `<div>` simples com `min-w-0`). O `HeroMediaSlot` continua exportado mas não consumido.
- **Nav — 3 itens** — remover `<li>` "Coleções". "Catálogo" recebe `href="#skins-destaque"`. "Rifas" e "Sobre" recebem `aria-disabled="true"`, `tabIndex={-1}`, `title="Em breve"` e `cursor: not-allowed` (via inline style ou class). Itens activos mantêm o `:hover` actual via CSS.

Backgrounds radiais e grid SVG do hero **não são tocados** (parte do design integral do hero, não há tokens equivalentes).

### 3. `components/ScrollDrivenHeroGallery.tsx` — só áreas seguras (não-3D)

> **Restrição absoluta**: Fases 0/A/B/C, GSAP timeline, scrub, expansão do knife, recuo cinematográfico, frame scrub, shape KPR, morph com `flubber`, border highlight + glow Fase B, sombra dual-stage, `rotateZ` C2, parallax + blur da narrativa **não podem ser tocados** (escopo cycle 0004).

Áreas seguras:

- **Título "DÊ O UPGRADE QUE VOCÊ MERECE."** (linha ~733, `titleRef`) — substituir o bloco `style={{ fontFamily, fontWeight, lineHeight, letterSpacing, fontSize, color, textTransform, whiteSpace, opacity }}` por `className="t-h2"` e manter apenas `style={{ whiteSpace: "pre-line", opacity: 0 }}` (a `opacity: 0` é inicial; o GSAP anima para `1`). O `ref={titleRef}` é preservado para o GSAP escrever transformações.
- **Container do título** — `px-[5vw] mt-[3vh] max-w-[60rem]` → `className="section-padding-x"` + `style={{ marginTop: "3vh", maxWidth: "60rem" }}` (mantém a posição vertical onde o GSAP espera).
- **Secção "Continua a história." (`<motion.section id="continua-narrativa">`)**:
  - Container externo do bloco de copy: `mx-auto flex h-full max-w-6xl flex-col justify-center px-[5vw] py-28 md:py-36` → `className="content-wrap section-padding"`. O `max-w-6xl` (~1152px) é substituído pelo `--content-max` (1240px) consistente.
  - **Layout interno passa a 2 colunas em desktop** — adicionar `grid lg:grid-cols-[1fr_auto] lg:gap-[var(--space-7)] lg:items-center` (ou flex equivalente). Coluna esquerda mantém o copy actual (`max-w-xl` no inner div). Coluna direita recebe o novo bloco de stats (ver §4).
  - **Eyebrow** `text-[11px] tracking-[0.28em] uppercase` → `className="t-eyebrow"`.
  - **H2** — substituir `style={{ fontFamily, fontWeight, letterSpacing, textTransform, fontSize, lineHeight, color, transformStyle }}` por `className="t-h2"` + manter apenas `style={{ transformStyle: "preserve-3d" }}` (o framer-motion stagger por palavra mantém-se).
  - **Sub** — `text-[14px] leading-relaxed max-w-md` → `className="t-body"` + `style={{ maxWidth: "44ch" }}`.
  - **CTA "Ver mercado"** — substituir `className="mt-8 inline-flex items-center justify-center px-8 py-3 text-[11px] font-semibold tracking-[0.22em] uppercase transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"` + `style={{ background, color }}` + 4 handlers JS (`onMouseEnter/Leave/Down/Up`) por `className="btn-solid t-cta mt-8"`. O `.btn-solid` cobre hover/active via CSS puro. O `focus-visible` global do `:where(...)` em `globals.css` continua a aplicar-se.

### 4. Nova segunda coluna da narrativa — bloco de stats

Adicionar dentro da `<motion.section id="continua-narrativa">`, na coluna direita do grid (descrita em §3):

```tsx
<div className="flex flex-row gap-[var(--space-5)] md:flex-col md:gap-[var(--space-6)]">
  <Stat number="+12k" label="Skins negociadas" />
  <Stat number="+3.4k" label="Usuários ativos" />
  <Stat number="24/7" label="Suporte" />
</div>
```

Onde `Stat` é um sub-componente local do `ScrollDrivenHeroGallery.tsx` (não exportado) que renderiza:

- **Número** — `<span className="t-h3" style={{ color: "var(--accent)" }}>{number}</span>`.
- **Label** — `<span className="t-card-sub">{label}</span>` (cor herdada `rgba(238,217,196,0.78)` do `.t-card-sub`).

Comentário no JSDoc do `Stat` indica que os números são placeholders — substituir quando dados reais existirem (TODO referenciando esta cycle).

### 5. `components/SkinsCarousel.tsx` — refinos visuais

- **Header da secção** — já alinhado ao gutter via `content-wrap` actual. **Manter inalterado** (alinhamento OK).
- **Vinheta lateral no track** — dentro do `<div ref={trackRef}>` (ou irmão dele), adicionar dois `<div aria-hidden>`:
  - Esquerda: `position: absolute; left: 0; top: 0; bottom: 0; width: var(--gutter); pointer-events: none; z-index: 2; background: linear-gradient(to right, var(--background), transparent)`.
  - Direita: `position: absolute; right: 0; top: 0; bottom: 0; width: var(--gutter); pointer-events: none; z-index: 2; background: linear-gradient(to left, var(--background), transparent)`.
  - Container pai do track recebe `position: relative` se ainda não tiver.
- **Cards** — em `<SkinCard>` (linha ~209):
  - Hover: o `group-hover:-translate-y-1` actual mantém-se (existe). Adicionar `group-hover:shadow-[0_24px_48px_rgba(0,0,0,0.45)]` no `<div>` interno com `transition` actual estendida para incluir `box-shadow`.
  - Active: `group-active:-translate-y-0.5 group-active:scale-[0.99]`.
  - Focus-visible no `<a>`: já tem outline global; adicionar `style={{ borderRadius: "18px" }}` no `:focus-visible` específico via classe ou style condicional para casar com o card. (Implementação: classe local `.skin-card-link:focus-visible { border-radius: 18px; }` ou inline style condicional.)
- **Setas (`ArrowButton`)** — substituir o `style={{ border, background, color, borderRadius }}` + `onMouseEnter/Leave` JS por `className="btn-icon"`. O componente passa só a renderizar `<button className="btn-icon" disabled={disabled} ...>{svg}</button>`. O estado disabled herda `opacity: 0.25` do `.btn-icon:disabled`. Aria-label mantém-se.

### 6. `components/Footer.tsx` — refinos de layout

- **Bloco superior** — manter `content-wrap section-padding-x`, mas remover o `borderTop: "1px solid var(--line-soft)"` do `<footer>` raiz. Manter apenas o `borderTop` da barra inferior (separação clara entre conteúdo e barra de copyright/CNPJ).
- **Grid das colunas em desktop largo (>1280px)** — actual `gap-10` em mobile e `1.4fr_1fr_1fr_1fr` em desktop. Adicionar `xl:gap-x-[var(--space-7)]` (64px) para desktop largo. Manter `rowGap: var(--space-6)` actual.
- **Coluna 1 (Marca)** — adicionar `padding-right: var(--space-6)` apenas em desktop (`md:pr-[var(--space-6)]`). Adicionar `padding-top: 2px` em desktop para alinhamento baseline com `<h3>` das outras colunas (decisão §6 das premissas).
- **Sociais** — uniformizar tamanho dos ícones para `18px` (Discord e Instagram já são; X/Twitter está `16` — alterar). Substituir os 3 `<a>` com handlers `onMouseEnter/Leave` JS por `className="btn-icon"` aplicado a cada `<a>`. O width/height passa a ser controlado pelo `.btn-icon` (44×44 padrão) — mas a request quer `40×40` (`h-10 w-10` actual). Adicionar variante: aplicar `style={{ width: "40px", height: "40px" }}` inline ao `<a>` para manter o ratio actual, e o `.btn-icon` pode aceitar override via inline style. Alternativa: criar `.btn-icon-sm` (40×40) se preferível para reuso. **Decisão**: criar `.btn-icon-sm` em `globals.css` como variante 40×40 do `.btn-icon`, sem duplicar lógica.
- **Coluna 1 — paragrafo da marca** — manter `t-body-sm mt-4` + `style={{ maxWidth: "32ch" }}` actual.
- **Barra inferior — mobile** — substituir `gap-3` por `gap-[var(--space-2)]` (8px). Adicionar `paddingBlock: var(--space-3)` em mobile (16px) e manter `var(--space-4)` em desktop. Implementação: `style={{ paddingBlock: "var(--space-3)" }}` em mobile, `md:py-[var(--space-4)]` em desktop. Ou usar `paddingBlock: "clamp(var(--space-3), 2vw, var(--space-4))"` num único valor.
- **Links internos do footer (`FooterLinkItem`)** — substituir os handlers `onMouseEnter/Leave` JS por classe CSS `.footer-link` em `globals.css` que define `color: var(--foreground-muted); transition: color 180ms ease` e `:hover { color: var(--highlight) }`. Reduz fricção (4 links × 4 colunas = 16 elementos com handlers JS hoje). **Alternativa simples**: declarar a transição inline já no className via Tailwind `hover:text-[var(--highlight)]` — mas isso mantém arbitrário; preferimos classe nomeada. **Decisão**: criar `.footer-link` (também serve para qualquer link "muted que vira highlight em hover").

### 7. `components/CookieBanner.tsx` — refinos

- **Card interno** — adicionar `max-width: 980px` + `margin-inline: auto` ao `<div>` do `pointer-events-auto` (linha ~87).
- **Sombra** — substituir `boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.32)"` por `boxShadow: "0 16px 40px rgba(0,0,0,0.45)"` (request §5).
- **Botões `BannerButton`** — substituir os handlers JS por `className="btn-ghost t-cta"` ou `className="btn-solid t-cta"` conforme `variant`. Remover o `style={{ padding, border, background, color, borderRadius, cursor }}` inline e os 2 `onMouseEnter/Leave`. O `.btn-ghost`/`.btn-solid` cobrem padding e estados.
- **Container externo** — manter `content-wrap section-padding-x` + `paddingBlock: var(--space-4)`. Em mobile, o `section-padding-x` aplica `var(--gutter)` ao card já correctamente — sem duplicação.

### 8. `app/page.tsx` — skip-link

- Skip-link `<a href="#pos-galeria-scroll">` — substituir `text-[11px] tracking-[0.2em]` por `t-cta`. Manter o resto das classes `sr-only focus:not-sr-only ...`.

### 9. `KprCard.tsx` — não tocado

`KprCard` já consome `.t-card-title`/`.t-card-sub` via cycle anterior. Sem mudanças nesta cycle.

## Verificação de alinhamento horizontal (critério 1)

Todas as secções pós-hero devem partilhar a mesma origem horizontal:

| Secção | Container | Padding lateral |
|--------|-----------|-----------------|
| Hero (nav, paragrafo, headline) | n/a | `.section-padding-x` (= `var(--gutter)`) |
| Galeria pinada — título "DE O UPGRADE..." | n/a | `.section-padding-x` |
| Carrossel — header e track (header alinhado, track sangra para gutter) | `.content-wrap` | herda do `.section-padding` da `<section>` |
| Narrativa — `<motion.section id="continua-narrativa">` bloco interno | `.content-wrap` + `.section-padding` | `var(--gutter)` |
| Footer — bloco superior e barra inferior | `.content-wrap` + `.section-padding-x` | `var(--gutter)` |

Validação: aplicar `<body class="debug-rule">` durante QA visual; a regra vertical em `var(--gutter)` esquerdo deve coincidir com a borda esquerda do conteúdo de cada secção em viewport ≥1024px.

## Decisões técnicas

- **Sem novas dependências** — apenas CSS adicional em `globals.css` e refactors. `flubber`/`gsap`/`framer-motion` já no projecto.
- **Sem listeners adicionais** — nenhuma das mudanças adiciona scroll/resize listeners. O carrossel mantém os 2 listeners actuais (`scroll` + `resize`); o `.btn-icon`/`.btn-ghost`/`.btn-solid` são CSS-only.
- **Reduced motion** — as transições de hover (180ms) são mantidas (não são scroll-triggered nem motion intrusivo). Nenhuma adição quebra `prefers-reduced-motion`.
- **TypeScript** — `npx tsc --noEmit` deve continuar limpo. A signature de `Hero` muda (remove `mediaSlot`); o callsite em `app/page.tsx` não passa essa prop, então não há erro.
- **Acessibilidade**:
  - `aria-disabled="true"` em "Rifas"/"Sobre" do nav é a forma correcta para um link sem destino.
  - `aria-label` das setas do carrossel preservado.
  - Focus-visible global continua a aplicar-se em todos os botões.
  - Skip-link em `t-cta` mantém legibilidade.
- **Compatibilidade browser** — os utilitários CSS novos usam apenas: `display: inline-flex`, `border-radius`, `transition`, `box-shadow`, `linear-gradient`. Sem `mask-image`, sem `backdrop-filter` (já há um na narrativa, cycle 0004).
- **Performance** — substituir handlers `onMouseEnter/Leave` por CSS reduz re-renders e listeners passivos. Ganho marginal mas alinhado a boas práticas.

## Critérios de aceitação (do `request.md`, mantidos)

1. Alinhamento horizontal — borda esquerda de Hero, Galeria pinada, Carrossel, Narrativa, Footer cai na mesma posição em viewport ≥1024px.
2. Tipografia uniforme — `grep -rn "text-\[" components/ app/` retorna zero matches para tamanhos arbitrários (excepção justificada: `text-[10px]` em locais com aspect-ratio específico, com comentário).
3. Espaçamento uniforme — `grep -rn "px-\[5vw\]" components/ app/` retorna zero. Idem `py-28`, `py-36`, `mt-[Nvh]`.
4. Botões sem JS de hover — `grep -rn "onMouseEnter" components/ app/` retorna zero (excepção: handlers de pointer da Fase 0 do `ScrollDrivenHeroGallery.tsx` para 3D — **mantidos**, são parte da cycle 0004).
5. Hero sem espaço morto — em 1920×1080, headline ocupa o viewport inicial sem scroll; <20% de altura vazia abaixo do headline antes da galeria.
6. Carrossel com vinheta — bordas esquerda e direita do track têm fade visível para `var(--background)`.
7. Narrativa com segunda coluna — `max-w-6xl` deixa de ter 4xl vazio (recebe stats em desktop).
8. `npx tsc --noEmit` sem erros.
9. `npx next build` sem warnings novos.
10. Reduced motion — transições de hover continuam funcionar; só scroll-triggered cai para fade.

## Riscos e mitigação

- **Trocar tipografia inline do título da galeria pinada (`titleRef`) pode quebrar o GSAP** — mitigação: o GSAP escreve `transform/opacity` via `gsap.to`, não touch CSS de fonte. Validar no smoke test que o título continua a animar nas Fases (entrada por palavra + saída).
- **`min-h-screen` em vez de `min-h-[115vh]` pode partir o layout do hero em viewports muito altas (>1100px)** — mitigação: `padding-bottom: var(--space-7)` adicional cobre o respiro; testar em monitor 1920×1200 antes do merge. Se ficar curto, aumentar para `var(--space-8)` (96px).
- **Substituir `max-w-6xl` por `--content-max` (1240px) na narrativa** — diferença de ~88px; cards/copy podem reflow. Validar visualmente.
- **Stats placeholder podem parecer pretensiosos** — mitigação: comentário JSDoc no `Stat` explica que são placeholders; troca não-bloqueante em cycle futura.
- **`btn-icon` 44×44 vs sociais 40×40** — mitigação: `.btn-icon-sm` introduzido como variante.
- **`debug-rule` esquecida em produção** — mitigação: comentário no CSS sinaliza dev-only; tasks.md inclui item de "remover antes de release final" (mas a remoção não é obrigatória nesta cycle, apenas a *opt-out*).

## Fora de escopo

- Qualquer alteração nas Fases 0/A/B/C do `ScrollDrivenHeroGallery` (timeline GSAP, scrub, expansão do knife, recuo 3D, shape KPR, clip-path do intro overlay, morph com `flubber`, frame highlight + glow, sombra dual-stage, `rotateZ` C2, parallax + blur). Tudo escopo da cycle 0004.
- Trocar conteúdo textual do hero, narrativa ou de qualquer copy congelada.
- Adicionar novas páginas além das três legais já criadas.
- Substituir imagens em `public/gallery/`.
- Conectar carrossel a CMS/Supabase (mantém array `FEATURED` hardcoded).
- Criar `<AmbientBackdrop />` para deduplicar fundos radiais (adiado para cycle separada).
- Substituir os números placeholder dos stats por dados reais (depende do produto fornecer).
- Remover a `.debug-rule` do CSS final (mantém-se até final do Q1 2026 como utilitário de dev).
- Reintroduzir o `mediaSlot` da hero ou montar `Dragon3D`/vídeo na coluna direita.

## Referências

- `cycles/Q12026/0005-padronizacao-e-layout-pos-rebrand/request.md`
- `cycles/Q12026/0004-transicoes-kpr-fieis/plan.md` — para entender o que **não** mexer na timeline GSAP.
- `cycles/Q12026/0001-rebranding-cores-e-copy/plan.md` — paleta e tokens base.
- `app/globals.css` — fonte da verdade dos tokens.
- `https://kpr.studio/` — referência de ritmo visual.
- `https://www.skinport.com/`, `https://buff.market/` — referências de footer institucional.
- `spec/features/rebrand-2026-q1/readme.md` — secção "Padronização e layout pós-rebrand" (a adicionar nesta cycle).
