# Spec delta — 0528 fix-admin-skins-raffle

Proposta de alteração em `spec/features/painel-admin-ruby-safira/readme.md`.  
Aplicar via `/update-spec` após validação humana — **não editar spec canônica durante execução.**

---

## Seção: Calculadora simples — ficha de skin (loja)

**Substituir / complementar saída de `suggested_price`:**

- `list_price` = valor alvo de venda (custo + lucro conforme modo percentual ou fixo) — **inalterado**.
- `suggested_price` (auto-preenchido) = **preço anunciado + margem promocional** sobre `list_price`, não custo + percentual fixo.
- Margem promocional padrão: **10% sobre `list_price`** (constante de produto até existir campo dedicado na ficha).
- Regra: quando auto-preenchido, `suggested_price` **>** `list_price`.
- Admin pode limpar `suggested_price` manualmente; recálculo automático somente ao alterar inputs-gatilho (custo, lucro, modo) — alinhado ao sync condicional de 0527.

**Exemplo:** custo R$ 100, margem loja 20% → `list_price` R$ 120 → `suggested_price` R$ 132 (120 + 10%).

---

## Seção: Upload de imagem

**Complementar (edição de skin existente):**

- Upload via Route Handler persiste `image_url` imediatamente no Supabase.
- Após upload bem-sucedido, revalidar `/admin`, `/loja` e home.
- Estado local do painel deve refletir a nova URL para evitar regressão ao reabrir ficha ou salvar novamente.
- Falhas de upload exibem mensagem na UI (não silenciosas).

**Fora de escopo:** remoção de blobs antigos; correção de upload em cadastro de skin nova (já aceito).

---

## Seção: Ficha técnica — campo Desgaste

**Substituir descrição genérica por:**

- Campo **Desgaste** (`wear_label`) em cadastro/edição de skin: **lista fechada** FN, MW, FT, WW, BS (valores canônicos curtos).
- Interação: dropdown/select ao clicar — não campo livre de texto.
- Campo **opcional** (não bloqueia salvamento).
- Valor persiste em `wear_label` e alimenta badge no card público da loja.

---

## Seção: Fluxo Cadastrar rifa

**Adicionar:**

- O formulário compacto da skin no fluxo **Cadastrar rifa** **não** exibe a seção **"Precos e publicacao"** (preço loja / sugerido / status de vitrine).
- Precificação da rifa permanece exclusivamente na **calculadora completa** (bilhetes, pacotes, `ticket_price`).
- Campos financeiros da skin vinculada continuam persistidos no backend via save da rifa; apenas a UI enganosa é removida.

**Inalterado:** calculadora completa, `saveRaffleAction`, critérios de `/rifas`, skin `em_rifa` fora de `/loja`.

---

## Exclusões (confirmar na spec)

- Campo UI para margem promocional X% — fora deste cycle (constante 10%).
- Migration SQL — fora de escopo.
- Redesign de card da loja ou painel admin.
