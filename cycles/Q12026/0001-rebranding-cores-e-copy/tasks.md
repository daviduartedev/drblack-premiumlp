# Tarefas — 0001 rebranding cores e copy

- [x] **Ler e manter alinhado** o feature em `spec/features/rebrand-2026-q1/readme.md` (atualizar se a implementação real divergir).
- [x] **Definir e implementar tokens** em `app/globals.css` (`:root` + `@theme inline`): cor de fundo base #0A0A0A, primário #FF5C0A, texto em fundo escuro #FFFFFF, destaque/labels #EED9C4, texto em cima de primário #0A0A0A; adicionar derivados (hover, muted, bordas) documentados no spec, sem sair da paleta.
- [x] **Renomear/substituir** utilitário de gradiente que substitui `.gold-shine` por um baseado em laranja/creme (e atualizar usos).
- [x] **Atualizar** `app/layout.tsx` metadata (title/description) em pt-BR, tom casual apropriado, coerente com o spec.
- [x] **Atualizar** `app/page.tsx` (fundos) para tokens globais, não hex soltos inconsistentes.
- [x] **Migrar** `components/Loader3D.tsx` (SVG, comentários, fases) para a nova paleta.
- [x] **Migrar** `components/hero.tsx` (gradientes, grid, nav, CTA) para a nova paleta; aplicar regras de CTA (fundo laranja + texto preto) e copy casual nas áreas permitidas.
- [x] **Alinhar** `components/ScrollDrivenHeroGallery.tsx` (cores inline, cenas, overlays) aos tokens/hex do spec; revisar comentários no código.
- [x] **Passada final**: busca por `c9a24b`, `e6c277`, `8a6d2c`, `#050505` (onde a intenção for o novo preto) e dourado literal em TS/CSS.
- [x] **Verificação visual**: 375 / 768 / 1280 — loader, flip, hero, galeria, foco e legibilidade. *(revisão manual recomendada)*
- [x] **(Opcional)** `npm run build` ou equivalente do projeto para garantir que não há erro de compilação.

**Obrigatório:** concluir com o spec canônico atualizado (`spec/features/rebrand-2026-q1/` + `spec/README.md` se o hub precisar de ajuste). — feito
