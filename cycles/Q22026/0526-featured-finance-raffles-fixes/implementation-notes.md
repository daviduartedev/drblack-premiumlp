# Notas de implementação — 0526

## Destaque home

- Campo `skins.is_featured` + view `public_featured_skins` (RLS via view em `em_estoque`).
- Home usa `FeaturedSkinsSection` (RSC) → `SkinsCarousel` com props; marquee duplica só se `length > 1`.

## Financeiro

- `syncFinancialEntriesForSkin` upsert por `(skin_id, kind)`:
  - `custo` enquanto `em_estoque`/`em_rifa` com `paidValue > 0`
  - `receita` + `lucro_realizado` quando `vendida`/`entregue`
- AdminPanel deriva Compras e vendas de skins vendidas client-side; Financeiro usa state sincronizado via `router.refresh()`.

## Rifas

- Edição via `updateRaffleAction`; finalização = `status encerrada`.
- `/rifas`: layout estático quando há exatamente 1 rifa (corrige “dobrada”).

## Deploy

Aplicar migration `005_featured_skins.sql` no Supabase de produção antes de marcar destaque.
