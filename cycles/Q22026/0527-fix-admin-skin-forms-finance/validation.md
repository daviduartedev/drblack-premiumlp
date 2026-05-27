# Validação — 0527 fix-admin-skin-forms-finance

## Build (agente)

- [x] `npm run build` — sucesso (2026-05-27, Next.js 16.2.4)

## Migration Supabase (humano)

- [x] N/A — sem migration neste cycle

## Preview Vercel (humano — sem local)

### Preços na edição

- [ ] Skin com Preço loja R$ 99 e Preço sugerido R$ 100 → abrir edição → campos mostram 99 e 100 (não 156/132)
- [ ] Alterar custo ou lucro → preços recalculam

### Cadastro e precificação

- [ ] Cadastrar skin nova → informar custo + lucro → preços preenchidos → salvar
- [ ] Drawer permanece aberto após save; upload habilitado

### Upload

- [ ] Skin nova: salvar → upload imagem → URL/preview atualiza → save opcional → `/loja` se elegível
- [ ] Skin existente: trocar imagem → persiste
- [ ] Simular erro (token Blob ausente ou arquivo inválido) → mensagem visível

### Compras e vendas

- [ ] Seção "Compras e vendas" ausente do admin

### Financeiro

- [ ] Múltiplas skins → lista rola internamente
- [ ] Skin com custo e venda → um card, custo vermelho, venda verde, data última alteração
- [ ] Skin só em estoque → card com custo; venda ausente

### Regressão

- [ ] Cadastrar rifa / calculadora rifa inalterados
- [ ] `/loja` e `/rifas` sem exposição de custo interno
- [ ] Reload `/admin` mantém dados

## Produção

- [ ] Promover deploy após preview OK
- [ ] Repetir smoke mínimo em prod

## Próximo passo

`/review-implementation` → `/update-spec` com `spec-delta.md`
