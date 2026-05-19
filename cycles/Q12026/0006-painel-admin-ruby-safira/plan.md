# Plano (delta) - Painel admin, cliente e efeitos Ruby/Safira (Q1 2026)

## Baseline canonico anterior

- `spec/features/rebrand-2026-q1/` continua como fonte de verdade da home publica atual: paleta laranja/creme/preto, hero, galeria pinada, narrativa, carrossel, footer, cookie banner e padronizacao pos-rebrand.
- O pedido deste ciclo nao substitui a paleta existente nem reescreve secoes publicas ja aprovadas.
- Este ciclo cria uma nova feature canonica: `spec/features/painel-admin-ruby-safira/`.

## Decisoes refinadas

1. **Escopo original** - refinamento/spec-driven. Implementacao foi executada depois por solicitacao direta do usuario em `2026-05-19`.
2. **Ruby/Safira na area publica** - adicionar novas secoes/efeitos com estetica ruby/safira na area publica, sem alterar a estrutura nem o comportamento das secoes publicas existentes.
3. **Rotas recomendadas** - cliente em `/dashboard`; admin em `/admin`.
4. **Papeis** - dois papeis: `customer` e `admin`. O admin representa o unico usuario operacional/super admin deste ciclo.
5. **Dados iniciais** - usar seed local tipado para validacao visual, com usuario cliente e usuario admin de teste. A estrutura deve preparar migracao limpa para Supabase/Vercel.
6. **Autenticacao** - MVP pode usar sessao mockada/local para validacao visual, mas com limites explicitos: nao tratar mock como seguranca real. A arquitetura deve prever Supabase Auth e RLS.
7. **Permissoes** - cliente ve somente seus dados; admin ve estoque, skins, rifas, financeiro e ficha tecnica.
8. **CRUD admin** - admin deve poder criar, editar e arquivar skins/rifas no fluxo local/mockado do MVP visual.
9. **Estoque integrado** - status de skin deve refletir em estoque, ficha tecnica, rifa e resumo financeiro no mesmo modelo de dados local.
10. **Financeiro do ciclo** - incluir custo da skin, valor de mercado, receita bruta, taxas estimadas, receita liquida, lucro esperado, lucro realizado e margem. Chargebacks, notas, recibos e custos operacionais avancados ficam fora.
11. **Cliente** - dashboard mostra compras, rifas participadas, bilhetes, premios, historico de compras, historico de vendas/revenda/indicacao e status oficiais.
12. **Status oficiais de rifa** - `ativa`, `encerrada`, `ganha`, `perdida`, `aguardando_sorteio`.
13. **Ficha tecnica** - fonte administrativa para decidir se uma skin esta pronta para virar rifa.
14. **Calculadora** - aceitar lucro alvo por percentual ou valor fixo. Se ambos forem preenchidos, a UI deve exigir escolha explicita de modo para evitar ambiguidade.
15. **Preco por bilhete** - valores em BRL, com arredondamento padrao a centavos; sugestoes podem mostrar combinacoes amigaveis em reais inteiros quando fizer sentido.
16. **Compliance** - registrar aviso de pendencia juridica para rifas/sorteios antes de operacao real. Nao simular conformidade legal no MVP.

## Delta de produto

### 1. Feature publica Ruby/Safira

Adicionar novas secoes ou blocos publicos que comuniquem raridade, lamina polida e luz controlada em Ruby/Safira:

- ruby: vermelho profundo, brilho quente, highlights metalicos;
- safira: azul/violeta intenso, reflexos frios, neon controlado;
- base escura elegante;
- gradientes discretos, bordas luminosas e estados hover/focus consistentes;
- sem visual de cassino, sem ruido cromatico e sem decoracao desconectada de skins/laminas/mercado CS2.

Essas secoes nao devem substituir nem quebrar hero, galeria, narrativa, carrossel, footer ou cookie banner atuais.

### 2. Dashboard do cliente (`/dashboard`)

O cliente autenticado deve experimentar uma area propria com:

- resumo no topo: total gasto, rifas ativas, bilhetes ativos, premios ganhos e ultimas atividades;
- compras e historico de compras;
- rifas participadas;
- bilhetes/numeros comprados;
- ganhos/premios;
- historico de vendas/revenda/indicacao, mesmo que inicialmente mockado;
- status de cada rifa usando apenas os status oficiais.

