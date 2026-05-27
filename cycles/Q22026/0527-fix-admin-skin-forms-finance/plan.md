# Plano (delta) — Corrigir cadastro, edição e financeiro admin (Q2 2026)

**Ciclo:** `cycles/Q22026/0527-fix-admin-skin-forms-finance/`

## Baseline canônico

- `spec/features/painel-admin-ruby-safira/readme.md` — ficha técnica, calculadora simples (loja), upload Blob, `financial_entries`, `/loja`.
- Ciclos anteriores: `0526-fix-admin-publish-calculator` (calculadora + sync de preços), `0526-featured-finance-raffles-fixes` (`syncFinancialEntriesForSkin`, Compras e vendas parcial).
- Código atual — causas raiz identificadas:
  1. **Preços na edição:** `useEffect` em `AdminPanel` (modo `skin`) sobrescreve `listPrice` / `suggestedPrice` com `storePricing` sempre que custo/lucro mudam — inclusive ao abrir skin existente, recalculando a partir de `paidValue` + margem e apagando preços já salvos (ex.: R$ 99 / R$ 100 → R$ 156 / R$ 132).
  2. **Upload:** `handleImageUpload` exige `selectedSkinId`; skin nova não tem ID até salvar. Após salvar, `saveSkinDraft` chama `closePanel()` — impede upload no mesmo fluxo. Erros de upload são silenciosos (`if (!res.ok) return`).
  3. **Compras e vendas:** painel agrega `purchases` (rifas), `salesHistory` (vazio) e `skinSalesRows` — sem operação útil percebida pelo admin.
  4. **Financeiro:** `Table` usa `max-h-[360px] overflow-hidden` — corta lista sem scroll. Uma skin gera múltiplas linhas (`Custo —`, `Venda —`, `Lucro —`).

## Decisões refinadas (produto)

| Tema | Decisão |
|------|---------|
| Sync calculadora → preços (edição) | **Não sobrescrever** preços persistidos ao abrir skin existente. Recalcular **somente** quando o admin alterar inputs-gatilho (custo, lucro %, lucro R$, modo) **depois** da carga inicial. |
| Sync calculadora → preços (cadastro novo) | Manter auto-sync ao alterar custo/lucro (comportamento atual desejado). |
| Upload — cadastro novo | Após primeiro save bem-sucedido: **manter drawer aberto**, definir `selectedSkinId`, permitir upload Blob no mesmo fluxo. Mensagem orientando envio da foto. |
| Upload — edição | Manter upload com `skinId` existente; exibir **erro visível** se API falhar (401, 503 Blob, etc.). |
| Compras e vendas | **Remover** seção do painel admin (não ocultar). DTO/repository intactos — sem reimplementar feature. |
| Financeiro — scroll | Lista com `max-h` + `overflow-y-auto` (corrigir `overflow-hidden`). |
| Financeiro — card unificado | **Um card por `skin_id`**: nome da skin; **Custo** vermelho (`kind === 'custo'`); **Venda** verde (`kind === 'receita'`), ou "—" se ausente; **Data** = data mais recente entre entradas da skin (cadastro = custo; após venda = data da venda se mais nova). |
| Data no card | **Somente uma data** (última alteração). Linhas separadas por custo/venda e modal de detalhes ficam **fora de escopo**. |
| Lucro realizado | Não exibir no card unificado (mantém métricas no topo). Card foca custo + venda conforme request. |
| Migration | **Nenhuma** — escopo UI + lógica client/admin existente. |
| Validação | `npm run build` no agente; smoke manual preview Vercel → produção (sem local). |

## Delta técnico

### 1. Precificação — sync condicional

**Arquivo:** `components/AdminPanel.tsx`

