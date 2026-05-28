# Tarefas — 0528 Corrigir admin: skins, preços, desgaste e rifa

> Antes de código Next.js: ler guias em `node_modules/next/dist/docs/` (`AGENTS.md`).  
> **Não rodar dev server local** para QA do humano — validar com `npm run build` e deploy preview → produção.  
> **Antes de cada stage:** verificar entregas do cycle `0527-fix-admin-skin-forms-finance` para evitar duplicação.

---

## 0. Pré-requisitos (cycle)

- [ ] Ler `request.md`, `plan.md`, `scenarios.feature` deste ciclo.
- [ ] Ler `spec/features/painel-admin-ruby-safira/readme.md`.
- [ ] Comparar `main` (ou branch base) com entregas de `0527` — marcar tasks já feitas como N/A.
- [ ] Inspecionar `components/AdminPanel.tsx`, `lib/profit-calculator.ts`, `app/api/admin/upload-skin-image/route.ts`.

---

## Stage 1 — fix-skin-image-upload-persist

### 1.1 Diagnóstico

- [x] Reproduzir em preview: editar skin existente → upload → reload admin → confirmar imagem stale/ausente.
- [x] Confirmar se API `updateSkinImageUrl` retorna sucesso e se save subsequente sobrescreve URL.

### 1.2 Persistência e estado

**Arquivo:** `components/AdminPanel.tsx`

- [x] Após upload OK em `handleImageUpload`: atualizar `skins` local (`setSkins`) com nova `image` para `selectedSkinId`.
- [x] Manter `updateDraft("image", url)` e feedback de sucesso/erro existente (0527).
- [x] Validar que `saveSkinDraft` envia `draft.image` atualizado se admin salvar após upload.

**Arquivo:** `app/api/admin/upload-skin-image/route.ts`

- [x] Adicionar `revalidatePath('/admin')`, `revalidatePath('/loja')`, `revalidatePath('/')` após update bem-sucedido.

### 1.3 Aceite Stage 1

- [ ] Upload em skin existente → reload admin → nova imagem na ficha.
- [ ] Skin elegível (`em_estoque`, preço, imagem) → `/loja` reflete foto.
- [ ] Erro de upload (401/503) → mensagem visível na UI.

---

## Stage 2 — fix-suggested-price-margin

### 2.1 Motor de precificação

**Arquivo:** `lib/profit-calculator.ts`

- [x] Substituir `paidValue * 1.1` por fórmula: `suggestedPrice = listPrice × (1 + STORE_PROMO_MARGIN_PERCENT/100)`.
- [x] Constante `STORE_PROMO_MARGIN_PERCENT = 10` (documentada no código).
- [x] Garantir `suggestedPrice > listPrice` quando ambos auto-preenchidos e `listPrice > 0`.
- [x] Retornar `suggestedPrice: null` quando `listPrice <= 0` ou modo fixo sem promo aplicável (alinhar com comportamento atual).

### 2.2 UI e sync

**Arquivo:** `components/AdminPanel.tsx`

- [x] Atualizar copy em `StoreCalculatorPanel` / seção preços — sugerido = promo sobre preço loja.
- [x] Sync `useEffect`: ao recalcular por mudança de custo/lucro, aplicar novo sugerido; **não** repor se admin limpou manualmente até próximo gatilho (estender baseline se necessário).
- [x] Smoke: margem 20%, custo 100 → list ~120, sugerido ~132 (não 110).

### 2.3 Aceite Stage 2

- [ ] Alterar custo/margem recalcula loja e sugerido coerentemente.
- [ ] Margem 20%: sugerido ≠ custo + 10%.
- [ ] Sugerido > loja quando auto-preenchido.
- [ ] Apagar sugerido manualmente → permanece vazio até mudar custo/lucro.

---

## Stage 3 — wear-label-dropdown

### 3.1 Campo Desgaste

**Arquivo:** `components/AdminPanel.tsx`

- [x] Substituir `SearchableCombobox` do campo Desgaste por `<select>` (ou dropdown explícito) com opções `CS2_WEAR_LABELS`.
- [x] Placeholder/opção vazia opcional (campo não obrigatório).
- [x] Manter hook `suggestFloatForWear` ao selecionar desgaste se `float` estiver vazio.
- [x] Confirmar persistência via `appendSkinFields` → `wearLabel` → `wear_label` no Supabase.

### 3.2 Aceite Stage 3

- [ ] Clicar Desgaste → lista FN, MW, FT, WW, BS.
- [ ] Selecionar valor → save → reload → valor persistido.
- [ ] Badge de desgaste na loja reflete `wear_label` salvo.

---

## Stage 4 — remove-raffle-prices-section

### 4.1 Remover seção enganosa

**Arquivo:** `components/AdminPanel.tsx`

- [x] Em `SkinForm`, não renderizar `FormSection` "Precos e publicacao" quando `compact === true` (fluxo Cadastrar rifa).
- [x] Verificar fluxo **Editar rifa** (`raffle-edit`) — confirmar que seção não aparece (hoje usa layout reduzido).
- [x] Não remover campos do payload — `saveRaffleAction` / `updateRaffleAction` continuam com `listPrice`, `suggestedPrice` da skin vinculada.

### 4.2 Aceite Stage 4

- [x] Cadastrar rifa: sem bloco "Precos e publicacao" _(validado: `compact` + grep)_.
- [x] Calculadora completa (bilhetes, pacotes) intacta _(sem diff na calculadora)_.
- [x] Salvar rifa → payload com `ticket_count` / `ticket_price` via `appendSkinFields` _(código)_.
- [x] Editar rifa — sem seção enganosa _(layout `raffle-edit` sem SkinForm)_.

---

## Encerramento do cycle

- [ ] Preencher `implementation-notes.md` por stage.
- [ ] Preencher `validation.md` com resultados de build e smoke remoto.
- [ ] Preencher `spec-delta.md` → aplicar via `/update-spec` após validação humana.
- [ ] `npm run build` — sucesso.
- [ ] Deploy preview Vercel; smoke manual (humano).
- [ ] Opcional: `/review-implementation` por stage ou ao final.
