# Notas de implementação — 0527

## Sync calculadora ↔ preços

- `pricingBaselineRef` guarda snapshot de custo/lucro/modo ao abrir ou trocar skin.
- `useEffect` em modo `skin` só aplica `storePricing` quando gatilhos divergem do baseline (edição não sobrescreve preços no mount).
- Baseline atualizado em `openSkinForm`, `selectSkin`, `startNewSkinDraft`, `saveSkinDraft` e após recálculo.

## Upload

- `saveSkinDraft` não chama mais `closePanel()` — drawer permanece aberto com `selectedSkinId` definido.
- `handleImageUpload` exibe erros da API via `setSaveMessage`; sucesso atualiza draft e `router.refresh()`.

## Financeiro

- `groupFinancialEntriesBySkin` agrupa `custo` + `receita` por `skin_id`; ignora `lucro_realizado` e `taxa` no card.
- `SkinFinancialCard`: custo vermelho, venda verde, data da última entrada.
- Lista com `max-h-[480px] overflow-y-auto`.

## Compras e vendas

- Painel removido; grid inferior passou de 3 para 2 colunas (Rifas + Financeiro).

## Deploy

Sem migration. Validar upload em preview com `BLOB_READ_WRITE_TOKEN` configurado na Vercel.
