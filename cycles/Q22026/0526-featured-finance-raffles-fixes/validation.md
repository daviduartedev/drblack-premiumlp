# Validação — 0526 featured-finance-raffles-fixes

## Build (agente)

- [x] `npm run build` — sucesso (2026-05-26)

## Migration Supabase (humano — produção)

- [ ] Aplicar `supabase/migrations/005_featured_skins.sql` em prod/preview
- [ ] Confirmar view `public_featured_skins` acessível anon

## Preview Vercel (humano — sem local)

- [ ] Admin: marcar skin em estoque como destaque → home exibe card → click leva a `/loja`
- [ ] Admin: tentar 11ª skin em destaque → erro de limite
- [ ] Admin: alterar skin para `vendida` → aparece em Compras e vendas + Financeiro
- [ ] Admin: salvar skin com custo → entrada de custo no Financeiro
- [ ] Admin: clicar rifa na tabela → editar → Finalizar rifa → status `encerrada`
- [ ] `/rifas` com 1 rifa ativa → exibe 1 card

## Decisões assumidas na execução

| Tema | Decisão |
|------|---------|
| Destaque | Somente `em_estoque` publicável |
| Limite 10 | Bloqueio rígido no server |
| Vendida | Cria/atualiza `financial_entries` (receita + lucro) |
| Finalizar rifa | Status `encerrada` via botão dedicado |
