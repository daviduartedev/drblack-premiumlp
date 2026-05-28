# Review — 0528 fix-admin-skins-raffle

> Skeleton — preencher via `/review-implementation` após cada stage ou ao encerrar o cycle.

---

## Stage 1 — fix-skin-image-upload-persist

| Critério | Status | Notas |
|----------|--------|-------|
| Upload edição persiste reload admin | | |
| `/loja` reflete imagem elegível | | |
| Erros de upload visíveis | | |
| Sem regressão cadastro novo | | |

### Riscos / regressões

- [ ] Save subsequente não sobrescreve imagem
- [ ] Revalidate paths após upload

---

## Stage 2 — fix-suggested-price-margin

| Critério | Status | Notas |
|----------|--------|-------|
| Sugerido ≠ custo + 10% | | |
| Sugerido > list auto | | |
| Campo manual respeitado | | |
| Vitrine ordem preços OK | | |

### Riscos / regressões

- [ ] Sync 0527 (baseline preços) intacto
- [ ] Calculadora rifa intacta

---

## Stage 3 — wear-label-dropdown

| Critério | Status | Notas |
|----------|--------|-------|
| Lista ao clicar | | |
| Persistência wear_label | | |
| Opcional no save | | |

---

## Stage 4 — remove-raffle-prices-section

| Critério | Status | Notas |
|----------|--------|-------|
| Seção ausente no fluxo rifa | | |
| saveRaffleAction OK | | |
| `/rifas` preço bilhete correto | | |

---

## Cycle — geral

### Escopo vs entrega

| Stage | Entregue | Pendente |
|-------|----------|----------|
| 1 — upload persist | | |
| 2 — suggested price | | |
| 3 — wear dropdown | | |
| 4 — remove raffle prices | | |

### Spec

- [ ] `spec-delta.md` aplicado via `/update-spec`

### Overlap 0527

- [ ] Sem duplicação desnecessária documentada em `implementation-notes.md`

### Aprovação

- [ ] Preview Vercel OK (humano)
- [ ] Produção OK (humano)
