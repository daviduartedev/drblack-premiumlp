# Feature: Painel admin, cliente e Ruby/Safira

**Ciclos de origem:** `cycles/Q12026/0006-painel-admin-ruby-safira/` · evolução Q2: `cycles/Q22026/0524-platform-skins-store-backend/` · correção operacional: `cycles/Q22026/0526-fix-admin-publish-calculator/`

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

- Loja (skins em estoque): `/loja`.
- Rifas publicas: `/rifas`.
- Cliente: `/dashboard`.
- Admin: `/admin`.
- Login: `/login` (Supabase Auth).

## Papeis e acesso

Papeis canonicos:

- `customer` - cliente comum;
- `admin` - unico usuario operacional/super admin deste ciclo.

Regras:

- cliente ve somente seus dados;
- cliente nao acessa `/admin`;
- admin acessa estoque, financeiro, skins, fichas tecnicas, rifas e calculadora;
- dados internos de custo, lucro e observacoes nunca aparecem para cliente.

Autenticacao de producao via **Supabase Auth** (ciclo 0524). Sessao mock/cookie local foi substituida; credenciais de teste nao aparecem na UI de login.

Regras do servidor (ciclo 0525):

- Usar somente `supabase.auth.getUser()` no servidor para validar sessao; nunca `getSession()` em RSC ou Route Handlers.
- Cookies de sessao devem incluir explicitamente `httpOnly: true`, `secure: true` (producao), `sameSite: 'lax'`, `path: '/'`.
- Primeiro login de usuario Auth sem linha em `profiles` → profile criado automaticamente com `role = 'customer'`; promocao a `admin` somente via SQL manual.
- Falha de persistencia de cookie → retornar erro distinto (`session_not_persisted`) para a UI; nunca loop silencioso para `/login`.

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

### UX admin (ciclo 0524)

- Ao abrir `/admin`, **nenhum** formulário de cadastro fica aberto.
- Dois CTAs explicitos:
  - **Cadastrar skin** — abre ficha tecnica com **calculadora simples (loja)**; fechar/cancelar descarta rascunho.
  - **Cadastrar rifa** — fluxo separado com **calculadora completa (rifa)** — bilhetes, pacotes e valor alvo.
- Em mobile, ficha e rifa usam drawer/modal full-screen; estoque em cards empilhados.
- **Salvar skin** persiste em `skins` e revalida `/loja` quando elegivel.
- **Salvar rifa** persiste em `raffles` (`status = 'ativa'`), atualiza skin para `em_rifa` e revalida `/rifas`; nao usar apenas `saveSkinAction`.
- Mensagem clara em sucesso/erro; drawer fecha apos sucesso, permanece aberto em erro.

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

## Calculadora de lucro (ficha tecnica assistida)

A calculadora e parte da **ficha tecnica operacional**: o admin informa custo e lucro; o sistema calcula e **preenche campos editaveis** antes do salvamento. Implementacao em `lib/profit-calculator.ts`.

### Modo de lucro

- **Percentual** ou **valor fixo (BRL)**.
- Se ambos estiverem preenchidos na UI, o admin deve **escolher explicitamente** qual modo esta ativo (evita ambiguidade).

Formula principal: `valor pago + lucro desejado = valor alvo de venda` (lucro conforme modo). Taxa estimada: **0%** neste ciclo (motor aceita fee futura; sem UI obrigatoria).

### Calculadora simples — ficha de skin (loja)

Usada em **Cadastrar skin** / ficha tecnica. **Sem bilhetes.**

Entrada:

- valor pago pela skin;
- modo e valor/percentual de lucro desejado.

Saida / sincronizacao:

- valor alvo de venda;
- `list_price` preenchido a partir do alvo (editavel);
- `suggested_price` opcional quando fizer sentido para o card publico.

### Calculadora completa — cadastro de rifa

Usada em **Cadastrar rifa**.

Entrada adicional:

- skin escolhida;
- quantidade de bilhetes e/ou preco por bilhete (constraint);
- pacotes sugeridos clicaveis.

Saida:

- valor alvo de venda;
- lucro esperado em BRL;
- preco e quantidade sugeridos por bilhete;
- pacotes (ex. `130 bilhetes a R$ 10`, `260 bilhetes a R$ 5`);
- margem percentual;
- ponto minimo para nao ter prejuizo.

