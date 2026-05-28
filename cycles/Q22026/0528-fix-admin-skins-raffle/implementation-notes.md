# Notas de implementação — 0528

> Skeleton — preencher durante `/execute-stage` de cada stage.

---

## Stage 1 — fix-skin-image-upload-persist

### Causa raiz confirmada

- Upload via API já persistia `image_url` no Supabase (`updateSkinImageUrl`).
- `handleImageUpload` atualizava só `draft.image`; **`skins` local permanecia stale** — ao fechar/reabrir ficha ou ver grid de estoque, a imagem antiga voltava na UI mesmo com DB correto.
- Rota de upload **não** revalidava cache de `/admin` e `/loja` após sucesso.

### Correção aplicada

| Arquivo | Mudança |
|---------|---------|
| `components/AdminPanel.tsx` | Após upload OK: `setSkins` com nova `image` para `selectedSkinId` + `updateDraft` (mantido). |
| `app/api/admin/upload-skin-image/route.ts` | `revalidatePath('/admin')`, `revalidatePath('/loja')`, `revalidatePath('/')` após update. |

`saveSkinDraft` já envia `draft.image` via `appendSkinFields` — após upload o draft está atualizado; save subsequente não regredirá URL.

### Overlap com 0527

- Erros de upload visíveis e drawer aberto pós-save: **já entregues em 0527** — não alterados.
- Esta stage adiciona sync de `skins` local + revalidate na rota de upload.

### Desvio do plano

- `useEffect` para sync `data.skins` após `router.refresh()` **não** aplicado — regra ESLint `react-hooks/set-state-in-effect` (Next 16) flagaria erro novo; `setSkins` no handler cobre reopen na mesma sessão; reload full page inicializa de `data.skins` fresco.

---

## Stage 2 — fix-suggested-price-margin

### Fórmula final

- `STORE_PROMO_MARGIN_PERCENT = 10` exportado de `lib/profit-calculator.ts`.
- `list_price = custo + lucro` (inalterado).
- `suggested_price = list_price × 1.10` quando modo percentual, `paidValue > 0` e `listPrice > 0`.
- Modo lucro fixo: `suggestedPrice: null` (comportamento anterior mantido).
- Exemplo validado: custo 100, margem 20% → list 120, sugerido **132** (antes 110).

### Sync manual de suggested_price

- Baseline de gatilhos (0527) já cobre o caso: limpar sugerido manualmente não altera triggers → `useEffect` não repõe.
- Ao mudar custo/lucro/modo, triggers divergem → sync aplica novo `storePricing.suggestedPrice`.
- **Sem alteração** no `useEffect` de sync — baseline existente suficiente.

### UI

- `StoreCalculatorPanel`: label "Preco sugerido (promo)" + copy explicando promo sobre preço loja.
- `FormSection` "Precos e publicacao": descrição atualizada.

---

## Stage 3 — wear-label-dropdown

### Componente escolhido

- `<select>` nativo com classe `admin-input` (mesmo padrão do campo Status).
- Opção vazia `"Selecionar desgaste"` para campo opcional.
- Opções de `CS2_WEAR_LABELS` com `value` FN–BS e label legível (ex. "MW — Minimal Wear").

### Persistência

- Inalterada: `appendSkinFields` → `formData.set("wearLabel", ...)` → `saveSkinAction` → `wear_label` no Supabase.
- `suggestFloatForWear` mantido ao trocar desgaste quando `float` está vazio.

---

## Stage 4 — remove-raffle-prices-section

### Seções removidas

- `FormSection` "Precos e publicacao" envolvida em `{!compact ? ... : null}`.
- Cadastrar rifa passa `compact` ao `SkinForm` — seção oculta.
- Editar rifa (`raffle-edit`): layout próprio sem `SkinForm` — seção já ausente.

### Payload de save

- `saveRaffleDraft` / `saveRaffleEdit` continuam chamando `appendSkinFields(formData)` — inclui `listPrice`, `suggestedPrice`, `wearLabel`, `image`, etc.

---

## Deploy

- Sem migration.
- Validar upload Stage 1 em preview com `BLOB_READ_WRITE_TOKEN` na Vercel.
- Smoke `/loja` e `/rifas` após cada stage relevante.
