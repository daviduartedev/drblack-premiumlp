# language: pt

# Cenários de negócio — Loja, Supabase, admin e galeria (Q2 2026)
# Detalhes de implementação vivem em plan.md, tasks.md e spec/features/.

Funcionalidade: Galeria scroll-driven na landing
  Como visitante na landing
  Quero ver a animação da seção de upgrade avançar com o scroll
  Para sentir a progressão frame a frame da skin em destaque

  Cenario: Scroll avança os frames de forma contínua no desktop
    Dado que estou na landing em desktop
    E a seção de upgrade está visível
    Quando rolo para baixo dentro da seção pinada
    Então a imagem em destaque progride pelos frames de forma contínua
    E ao rolar para cima os frames recuam sem travar ou pular de forma incoerente

  Cenario: Preferência de movimento reduzido mantém a página usável
    Dado que o sistema indica preferência por movimento reduzido
    Quando passo pela seção de upgrade
    Então ainda consigo ler o conteúdo e seguir rolando a página
    E não fico preso nem vejo layout quebrado

Funcionalidade: Painel admin operacional
  Como administrador
  Quero cadastrar skins e rifas em fluxos separados
  Para operar o estoque sem poluir a tela inicial

  Cenario: Admin abre o painel sem formulário aberto
    Dado que estou autenticado como administrador
    Quando acesso o painel admin
    Então vejo a listagem e métricas sem formulário de cadastro aberto
    E consigo escanear o estoque com clareza

  Cenario: Admin cadastra skin pelo fluxo dedicado
    Dado que estou no painel admin
    Quando escolho cadastrar skin
    Então abro o formulário de ficha técnica da skin
    E ao cancelar volto à listagem sem rascunho pendente

  Cenario: Admin cadastra rifa pelo fluxo com calculadora
    Dado que estou no painel admin
    Quando escolho cadastrar rifa
    Então abro o fluxo de rifa com a calculadora de lucro e precificação
    E consigo definir bilhetes e preço antes de salvar

Funcionalidade: Autenticação Supabase
  Como usuário da plataforma
  Quero entrar com conta real
  Para acessar área de cliente ou admin com segurança

  Cenario: Visitante não vê credenciais de teste na tela de login
    Dado que acesso a página de login
    Quando a tela carrega
    Então não vejo cartões com e-mail e senha de demonstração
    E só consigo entrar com credenciais válidas do Supabase Auth

  Cenario: Cliente não acessa área administrativa
    Dado que estou autenticado como cliente
    Quando tento abrir o painel admin
    Então sou impedido de ver dados operacionais
    E recebo orientação para voltar à minha área

Funcionalidade: Loja pública de skins
  Como visitante
  Quero ver skins à venda em uma vitrine dedicada
  Para conhecer o estoque disponível fora das rifas

  Cenario: Visitante abre a loja pelo menu Catálogo
    Dado que estou na landing
    Quando sigo o link Catálogo no menu
    Então chego à página da loja
    E não permaneço apenas na âncora de destaques da home

  Cenario: Loja lista somente skins em estoque
    Dado que existem skins em estoque e skins em rifa ou arquivadas
    Quando abro a loja
    Então vejo apenas skins disponíveis para venda direta
    E skins em rifa não aparecem misturadas como produto da loja

  Cenario: Card da loja mostra informação de vitrine sem dados internos
    Dado que existe pelo menos uma skin em estoque na loja
    Quando visualizo um card
    Então vejo nome, tipo, desgaste, preço e detalhes públicos como float quando existirem
    E não vejo custo pago, lucro desejado nem observações internas

  Cenario Esquema: Visitante inicia contato pelo WhatsApp a partir do card
    Dado que estou na loja
    Quando escolho quero esta skin no card "<skin>"
    Então sou direcionado ao WhatsApp com contexto da skin "<skin>"

    Exemplos:
      | skin              |
      | AWP \| Redline    |
      | AK-47 \| Slate    |

  Cenario: Loja vazia orienta o visitante
    Dado que não há skins em estoque publicáveis
    Quando abro a loja
    Então vejo mensagem clara de catálogo vazio
    E consigo chamar no WhatsApp a partir da página

Funcionalidade: Persistência real de skins
  Como administrador
  Quero cadastrar skins com foto persistente
  Para alimentar a loja com dados reais

  Cenario: Admin salva skin com imagem no backend
    Dado que estou autenticado como administrador
    Quando cadastro uma skin com upload de foto
    Então a skin fica gravada no banco
    E a imagem fica disponível por URL pública para a vitrine

Funcionalidade: Experiência mobile nas áreas tocadas
  Como visitante ou admin em celular
  Quero usar landing, loja e painel sem quebra crítica
  Para operar em telas pequenas

  Cenario Esquema: Área permanece usável em largura mobile
    Dado que uso um viewport de "<largura>" pixels
    Quando acesso "<area>"
    Então não há overflow horizontal crítico
    E os CTAs principais são tocáveis com área confortável

    Exemplos:
      | largura | area           |
      | 375     | landing        |
      | 375     | loja           |
      | 375     | painel admin   |
      | 768     | landing        |
      | 768     | loja           |
