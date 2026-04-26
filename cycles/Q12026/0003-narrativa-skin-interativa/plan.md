# Plano (delta) — “Continua a narrativa” com background 3D interativo (Q1 2026)

## Baseline (estado canónico anterior)

- [cycles/Q12026/0001-rebranding-cores-e-copy/](../0001-rebranding-cores-e-copy/): paleta laranja/creme/preto fixa, tokens em `app/globals.css`, `@theme inline`, classe `.accent-shine`.
- [cycles/Q12026/0002-hero-elemento-estatico-e-scroll-contínuo/](../0002-hero-elemento-estatico-e-scroll-contínuo/): slot de mídia na hero, scroll contínuo (GSAP `ScrollTrigger` com scrub `1.45` e `normalizeScroll(true)` em desktop sem reduced-motion), `prefers-reduced-motion` respeitado.
- `components/ScrollDrivenHeroGallery.tsx` (linhas ~486–518): secção “Continua a narrativa” renderizada inline com fundo creme `#EED9C4`, H2 `Continua a narrativa`, parágrafo curto e **sem CTA**.
- `public/skininterativa.png`: ativo presente, ainda **não** referenciado em código.

## Decisões de produto (confirmadas neste ciclo)

1. **Fundo escuro**: a secção passa para base `#0A0A0A`, alinhada ao rebrand 2026 — o creme `#EED9C4` deixa de ser superfície dominante neste bloco e passa a aparecer apenas em bordas/labels conforme regras da paleta.
2. **Imagem como background interativo**: `public/skininterativa.png` ocupa o background do bloco em `object-cover` com tratamento de cor via overlays CSS (não há reprocessamento do raster).
3. **Efeito 3D leve, ligado ao cursor**:
   - tilt em `rotateX/rotateY` no intervalo `[-5°, +5°]`,
   - paralax translate `±12px` em sentido oposto ao tilt,
   - `scale 1.02` ao entrar,
   - glow radial laranja `#FF5C0A` (≤ 28% opacidade) seguindo o ponteiro,
   - retorno suave ao neutro quando o cursor sai (spring; sem snap).
4. **Plataforma alvo**: **desktop** (pointer fino). Em `@media (pointer: coarse)` o efeito não é montado — a imagem fica estática com os mesmos overlays cromáticos.
5. **`prefers-reduced-motion: reduce`**: sem tracking ativo de cursor. Mantém um **3D estático subtil** (perspective + leve `rotateX(-2°)` + sombra interna + overlay radial laranja) para que a leitura de profundidade continue a fazer sentido sem violar a preferência.
6. **Copy + CTA (proposta, a confirmar na implementação)**:
   - Eyebrow: `06 · NARRATIVA`
   - H2: `Continua a história.`
   - Sub: `Cada skin é um novo começo. Bora virar a tua?`
   - CTA primário: `Ver mercado` (laranja `#FF5C0A`, texto `#0A0A0A`); destino real — âncora na própria página ou link futuro — definido na implementação.
7. **Composição**: secção mantida **inline** no fim de `components/ScrollDrivenHeroGallery.tsx`. Não há extração para componente top-level nesta cycle (o objetivo é trocar fundo + copy + interatividade, não reorquestrar a página).

## Delta funcional (o que muda no produto)

1. **Background interativo (novo)**:
   - Novo componente `components/InteractiveSkinBackground.tsx` encapsula a imagem (`next/image`), as camadas de overlay e a lógica de cursor com `framer-motion` (`useMotionValue` + `useSpring` + `useTransform`).
   - O componente assume um **wrapper relativo** (`absolute inset-0`) e é montado dentro da secção “Continua a narrativa”.
   - Em `pointer: coarse` ou `prefers-reduced-motion: reduce`, o componente devolve a versão estática (mesmos overlays, sem listeners de mouse).

2. **Refatoração local do bloco final** em `components/ScrollDrivenHeroGallery.tsx`:
   - Trocar `background: "#eed9c4"` por `#0A0A0A`.
   - Inserir `<InteractiveSkinBackground />` antes do conteúdo textual (com `z-index` adequado).
   - Reescrever cores de eyebrow/H2/sub para o sistema escuro (branco + `--foreground-muted`, eyebrow em `--highlight`).
   - Adicionar CTA primário (botão laranja) seguindo as regras de uso (`text: #0A0A0A`, `bg: #FF5C0A`, hover via `--accent-soft`/`--accent-deep`).
   - Aumentar espaçamento vertical (`py-32 md:py-40`) para dar “respiro” à imagem.

