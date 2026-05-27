# Spec delta — 0527 fix-admin-skin-forms-finance

Proposta de alteração em `spec/features/painel-admin-ruby-safira/readme.md`.  
Aplicar via `/update-spec` após validação humana — **não editar spec canônica durante execução.**

---

## Seção: Painel admin → UX admin

**Adicionar / substituir:**

### Sync calculadora ↔ preços (ficha skin)

- Ao **editar** skin existente, `list_price` e `suggested_price` carregados do banco **não** são sobrescritos pela calculadora no mount.
- Recálculo automático ocorre **somente** quando o admin altera inputs-gatilho: valor pago, lucro (% ou R$), modo de lucro ativo.
- Cadastro **novo** mantém sync em tempo real ao informar custo/lucro.

### Upload de imagem

- Após **primeiro save** de skin nova, o drawer **permanece aberto** com `skinId` definido para permitir upload Blob no mesmo fluxo.
- Falhas de upload devem exibir mensagem de erro na UI (não falha silenciosa).
- URL manual continua disponível como fallback.

### Compras e vendas

- Remover seção **Compras e vendas** do painel admin neste ciclo (UI morta).
- Dados de `purchases` / histórico permanecem no backend para uso futuro; sem nova UI neste cycle.

---

## Seção: Painel admin → histórico financeiro

**Substituir descrição de listagem flat por:**

- Seção **Financeiro** exibe **cards agrupados por skin** (não uma linha por `financial_entry`).
- Cada card contém:
  - Nome da skin
  - **Custo** (BRL, vermelho) — entrada `kind = custo`
  - **Venda** (BRL, verde) — entrada `kind = receita`, ou ausente se skin não vendida
  - **Data** — data mais recente entre entradas da skin (última alteração relevante)
- Lista com **scroll interno** quando exceder altura visível; não truncar sem rolagem.
- Entradas `lucro_realizado` e `taxa` continuam alimentando **métricas do topo**; não duplicadas no card por skin.

---

## Exclusões (confirmar na spec)

- Modal ou click-for-details no card financeiro — fora de escopo.
- Reimplementação de Compras e vendas — fora de escopo.
- Migration SQL — fora de escopo.
