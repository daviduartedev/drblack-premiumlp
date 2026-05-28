# Validação — 0528 fix-admin-skins-raffle

**Validado pelo agente em 2026-05-28** (pré-produção). Smoke manual do humano opcional — checklist de prod abaixo.

## Build (agente)

- [x] `npm run build` — sucesso (Next.js 16.2.4, TypeScript OK)
- [x] `npm run lint` — 2 erros **pré-existentes** (`react-hooks/set-state-in-effect` em raffle sync e financialEntries); nenhum novo deste cycle
- [x] `node scripts/validate-0528-cycle.mjs` — 14 checks OK (precificação + wear)

## Migration Supabase (humano)

- [x] N/A — sem migration neste cycle

---

## Stage 1 — fix-skin-image-upload-persist

| Check | Agente | Prod |
|-------|--------|------|
| Upload API persiste + `revalidatePath` | [x] código | [ ] |
| `setSkins` + `updateDraft` após upload | [x] código | [ ] |
| Erro 401/503 visível na UI | [x] código (0527) | [ ] |
| Reload admin → imagem nova | [x] fluxo DB direto + revalidate | [ ] confirmar |
| `/loja` reflete imagem elegível | [x] revalidate `/loja` | [ ] confirmar |

**Pré-requisito prod:** `BLOB_READ_WRITE_TOKEN` na Vercel.

---

## Stage 2 — fix-suggested-price-margin

| Check | Agente | Prod |
|-------|--------|------|
| Custo 100, margem 20% → list 120, sugerido 132 | [x] script | [ ] |
| Sugerido ≠ custo + 10% (110) | [x] script | [ ] |
| Sugerido > list quando auto | [x] script | [ ] |
| Modo lucro fixo → sugerido null | [x] script | [ ] |
| Baseline: apagar sugerido não repõe sem mudar custo | [x] código | [ ] |
| Calculadora rifa inalterada | [x] sem diff em `calculateRaffleProfit` | [ ] |

---

## Stage 3 — wear-label-dropdown

| Check | Agente | Prod |
|-------|--------|------|
| `<select>` com FN–BS + opção vazia | [x] código | [ ] |
| `wearLabel` → `appendSkinFields` → `wear_label` | [x] código | [ ] |
| Badge loja usa `skin.wearLabel` | [x] `LojaSkinCard` | [ ] |
| `suggestFloatForWear` ao selecionar | [x] código | [ ] |

---

## Stage 4 — remove-raffle-prices-section

| Check | Agente | Prod |
|-------|--------|------|
| Cadastrar rifa sem "Precos e publicacao" | [x] `!compact` | [ ] |
| Editar rifa sem seção | [x] layout sem SkinForm | [ ] |
| Payload rifa mantém bilhetes/preço | [x] `appendSkinFields` | [ ] |
| Calculadora rifa intacta | [x] sem diff | [ ] |

---

## Checklist rápido produção (5 min)

1. **Admin → editar skin** → upload foto → F5 → foto nova na ficha
2. **Mesma skin elegível** → `/loja` → foto nova no card
3. **Cadastrar/editar skin** → custo 100, margem 20% → loja ~120, sugerido ~132
4. **Desgaste** → dropdown MW → salvar → reload → MW no campo e badge na loja
5. **Cadastrar rifa** → sem bloco "Precos e publicacao" → salvar → `/rifas` com preço/bilhete OK

## Produção

- [ ] Deploy após merge
- [ ] Checklist acima em prod

## Próximo passo

`/update-spec` com `spec-delta.md` após deploy OK
