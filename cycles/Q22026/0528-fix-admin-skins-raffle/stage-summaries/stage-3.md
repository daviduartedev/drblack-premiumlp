# Stage 3 — wear-label-dropdown

**Status:** implementação concluída — aguardando smoke humano em preview.

## Entrega

- Campo Desgaste: `<select>` nativo com FN, MW, FT, WW, BS (+ opção vazia).
- `suggestFloatForWear` preservado.

## Arquivos modificados

- `components/AdminPanel.tsx`

## Validação agente

- `npm run build` — OK
- Persistência via fluxo existente `wearLabel` → `wear_label`

## Próximo passo

Smoke OK → `/execute-stage` Stage 4
