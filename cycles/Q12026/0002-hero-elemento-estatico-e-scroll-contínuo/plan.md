# Plano (delta) — Hero com placeholder estático e scroll contínuo (Q1 2026)

## Baseline (estado canónico anterior)

- [cycles/Q12026/0001-rebranding-cores-e-copy/](../0001-rebranding-cores-e-copy/): paleta laranja/creme, hero pós-loader, galeria scroll-driven com GSAP `ScrollTrigger` (pin, scrub, timeline) em `components/ScrollDrivenHeroGallery.tsx`.
- `app/page.tsx`: `Hero` (viewport) → após `Loader3D`, `ScrollDrivenHeroGallery` e `Dragon3D`.
- `components/hero.tsx`: copy e gradientes, **sem** slot de mídia substituível na composição “capa”.
- `public/video.mp4`: referência de ritmo/composição (não requisito de embed em UI).

## Decisões de produto (confirmadas neste ciclo)

1. **Placeholder** = ponto único de integração para **qualquer** mídia futura (3D leve, vídeo silencioso, imagem). O ativo concreto troca-se depois sem refator grande; neste ciclo basta API clara + conteúdo provisório leve.
2. **Vida útil na viewport**: o elemento de destaque pertence à **hero** e **deixa de integrar a composição capa** quando o utilizador avança para a secção seguinte (galeria scroll-driven). Pode alargar-se ligeiramente a altura da hero (`min-height` / padding) para o enquadramento bater com a referência.
3. **`public/video.mp4`**: mantém-se **só como referência** no repositório (sem obrigação de reprodução na UI neste ciclo).
4. **Alvo de plataforma**: **navegação web de secretária** (roda/trackpad). **Sem critérios de aceitação específicos para mobile/touch** neste ciclo (não bloquear merge por regressões móveis não planeadas; evitar trabalho extra só “para mobile”).
5. **Scroll contínuo vs saltos**: a progressão “ideal” do scrub está pensada para **delta contínuo**; **saltos grandes** (ex.: clique na trilha da barra, *page up/down*) **não** devem ser o caminho que produz a mesma sensação de controlo fino — mitigar sem quebrar acessibilidade.

## Delta funcional (o que muda no produto)

1. **Slot na hero** (`HeroMediaSlot` ou equivalente): `children`/prop documentada, dimensão e ancoragem estáveis; não é filho da faixa transformada dos cards da galeria.
2. **Composição**: alinhar hierarquia visual à referência do vídeo dentro do layout responsivo; ajustar hero se necessário para “respiro” do slot.
3. **Scroll-linked (`ScrollDrivenHeroGallery`)**: manter pin/timeline; melhorar **percepção** em saltos vs **roda** contínua conforme secção técnica abaixo.

## Decisão técnica — saltos de scroll (recomendação adoptada no plano)

**Abordagem principal (GSAP-only, alinhada ao repo):**

- Aumentar o **atraso do scrub** no `ScrollTrigger` da timeline pinada (parâmetro numérico `scrub`, hoje `0.8`), na ordem de **~1.2–1.8s** de suavização, até QA em desktop: saltos na posição de scroll traduzem-se em **perseguição suave** da timeline em vez de atravessar muitos *keyframes* de forma “cinemática” instantânea.
- **Trade-off**: a roda fica com um ligeiro “arrasto” adicional; calibrar para não anular a sensação de controlo do vídeo de referência.

**O que **não** fazer neste ciclo (salvo nova decisão explícita):**

- **Não** impor `scroll-behavior: smooth` no `html` em global — interage mal com pin longo e pode piorar UX.
- **Não** desactivar a barra de scroll nem capturar `wheel` para scroll exclusivamente programático — risco alto para acessibilidade e teclado.

**Opcional (só se o ponto acima for insuficiente após teste):**

- Avaliar `ScrollTrigger.normalizeScroll(true)` **apenas em desktop**, com teste de teclado e de foco; documentar efeitos colaterais no PR.

**`prefers-reduced-motion`:**

- Respeitar com caminho reduzido: menos distância de scroll pinada, ou estado final estático da secção narrativa, conforme implementação — documentar no PR o comportamento exacto.

## Riscos e mitigação

- **Empilhamento**: `z-index` entre hero (slot), overlay do loader e galeria pinada — evitar o slot a ser tapado ou confundido com a faixa de cards.
- **Performance**: o slot deve usar `priority`/lazy conforme o ativo; evitar `setState` por frame de scroll na hero.
- **Âmbito mobile**: fora dos critérios deste ciclo; regressões óbvias podem ser *follow-up*.

## Fora de escopo

- Rebranding cromático/copy (0001).
- Troca de todos os rasters finais da galeria.
- Obrigação de embed do `video.mp4` na UI.

## Referências

- `cycles/Q12026/0002-hero-elemento-estatico-e-scroll-contínuo/request.md`
- `components/ScrollDrivenHeroGallery.tsx`, `components/hero.tsx`, `app/page.tsx`
- `spec/features/rebrand-2026-q1/readme.md` — secção “Hero: slot de mídia e scroll”
