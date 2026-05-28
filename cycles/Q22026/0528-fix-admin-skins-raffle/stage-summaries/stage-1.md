# Stage 1 — fix-skin-image-upload-persist

**Status:** implementação concluída — aguardando smoke humano em preview.

## Entrega

- Sync de `skins` local após upload bem-sucedido em edição.
- Revalidação de `/admin`, `/loja` e `/` na rota de upload.

## Arquivos modificados

- `components/AdminPanel.tsx`
- `app/api/admin/upload-skin-image/route.ts`

## Validação agente

- `npm run build` — OK
- Smoke manual upload/reload — pendente humano

## Próximo passo

`/close-stage` ou smoke OK → `/map-stage` Stage 2
