# Tarefas — 0524 Plataforma: loja, Supabase e UX operacional

> Antes de código Next.js: ler guias em `node_modules/next/dist/docs/` (`AGENTS.md`). Stages na ordem do `request.md` salvo bloqueio explícito.

## 0. Pré-requisitos

- [x] Ler `cycles/Q22026/0524-platform-skins-store-backend/request.md`, `plan.md`, `scenarios.feature`.
- [x] Ler `spec/features/rebrand-2026-q1/readme.md` e `spec/features/painel-admin-ruby-safira/readme.md`.
- [x] Inspecionar `ScrollDrivenHeroGallery.tsx`, `AdminPanel.tsx`, `lib/ruby-safira-repository.ts`, `app/login/`.

## 1. Atualizar `spec/` (obrigatório — fazer ao fechar cada stage relevante)

- [ ] Atualizar `spec/features/painel-admin-ruby-safira/readme.md` (loja, Supabase Auth, Blob, schema, admin UX).
- [ ] Atualizar `spec/features/rebrand-2026-q1/readme.md` (nav `/loja`, nota galeria Q2).
- [ ] Atualizar `spec/README.md` com referência ao ciclo `0524-platform-skins-store-backend`.
- [ ] Se decisões mudarem na implementação, atualizar `plan.md` primeiro e depois o spec.

## 2. Infra e ambiente (Stage 3 — início)

- [x] Criar `.env.example` com: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `BLOB_READ_WRITE_TOKEN`, `SESSION_SECRET` (se ainda usado), URL de site para Auth redirects.
- [x] Documentar no spec variáveis Vercel (Production + Preview) e Blob store ligado ao projeto.
- [x] SQL migrations Supabase: `profiles`, `skins` (campos públicos + internos), `raffles`, `tickets`, `purchases`, `financial_entries`.
- [x] View ou policy `public_store_skins` — somente colunas públicas, `status = em_estoque`.
- [x] RLS: admin full ops; customer own rows; anon/authenticated read loja via view.
- [x] Seed SQL novo (admin + customer de dev **somente** via Supabase dashboard/seed script, não na UI de login).

## Stage 1 — fix-upgrade-scroll-frames

- [x] Reproduzir bug: scroll na seção upgrade sem avanço frame-to-frame (desktop).
- [x] Diagnosticar ligação Fase B ↔ `ScrollFilmFrames` / `expansionProgress` / scrub GSAP.
- [x] Corrigir com diff mínimo; não alterar copy, layout, easings salvo necessário.
- [ ] Validar scroll reverso e `prefers-reduced-motion` (QA manual).
- [ ] Smoke mobile: `UpgradeShowcaseMobile` sem regressão.

## Stage 2 — admin-panel-ux-layout

- [x] Estado UI: painéis de cadastro **fechados** ao abrir `/admin`.
- [x] Botão **Cadastrar skin** → abre ficha (drawer/modal em mobile).
- [x] Botão **Cadastrar rifa** → abre fluxo separado com calculadora existente.
- [x] Cancelar/fechar **descarta rascunho** e restaura listagem.
- [x] Melhorar hierarquia/densidade (estoque, métricas, ficha) mantendo Ruby/Safira.
- [x] Sem mudança de persistência (ainda local até Stage 3) — persistência Supabase integrada no save quando env presente.

## Stage 3 — supabase-blob-integration

- [x] Instalar/configurar `@supabase/supabase-js` + `@supabase/ssr` conforme docs Next instalados.
- [x] Clientes server/browser + middleware de sessão.
- [x] Refatorar `app/login/` — Supabase Auth email/senha; **remover** `TEST_CREDENTIALS` da UI e fluxo mock.
- [x] Proteger `/admin` (role admin) e `/dashboard` (customer).
- [x] Implementar `lib/supabase/*` e repositório Supabase substituindo seed in-memory.
- [x] Route Handler upload imagem → Vercel Blob → salvar `image_url` em `skins` (admin only).
- [ ] Aplicar seed SQL em projeto Supabase existente (banco limpo) — **humano/deploy**.
- [x] Remover ou deprecar `lib/server-session.ts` mock e `ruby-safira-seed.ts` do caminho de produção.

## Stage 4 — public-catalog-storefront

- [x] Criar `app/loja/page.tsx` + metadata pt-BR.
- [x] `lib/whatsapp.ts` — URL base + helper mensagem por skin (mesmo número rifas/footer).
- [x] Componente card loja (referência visual do ciclo): categoria, disponível, nome, StatTrak, desgaste, float bar, preços, stickers opcionais, hover Framer-like.
- [x] `getPublicStoreSkins()` via view/policy — só `em_estoque`.
- [x] Estado vazio com copy acordada + CTA WhatsApp.
- [x] Atualizar nav **Catálogo** → `/loja` em `hero.tsx`, `HeroMobile.tsx`, `Footer.tsx` (label Catálogo; **Rifas** no hero permanece em breve).
- [x] Manter `#skins-destaque` na LP inalterado como destaque.

## Stage 5 — responsive-mobile-pass

- [x] QA 375px: LP (galeria mobile + carrossel), `/loja`, `/admin` — estilos aplicados.
- [x] QA 768px: mesmas áreas — grid responsivo.
- [x] Admin: ficha/rifa em drawer full-screen; estoque empilhado.
- [x] Loja: grid 1 col mobile, multi-col desktop; CTAs ≥ 44px.
- [x] Form upload e login utilizáveis em touch.

## Verificação final

- [x] `npm run build` sem erros.
- [ ] Revisar `scenarios.feature` manualmente ou e2e se existir Playwright.
- [x] Confirmar vitrine não expõe `paid_value`, `internal_notes`, lucro.
- [ ] Deploy Vercel: env configuradas; testar `/loja`, login admin, cadastro com foto, item na loja.

## Notas de entrega

- Rotas novas: `/loja`. Rotas preservadas: `/admin`, `/dashboard`, `/rifas`, `/login`.
- Não commitar `.env` nem secrets.