Cliente nao acessa `/admin`. Quando uma sessao de cliente tenta abrir admin, a experiencia recomendada e tela 403/acesso negado com link de retorno ao dashboard.

### 3. Admin operacional (`/admin`)

O admin deve ter uma area separada e densa, voltada a operacao:

- visao geral financeira;
- organizacao de estoque de skins;
- cadastro e edicao de skins;
- controle de skins em estoque, em rifa, vendidas, entregues e arquivadas;
- criacao/edicao de rifas a partir de skins elegiveis;
- historico financeiro por skin/rifa;
- controle basico de compras e vendas;
- receita, custo, taxas estimadas, lucro esperado e lucro realizado.

### 4. Ficha tecnica de skins

Campos canonicos:

- nome da skin;
- tipo/arma;
- acabamento/padrao;
- float, quando aplicavel;
- raridade;
- imagem;
- valor pago;
- valor de mercado estimado;
- valor desejado de lucro;
- percentual desejado de lucro;
- quantidade de bilhetes;
- preco por bilhete;
- status;
- observacoes internas.

A ficha tecnica e administrativa. Parte dos dados pode alimentar a rifa publica no futuro, mas observacoes internas e custos nunca devem aparecer para cliente.

### 5. Calculadora de lucro para rifas

O admin informa:

- valor pago pela skin;
- modo de lucro: percentual ou valor fixo;
- quantidade desejada de bilhetes ou preco desejado por bilhete;
- taxas estimadas.

O sistema calcula:

- receita total necessaria;
- lucro esperado;
- preco sugerido por bilhete;
- quantidade sugerida de bilhetes;
- margem percentual;
- ponto minimo para nao ter prejuizo;
- receita liquida apos taxas estimadas.

Exemplo canonico: custo de R$ 1.000 e lucro alvo de 30% gera receita alvo de R$ 1.300 antes de taxas; sugestoes podem incluir 130 bilhetes a R$ 10 ou 260 bilhetes a R$ 5, ajustadas quando taxas forem consideradas.

## Contratos de integracao preparados

### Modelo local inicial

Criar dados seedados locais para:

- `users`: admin e cliente de teste;
- `profiles`: id, role, nome publico;
- `skins`: ficha tecnica, status e custos;
- `raffles`: skin vinculada, status, quantidade/preco de bilhetes;
- `tickets`: numeros por cliente e rifa;
- `purchases`: historico de compras;
- `salesHistory`: historico de venda/revenda/indicacao;
- `financialEntries`: receitas, custos, taxas e lucro por skin/rifa.

### Supabase futuro

Preparar repository/service layer para trocar seed local por Supabase sem reescrever UI:

- tabelas equivalentes aos modelos acima;
- `profiles.role` controlado no banco;
- Row Level Security:
  - customer so le seus tickets, purchases, premios e historico proprio;
  - admin pode ler/escrever estoque, skins, rifas e financeiro;
  - custos, lucro e observacoes internas nunca sao expostos por policies de cliente.

## Requisitos de qualidade

- Ler `node_modules/next/dist/docs/` antes de qualquer implementacao em Next.js, conforme `AGENTS.md`.
- Manter tipagem forte para modelos e calculos financeiros.
- Evitar strings magicas para roles/status.
- Separar dados seedados, contratos de dominio, componentes e calculos.
- Nao guardar segredos reais no repo.
- Nao usar localStorage como fronteira de seguranca.
- Garantir responsividade em dashboard cliente e admin.
- Usar UI densa e operacional para admin; UI resumida e clara para cliente.
- Usar textos curtos, pt-BR, premium/gamer.

## Fora de escopo

- Substituir a paleta canonica existente do rebrand `rebrand-2026-q1`.
- Alterar secoes publicas existentes alem de adicionar novas secoes/efeitos.
- Recibos, notas fiscais, exportacao financeira e comprovantes.
- Integracao real com Supabase, gateway de pagamento ou API externa de preco de skin.
- Compliance juridico completo de rifas/sorteios.
- Checkout, Pix ou liquidacao de premios.
