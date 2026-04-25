# Plano (delta) — Rebranding cores e copy (Q1 2026)

## Baseline (estado canônico anterior)

- Tokens globais em `app/globals.css` com identidade **preto + dourado** (`--accent` #c9a24b, `--foreground` tipo creme #f2ede3).
- UI principais: `Loader3D`, `Hero`, `ScrollDrivenHeroGallery`, `app/page.tsx` com fundos/gradientes e hex hardcoded ainda alinhados ao dourado ou a tons legacy (#050505, gradientes dourados).
- Metadados em `app/layout.tsx`: título “DR Black Skins”, descrição “Compre. Venda. Concorra.”
- Não existia hub `spec/` versionado; este plano introduz o feature **rebrand-2026-q1** como fonte de verdade.

## Decisões consolidadas (respostas do solicitante)

| Tópico | Decisão |
|--------|--------|
| Idioma | 100% **pt-BR** (interface e copy com tom casual onde aplicável). |
| Onde NÃO aplica o tom casual | **Notícias**, **termos**, **rodapé** (mantêm tom mais neutro/formal, sem obrigatoriedade de “gíria gamer”). |
| Escopo | **Site todo** (cores, layout, fluxos visuais existentes) — o que hoje for uma “face” do produto continua coberto. |
| Identidade de movimento/loader | Migração **integral** da paleta antiga para a **paleta fixa** do request (laranja, creme, preto, branco). |
| Contrastes e variações | A equipe de implementação **define** tons derivados (hover, bordas, estados) para **melhor contraste e coerência**, ancorados nas cores fixas. |
| Ativos de imagem | Não reexportar arquivos raster do `public/gallery` nesta cycle: **política** em `spec/features/rebrand-2026-q1/readme.md` (código, SVG, shaders parametrizáveis = alinhar; JPEG/PNG = backlog opcional). |

## Delta funcional (o que muda no produto)

1. **Design tokens (CSS)**: substituir o sistema dourado por um sistema **laranja + creme + preto** com regras de uso (CTA, texto, destaque, fundo). Incluir variantes **sem** fugir da paleta (apenas opacidade/derivação controlada a partir de #FF5C0A e #EED9C4).
2. **Componentes**: atualizar `globals.css` (@theme), utilitários que substituem `gold-shine`, `Hero`, `Loader3D`, `ScrollDrivenHeroGallery` (incl. hex e gradientes de cena alinhados aos tokens), `app/page.tsx` (fundo), `app/layout.tsx` (metadata alinhada à nova copy — ver spec).
3. **Copy (PT-BR)**: textos de marketing, CTAs, hero, navegação e blocos de destaque com tom **curto e casual**, nos limites do feature spec (exclusões: notícias, termos, rodapé).
4. **Documentação**: `spec/features/rebrand-2026-q1/` passa a descrever tokens, regras de copy e exclusões, para evitar deriva.

## Riscos e mitigação

- **Galeria 3D / `envColor`**: risco de “vazamento” visual de cores antigas; mitigação: mapear cenas para a nova gama (laranja/creme/escuro) no código, não exigir reedição de fotos.
- **Acessabilidade**: validar CTA laranja + texto preto e texto branco sobre #0A0A0A; ajustar `--foreground-muted` se o contraste cair abaixo do alvo mínimo definido no spec.

## Fora de escopo (esta cycle)

- Redesenho estrutural de rotas ou novas páginas.
- Reprocessar ou substituir arquivos de galeria raster (exceto se já previsto como ajuste mínimo de cor em código).
- Trocar família tipográfica (Geist + Oswald permanecem salvo solicitação futura).

## Referências

- `cycles/Q12026/0001-rebranding-cores-e-copy/request.md`
- `spec/features/rebrand-2026-q1/readme.md`
