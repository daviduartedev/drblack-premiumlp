# language: pt

# Cenários de negócio — Admin: formulário de skin, upload e financeiro (Q2 2026)
# Detalhes: plan.md, tasks.md, spec/features/painel-admin-ruby-safira/

Funcionalidade: Edição de skin com preços persistidos
  Como administrador
  Quero editar uma skin e ver os preços que salvei
  Para não perder precificação manual ou anterior

  Cenario: Abrir skin existente exibe preços salvos no banco
    Dado que estou autenticado como administrador
    E existe uma skin com preço de loja "99" e preço sugerido "100"
    Quando abro a ficha técnica dessa skin para editar
    Então o campo preço de loja exibe "99"
    E o campo preço sugerido exibe "100"
    E não vejo valores recalculados obsoletos de outra sessão

  Cenario: Alterar custo recalcula preços após carga inicial
    Dado que abri uma skin existente para editar
    Quando altero o valor pago pela skin ou o lucro desejado
    Então a calculadora atualiza o valor alvo de venda
    E os campos de preço são sincronizados com o novo cálculo

Funcionalidade: Cadastro de skin com precificação assistida
  Como administrador
  Quero cadastrar uma skin nova com fluxo claro de custo e preço
  Para publicar na loja sem confusão

  Cenario: Cadastro novo sincroniza preços ao informar custo e lucro
    Dado que abri o fluxo de cadastrar skin nova
    Quando informo quanto paguei e o lucro desejado
    Então vejo o preço de lista preenchido pela calculadora
    E posso ajustar manualmente antes de salvar

Funcionalidade: Upload de imagem da skin
  Como administrador
  Quero enviar foto da skin no cadastro e na edição
  Para que ela apareça na loja

  Cenario: Upload após primeiro save de skin nova
    Dado que cadastrei uma skin nova e salvei com sucesso
    E o painel permanece aberto com a skin identificada
    Quando seleciono um arquivo de imagem válido
    Então a imagem é enviada ao storage
    E vejo preview ou URL atualizada na ficha

  Cenario: Upload em skin existente persiste imagem
    Dado que estou editando uma skin já salva
    Quando envio uma nova foto
    Então a URL da imagem é atualizada
    E a skin elegível exibe a nova imagem na loja

  Cenario: Falha de upload exibe erro compreensível
    Dado que tento enviar imagem sem permissão ou com storage indisponível
    Quando confirmo o upload
    Então vejo uma mensagem de erro na interface
    E não fico sem feedback silencioso

Funcionalidade: Painel financeiro agrupado por skin
  Como administrador
  Quero ver custo e venda de cada skin em um único card
  Para escanear o histórico financeiro com clareza

  Cenario: Card unificado exibe custo e venda
    Dado que existe uma skin "AK-47 Slate" com entrada de custo de 100 reais
    E existe entrada de venda de 156 reais para a mesma skin
    Quando visualizo a seção Financeiro no painel admin
    Então vejo um card com o nome "AK-47 Slate"
    E o custo de 100 reais em destaque vermelho
    E a venda de 156 reais em destaque verde
    E a data da última alteração relevante

  Cenario: Skin só com custo exibe venda ausente
    Dado que uma skin em estoque tem apenas entrada de custo
    Quando visualizo o card financeiro dessa skin
    Então vejo o custo em vermelho
    E a venda não preenchida ou indicada como ausente

  Cenario: Lista financeira permite rolar quando há muitas skins
    Dado que existem mais movimentações do que cabem na área visível
    Quando acesso a seção Financeiro
    Então consigo rolar a lista internamente
    E nenhuma movimentação fica permanentemente oculta por corte sem scroll

Funcionalidade: Remoção de Compras e vendas inoperante
  Como administrador
  Quero um painel sem seções que não funcionam
  Para focar no que é operacional

  Cenario: Seção Compras e vendas não aparece no admin
    Dado que estou no painel admin autenticado
    Quando visualizo a área inferior de operação
    Então não vejo a seção "Compras e vendas"
    E continuo vendo Rifas e Financeiro

Funcionalidade: Persistência e vitrine pública
  Como administrador
  Quero que correções não exponham dados internos
  Para manter a loja pública limpa

  Cenario: Loja pública não exibe custo interno
    Dado que corrigi cadastro e financeiro no admin
    Quando acesso a loja como visitante
    Então vejo apenas preço de lista e dados públicos
    E não vejo custo pago nem entradas financeiras internas
