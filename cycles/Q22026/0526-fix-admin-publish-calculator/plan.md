# Plano (delta) — Corrigir admin, calculadora e publicação (Q2 2026)

**Ciclo:** `cycles/Q22026/0526-fix-admin-publish-calculator/`

## Baseline canônico

- `spec/features/painel-admin-ruby-safira/readme.md` — admin, ficha técnica, calculadora, `/loja`, `/rifas`, Supabase, view `public_store_skins`.
- Ciclo anterior: `cycles/Q22026/0524-platform-skins-store-backend/` — persistência Supabase, CTAs separados, calculadora só no fluxo **Cadastrar rifa**, `saveSkinAction` sem `raffles` insert.
- Código atual (gaps conhecidos): `AdminPanel` — **Salvar rifa** chama o mesmo `saveSkinAction`; calculadora ausente na **Ficha técnica**; modo de lucro fixo apenas `%` na UI.

## Decisões refinadas (produto)

| Tema | Decisão |
|------|---------|
| Calculadora — papel | **Ficha técnica assistida**: admin informa custo e lucro desejado; o sistema calcula e **preenche campos editáveis** (preço de venda, bilhetes na rifa). Não é painel passivo — é operação central do cadastro. |
| Calculadora — rifa | **Completa**: custo, lucro (% **ou** valor fixo com modo explícito), quantidade/preço de bilhete, pacotes sugeridos, valor alvo, margem, ponto de equilíbrio. Clicar pacote atualiza `ticket_count` **e** `ticket_price`. |
| Calculadora — skin / loja | **Simples**: custo, lucro (% ou fixo), **sem bilhetes**. Atualiza `list_price` e opcionalmente `suggested_price` a partir do valor alvo. Exibida na **Ficha técnica** (Cadastrar skin). |
| Modo de lucro | **Ambos** (% e BRL). Se ambos preenchidos, UI exige **escolha explícita** do modo ativo (evita ambiguidade — ciclo 0006). |
| Salvar rifa | **Ambos**: `INSERT` em `raffles` com `status = 'ativa'` **e** skin vinculada → `status = 'em_rifa'`. |
| Título da rifa | Padrão: **nome da skin**; campo **editável** antes de salvar. |
| Data do sorteio | Campo obrigatório no formulário de rifa; padrão sugerido: **+30 dias** a partir de hoje (editável). |
| Publicação `/loja` | Somente skins com `status = 'em_estoque'` **e** dados públicos mínimos válidos (ver spec). `em_rifa` **nunca** na loja. |
| Rascunho | Skin salva com `list_price <= 0` ou sem imagem válida permanece no admin mas **não** entra na vitrine pública. |
| Taxa estimada | **0%** neste ciclo (campo reservado no motor; sem UI obrigatória). |
| Feedback ao salvar | Mensagem clara de sucesso/erro (não falha silenciosa). Drawer fecha após sucesso; permanece aberto em erro. |
| Listagem admin rifas | Manter/reforçar tabela de rifas no painel (dados reais do Supabase após salvar). |
| Nav LP “Rifas” | Permanece **Em breve** (fora de escopo). |
| Ambiente de validação | **Sem execução local** pelo humano. Build no agente/CI; QA manual em **preview Vercel** → **produção**. |
| Migrations | Preferir **camada app** (actions + repository). Migration SQL **somente** se RLS/view impedir publicação após correção de código. |

### Regras de publicação na loja (definidas neste ciclo)

Uma skin aparece em `/loja` quando **todas** forem verdadeiras:

1. `status = 'em_estoque'`
2. `name` não vazio
3. `list_price > 0`
4. `image_url` não vazio (URL Blob ou válida)

Caso contrário: visível no admin como estoque/rascunho, ausente da view `public_store_skins`.

### Regras de publicação em `/rifas`

Rifa aparece quando:

1. Linha em `raffles` com `status = 'ativa'`
2. Skin vinculada existe (qualquer status; tipicamente `em_rifa` após salvar)
3. `ticket_count > 0`, `ticket_price > 0`, `title` e `draw_date` preenchidos

## Delta técnico

### 1. Motor e UI da calculadora

- Reutilizar `lib/profit-calculator.ts`; expor modo `%` | `valor_fixo` na UI de ambos os fluxos.
- **Skin:** função ou branch que deriva `list_price` / `suggested_price` do valor alvo (sem pacotes de bilhetes).
- **Rifa:** manter pacotes + sincronização bidirecional custo/lucro → `ticket_price`, `ticket_count`, métricas do painel lateral.
- Recalcular em tempo real ao editar custo, margem ou modo; respeitar overrides manuais até próximo “recalcular” explícito ou mudança nos inputs-gatilho (custo, %, modo).

### 2. Persistência de skin

- Corrigir `saveSkinAction` / `upsertSkin` se falha de RLS ou mapeamento impedir insert (mensagem de erro ao admin).
- `revalidatePath('/loja')` e `revalidatePath('/admin')` após salvar.
- Validar leitura via `public_store_skins` (não query direta com colunas internas).

### 3. Persistência de rifa (novo)

- `saveRaffleAction` (Server Action) + `upsertRaffle` no repository:
  - Criar/atualizar `raffles`
  - Atualizar skin: `status = 'em_rifa'`, persistir `ticket_count`, `ticket_price`, campos financeiros da ficha
- `AdminPanel`: em `panelMode === 'raffle'`, botão **Salvar rifa** chama action de rifa, não skin isolada.
- `revalidatePath('/rifas')`, `/admin`.

### 4. Spec e aceite

- Atualizar `spec/features/painel-admin-ruby-safira/readme.md` com calculadoras duplas, modos de lucro, critérios de vitrine e fluxo salvar rifa.
- Cenários Gherkin em `scenarios.feature` (nível usuário/negócio).

## Fora de escopo (confirmado)

- Checkout, pagamento online, reserva de bilhetes
- Busca/filtros/paginação em `/loja`
- Link “Rifas” ativo no hero da LP
- Redesign Ruby/Safira
- Compliance jurídico de sorteios
- Rodar app localmente para QA do humano

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| RLS bloqueia insert admin | Testar com service role apenas onde spec permite; policy `skins_admin_all` / `raffles_admin_all` já na migration 001 |
| Migration não aplicada em prod | Documentar check SQL no `tasks.md`; validar em preview |
| Auto-preenchimento sobrescreve edição manual | Recalcular só quando inputs-gatilho mudam; campos de preço permanecem editáveis |

## Referências

- `cycles/Q22026/0526-fix-admin-publish-calculator/request.md`
- `cycles/Q22026/0524-platform-skins-store-backend/`
- `cycles/Q12026/0006-painel-admin-ruby-safira/plan.md` (calculadora dual mode)
