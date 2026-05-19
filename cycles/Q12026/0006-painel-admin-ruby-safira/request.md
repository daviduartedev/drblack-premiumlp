## Context

O projeto precisa evoluir em duas frentes conectadas:

- Atualizar a identidade visual para uma estetica premium inspirada em skins Ruby/Safira de CS2.
- Estruturar uma area logada com dashboards para cliente e super admin, incluindo controle financeiro, estoque, ficha tecnica de skins e calculadora de lucro para rifas.

As referencias visuais enviadas mostram laminas com brilho ruby/vermelho profundo e safira/azul-violeta intenso. A nova direcao deve aproveitar essa sensacao de skin rara, metal polido e luz neon controlada, sem transformar o site em uma interface generica de cassino ou em uma tela visualmente poluida.

Este projeto usa uma versao de Next.js com mudancas especificas. Antes de alterar codigo, ler os guias relevantes em `node_modules/next/dist/docs/`, conforme instruido no `AGENTS.md`.

---

## Intent

Transformar o site em uma experiencia mais premium para rifas de skins, mantendo a estrutura atual e preparando o sistema para operacao real:

- Rebrand visual Ruby/Safira.
- Uso da nova logo em header e icones do navegador.
- Dashboard de cliente autenticado.
- Dashboard administrativo/super admin.
- Ficha tecnica de skins.
- Calculadora de margem, lucro e precificacao de bilhetes.
- Separacao clara de permissoes entre cliente e admin.

---

## Visual Direction

Atualizar a paleta visual do site para fugir das cores atuais e adotar uma estetica premium baseada em:

- Ruby: vermelho profundo, brilho quente, highlights metalicos.
- Safira: azul/violeta intenso, reflexos frios, neon controlado.
- Base escura elegante para contraste.
- Gradientes discretos, bordas luminosas, sombras e estados hover coerentes com a identidade.
- Boa legibilidade, contraste e responsividade.

Aplicar a nova linguagem visual em:

- Header.
- Botoes.
- Cards de rifas/skins.
- Badges/status.
- Secoes principais.
- Estados hover/focus.
- Elementos de destaque financeiro ou promocional.

Evitar:

- Visual excessivamente colorido ou ruidoso.
- Aparencia generica de cassino.
- Gradientes dominantes demais que prejudiquem leitura.
- Elementos decorativos sem relacao com skins/laminas/mercado CS2.

---

## Logo e icone do navegador

Usar o arquivo existente `public/new-logo.png` como logo principal no header.

Tambem gerar/aplicar uma versao melhorada/upscaled da logo para evitar baixa resolucao, especialmente em telas retina.

Aplicar a logo tambem como icone do navegador:

- `favicon`.
- `apple-touch-icon`, se o projeto ja suportar.
- `metadata/icons`, conforme o padrao do Next.js usado no projeto.

Critérios:

- A logo deve aparecer nitida no header.
- O favicon deve ser atualizado.
- O header nao pode quebrar em telas pequenas.
- Se necessario, gerar arquivos derivados como `new-logo-upscaled.png`, `favicon.png` ou equivalentes dentro de `public`.

---

## Area logada do cliente

Criar ou preparar uma area de dashboard para o cliente autenticado.

O cliente deve conseguir visualizar:

- Suas compras.
- Suas rifas participadas.
- Seus bilhetes/numeros comprados.
- Seus ganhos/premios.
- Historico de compras.
- Historico de vendas, caso o sistema permita algum fluxo de revenda ou indicacao.
- Status de cada rifa: ativa, encerrada, ganha, perdida, aguardando sorteio etc.

A interface deve ter uma visao resumida no topo:

- Total gasto.
- Rifas ativas.
- Bilhetes ativos.
- Premios ganhos.
- Ultimas atividades.

Usar dados mockados inicialmente se ainda nao houver backend completo, mas estruturar os componentes de forma facil de integrar depois.

---

## Area administrativa / super admin

Criar ou estruturar uma area separada para super admin, protegida por permissao/role.

