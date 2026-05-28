# Stage 2 — fix-suggested-price-margin

**Status:** implementação concluída — aguardando smoke humano em preview.

## Entrega

- `calculateStorePricing`: sugerido = `list_price × (1 + 10%)`, não `custo × 1.1`.
- Copy da calculadora loja e seção "Precos e publicacao" alinhada.

## Arquivos modificados

- `lib/profit-calculator.ts`
- `components/AdminPanel.tsx`

## Validação agente

- Fórmula: 100 + 20% → list 120, sugerido 132
- `npm run build` — OK
- Smoke manual admin/loja — pendente humano

## Próximo passo

Smoke OK → `/map-stage` Stage 3
