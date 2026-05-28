# language: pt

# Cenários de negócio — Admin: upload, preços, desgaste e rifa (Q2 2026)
# Detalhes: plan.md, tasks.md, spec/features/painel-admin-ruby-safira/
# Organizado por stage — executar validação stage a stage.

# --- Stage 1: fix-skin-image-upload-persist ---

Funcionalidade: Upload de imagem em skin existente
  Como administrador
  Quero trocar a foto de uma skin já cadastrada
  Para que a vitrine pública exiba a imagem correta

  Cenario: Upload em edição persiste após reload do admin
    Dado que estou autenticado como administrador
    E existe uma skin salva com imagem antiga
    Quando abro a ficha dessa skin para editar
    E envio uma nova foto via upload
    E recarrego a página do painel admin
    Então vejo a nova imagem na ficha da skin

  Cenario: Imagem atualizada reflete na loja quando skin elegível
    Dado que a skin está com status "em estoque"
    E possui nome, preço de loja maior que zero e imagem válida
    Quando troco a foto via upload em edição
    E acesso a loja pública
    Então o card da skin exibe a nova imagem

  Cenario: Falha de upload exibe erro visível
    Dado que tento enviar imagem em edição de skin existente
    E o storage ou autenticação falha
    Quando confirmo o upload
    Então vejo uma mensagem de erro na interface
    E não fico sem feedback

# --- Stage 2: fix-suggested-price-margin ---

Funcionalidade: Precificação promocional coerente
  Como administrador
  Quero que o preço sugerido siga a margem promocional sobre o preço loja
  Para exibir desconto verídico na vitrine

  Cenario: Margem de loja 20 porcento não gera sugerido como custo mais 10 porcento
    Dado que informo custo de 100 reais
    E margem de lucro de 20 porcento
    Quando a calculadora preenche os preços
    Então o preço de loja reflete custo mais margem cadastrada
    E o preço sugerido não é igual a 110 reais
    E o preço sugerido é maior que o preço de loja

  Cenario: Alterar custo recalcula loja e sugerido
    Dado que estou editando uma skin existente
    Quando altero o valor pago ou a margem de lucro
    Então o preço de loja é recalculado
    E o preço sugerido é recalculado sobre o novo preço de loja

  Cenario: Admin apaga preço sugerido manualmente
    Dado que limpei o campo preço sugerido
    Quando não altero custo nem margem
    Então o preço sugerido permanece vazio
    Quando altero o custo ou a margem
    Então o preço sugerido é preenchido novamente pela calculadora

Funcionalidade: Vitrine pública sem dados internos
  Como visitante da loja
  Quero ver preço anunciado e preço riscado coerentes
  Para entender a promoção

  Cenario: Card da loja exibe preço e sugerido na ordem correta
    Dado que a skin tem preço de loja e preço sugerido preenchidos
    Quando visualizo o card na loja
    Então vejo o preço de loja em destaque
    E vejo o preço sugerido riscado abaixo
    E não vejo custo pago nem margem interna

# --- Stage 3: wear-label-dropdown ---

Funcionalidade: Seleção padronizada de desgaste
  Como administrador
  Quero escolher o desgaste de uma lista fixa
  Para padronizar badges na loja

  Cenario: Campo Desgaste exibe lista ao clicar
    Dado que estou no formulário de cadastro ou edição de skin
    Quando clico no campo Desgaste
    Então vejo opções FN, MW, FT, WW e BS

  Cenario: Desgaste selecionado persiste após save
    Dado que seleciono "MW" no campo Desgaste
    Quando salvo a skin
    E reabro a ficha
    Então o campo Desgaste exibe "MW"

  Cenario: Desgaste opcional não bloqueia save
    Dado que deixo o campo Desgaste vazio
    Quando salvo a skin com demais campos válidos
    Então a skin é salva com sucesso

# --- Stage 4: remove-raffle-prices-section ---

Funcionalidade: Cadastro de rifa sem seção enganosa
  Como administrador
  Quero cadastrar rifa sem ver preços de loja irrelevantes
  Para focar na calculadora de bilhetes

  Cenario: Fluxo Cadastrar rifa não exibe Precos e publicacao
    Dado que abri o fluxo Cadastrar rifa
    Quando visualizo o formulário da skin vinculada
    Então não vejo a seção "Precos e publicacao"
    E continuo vendo a calculadora completa de bilhetes

  Cenario: Salvar rifa mantém preço por bilhete correto
    Dado que configurei quantidade e preço por bilhete na calculadora
    Quando salvo a rifa
    Então a rifa aparece em rifas públicas
    E o card exibe o preço por bilhete configurado

  Cenario: Calculadora de rifa inalterada
    Dado que uso pacotes sugeridos na calculadora de rifa
    Quando seleciono um pacote
    Então bilhetes e preço por bilhete são atualizados
    E as fórmulas de margem da rifa permanecem as mesmas
