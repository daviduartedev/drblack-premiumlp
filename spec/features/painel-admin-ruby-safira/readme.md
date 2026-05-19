# Feature: Painel admin, cliente e Ruby/Safira

**Ciclo de origem:** `cycles/Q12026/0006-painel-admin-ruby-safira/`

## Objetivo

Preparar a plataforma para operacao real de rifas de skins com:

- novas secoes/efeitos Ruby/Safira na area publica, sem substituir a identidade publica ja aprovada;
- dashboard autenticado de cliente;
- painel admin operacional;
- ficha tecnica de skins;
- calculadora de lucro e precificacao;
- contratos locais preparados para Supabase/Vercel.

## Escopo visual Ruby/Safira

A estetica Ruby/Safira e uma camada nova, nao uma substituicao da paleta canonica `rebrand-2026-q1`.

Uso esperado:

- novas secoes publicas;
- efeitos de destaque;
- paineis cliente/admin;
- cards, metricas, bordas luminosas, estados hover/focus e elementos financeiros.

Direcao:

- ruby: vermelho profundo, brilho quente e highlights metalicos;
- safira: azul/violeta intenso, reflexos frios e neon controlado;
- base escura elegante;
- gradientes discretos;
- brilho com intencao de lamina/skin rara.

Evitar:

- aparencia generica de cassino;
- excesso de cor;
- gradientes que prejudiquem leitura;
- decoracao sem relacao com skins, laminas ou mercado CS2.

## Rotas canonicas

- Rifas publicas: `/rifas`.
- Cliente: `/dashboard`.
- Admin: `/admin`.

## Papeis e acesso

Papeis canonicos:

- `customer` - cliente comum;
- `admin` - unico usuario operacional/super admin deste ciclo.

Regras:

- cliente ve somente seus dados;
- cliente nao acessa `/admin`;
- admin acessa estoque, financeiro, skins, fichas tecnicas, rifas e calculadora;
- dados internos de custo, lucro e observacoes nunca aparecem para cliente.

Enquanto a autenticacao real nao existir, o mock/local seed deve ser tratado como validacao visual e funcional local, nao como fronteira de seguranca real.

## Dashboard do cliente

Resumo no topo:

- total gasto;
- rifas ativas;
- bilhetes ativos;
- premios ganhos;
- ultimas atividades.

Listas/areas:

- compras;
- rifas participadas;
- bilhetes/numeros comprados;
- ganhos/premios;
- historico de compras;
- historico de vendas/revenda/indicacao.

Status oficiais de rifa para cliente:

- `ativa`;
- `encerrada`;
- `ganha`;
- `perdida`;
- `aguardando_sorteio`.

## Painel admin

O admin deve ter uma interface densa, operacional e escaneavel para:

- organizacao de estoque de skins;
- cadastro e edicao de skins;
- controle de skins que serao rifadas;
- controle de status: em estoque, em rifa, vendida, entregue, arquivada;
- historico financeiro por skin/rifa;
- controle basico de compras e vendas;
- visao geral de receita, custo, taxas estimadas, lucro esperado e lucro realizado.

## Ficha tecnica de skins

Campos canonicos:

- nome da skin;
- tipo/arma;
- acabamento/padrao;
- float, se aplicavel;
- raridade;
- imagem;
- valor pago pela skin;
- valor de mercado estimado;
- valor desejado de lucro;
- percentual de lucro desejado;
- quantidade de bilhetes;
- preco por bilhete;
- status;
- observacoes internas.

A ficha tecnica e a fonte administrativa para decidir se uma skin esta pronta para virar rifa.

## Calculadora de lucro

Entrada:

- skin escolhida;
- valor pago pela skin;
- percentual de lucro desejado;
- quantidade desejada de bilhetes.

Saida:

- valor total pelo qual a skin deve ser vendida;
- lucro esperado em BRL;
- preco sugerido por bilhete;
- pacotes sugeridos de quantidade de bilhetes e preco por bilhete;
- margem percentual;
- ponto minimo para nao ter prejuizo.

Formula principal do ciclo: `valor pago + percentual de lucro desejado = valor alvo de venda`. A partir do valor alvo, o admin ve sugestoes como `130 bilhetes a R$ 10` ou `260 bilhetes a R$ 5`.

## Area publica de rifas

Enquanto checkout/pagamento nao existem, `/rifas` e a vitrine publica das rifas. A pagina usa a mesma base visual do site, mostra cards de rifas em movimento e direciona reserva/pagamento/suporte para WhatsApp.

CTA canonico temporario: `Chamar no WhatsApp` / `Reservar bilhete`.

## Dados locais e Supabase futuro

O MVP visual usa seed local tipado com:

- `users`;
- `profiles`;
- `skins`;
- `raffles`;
- `tickets`;
- `purchases`;
- `salesHistory`;
- `financialEntries`.

A implementacao deve isolar acesso a dados em uma camada de repositorio/service para troca futura por Supabase.

Supabase futuro:

- `profiles.role` controla acesso;
- Row Level Security obrigatoria;
- customer so acessa dados proprios;
- admin acessa dados operacionais;
- custos, lucro, taxas e observacoes internas nao sao expostos ao papel customer.

## Implementacao local (ciclo 0006)

Arquivos principais:

- `lib/ruby-safira-types.ts` - contratos tipados de roles, status, skins, rifas, tickets, compras, vendas e financeiro.
- `lib/test-credentials.ts` - credenciais seedadas exibidas no login local.
- `lib/ruby-safira-seed.ts` - seed server-only com dados operacionais.
- `lib/ruby-safira-repository.ts` - DAL server-only que retorna DTOs filtrados para cliente/admin.
- `lib/server-session.ts` - cookie HTTP-only assinado para sessao local de validacao visual.
- `lib/profit-calculator.ts` - calculadora pura de margem, lucro e precificacao.
- `app/login/actions.ts` - Server Actions de login/logout.
- `app/dashboard/page.tsx` - dashboard do cliente com DTO sem dados internos.
- `app/admin/page.tsx` e `components/AdminPanel.tsx` - painel admin com estoque, ficha tecnica, CRUD local visual e calculadora.
- `app/rifas/page.tsx` - area publica de rifas com cards em movimento e CTA WhatsApp.
- `components/RubySapphirePublicSection.tsx` - nova secao publica Ruby/Safira.

Credenciais locais:

- Cliente: `cliente@drblack.local` / `cliente123`.
- Admin: `admin@drblack.local` / `admin123`.

Essas credenciais sao somente seed local para validacao visual e nao devem ser usadas em producao.

## Logo e icones

- Header desktop/mobile usa `public/new-logo.png`.
- Derivados gerados no ciclo: `public/new-logo-upscaled.png`, `public/favicon.png`, `public/apple-touch-icon.png`.
- `app/layout.tsx` aponta `metadata.icons` para os derivados PNG.

## Compliance

Antes de operacao real, rifas/sorteios exigem validacao juridica humana. O produto nao deve comunicar conformidade legal enquanto essa validacao nao existir.

## Qualidade

- Ler os guias relevantes em `node_modules/next/dist/docs/` antes de implementacao Next.js.
- Manter tipagem forte para modelos e calculos.
- Usar BRL para valores monetarios.
- Evitar segredos reais no repo.
- Evitar localStorage como seguranca.
- Criar UI responsiva.
- Manter copy pt-BR curta, premium/gamer e direta.