Ao selecionar um pacote, atualizar **`ticket_count` e `ticket_price`** no formulario.

### Salvar rifa (contrato)

1. Criar linha em `raffles` com `status = 'ativa'`, `title` (padrao: nome da skin, editavel), `draw_date` obrigatorio, `ticket_count`, `ticket_price`.
2. Atualizar skin vinculada para `status = 'em_rifa'` e persistir campos financeiros da ficha.
3. Skin `em_rifa` **nao** aparece em `/loja`; rifa ativa aparece em `/rifas`.

## Loja publica (`/loja`)

Vitrine de **skins a venda** (status `em_estoque`). Skins `em_rifa` aparecem apenas em `/rifas`, nao na loja.

### Elegibilidade na vitrine (ciclo 0526)

Uma skin e listada publicamente somente quando:

| Regra | Criterio |
|-------|----------|
| Status | `em_estoque` |
| Nome | preenchido |
| Preco | `list_price > 0` |
| Imagem | `image_url` nao vazio (Vercel Blob ou URL valida) |

Caso contrario: permanece no admin (rascunho/estoque incompleto), **fora** de `public_store_skins` e de `/loja`.

### Card publico (referencia de produto)

Campos exibidos (nunca dados internos):

| Elemento | Fonte / nota |
|----------|----------------|
| Categoria | `weapon` (ex. Rifle) |
| Disponibilidade | Label fixa **Disponível** para `em_estoque` |
| Nome | `name` (ex. `AWP \| Linhas Vermelhas`) |
| Badges | `is_stat_trak` → StatTrak™; `wear_label` → FT, MW, etc. |
| Imagem | `image_url` (Vercel Blob) |
| Stickers | `stickers` jsonb opcional (icones em fila) |
| Preco | `list_price` (BRL) |
| Preco sugerido | `suggested_price` opcional (BRL) |
| Float | `float` + barra visual de desgaste |
| CTA primario | **Quero esta skin** → WhatsApp com nome da skin na mensagem |

Fora do card: custo pago, lucro desejado, bilhetes, observacoes internas.

Comportamento da pagina:

- Grid responsivo (1 col mobile, multi-col desktop), hover/transicoes estilo Framer.
- Sem busca, filtros ou paginacao neste ciclo.
- Estado vazio: *Nenhuma skin disponível no momento. Volte em breve ou chama no WhatsApp.* + CTA WhatsApp.
- Nav **Catálogo** na LP aponta para `/loja`; carrossel `#skins-destaque` permanece na home.

## Area publica de rifas

Enquanto checkout/pagamento nao existem, `/rifas` e a vitrine publica das **rifas**. A pagina usa a mesma base visual do site, mostra cards de rifas em movimento e direciona reserva/pagamento/suporte para WhatsApp.

CTA canonico temporario: `Chamar no WhatsApp` / `Reservar bilhete`.

No **hero** da LP, o item de menu “Rifas” permanece marcado **Em breve** (desabilitado), independentemente de `/rifas` estar publicada.

## Dados — Supabase + Vercel Blob (ciclo 0524)

Persistencia em **Supabase** (projeto existente) e imagens em **Vercel Blob** (URLs publicas, prefixo `skins/{id}/`).

### Variaveis de ambiente (documentar em `.env.example`, configurar na Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (somente servidor — upload/admin)
- `BLOB_READ_WRITE_TOKEN`

Redirect URLs do Supabase Auth devem incluir dominio de producao (e preview se usado).

### Tabelas

- `profiles` (`id` = `auth.users.id`, `role`: `customer` | `admin`)
- `skins` (campos publicos + internos; ver abaixo)
- `raffles`, `tickets`, `purchases`, `financial_entries` — suportam dashboard e fluxo de rifa

Campos adicionais em `skins` para loja:

- `wear_label` (texto curto: FT, MW, FN, …)
- `is_stat_trak` (boolean)
- `list_price`, `suggested_price` (numeric, BRL)
- `stickers` (jsonb, opcional)
- `image_url` (text, URL Blob)

View recomendada: `public_store_skins` — projeta apenas colunas publicas onde `status = 'em_estoque'` **e** criterios de elegibilidade da vitrine (`list_price > 0`, `image_url` preenchido). Implementar filtro na view ou equivalente no repository; comportamento canonico e o da tabela de elegibilidade acima.

### RLS