- Introduzir baseline de inputs-gatilho (ref ou state) setado em `openSkinForm` / `selectSkin` / `startNewSkinDraft`.
- Alterar `useEffect` de sync de preços: comparar inputs atuais com baseline; só aplicar `storePricing` quando gatilhos **mudarem** após carga (ou usar flag `pricingDirty` incrementada nos `onChange` de custo/lucro/modo).
- Ao carregar skin existente: `setDraft(stripId(skin))` preserva `listPrice` / `suggestedPrice` do banco até recálculo explícito por mudança de custo/lucro.
- Atualizar copy em "Precos e publicacao" / calculadora lateral: deixar claro que edição manual permanece até custo/lucro mudarem.

### 2. Upload de imagem

**Arquivo:** `components/AdminPanel.tsx`

- `saveSkinDraft`: **não** chamar `closePanel()` após save bem-sucedido (ou só fechar se usuário clicar Cancelar/X). Atualizar `selectedSkinId` com ID retornado.
- `handleImageUpload`: tratar erros com `setSaveMessage`; parsear JSON de erro da API.
- Opcional: após save de skin nova com arquivo pendente em input, disparar upload automático se file ainda selecionado.
- Manter fallback URL manual no campo "URL da imagem".

**Arquivo:** `app/api/admin/upload-skin-image/route.ts` — revisar apenas se mensagens de erro precisarem padronizar (sem mudança estrutural esperada).

### 3. Remover Compras e vendas

**Arquivo:** `components/AdminPanel.tsx`

- Remover `<Panel title="Compras e vendas">` e `skinSalesRows` se usado só ali.
- Ajustar grid (`xl:grid-cols-3` → `xl:grid-cols-2` ou layout equivalente).

### 4. Financeiro — cards agrupados + scroll

**Arquivo:** `components/AdminPanel.tsx`

- Helper `groupFinancialEntriesBySkin(entries, skins)` → `{ skinId, skinName, cost, sale, lastDate }[]`.
- Componente `SkinFinancialCard` (inline ou função local): custo `#EF4444`, venda `#22C55E`, data formatada pt-BR.
- Container scrollável (`max-h-[480px] overflow-y-auto` ou similar).
- Substituir `Table` flat de `financialEntries` por lista de cards.

### 5. Estoque e precificação — UX

**Arquivo:** `components/AdminPanel.tsx`

- Revisar descrição do bloco "Estoque e precificacao": fluxo cadastro novo vs edição.
- Garantir combobox "Editar skin do estoque" + CTA "Cadastrar skin" não conflitam (já separados por `openSkinForm()` vs drawer).
- Smoke: cadastro novo → custo/lucro → preços preenchidos → save → upload → `/loja` se elegível.

## Arquivos prováveis

| Arquivo | Mudança |
|---------|---------|
| `components/AdminPanel.tsx` | Sync preços, upload UX, remover Compras e vendas, cards financeiros |
| `app/api/admin/upload-skin-image/route.ts` | Só se necessário padronizar erros |
| `spec/features/painel-admin-ruby-safira/readme.md` | Via `spec-delta.md` pós-execução |

## Fora de escopo (confirmado)

- Redesign Ruby/Safira
- Fluxo Cadastrar rifa / calculadora completa
- Reimplementar Compras e vendas
- Modal/detalhes extras no card financeiro
- Migration SQL
- Checkout / pagamento

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| Sync condicional ainda sobrescreve após editar custo em skin salva | Comportamento esperado — documentar na UI; admin pode reajustar preços manualmente após mudar custo |
| Drawer aberto após save confunde quem esperava fechar | Mensagem de sucesso clara + botão Fechar explícito |
| `BLOB_READ_WRITE_TOKEN` ausente em prod | Erro 503 já existe; exibir na UI |
| Agrupamento financeiro sem nome se skin deletada | Fallback para label da entry (`Custo — Nome`) |

## Referências

- `cycles/Q22026/0527-fix-admin-skin-forms-finance/request.md`
- `cycles/Q22026/0526-fix-admin-publish-calculator/plan.md` (sync calculadora)
- `cycles/Q22026/0526-featured-finance-raffles-fixes/implementation-notes.md` (`syncFinancialEntriesForSkin`)
