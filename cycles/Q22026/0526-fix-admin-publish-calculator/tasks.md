# Tarefas — 0526 Corrigir admin, calculadora e publicação

> Antes de código Next.js: ler guias em `node_modules/next/dist/docs/` (`AGENTS.md`).  
> **Não rodar dev server local** para QA do humano — validar com `npm run build` e deploy preview → produção.

## 0. Pré-requisitos

- [x] Ler `request.md`, `plan.md`, `scenarios.feature` deste ciclo.
- [x] Ler `spec/features/painel-admin-ruby-safira/readme.md` (versão pós-refino).
- [x] Inspecionar `components/AdminPanel.tsx`, `app/login/actions.ts`, `lib/profit-calculator.ts`, `lib/ruby-safira-repository.ts`, `app/loja/page.tsx`, `app/rifas/page.tsx`.

## 1. Atualizar `spec/` (obrigatório)

- [x] Atualizar `spec/features/painel-admin-ruby-safira/readme.md` — feito no `/refine-request`.
- [x] Atualizar `spec/README.md` — feito no `/refine-request`.
- [x] Spec final pós-execução: aguardar `/update-spec` após validação humana.

## 2. Calculadora — motor e tipos

- [x] Garantir `ProfitMode` (`percent` | `fixed`) usado de ponta a ponta em `lib/ruby-safira-types.ts` / `profit-calculator.ts`.
- [x] Adicionar helper de precificação **loja** (`calculateStorePricing`) sem lógica de bilhetes.
- [x] Manter pacotes de bilhetes apenas no ramo **rifa**.

## 3. Calculadora — UI admin (skin)

- [x] Exibir painel **Calculadora (loja)** na ficha técnica (`panelMode === 'skin'`).
- [x] Sincronizar `list_price` e `suggested_price` ao mudar custo/lucro/modo; campos editáveis.
- [x] Se % e valor fixo preenchidos, exigir seleção explícita do modo ativo.

## 4. Calculadora — UI admin (rifa)

- [x] Manter painel completo no fluxo **Cadastrar rifa**.
- [x] Clique em pacote atualiza `ticket_count` **e** `ticket_price`.
- [x] Modo lucro %/fixo igual ao da skin.

## 5. Persistência — skin → `/loja`

- [x] Revisar `saveSkinAction` + `upsertSkin`: erros Supabase retornam mensagem ao admin.
- [x] Após salvar: `revalidatePath('/admin')`, `revalidatePath('/loja')`.
- [x] Leitura pública via `getPublicStoreSkins` → view `public_store_skins`.
- [x] Migration `003` + filtro seed: skins incompletas fora da vitrine.

## 6. Persistência — rifa → `/rifas` (novo)

- [x] Implementar `createRaffleFromSkin` em `lib/ruby-safira-repository.ts`.
- [x] Implementar `saveRaffleAction` em `app/login/actions.ts`.
- [x] **Salvar rifa**: insert `raffles` (`ativa`), skin `em_rifa`.
- [x] Campos: `title`, `draw_date` (+30d default), `ticket_count`, `ticket_price`.
- [x] `AdminPanel`: `panelMode === 'raffle'` → `saveRaffleAction`.
- [x] `revalidatePath('/rifas')`, `/admin`, `/loja`.
- [x] Listagem de rifas no admin atualiza estado local após salvar.

## 7. Qualidade e deploy (sem local humano)

- [x] `npm run build` — sem erros TypeScript/Next.
- [ ] Deploy preview Vercel; smoke manual remoto (humano).
- [ ] Promover para produção após preview OK.
- [ ] Se publicação falhar: checar migration `003` e policies no Supabase.

## 8. Encerramento do ciclo

- [x] `scenarios.feature` coberto pelos comportamentos entregues.
- [x] Criar `validation.md` com checklist preview/prod (humano).
- [ ] Opcional: `/review-implementation` quando código estiver no branch.
