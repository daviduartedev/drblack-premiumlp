# Plano (delta) — Corrigir admin: skins, preços, desgaste e rifa (Q2 2026)

**Ciclo:** `cycles/Q22026/0528-fix-admin-skins-raffle/`  
**Tipo:** Large — 4 stages sequenciais, cada uma validável isoladamente.

## Baseline canônico

- `spec/features/painel-admin-ruby-safira/readme.md` — ficha técnica, calculadora simples/completa, upload Blob, `list_price` / `suggested_price`, `wear_label`, `/loja`, `/rifas`.
- Ciclos relacionados:
  - `0527-fix-admin-skin-forms-finance` — sync condicional de preços na edição, drawer aberto após save, erros de upload visíveis, financeiro agrupado. **Verificar o que já está mergeado antes de cada stage.**
  - `0526-fix-admin-publish-calculator` — calculadoras duplas, critérios de elegibilidade `/loja`.
  - `0524-platform-skins-store-backend` — Supabase + Blob, `updateSkinImageUrl`.

## Causas raiz identificadas (código atual)

| Stage | Arquivo | Problema |
|-------|---------|----------|
| 1 | `components/AdminPanel.tsx` | Upload em edição chama API (persiste via `updateSkinImageUrl`) e atualiza `draft.image`, mas **não atualiza** `skins` local. Reabrir ficha ou save subsequente pode usar imagem stale. Rota de upload **não** chama `revalidatePath`. |
| 1 | `app/api/admin/upload-skin-image/route.ts` | Grava `image_url` no Supabase; falta revalidação de `/admin` e `/loja`. |
| 2 | `lib/profit-calculator.ts` L136–138 | `suggestedPrice` fixo em `paidValue * 1.1` (custo + 10%), ignorando margem cadastrada e relação com `list_price`. |
| 2 | `components/AdminPanel.tsx` | `useEffect` de sync aplica `storePricing.suggestedPrice` ao alterar custo/lucro — propaga bug do motor. |
| 3 | `components/AdminPanel.tsx` | Campo Desgaste usa `SearchableCombobox` (busca + foco); UX reportada pede **lista selecionável ao clicar** com valores padronizados FN–BS. |
| 4 | `components/AdminPanel.tsx` | Fluxo **Cadastrar rifa** renderiza `SkinForm compact` que inclui seção **"Precos e publicacao"** — enganosa (preço de loja ≠ preço rifado). |

## Decisões refinadas (produto)

| Tema | Decisão |
|------|---------|
| Stage 1 — escopo upload | **Somente edição** de skin existente. Cadastro novo fora de escopo (OK pelo humano). |
| Stage 1 — drawer aberto | **Comportamento esperado** (entregue em 0527). Não tratar como bug. |
| Stage 1 — erros de upload | Exibir mensagem na UI (0527); reforçar se ainda houver falha silenciosa em edge cases. |
| Stage 1 — assets Blob antigos | **Não** remover blobs anteriores neste cycle. |
| Stage 2 — fórmula sugerido | `suggested_price = list_price × (1 + X/100)` onde `list_price = custo + margem cadastrada`. **X = 10% fixo** (margem promocional sobre o preço anunciado) até haver campo dedicado na ficha. |
| Stage 2 — sugerido manual | Admin pode apagar `suggested_price`; sync automático **não** repõe até mudança nos gatilhos (custo, lucro, modo) — mesmo padrão de baseline de 0527. |
| Stage 2 — vitrine | Manter ordem atual: `list_price` destaque, `suggested_price` riscado abaixo (`LojaSkinCard`). Sem redesign. |
| Stage 3 — desgaste | Lista fechada FN, MW, FT, WW, BS (`CS2_WEAR_LABELS`). **Opcional** (não bloqueia save). |
| Stage 3 — UX | Substituir combobox de busca por **`<select>` nativo** (ou equivalente com lista explícita ao clicar) — mínimo diff, padrão claro de dropdown. |
| Stage 4 — seção removida | Ocultar **"Precos e publicacao"** no `SkinForm` quando `compact` (fluxo rifa). Manter campos no payload de save (vêm da skin vinculada). |
| Stage 4 — calculadora rifa | **Inalterada** — bilhetes, pacotes, margem lateral. |
| Migration | **Nenhuma** — escopo app/UI. |
| Validação | `npm run build` no agente; smoke manual preview Vercel → produção. |
| Overlap 0527 | Antes de Stage 1/2, diff contra branch/main e pular tasks já entregues em 0527. |

## Delta por stage

### Stage 1 — `fix-skin-image-upload-persist`

**Objetivo:** trocar foto em skin existente persiste após reload admin e reflete em `/loja` quando elegível.

**Arquivos:**

