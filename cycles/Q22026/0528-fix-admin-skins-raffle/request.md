## Cycle metadata

| Campo | Valor |
|-------|--------|
| **Tipo** | Large |
| **Path** | `cycles/Q22026/0528-fix-admin-skins-raffle/` |
| **Data** | 2026-05-28 |

---

## Context

Rascunho consolidado do painel admin (`/admin`): correções em upload de imagem, precificação automática (preço loja / preço sugerido), UX do campo Desgaste e limpeza do cadastro de rifa.

**Esclarecido pelo humano:**
- Upload em **Cadastrar skin** (skin nova) está OK — fora do escopo de correção de upload.
- Calculadora de **rifa** (bilhetes, pacotes, custo/margem) está OK — não refazer fórmulas.

Cycle paralelo (escopo mais amplo, possível sobreposição): `cycles/Q22026/0527-fix-admin-skin-forms-finance/`. Ao executar stages, verificar o que já foi entregue em `0527` para evitar duplicação.

Specs e referências:
- `spec/features/painel-admin-ruby-safira/readme.md` — ficha técnica, calculadora simples/completa, upload Blob, `list_price` / `suggested_price`, `wear_label`, `/loja`, `/rifas`
- `cycles/Q22026/0524-platform-skins-store-backend/`
- `cycles/Q22026/0526-fix-admin-publish-calculator/`

---

## Intent

Operação admin confiável para skins e rifas: imagens que persistem na edição, preços promocionais coerentes com margem cadastrada, desgaste padronizado no cadastro e formulário de rifa sem seção enganosa.

Quatro frentes em **stages sequenciais** (cada stage entregável e validável isoladamente).

---

## Stage 1 — fix-skin-image-upload-persist

Upload de imagem em **skin já cadastrada** (editar/trocar foto) não persiste — após reload a imagem anterior permanece ou some.

O que deve acontecer:
- Trocar imagem via upload + salvar formulário persiste `image_url` no Supabase (Vercel Blob ou URL válida).
- Reload do admin exibe a nova imagem na ficha.
- Skin elegível em `/loja` (`em_estoque`, `list_price > 0`, `image_url` válido) reflete a foto atualizada.

O que NÃO fazer:
- Corrigir upload em **cadastro** de skin nova (já aceito pelo humano).
- Refactor geral do drawer/modal mobile (salvo bloqueio direto de save/persistência).
- Remoção de assets antigos no Blob.

Open questions (resolver no refine/implementação):
- Drawer permanece aberto: bug ou observação?
- Upload falha em silêncio ou com erro visível?

---

## Stage 2 — fix-suggested-price-margin

Ao alterar **custo** ou **lucro/margem** na ficha de skin, o sistema recalcula `list_price` e `suggested_price`.

**Atual (reportado):** preço loja respeita margem cadastrada (OK); preço sugerido (riscado na loja) fixo em **custo + 10%** — incorreto quando margem ≠ 10%.

**Desejado:**
- Custo + margem cadastrada → `list_price` (preço anunciado).
- Preço anunciado + margem promocional X% → `suggested_price` (sempre **maior** que `list_price` quando auto-preenchido).
- Não usar `custo + 10%` fixo para o sugerido.

O que NÃO fazer:
- Alterar calculadora completa de rifa.
- Redesenhar card da loja.
- Migration sem necessidade comprovada.

Open questions:
- Valor de **X% promocional**: fixo ou campo na ficha?
- Comportamento se admin apagar `suggested_price` manualmente.
- Ordem visual “de → por” na vitrine.

Referência: `lib/profit-calculator.ts`, calculadora simples na spec.

---

## Stage 3 — wear-label-dropdown

Campo **Desgaste** (Identificação) em cadastro/edição de skin deve exibir **lista selecionável** ao clicar, persistindo `wear_label` padronizado (ex. FN, MW, FT, WW, BS).

O que NÃO fazer:
- Barra visual de `float`.
- Autocomplete por nome de skin.

Open questions:
- Desgaste obrigatório ou opcional?

---

## Stage 4 — remove-raffle-prices-section

Remover do fluxo **Cadastrar rifa** (e edição, se existir) a seção **“Preços e publicação”** — preço exibido não corresponde ao valor rifado; seção considerada inútil pelo humano.

O que deve permanecer:
- Calculadora completa de rifa (bilhetes, pacotes, margem) inalterada.
- `saveRaffleAction` com `ticket_count`, `ticket_price`; rifa visível em `/rifas` com preço por bilhete correto.

O que NÃO fazer:
- Refazer fórmulas da calculadora de rifa.
- Checkout/pagamento.

Open questions:
- Campos da seção removida ainda referenciados no save?

---

## Constraints (globais)

- Admin autenticado para upload; não expor custo/margem interna em `/loja`.
- Manter contratos da spec (`skins`, `raffles`, status, view pública).
- Campos de preço editáveis após auto-preenchimento (calculadora).
- **Sem migration** salvo necessidade comprovada em algum stage.
- Valores monetários em BRL.

---

## Out of scope (globais)

- Upload em cadastro de skin nova (OK).
- Redesign completo do painel admin ou Ruby/Safira.
- Checkout, pagamento, conformidade legal de rifas.
- Itens do cycle `0527` não listados acima (financeiro unificado, compras e vendas, etc.) — tratar em `0527` ou cycle futuro.

---

## Success criteria (por stage)

**Stage 1**
- Upload + salvar em skin existente → reload admin mostra nova imagem.
- `/loja` reflete imagem quando skin elegível.

**Stage 2**
- Mudança custo/margem recalcula loja e sugerido; sugerido > loja.
- Margem 20%: sugerido não segue +10% sobre custo.

**Stage 3**
- Lista ao clicar Desgaste; valor persiste após save e reload.

**Stage 4**
- Seção “Preços e publicação” ausente; salvar rifa e `/rifas` OK.

---

## Ordem de execução recomendada

1 → 2 → 3 → 4 (stages independentes entre 3 e 4; 1 e 2 priorizam operação de estoque e preços).
