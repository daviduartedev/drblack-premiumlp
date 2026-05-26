# Validação — 0526

## Build (agente)

- [x] `npm run build` — sucesso (2026-05-26)

## Migration Supabase (humano)

- [ ] Aplicar `supabase/migrations/003_public_store_skins_eligibility.sql` em prod/preview
- [ ] Confirmar view `public_store_skins` exclui skins sem preço/imagem

## Preview Vercel (humano — sem local)

- [ ] Login admin (Supabase Auth)
- [ ] **Ficha skin**: custo + lucro % ou R$ → preço lista sincroniza; salvar `em_estoque` com imagem e preço → `/loja`
- [ ] **Cadastrar rifa**: calculadora completa, pacotes, salvar → rifa no admin + `/rifas`; skin some de `/loja`
- [ ] Reload `/admin` mantém skin e rifa
- [ ] Erro de save exibe mensagem e mantém drawer aberto

## Produção

- [ ] Promover deploy após preview OK
- [ ] Repetir smoke mínimo em prod

## Próximo passo

`/review-implementation` → `/update-spec` se necessário
