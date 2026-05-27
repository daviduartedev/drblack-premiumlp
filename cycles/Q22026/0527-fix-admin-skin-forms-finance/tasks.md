# Tarefas — 0527 Corrigir cadastro, edição e financeiro admin

> Antes de código Next.js: ler guias em `node_modules/next/dist/docs/` (`AGENTS.md`).  
> **Não rodar dev server local** para QA do humano — validar com `npm run build` e deploy preview → produção.

## 0. Pré-requisitos

- [x] Ler `request.md`, `plan.md`, `scenarios.feature` deste ciclo.
- [x] Ler `spec/features/painel-admin-ruby-safira/readme.md`.
- [x] Inspecionar `components/AdminPanel.tsx` (sync preços ~L244, upload ~L564, financeiro ~L691, Compras e vendas ~L667).
- [x] Inspecionar `app/api/admin/upload-skin-image/route.ts`.

## 1. Precificação — edição carrega valores persistidos

**Arquivo:** `components/AdminPanel.tsx`

- [x] Implementar baseline/flag para sync calculadora → `listPrice` / `suggestedPrice` (ver `plan.md` §1).
- [x] Ao abrir skin existente (`openSkinForm(skin)`, `selectSkin`): **não** sobrescrever preços salvos no mount.
- [x] Ao alterar custo, lucro %, lucro R$ ou modo de lucro **após carga**: aplicar `storePricing` como hoje.
- [x] Cadastro novo (`openSkinForm()` sem skin): manter auto-sync ao digitar custo/lucro.
- [x] Ajustar copy em "Precos e publicacao" / `StoreCalculatorPanel` se necessário.

## 2. Upload de imagens — cadastro e edição

**Arquivo:** `components/AdminPanel.tsx`

- [x] `saveSkinDraft`: remover `closePanel()` automático após sucesso; manter drawer aberto.
- [x] Após save: `setSelectedSkinId(persistedId)` para habilitar upload Blob.
- [x] Mensagem de sucesso orientando envio de foto (ex.: "Skin salva. Envie a imagem abaixo.").
- [x] `handleImageUpload`: exibir erro na UI quando `!res.ok` (401, 403, 503, 500).
- [x] Confirmar `updateDraft("image", url)` + persistência em save subsequente ou upload já grava via API.

**Arquivo:** `app/api/admin/upload-skin-image/route.ts` (somente se necessário)

- [x] Revisar mensagens JSON de erro para consumo pela UI — já padronizadas (`error` field).

## 3. Remover Compras e vendas

**Arquivo:** `components/AdminPanel.tsx`

- [x] Remover `<Panel title="Compras e vendas">` e código morto associado (`skinSalesRows` se exclusivo desse painel).
- [x] Ajustar layout do grid inferior (Rifas + Financeiro).

## 4. Financeiro — scroll + card unificado por skin

**Arquivo:** `components/AdminPanel.tsx`

- [x] Criar helper `groupFinancialEntriesBySkin(financialEntries, skins)`.
- [x] Criar renderização de card: nome, custo vermelho, venda verde ou "—", data última alteração.
- [x] Container com scroll (`overflow-y-auto`, altura máxima definida).
- [x] Substituir `Table` flat de entradas financeiras pela lista de cards.
- [x] Estado vazio: "Nenhuma movimentacao ainda."

## 5. Estoque e precificação — revisão UX

**Arquivo:** `components/AdminPanel.tsx`

- [x] Revisar descrição do `FormSection` "Estoque e precificacao" (cadastro vs edição).
- [x] Smoke mental: combobox estoque + fluxo "Cadastrar skin" coerentes.

## 6. Spec delta (proposta)

- [x] Preencher `spec-delta.md` com mudanças em painel admin (remoção Compras e vendas, card financeiro).
- [ ] Aplicar em `spec/features/painel-admin-ruby-safira/readme.md` via `/update-spec` após validação humana.

## 7. Qualidade e deploy (sem local humano)

- [x] `npm run build` — sucesso (2026-05-27)
- [ ] Deploy preview Vercel; smoke manual remoto (humano) — ver `validation.md`.
- [ ] Promover para produção após preview OK.

## 8. Encerramento do ciclo

- [x] `scenarios.feature` coberto pelos comportamentos entregues.
- [x] Preencher `validation.md` com resultados do build.
- [ ] Opcional: `/review-implementation` quando código estiver no branch.
