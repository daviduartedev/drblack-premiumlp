# Tarefas - 0006 Painel admin, cliente e Ruby/Safira

> Este ciclo esta refinado para implementacao posterior. Antes de implementar codigo Next.js, ler os guias relevantes em `node_modules/next/dist/docs/`, conforme `AGENTS.md`.

## 0. Pre-requisitos

- [x] Ler `cycles/Q12026/0006-painel-admin-ruby-safira/request.md`.
- [x] Ler `cycles/Q12026/0006-painel-admin-ruby-safira/plan.md`.
- [x] Ler `cycles/Q12026/0006-painel-admin-ruby-safira/scenarios.feature`.
- [x] Ler `spec/README.md`.
- [x] Ler `spec/features/rebrand-2026-q1/readme.md` para respeitar o estado publico atual.
- [x] Ler `spec/features/painel-admin-ruby-safira/readme.md`.
- [x] Inspecionar a estrutura atual de `app/`, `components/`, `lib/`, `public/` e dependencias antes de editar.

## 1. Atualizar `spec/` (obrigatorio)

- [x] Manter `spec/features/painel-admin-ruby-safira/readme.md` sincronizado com a implementacao real.
- [x] Atualizar `spec/README.md` se o nome da rota, feature ou contrato mudar.
- [x] Se a implementacao divergir do plano, atualizar primeiro `plan.md` e depois refletir no spec canonico.

## 2. Guias Next.js

- [x] Antes de alterar rotas, layouts, metadata, imagens ou server/client boundaries, ler os guias relevantes em `node_modules/next/dist/docs/`.
- [x] Registrar em notas de implementacao quais guias foram consultados.
- [x] Seguir padroes da versao instalada de Next.js, nao conhecimento generico.

## 3. Dados locais e contratos

- [x] Criar modelos tipados para roles, status, skins, rifas, bilhetes, compras, vendas e financeiro.
- [x] Criar seed local com:
  - [x] um usuario `customer` de teste;
  - [x] um usuario `admin` de teste;
  - [x] skins em diferentes status;
  - [x] rifas com status `ativa`, `encerrada`, `ganha`, `perdida`, `aguardando_sorteio`;
  - [x] compras, bilhetes, premios e historico de vendas do cliente;
  - [x] entradas financeiras vinculadas a skin/rifa.
- [x] Criar camada de repositorio/service para permitir troca futura por Supabase.
- [x] Evitar segredos reais, tokens ou credenciais de producao no repo.
- [x] Nao usar localStorage como fronteira de seguranca.

## 4. Identidade publica Ruby/Safira

- [x] Adicionar novas secoes ou efeitos Ruby/Safira na area publica sem reestruturar secoes existentes.
- [x] Usar `public/new-logo.png` no header conforme a feature permitir.
- [x] Gerar/aplicar derivados nitidos para favicon/apple-touch-icon quando a implementacao de metadata for feita.
- [x] Preservar legibilidade, responsividade e contraste.
- [x] Evitar visual de cassino, excesso de gradiente ou ruido decorativo.

## 5. Dashboard cliente (`/dashboard`)

- [x] Criar rota/layout do cliente.
- [x] Criar guard preparatorio por role `customer`.
- [x] Mostrar resumo: total gasto, rifas ativas, bilhetes ativos, premios ganhos, ultimas atividades.
- [x] Mostrar compras e historico de compras.
- [x] Mostrar rifas participadas com status oficial.
- [x] Mostrar bilhetes/numeros comprados.
- [x] Mostrar ganhos/premios.
- [x] Mostrar historico de vendas/revenda/indicacao.
- [x] Garantir que o cliente so ve dados proprios.

## 6. Painel admin (`/admin`)

- [x] Criar rota/layout administrativo separado.
- [x] Criar guard preparatorio por role `admin`.
- [x] Criar visao geral com receita, custo, taxas, lucro esperado e lucro realizado.
- [x] Criar estoque de skins com status integrado.
- [x] Permitir criar, editar e arquivar skins no modo local/mockado.
- [x] Permitir preparar rifa a partir de skin elegivel.
- [x] Mostrar historico financeiro por skin/rifa.
- [x] Mostrar compras e vendas em visao administrativa.
- [x] Cliente acessando `/admin` deve receber acesso negado/403 sem dados sensiveis.

## 7. Ficha tecnica

- [x] Implementar ficha tecnica administrativa com campos canonicos do spec.
- [x] Separar campos publicos de campos internos.
- [x] Garantir que custo, lucro e observacoes internas nao aparecem em UI de cliente.
- [x] Integrar status da ficha com estoque e rifa.