| Arquivo | Mudança |
|---------|---------|
| `components/AdminPanel.tsx` | Após upload OK: `setSkins` com `image` atualizada; opcionalmente sincronizar `draft` se reabrir mesma skin. |
| `app/api/admin/upload-skin-image/route.ts` | `revalidatePath('/admin')`, `revalidatePath('/loja')`, `revalidatePath('/')`. |
| `components/AdminPanel.tsx` | Garantir que `saveSkinDraft` após upload não sobrescreve com URL antiga (draft já atualizado — validar). |

**Aceite:** upload + save (ou só upload, pois API já persiste) → reload admin → nova imagem; skin elegível em `/loja` mostra foto nova.

---

### Stage 2 — `fix-suggested-price-margin`

**Objetivo:** `suggested_price` derivado do preço anunciado + margem promocional, não de `custo + 10%`.

**Arquivos:**

| Arquivo | Mudança |
|---------|---------|
| `lib/profit-calculator.ts` | Corrigir `calculateStorePricing`: `suggestedPrice = roundCurrency(listPrice * (1 + PROMO_MARGIN_PERCENT / 100))` quando `listPrice > 0`; garantir `suggestedPrice > listPrice` quando auto-preenchido. Exportar constante `STORE_PROMO_MARGIN_PERCENT = 10` (ou param opcional). |
| `components/AdminPanel.tsx` | `StoreCalculatorPanel` — copy alinhada à nova fórmula. |
| `components/AdminPanel.tsx` | Sync via `useEffect`: respeitar `suggestedPrice === null` manual até gatilho mudar (estender baseline se necessário). |

**Exemplo (margem loja 20%, promo 10%):** custo 100 → list 120 → sugerido 132 (não 110).

**Aceite:** margem 20% → sugerido ≠ custo×1.1; sugerido > list_price quando auto-preenchido.

---

### Stage 3 — `wear-label-dropdown`

**Objetivo:** Desgaste com lista padronizada ao clicar; valor persiste em `wear_label`.

**Arquivos:**

| Arquivo | Mudança |
|---------|---------|
| `components/AdminPanel.tsx` | Campo Desgaste: `<select>` com opções de `CS2_WEAR_LABELS` (valor FN–BS, label legível). Manter `suggestFloatForWear` ao trocar desgaste se float vazio. |
| `lib/cs2-skin-catalog.ts` | Sem mudança esperada (já exporta `CS2_WEAR_LABELS`). |

**Aceite:** clicar → lista; selecionar MW → save → reload → MW; badge na loja reflete `wear_label`.

---

### Stage 4 — `remove-raffle-prices-section`

**Objetivo:** remover seção enganosa do fluxo rifa; salvar rifa e `/rifas` intactos.

**Arquivos:**

| Arquivo | Mudança |
|---------|---------|
| `components/AdminPanel.tsx` | Em `SkinForm`, omitir `FormSection` "Precos e publicacao" quando `compact === true`. Avaliar `panelMode === 'raffle-edit'` — hoje não usa `SkinForm` completo; confirmar ausência da seção. |
| `app/login/actions.ts` | Sem mudança — `saveRaffleAction` continua recebendo preços da skin via `appendSkinFields`. |

**Aceite:** Cadastrar rifa sem bloco "Precos e publicacao"; bilhetes/preço rifa via calculadora; card em `/rifas` com `ticket_price` correto.

## Dependências entre stages

```
Stage 1 ──► Stage 2 ──► Stage 3 ──► Stage 4
              │              │
              └─ independentes entre 3 e 4
```

- Stages 1 e 2 priorizam operação de estoque/preços.
- Stages 3 e 4 são independentes entre si; executar após 1–2 ou em paralelo se 1–2 concluídos.

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Duplicar fix de 0527 (upload drawer/erros) | Checklist de overlap no início de Stage 1 |
| Save rifa perde dados de skin ao ocultar seção | Campos permanecem no draft; só UI removida |
| Sugerido auto menor que list por arredondamento | Usar `Math.max` ou ceil na promo |
| Select nativo quebra estilo admin | Reutilizar classe `admin-input` |
| Upload persiste mas cache CDN Blob | Fora de escopo; URL com suffix aleatório já invalida cache |

## Fora de escopo (confirmado)

- Upload em cadastro de skin nova
- Refactor drawer/modal mobile (salvo bloqueio de save)
- Remoção de assets Blob antigos
- Calculadora completa de rifa / checkout
- Migration SQL
- Itens financeiros unificados de 0527

## Referências

- `cycles/Q22026/0528-fix-admin-skins-raffle/request.md`
- `cycles/Q22026/0527-fix-admin-skin-forms-finance/plan.md`
- `lib/profit-calculator.ts`, `components/AdminPanel.tsx`
