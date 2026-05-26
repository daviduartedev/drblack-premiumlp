## Context

Operação admin da plataforma DrBlack: cadastro de skins e rifas, calculadora de custo/margem e vitrines públicas (`/loja`, `/rifas`).

Sintomas reportados:
- Calculadora de sugestão preço/margem **inoperante** (custo + margem desejada não produzem sugestão utilizável).
- **Skins:** cadastro no admin aparenta funcionar, mas a skin **não aparece** em `/loja`.
- **Rifas:** fluxo **não registra** no admin e rifa **não aparece** em `/rifas`.

Dúvida de produto: ao informar custo e margem, o preço deve ser **auto-preenchido** ou apenas **sugerido** (editável)?

Specs e referências:
- `spec/features/painel-admin-ruby-safira/readme.md` — admin, ficha técnica, calculadora, `/loja`, `/rifas`, status, RLS, view `public_store_skins`
- `cycles/Q12026/0006-painel-admin-ruby-safira/`
- `cycles/Q22026/0524-platform-skins-store-backend/`

---

## Intent

Restaurar operação confiável do painel admin: precificação assistida por custo e margem, persistência de cadastros e reflexo nas vitrines públicas (`/loja`, `/rifas`), sem workaround manual paralelo.

---

## Scope

### 1. Calculadora de custo e margem

No fluxo admin (ficha de skin e/ou cadastro de rifa com calculadora), ao informar **custo** (valor pago) e **margem/lucro desejado** (%), o sistema deve calcular e exibir o valor alvo de venda e sugestões derivadas (preço por bilhete, pacotes de bilhetes), conforme fórmula da spec: `valor pago + percentual de lucro = valor alvo`.

Corrigir estado **inoperante** atual. Definir com o humano (open question) se campos de preço (`list_price`, preço por bilhete, etc.) são **auto-preenchidos** ou apenas **mostrados como sugestão** editável.

### 2. Skin cadastrada no admin → vitrine `/loja`

Skin registrada no admin deve aparecer em `/loja` quando atender regras da spec: status **`em_estoque`**, dados públicos mínimos (nome, `list_price`, imagem, etc.) e leitura via view/repositório público.

Skin com status **`em_rifa`** não deve aparecer em `/loja`.

### 3. Rifa no admin → vitrine `/rifas`

Fluxo **Cadastrar rifa** deve persistir no painel admin (listagem/estoque operacional) e rifas elegíveis devem aparecer em `/rifas`.

---

## Constraints

- Manter contratos e campos canônicos da spec (`skins`, `raffles`, status, view `public_store_skins`).
- Não expor custo, lucro interno nem observações ao visitante/cliente.
- Autenticação Supabase + RLS: admin persiste; leitura pública só via colunas/view permitidas.
- Valores monetários em BRL.
- Item **“Rifas” no nav da home** permanece “Em breve” por spec, mesmo com `/rifas` publicada.
- Sem checkout/pagamento online neste cycle (CTA WhatsApp mantido).

---

## Out of scope

- Checkout, pagamento online ou reserva automática de bilhetes
- Busca, filtros ou paginação em `/loja`
- Habilitar link “Rifas” no nav da LP (hero)
- Redesign visual Ruby/Safira ou copy do rebrand
- Compliance jurídico de sorteios/rifas
- Novas migrations de schema salvo as estritamente necessárias para corrigir publicação/RLS já definidas na spec

---

## Decisões (refino 2026-05-26)

| # | Decisão |
|---|---------|
| 1 | Ficha técnica **assistida**: sistema calcula e **preenche campos editáveis** (preço, bilhetes na rifa). |
| 2 | **Duas calculadoras**: simples na ficha skin (loja, sem bilhetes); completa no fluxo rifa. |
| 3 | Lucro: **% e valor fixo**, com modo explícito se ambíguo. |
| 4 | Salvar rifa: **`raffles` + skin `em_rifa`**. |
| 5 | `/loja`: só `em_estoque` com nome, `list_price > 0`, imagem; rascunho fora da vitrine. |
| 6 | Validação **sem local**; build + preview Vercel → produção. |

Detalhes: `plan.md`, `tasks.md`, `scenarios.feature`, spec atualizada.

---

## Success criteria

- Admin informa custo e margem → valor alvo e sugestões visíveis (fórmula da spec); sem falha silenciosa.
- Skin `em_estoque` cadastrada com dados públicos válidos → visível em `/loja`.
- Skin `em_rifa` → não aparece em `/loja`.
- Rifa cadastrada → listada no admin e visível em `/rifas` quando elegível.
- Vitrines públicas não exibem custo, margem interna nem observações.
- Após salvar skin/rifa, reload de `/admin` mantém os dados (persistência real).
