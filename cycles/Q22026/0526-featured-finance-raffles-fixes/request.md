## Context

Ajustes operacionais pós-cycle `0526-fix-admin-publish-calculator`: home, admin skins, financeiro/compras e rifas ainda não refletem o comportamento esperado pela spec.

Sintomas reportados:
- **Home:** seção "Skins em destaque" não exibe skins do catálogo; click deve levar a `/loja`.
- **Admin skins:** falta controle para marcar skin como destaque (limite sugerido: 10).
- **Admin:** skin alterada para **`vendida`** não aparece em "Compras e vendas" nem no **Financeiro**.
- **Financeiro:** não reage a cadastros nem alterações (permanece estático/desconectado).
- **Admin rifas:** falta **edição** de rifa, incluindo fluxo de **finalização**.
- **`/rifas`:** apresentação dobrada — 1 cadastro renderiza 2 itens na página.

Restrição operacional: **sem ambiente de dev local** — ajustar código, build/preview Vercel → produção.

Specs e referências:
- `spec/features/painel-admin-ruby-safira/readme.md` — home `#skins-destaque`, `/loja`, `/rifas`, admin financeiro, `financial_entries`, status de skin/rifa
- `cycles/Q22026/0526-fix-admin-publish-calculator/`
- `cycles/Q22026/0524-platform-skins-store-backend/`

---

## Intent

Operação admin e vitrines públicas alinhadas à spec: destaque na home alimentado pelo catálogo, controle admin do que aparece em destaque, financeiro e compras/vendas refletindo vendas reais, rifas editáveis até finalização, e vitrine `/rifas` sem duplicatas.

---

## Scope

### 1. Home — "Skins em destaque"

- A seção `#skins-destaque` na home deve listar skins do catálogo marcadas como destaque (não mock/estático vazio).
- Cada item (ou CTA da seção) deve levar para **`/loja`**.

### 2. Admin skins — destaque

- Na ficha/cadastro de skin no admin, adicionar **checkbox "Exibir em Skins em destaque"**.
- Limitar a **no máximo 10** skins em destaque simultâneas (bloqueio ou mensagem clara ao tentar exceder).

### 3. Admin — status `vendida` → Compras e vendas + Financeiro

- Ao alterar uma skin para status **`vendida`**, o registro deve aparecer na aba admin **"Compras e vendas"**.
- O mesmo evento deve refletir no módulo **Financeiro** (receita/custo/lucro conforme dados da ficha).

### 4. Admin — Financeiro reativo

- O Financeiro deve reagir a operações reais: cadastro/alteração de skin (custos, preços, status) e vendas (`vendida`), não permanecer estático ou desconectado.

### 5. Admin rifas — edição e finalização

- Adicionar **edição de rifa** no painel admin.
- Na edição, permitir o **fluxo de finalização** da rifa (encerrar/concluir conforme status canônicos da spec).

### 6. Público `/rifas` — duplicata

- Corrigir exibição dobrada: **1 rifa cadastrada** não pode renderizar **2 cards** na página `/rifas`.

---

## Constraints

- **Deploy direto em produção** — sem subir ambiente de dev local; validar via build + preview Vercel → produção.
- Seguir **padrão atual do código** (`lib/*-repository.ts`, Server Actions, Supabase + RLS); boas práticas e **cibersegurança** (sem expor custo/lucro/observações ao público).
- Manter contratos da spec: status canônicos, `/loja` só `em_estoque`, skin `em_rifa` fora da loja, WhatsApp como CTA (sem checkout).
- Migration só se **estritamente necessária** (ex.: campo de destaque em `skins` + regra de limite 10).
- UI admin densa/operacional existente; sem redesign Ruby/Safira.

---

## Out of scope

- Checkout, pagamento online ou reserva automática de bilhetes
- Busca, filtros ou paginação em `/loja`
- Habilitar link "Rifas" no hero da LP (permanece "Em breve" por spec)
- Redesign visual Ruby/Safira ou copy do rebrand
- Compliance jurídico de sorteios/rifas
- Novo ambiente de dev / seed local extensivo
- Calculadora de margem (cycle 0526 — fora deste escopo salvo regressão explícita)

---

## Open questions

1. Skins em destaque: só **`em_estoque`** elegíveis, ou também outras?
2. Ao marcar **`vendida`**: criar linha em `purchases` + `financial_entries` automaticamente, ou só listar na aba Compras e vendas a partir de `skins`?
3. **Finalização de rifa**: quais campos editáveis após criação (`draw_date`, bilhetes, título)? Status alvo ao finalizar: `encerrada` apenas, ou incluir sorteio/ganhador?
4. Limite 10: **bloqueio rígido** ou permitir substituir a mais antiga?

---

## Success criteria

- Skin marcada destaque → aparece na home e link leva a `/loja`; máximo 10 enforced no server.
- Skin `vendida` → visível em Compras e vendas e Financeiro atualizado.
- Cadastro/edição de skin → Financeiro reflete dados agregados ou entradas coerentes.
- Rifa editável no admin com finalização funcional.
- `/rifas` mostra **1 card por rifa** cadastrada (sem duplicata).
- Vitrines públicas não exibem custo, margem interna nem observações.
