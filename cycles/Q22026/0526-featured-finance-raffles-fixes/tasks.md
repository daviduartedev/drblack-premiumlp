# Tarefas — 0526 Destaque, financeiro e rifas

## 1. Schema e repository

- [x] Migration `005_featured_skins.sql` — coluna `is_featured`, view `public_featured_skins`
- [x] Tipos `Skin.isFeatured`, `SkinStoreSale`, `AdminDashboardDTO.skinSales`
- [x] `getFeaturedStoreSkins`, limite 10 no `upsertSkin`
- [x] `syncFinancialEntriesForSkin` em save/update
- [x] `updateRaffle` + `updateRaffleAction`

## 2. Home e loja

- [x] `FeaturedSkinsSection` (server) + `HomePageClient`
- [x] `SkinsCarousel` consome catálogo; links → `/loja`
- [x] Estado vazio com CTA para loja

## 3. Admin

- [x] Checkbox destaque na ficha skin (somente `em_estoque`)
- [x] Compras e vendas inclui skins `vendida`/`entregue`
- [x] Financeiro reativo via `financial_entries` + métricas derivadas
- [x] Edição de rifa + botão Finalizar rifa

## 4. Rifas público

- [x] 1 rifa = 1 card (sem duplicata de marquee)

## 5. Build

- [x] `npm run build` — sucesso
