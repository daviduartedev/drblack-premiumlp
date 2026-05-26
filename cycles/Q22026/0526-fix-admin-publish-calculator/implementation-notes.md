# Notas de implementação — 0526

## Decisões técnicas

- **`upsertSkin`** passa a retornar `{ skin, error? }` para expor mensagens Supabase na UI.
- **`createRaffleFromSkin`**: upsert da skin com `em_rifa` → insert em `raffles` (`ativa`).
- **Migration `003_public_store_skins_eligibility.sql`**: view filtra `list_price > 0`, nome e imagem; aplicar no Supabase de prod/preview.
- **Calculadoras**: `calculateStorePricing` (loja) vs `calculateRaffleProfit` (rifa); sincronização via `useEffect` nos inputs-gatilho (custo, lucro, modo).
- **Modo de lucro**: radio só quando % e R$ > 0 simultaneamente; senão inferência automática.
- **Pacote de bilhetes**: atualiza `ticket_count` e `ticket_price`.

## Arquivos alterados

- `lib/profit-calculator.ts`
- `lib/ruby-safira-repository.ts`
- `app/login/actions.ts`
- `components/AdminPanel.tsx`
- `supabase/migrations/003_public_store_skins_eligibility.sql`

## Pendente (humano)

- Aplicar migration `003` no projeto Supabase (Dashboard SQL ou CLI).
- Deploy preview Vercel → smoke manual → produção.
- `/update-spec` após validação em prod (spec já atualizada no refine; conferir delta).
