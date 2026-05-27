## Context

Correções operacionais no painel admin (`/admin`) após cycles de backend e financeiro (`0524`, `0526-fix-admin-publish-calculator`, `0526-featured-finance-raffles-fixes`).

Sintomas reportados:
- **Cadastro de skins:** bloco "Estoque e precificação" com fluxo confuso ou incoerente (calculadora ↔ campos de preço).
- **Edição de skins:** Preço loja e Preço sugerido exibem valores antigos ao abrir a ficha (ex.: R$ 156 / R$ 132 em vez de R$ 99 / R$ 100 persistidos).
- **Upload de imagens:** inoperante em **Cadastrar skin** e **Editar skin** (deveria persistir `image_url` via Vercel Blob).
- **Compras e vendas:** seção/campo não opera; candidato a remoção.
- **Financeiro:** lista truncada sem scroll; exibição em dois cards separados (Custo / Venda) por skin — desejado um card unificado por skin com custo (vermelho), venda (verde) e data da última alteração.

Restrição operacional: **sem ambiente de dev local** — validar via build + preview Vercel → produção.

Specs e referências:
- `spec/features/painel-admin-ruby-safira/readme.md` — ficha técnica, calculadora simples, upload Blob, `financial_entries`, `/loja`
- `cycles/Q22026/0524-platform-skins-store-backend/`
- `cycles/Q22026/0526-fix-admin-publish-calculator/`
- `cycles/Q22026/0526-featured-finance-raffles-fixes/`

---

## Intent

Permitir operação confiável do estoque admin: cadastro e edição de skins com preços e imagens corretos, fluxo de precificação previsível, e histórico financeiro legível e completo.

---

## Scope

### 1. Cadastro de skins — Estoque e precificação

Revisar o bloco "Estoque e precificação" no fluxo **Cadastrar skin**: ordem dos campos, sincronização calculadora → `list_price` / `suggested_price`, feedback visual e comportamento ao salvar. Objetivo: fluxo previsível, sem valores "fantasma" ou campos desconectados.

### 2. Edição de skins — Preços desatualizados

Ao abrir uma skin para editar, os campos **Preço loja** e **Preço sugerido** devem refletir os valores persistidos (ex.: R$ 99,00 e R$ 100,00), não valores antigos (ex.: R$ 156,00 e R$ 132,00).

### 3. Upload de imagens

Restaurar upload funcional em **Cadastrar skin** e **Editar skin** (Vercel Blob, admin autenticado), com preview e persistência de `image_url` conforme spec.

### 4. Campo "Compras e vendas"

Remover ou ocultar a seção/campo que não opera. Não manter UI morta no painel.

### 5. Seção financeira — layout e scroll

- A lista de movimentações não deve ser cortada sem scroll; a seção deve rolar internamente.
- Exibir **um card por skin** com:
  - Nome da skin (ex.: AK-47 Slate)
  - **Custo** em vermelho (ex.: R$ 100,00)
  - **Venda** em verde (ex.: R$ 156,00), quando existir
  - **Data:** da última alteração relevante (cadastro = data do custo; após venda = data da venda)

---

## Constraints

- Manter contratos da spec `painel-admin-ruby-safira`: calculadora simples na ficha de skin, `list_price` / `suggested_price`, upload via Blob (admin only), BRL.
- Não expor custo/lucro interno na loja pública ou para `customer`.
- Preferir componentes e padrões já usados em `AdminPanel` / ficha técnica.
- **Sem migration** salvo necessidade comprovada (escopo atual parece UI + bugs de formulário/upload).
- **Deploy direto em produção** — sem subir ambiente de dev local.

---

## Out of scope

- Redesign completo do painel admin ou Ruby/Safira visual.
- Calculadora de **rifa** (fluxo "Cadastrar rifa") — salvo regressão causada pelas correções.
- Checkout, pagamento, rifas públicas além do que já existe.
- **Sugestão extra (ideia):** datas de compra/venda em linhas separadas ou modal "click for details" no card financeiro.
- Reimplementar "Compras e vendas" como feature nova (só remoção/desativação neste cycle).
- Busca, filtros ou paginação na seção financeira.

---

## Open questions

1. **"Compras e vendas":** remover de vez da UI ou só ocultar até implementação futura?
2. **Estoque e precificação "estranho":** há passo a passo reproduzível concreto? (Aguardar detalhe do humano se necessário no refine.)
3. **Data no card financeiro:** usar **só** "última alteração" (cadastro ou venda) ou incluir datas em cada linha (custo/venda) neste cycle?

---

## Success criteria

- Edição exibe preços salvos (ex.: R$ 99 / R$ 100), não valores obsoletos.
- Upload funciona em cadastro e edição; imagem persiste e reflete na ficha/loja.
- Cadastro estoque/precificação: fluxo coerente calculadora → campos → save.
- "Compras e vendas" ausente ou removido.
- Financeiro: scroll na lista + card unificado por skin (custo vermelho, venda verde, data última alteração).
- Vitrines públicas não exibem custo, margem interna nem observações.
