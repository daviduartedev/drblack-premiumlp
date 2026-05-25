# Validação — 0524

## Build

- [x] `npm run build` — sucesso (2026-05-24)

## Stage 1 — galeria scroll-driven

- [x] Causa identificada: inline `opacity: 0` resetado em re-render
- [x] Correção aplicada em `ScrollDrivenHeroGallery.tsx`
- [ ] QA manual desktop: scroll frame-to-frame (requer browser)
- [ ] QA scroll reverso + `prefers-reduced-motion`

## Stage 2 — admin UX

- [x] Formulários fechados ao abrir `/admin`
- [x] CTAs Cadastrar skin / Cadastrar rifa
- [x] Cancelar fecha drawer e descarta rascunho
- [x] Drawer full-screen em mobile

## Stage 3 — Supabase + Blob

- [x] Pacotes instalados
- [x] Clientes server/browser + middleware
- [x] Login sem credenciais de teste na UI
- [x] Repository Supabase + fallback seed
- [x] Route Handler upload Blob
- [x] `.env.example` + SQL migrations/seed
- [ ] Migration aplicada no projeto Supabase (humano)
- [ ] Upload testado em produção com Blob token (humano)

## Stage 4 — loja

- [x] `/loja` criada
- [x] Cards públicos sem campos internos
- [x] Nav Catálogo → `/loja`
- [x] Estado vazio + WhatsApp

## Stage 5 — mobile

- [x] CTAs ≥ 44px nas áreas tocadas
- [x] Grid responsivo loja
- [x] Admin drawer mobile
- [ ] QA 375px / 768px manual

## Segurança

- [x] DTO público (`PublicStoreSkin`) exclui `paidValue`, `internalNotes`, lucro
- [x] View `public_store_skins` na migration
- [x] Upload admin-only (sessão + role)

## Próximo passo

`/review-implementation`
