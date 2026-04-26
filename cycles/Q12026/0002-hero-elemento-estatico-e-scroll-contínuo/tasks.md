# Tarefas — 0002 hero elemento estático e scroll contínuo

- [x] **Ler** `request.md` e `plan.md` e confirmar alinhamento antes de implementar.
- [x] **Actualizar `spec/` (obrigatório):** editar `spec/features/rebrand-2026-q1/readme.md` — secção “Hero: slot de mídia e scroll” (slot substituível, referência vídeo, desktop-first, `prefers-reduced-motion`, link a este ciclo).
- [x] **Slot na hero:** em `components/hero.tsx`, introduzir um único ponto de integração (ex. `HeroMediaSlot` com `children` ou prop) com dimensão/ancoragem documentadas no código; conteúdo provisório leve (imagem em `public/` ou stub mínimo) e comentário “onde trocar o ativo 3D/vídeo”.
- [x] **Composição e saída da capa:** garantir que o slot **não** desloca com o `transform` horizontal da faixa de cards; ao entrar na secção seguinte (`ScrollDrivenHeroGallery`), o utilizador **não** continua a ver o elemento como parte da capa — ajustar altura da hero (`min-height` / padding) só o necessário para o enquadramento.
- [x] **Galeria / GSAP:** em `components/ScrollDrivenHeroGallery.tsx`, aplicar a decisão do `plan.md` (ajuste do `scrub` e, se necessário após QA, `normalizeScroll` documentado); evitar re-renders pesados no `onUpdate`.
- [x] **Acessibilidade:** sem bloquear barra/teclado; se o comportamento de motion for reduzido, ligar a `prefers-reduced-motion`; manter ou acrescentar alternativa mínima (ex. skip para conteúdo após a secção pinada) se alguma mudança afectar foco ou navegação linear.
- [x] **Verificação manual (desktop):** roda vs clique na trilha da barra vs *page down*; comparar ritmo com `public/video.mp4` como referência visual.
- [x] **`npm run build`** para garantir compilação antes de fechar o ciclo.