O super admin deve ter uma visao administrativa e financeira do sistema, incluindo:

- Organizacao de estoque de skins.
- Cadastro de skins disponiveis.
- Controle de skins que serao rifadas.
- Status da skin: em estoque, em rifa, vendida, entregue, arquivada.
- Historico financeiro por skin/rifa.
- Controle de compras e vendas.
- Visao geral de receita, custo, lucro estimado e lucro realizado.

O admin pode estar em uma rota/area separada da area do cliente, desde que a separacao fique clara e protegida por role.

---

## Ficha tecnica de skins

Criar um sistema de ficha tecnica para cada skin.

Campos esperados:

- Nome da skin.
- Tipo/arma.
- Acabamento/padrao.
- Float, se aplicavel.
- Raridade.
- Imagem.
- Valor pago pela skin.
- Valor de mercado estimado.
- Valor desejado de lucro.
- Percentual de lucro desejado.
- Quantidade de bilhetes.
- Preco por bilhete.
- Status.
- Observacoes internas.

Essa ficha deve funcionar como a fonte administrativa para decidir se uma skin esta pronta para virar rifa.

---

## Calculadora de lucro para rifas

Dentro da ficha tecnica/admin, criar uma calculadora administrativa.

O admin informa:

- Quanto pagou na skin.
- Quanto deseja lucrar em percentual ou valor fixo.
- Quantidade desejada de bilhetes, ou preco desejado por bilhete.

O sistema deve calcular:

- Receita total necessaria.
- Lucro esperado.
- Preco sugerido por bilhete.
- Quantidade sugerida de bilhetes.
- Margem percentual.
- Ponto minimo para nao ter prejuizo.

Exemplo:

Se o admin pagou R$ 1.000 em uma skin e quer lucrar 30%, o sistema deve calcular que a receita alvo e R$ 1.300. A partir disso, sugerir combinacoes possiveis, como 130 bilhetes a R$ 10 ou 260 bilhetes a R$ 5.

---

## Permissoes

Separar claramente os tipos de usuario:

- Cliente comum.
- Admin/super admin.

Regras:

- Cliente nao pode acessar rotas administrativas.
- Admin pode acessar painel financeiro, estoque, skins e fichas tecnicas.
- Caso ainda nao exista autenticacao/role real, criar uma estrutura mockada ou preparatoria que deixe explicito onde a verificacao real deve entrar.

---

## Requisitos de qualidade

Antes de implementar:

- Analisar a estrutura atual do projeto.
- Seguir os padroes existentes de rotas, componentes, estilos e dados.
- Ler os guias relevantes em `node_modules/next/dist/docs/`, por causa das instrucoes do `AGENTS.md`.

A implementacao deve:

- Ser responsiva.
- Seguir os padroes visuais existentes onde fizer sentido.
- Nao quebrar rotas atuais.
- Nao remover funcionalidades existentes.
- Usar dados mockados inicialmente se ainda nao houver backend completo.
- Criar componentes reutilizaveis para cards, metricas, tabelas, ficha tecnica e calculadora.
- Manter texto claro e direto, com tom premium/gamer.

---

## Prioridade sugerida

1. Atualizar visual Ruby/Safira.
2. Aplicar logo e favicon.
3. Criar estrutura de rotas/painéis.
4. Criar dashboard do cliente.
5. Criar dashboard admin.
6. Criar ficha tecnica de skins.
7. Criar calculadora de lucro.

---

## Success criteria

- O site passa a comunicar uma identidade Ruby/Safira clara e consistente.
- `public/new-logo.png` e usado no header.
- O navegador passa a usar o novo icone/favicon derivado da logo.
- Existe estrutura de dashboard para cliente.
- Existe estrutura de dashboard para super admin.
- Existe modelo de ficha tecnica de skins.
- Existe calculadora funcional de lucro/precificacao para rifas.
- As areas cliente/admin ficam separadas por role ou por uma camada preparatoria clara.
- O projeto continua compilando sem quebrar rotas existentes.
