# language: pt

# Cenários de negócio — Admin: calculadora, loja e rifas (Q2 2026)
# Detalhes de implementação: plan.md, tasks.md, spec/features/painel-admin-ruby-safira/

Funcionalidade: Ficha técnica de skin com precificação assistida
  Como administrador
  Quero cadastrar uma skin com custo e lucro desejado
  Para que o sistema sugira o preço de venda na loja sem precisar de bilhetes

  Cenario: Calculadora simples na ficha técnica atualiza o preço de lista
    Dado que estou autenticado como administrador
    E abri o fluxo de cadastrar skin
    Quando informo quanto paguei pela skin e o lucro desejado em percentual
    Então vejo o valor alvo de venda calculado pelo sistema
    E o preço de lista é preenchido com esse valor de forma editável
    E não preciso informar quantidade de bilhetes neste fluxo

  Esquema do Cenario: Modo de lucro percentual ou valor fixo na ficha de skin
    Dado que estou cadastrando uma skin no painel admin
    Quando defino o modo de lucro como "<modo>"
    E informo custo e lucro conforme o modo
    Então o sistema calcula um preço de venda coerente com a fórmula da plataforma
    Exemplos:
      | modo          |
      | percentual    |
      | valor_fixo    |

Funcionalidade: Cadastro de rifa com ficha técnica completa
  Como administrador
  Quero rifar uma skin com custo, lucro e bilhetes calculados
  Para publicar a rifa na vitrine sem planilha paralela

  Cenario: Fluxo de rifa calcula venda e bilhetes
    Dado que estou autenticado como administrador
    E abri o fluxo de cadastrar rifa
    Quando informo o custo da skin e o lucro desejado
    Então vejo o valor alvo de venda e sugestões de pacotes de bilhetes
    E posso escolher um pacote que ajusta quantidade e preço por bilhete

  Cenario: Admin salva rifa e ela passa a existir operacionalmente
    Dado que preenchi uma rifa válida com skin, título, bilhetes e data de sorteio
    Quando salvo a rifa
    Então a rifa aparece na listagem do painel admin
    E a skin vinculada deixa de estar disponível para venda direta na loja

Funcionalidade: Vitrine pública da loja
  Como visitante
  Quero ver skins à venda em estoque
  Para entrar em contato pelo WhatsApp

  Cenario: Skin em estoque com dados válidos aparece na loja
    Dado que existe uma skin cadastrada como em estoque
    E ela tem nome, preço de lista positivo e imagem
    Quando acesso a loja
    Então vejo a skin no catálogo público
    E não vejo custo pago nem observações internas

  Cenario: Skin em rifa não aparece na loja
    Dado que uma skin está em rifa
    Quando acesso a loja
    Então essa skin não aparece no catálogo

  Cenario: Skin incompleta não aparece na loja mesmo em estoque
    Dado que uma skin está em estoque mas sem preço de lista válido ou sem imagem
    Quando acesso a loja
    Então essa skin não aparece no catálogo público

Funcionalidade: Vitrine pública de rifas
  Como visitante
  Quero ver rifas ativas
  Para reservar bilhetes pelo WhatsApp

  Cenario: Rifa ativa cadastrada aparece na página de rifas
    Dado que o administrador cadastrou uma rifa ativa
    Quando acesso a página de rifas
    Então vejo a rifa listada com informações públicas da skin
    E posso usar o canal de contato por WhatsApp

Funcionalidade: Persistência confiável no painel admin
  Como administrador
  Quero que cadastros sobrevivam ao recarregar a página
  Para operar com confiança em produção

  Cenario: Skin salva permanece após recarregar o admin
    Dado que salvei uma skin com sucesso no painel admin
    Quando recarrego o painel admin
    Então ainda encontro a skin na listagem com os dados salvos

  Cenario: Falha ao salvar é comunicada
    Dado que tento salvar um cadastro inválido ou bloqueado
    Quando confirmo o salvamento
    Então vejo uma mensagem de erro compreensível
    E o formulário permanece aberto para correção