- `profiles.role` controla acesso;
- Row Level Security obrigatoria;
- customer so acessa dados proprios (tickets, purchases, …);
- admin acessa dados operacionais;
- leitura anonima/autenticada da loja apenas via view/colunas publicas;
- custos, lucro, taxas e observacoes internas nunca expostos ao papel customer.

### Repositorio

A UI **nao** importa `@supabase/supabase-js` diretamente nos componentes. Server Actions / `lib/*-repository.ts` centralizam queries e DTOs.

### Seed

Apos migrations em banco vazio, aplicar **seed SQL** (usuarios de dev criados no Supabase Auth + linhas de exemplo). Nao reutilizar o seed TypeScript antigo em producao.

### Upload

Somente admin autenticado envia foto (Route Handler + service role). Stage 2 (pre-Supabase) pode usar URL manual; upload Blob no Stage 3.

### WhatsApp

Numero e base `wa.me` centralizados (ex. `lib/whatsapp.ts`), reutilizados em `/rifas`, `/loja` e footer.

## Implementacao (referencia de codigo)

Arquivos principais (evoluir no ciclo 0524):

- `lib/ruby-safira-types.ts` — contratos tipados (estender com campos de loja).
- `lib/ruby-safira-repository.ts` — DAL server-only; implementacao Supabase substitui seed in-memory.
- `lib/supabase/*` — clientes server/browser e helpers de sessao.
- `lib/whatsapp.ts` — URLs WhatsApp compartilhadas.
- `lib/profit-calculator.ts` — calculadora pura de margem, lucro e precificacao.
- `app/login/` — Supabase Auth (sem exibir credenciais de teste).
- `app/dashboard/page.tsx` — dashboard do cliente com DTO sem dados internos.
- `app/admin/page.tsx` e `components/AdminPanel.tsx` — painel admin, fluxos skin/rifa separados, calculadoras simples/completa.
- `saveSkinAction` / `saveRaffleAction` (Server Actions) — persistencia Supabase; rifa revalida `/rifas` e move skin para `em_rifa`.
- `app/loja/page.tsx` — vitrine publica de skins em estoque.
- `app/rifas/page.tsx` — rifas ativas + CTA WhatsApp.
- `components/RubySapphirePublicSection.tsx` — secao publica Ruby/Safira.

Legado (remover do caminho de producao apos migracao):

- `lib/test-credentials.ts`, `lib/ruby-safira-seed.ts`, `lib/server-session.ts` — substituidos por Supabase Auth + seed SQL.

## Logo e icones

- Header desktop/mobile usa `public/new-logo.png`.
- Derivados gerados no ciclo: `public/new-logo-upscaled.png`, `public/favicon.png`, `public/apple-touch-icon.png`.
- `app/layout.tsx` aponta `metadata.icons` para os derivados PNG.

## Runbook operacional de auth

### Sequência de triagem — loop de redirect para /login

1. **Env vars** — verificar as quatro na Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
2. **Migration** — confirmar tabela `profiles` e trigger `on_auth_user_created` existem no banco de producao.
3. **Profile** — confirmar linha em `public.profiles` para o usuario com `role` correto.
4. **Redirect URLs** — Supabase Dashboard → Authentication → URL Configuration: Site URL e Redirect URLs apontam para o dominio real.
5. **Cookies** — DevTools → Application → Cookies: apos login, `sb-*-auth-token` presentes com `HttpOnly`, `Secure`, `SameSite=Lax`; enviados em requests subsequentes a `/admin`.

### Checks SQL

```sql
-- Usuario existe em Auth
SELECT id, email, created_at FROM auth.users WHERE email = 'usuario@exemplo.com';

-- Profile existe e tem role correto
SELECT id, email, role FROM public.profiles WHERE email = 'usuario@exemplo.com';

-- Bootstrap: criar/promover profile de usuario Auth sem linha em profiles
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = 'usuario@exemplo.com'
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
```

### Env vars Vercel (producao)

| Variavel | Valor esperado |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon/publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (server-only) |
| `NEXT_PUBLIC_SITE_URL` | `https://drblack-premiumlp.vercel.app` |

### Diagrama de rede esperado apos login bem-sucedido

```
POST /auth/token?grant_type=password  → 200  (Supabase direto, browser)
POST /auth/session                    → 200  (Set-Cookie: sb-*-auth-token)
GET  /admin                           → 200  (nao RSC 304 em /login)
```

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