3. **Tratamento cromático da imagem (camadas, top-down)**:
   - Imagem (`<Image>`) em `object-cover`, opacidade `0.78`.
   - Overlay 1: gradiente radial laranja `rgba(255,92,10,0.22)` que **segue o cursor** (centro = posição do mouse). Em reduced-motion / touch: estático em 50%/30%.
   - Overlay 2: vinheta preta nas bordas `radial-gradient(120% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.65) 100%)` para amarrar à secção e reforçar o foco.
   - Overlay 3: linha creme superior/inferior `rgba(238,217,196,0.12)` (1–2px) para integração visual com o resto da página.

## Decisões técnicas

- **Lib**: `framer-motion` (já no repo). Padrão:
  - `useMotionValue(0)` para `mouseX`, `mouseY` (relativos ao centro, normalizados a `[-1, 1]`).
  - `useSpring` (≈ `{ stiffness: 150, damping: 20, mass: 0.5 }`) para suavizar transição entrada/saída.
  - `useTransform` mapeia `mouseX/Y → rotateY/X, translateX/Y, glow center`.
  - Listener `onPointerMove` no wrapper; `onPointerLeave` reseta para `0`.
- **Render**: `style={{ rotateX, rotateY, translateX, translateY, scale }}` em divs `motion.div`. **Sem `setState` por frame** — só motion values (escrita direta no estilo).
- **Performance**:
  - `next/image` com `priority={false}` (a secção está abaixo da galeria pinada — não é LCP) e `sizes="100vw"`.
  - `transform-style: preserve-3d`, `will-change: transform` no wrapper.
  - `perspective: 1200px` no parent.
- **Acessibilidade**:
  - `aria-hidden` nas camadas decorativas; o conteúdo textual mantém-se semântico (`<h2>`, `<p>`, `<a>` ou `<button>` para o CTA).
  - Foco visível no CTA, contrastes mínimos respeitados.
- **Detecção de capacidades**:
  - Hook interno `useReducedMotion()` (de `framer-motion`) e `window.matchMedia("(pointer: coarse)")` para decidir o caminho estático.
  - Caminho estático monta a mesma árvore visual sem listeners.

## Riscos e mitigação

- **Legibilidade do texto sobre imagem**: mitigar com vinheta + container do texto sobre `bg-[rgba(10,10,10,0.55)]` com `backdrop-filter: blur(2px)` (opcional) ou simplesmente padding generoso e tipografia branca.
- **Performance do glow radial seguindo cursor**: usar `background-position` ou variável CSS atualizada via motion value, evitando recriar o gradiente em cada frame.
- **Excesso de movimento**: limites duros (`±5°`, `±12px`, `scale ≤ 1.02`) para não destoar do tom “direto, sem enrolação”.
- **Mobile**: caminho estático evita comportamento incoerente em touch; sem âmbito de gyroscope nesta cycle.
- **Asset pesado**: se `public/skininterativa.png` for grande, considerar versão `webp` em follow-up — fora de escopo desta cycle (o ativo entregue é o `.png`).

## Fora de escopo

- Suporte a gyroscope/orientation em mobile/tablet.
- Pin / scroll-linked timeline para esta secção.
- Substituição de outros assets `public/gallery/*.{jpg,png}` (segue regra do ciclo 0001: não reprocessar rasters em batch).
- Mudanças na hero (`components/hero.tsx`) ou na galeria pinada (`ScrollDrivenHeroGallery` parte superior).

## Referências

- `cycles/Q12026/0003-narrativa-skin-interativa/request.md`
- `components/ScrollDrivenHeroGallery.tsx` (secção “Continua a narrativa”, ~linhas 486–518)
- `spec/features/rebrand-2026-q1/readme.md` — paleta canónica e tokens
- Ciclo 0001 (rebranding) e 0002 (hero + scroll contínuo) — padrões de motion e `prefers-reduced-motion`
