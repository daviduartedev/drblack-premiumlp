# language: pt

# Cenarios de negocio - Painel admin, cliente e efeitos Ruby/Safira
# Detalhes de implementacao, storage, policies, classes CSS, nomes de arquivos
# e contratos tecnicos vivem no plan.md, tasks.md e spec/features.

Funcionalidade: Experiencia Ruby/Safira e paineis operacionais
  Como plataforma de rifas de skins
  Quero apresentar uma identidade premium e separar areas de cliente e admin
  Para operar compras, estoque, fichas tecnicas e precificacao com clareza

  Cenario: Visitante percebe uma nova camada visual Ruby/Safira sem perder a identidade atual
    Dado que acesso a area publica do site
    Quando encontro as novas secoes ou efeitos Ruby/Safira
    Entao percebo uma estetica de skin rara, lamina polida e luz controlada
    E as secoes publicas ja existentes continuam reconheciveis e sem mudancas bruscas

  Cenario: Logo nova aparece com nitidez nos pontos de marca
    Dado que acesso o site em desktop ou mobile
    Quando olho para o header e para o icone do navegador
    Entao a marca usa a nova logo com boa nitidez
    E o header continua funcionando em telas pequenas

  Cenario: Cliente acompanha sua atividade em um dashboard proprio
    Dado que estou autenticado como cliente
    Quando acesso meu dashboard
    Entao vejo um resumo com total gasto, rifas ativas, bilhetes ativos, premios ganhos e ultimas atividades
    E consigo abrir minhas compras, rifas participadas, bilhetes e premios

  Cenario: Cliente entende o status das rifas que participou
    Dado que estou no dashboard do cliente
    Quando vejo minha lista de rifas
    Entao cada rifa mostra um status claro
    E esse status pertence ao conjunto ativa, encerrada, ganha, perdida ou aguardando sorteio

  Cenario: Cliente ve historico de compras e vendas
    Dado que estou autenticado como cliente
    Quando consulto meu historico
    Entao vejo compras realizadas em ordem compreensivel
    E vejo tambem vendas, revendas ou indicacoes quando existirem para minha conta

  Cenario: Cliente nao acessa area administrativa
    Dado que estou autenticado como cliente
    Quando tento acessar a area admin
    Entao sou impedido de ver informacoes administrativas
    E recebo uma orientacao clara para voltar a minha area

  Cenario: Admin visualiza saude financeira e operacional
    Dado que estou autenticado como admin
    Quando acesso o painel admin
    Entao vejo indicadores de receita, custo, taxas, lucro esperado e lucro realizado
    E consigo identificar skins em estoque, em rifa, vendidas, entregues e arquivadas

  Cenario: Admin cadastra e mantem skins no estoque
    Dado que estou no painel admin
    Quando cadastro ou edito uma skin
    Entao consigo preencher os dados tecnicos e financeiros necessarios
    E a skin fica disponivel no estoque com status atualizado

  Cenario: Admin transforma uma skin elegivel em rifa
    Dado que existe uma skin pronta no estoque
    Quando o admin configura a quantidade de bilhetes, preco e status da rifa
    Entao a skin passa a estar vinculada a uma rifa
    E o painel financeiro reflete a decisao de precificacao

  Cenario: Ficha tecnica orienta a decisao de rifa
    Dado que o admin abre a ficha tecnica de uma skin
    Quando analisa nome, arma, padrao, float, raridade, imagem, custos e observacoes internas
    Entao consegue decidir se a skin esta pronta para virar rifa
    E dados internos sensiveis nao aparecem para clientes

  Cenario: Calculadora mostra preco e margem esperados
    Dado que o admin informa custo da skin, lucro desejado e uma restricao de bilhetes ou preco
    Quando calcula a rifa
    Entao ve receita alvo, lucro esperado, preco sugerido, quantidade sugerida, margem e ponto minimo sem prejuizo
    E entende o impacto de taxas estimadas sobre a receita liquida

  Cenario: Visitante entra na area publica de rifas e segue para WhatsApp
    Dado que acesso a pagina publica de rifas
    Quando vejo as rifas disponiveis em cards em movimento
    Entao entendo o valor do bilhete, quantidade total e progresso de venda
    E consigo iniciar a reserva pelo WhatsApp

  Esquema do Cenario: Experiencia respeita o papel do usuario
    Dado que estou autenticado como "<papel>"
    Quando acesso "<rota>"
    Entao vejo "<resultado>"

    Exemplos:
      | papel    | rota       | resultado                                      |
      | customer | /dashboard | meus dados, compras, bilhetes e premios        |
      | customer | /admin     | acesso negado sem dados administrativos        |
      | admin    | /admin     | estoque, financeiro, fichas e calculadora      |
      | admin    | /dashboard | uma experiencia de cliente quando aplicavel    |

  Cenario: Dados mockados permitem validar visual sem prometer seguranca real
    Dado que o projeto ainda esta usando seed local
    Quando admin e cliente de teste navegam pelos paineis
    Entao os dados aparecem consistentes entre dashboard, estoque, ficha tecnica e calculadora
    E a interface deixa claro onde a integracao real de auth e banco deve entrar

  Cenario: Layout funciona em desktop e mobile
    Dado que uso a plataforma em tamanhos diferentes de tela
    Quando abro area publica, dashboard cliente e painel admin
    Entao consigo ler metricas, listas, tabelas e formularios sem sobreposicao
    E as acoes principais continuam acessiveis por toque ou teclado

  Cenario: Operacao real fica bloqueada por pendencia de compliance
    Dado que a plataforma ainda esta em preparacao operacional
    Quando o admin consulta fluxos de rifa e financeiro
    Entao fica registrado que validacao juridica de rifas/sorteios e obrigatoria antes do uso real
    E o MVP nao comunica conformidade que ainda nao foi confirmada