## 8. Calculadora de lucro

- [x] Implementar calculos em funcao pura e testavel.
- [x] Suportar lucro alvo por percentual ou valor fixo, com escolha explicita de modo.
- [x] Aceitar quantidade de bilhetes ou preco desejado por bilhete.
- [x] Calcular receita alvo, receita liquida, lucro esperado, margem, preco sugerido, quantidade sugerida e ponto minimo sem prejuizo.
- [x] Considerar taxas estimadas no resultado financeiro do ciclo.
- [x] Formatar moeda em BRL.

## 9. Supabase/Vercel preparado

- [x] Documentar mapeamento futuro de tabelas Supabase: profiles, skins, raffles, tickets, purchases, sales_history, financial_entries.
- [x] Preparar pontos de substituicao do seed local por chamadas Supabase.
- [x] Documentar RLS esperada:
  - [x] customer le somente dados proprios;
  - [x] admin le/escreve estoque, skins, rifas e financeiro;
  - [x] dados internos nunca sao retornados para cliente.
- [x] Evitar dependencia de ambiente Vercel para validar visual local.

## 10. UX, acessibilidade e responsividade

- [x] Admin deve priorizar tabelas densas, filtros e metricas operacionais.
- [x] Cliente deve priorizar resumo claro, listas escaneaveis e historico.
- [x] Garantir foco visivel em links, botoes, abas, formularios e tabelas interativas.
- [x] Garantir estados vazios, loading e erro para listas principais.
- [ ] Testar desktop e mobile para area publica, `/dashboard` e `/admin`. Nao executado por pedido do usuario: "sem testes qa ou semelhante".

## 11. Testes e validacao

- [ ] Testar funcoes da calculadora com cenarios de percentual, valor fixo, quantidade fixa e preco fixo. Nao executado por pedido do usuario: sem testes/QA.
- [ ] Testar guards de role no modo local. Nao executado por pedido do usuario: sem testes/QA.
- [ ] Testar que cliente nao ve dados financeiros/admin. Nao executado por pedido do usuario: sem testes/QA.
- [x] Rodar lint/typecheck conforme scripts existentes.
- [x] Rodar build production.
- [ ] Fazer QA visual via browser local em desktop e mobile. Nao executado por pedido do usuario: "sem testes qa ou semelhante".
- [x] Registrar pendencias de compliance juridico antes de qualquer rollout real.

## 12. Fora de escopo da implementacao posterior

- [x] Nao implementar gateway de pagamento neste ciclo.
- [x] Nao implementar recibos, notas ou exportacao financeira.
- [x] Nao integrar API externa de preco de skin.
- [x] Nao afirmar conformidade juridica de rifas/sorteios sem validacao humana.
- [x] Nao substituir a feature canonica `rebrand-2026-q1`.

## Notas de implementacao

- Guias Next.js consultados em `node_modules/next/dist/docs/`: layouts/pages, server/client components, images, metadata/icons, authentication, data security, forms e CSS.
- Rotas criadas: `/dashboard` (cliente) e `/admin` (admin).
- Login local seedado em `/login` com cookie HTTP-only assinado. O mock local nao e fronteira de seguranca de producao.
- Credenciais locais:
  - cliente: `cliente@drblack.local` / `cliente123`;
  - admin: `admin@drblack.local` / `admin123`.
- Arquivos principais criados: `lib/ruby-safira-types.ts`, `lib/test-credentials.ts`, `lib/ruby-safira-seed.ts`, `lib/ruby-safira-repository.ts`, `lib/server-session.ts`, `lib/profit-calculator.ts`, `app/login/actions.ts`, `app/dashboard/page.tsx`, `app/admin/page.tsx`, `components/AdminPanel.tsx`, `components/RubySapphirePublicSection.tsx`.
- Logo aplicada em header desktop/mobile e footer usando `public/new-logo.png`.
- Derivados gerados: `public/new-logo-upscaled.png`, `public/favicon.png`, `public/apple-touch-icon.png`.
- Validacao tecnica executada:
  - `cmd /c npm run lint` - passou com 2 warnings pre-existentes em `components/ScrollFilmFrames.tsx` por uso de `<img>`.
  - `cmd /c npm exec tsc -- --noEmit` - passou sem erros.
  - `cmd /c npm run build` - passou sem warnings finais.
- QA visual/browser, teste manual de rotas e testes funcionais detalhados nao foram executados por pedido direto do usuario.
