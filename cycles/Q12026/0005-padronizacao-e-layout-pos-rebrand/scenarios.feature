# language: pt

# Cenários de negócio — Padronização e layout pós-rebrand
# Âmbito de aceitação: experiência web em viewport ≥1024px (desktop) e mobile.
# Detalhes de implementação (classes utilitárias, valores em px, gradientes,
# atributos ARIA específicos) vivem no plan.md, no tasks.md e no readme.md
# da feature, não nestes cenários.

Funcionalidade: Layout coerente e tipografia uniforme em toda a página
  Como visitante a chegar à home depois do rebranding
  Quero que cada secção (hero, galeria pinada, carrossel, narrativa, footer, banner)
    sinta-se como parte do mesmo sistema visual
  Para reconhecer a marca pela coerência, não só pela paleta

  Cenário: Borda esquerda do conteúdo cai na mesma linha em todas as secções
    Dado que estou a olhar a página em desktop largo
    Quando comparo a borda esquerda do conteúdo do hero, do título da galeria pinada, do header do carrossel, da narrativa e do footer
    Então essas bordas caem visivelmente na mesma linha vertical
    E essa linha corresponde ao gutter padrão do sistema

  Cenário: Hero ocupa o ecrã inicial sem espaço morto em monitores grandes
    Dado que abro a página num monitor com mais de 1080 píxeis de altura
    Quando vejo a capa pela primeira vez
    Então o headline cabe na primeira dobra sem necessidade de rolar
    E não há uma faixa vazia perceptível abaixo do headline antes da galeria começar

  Cenário: Tipografia consistente entre secções
    Dado que percorro a página de cima a baixo
    Quando comparo títulos, eyebrows, parágrafos e CTAs entre secções diferentes
    Então a mesma família, peso e proporção tipográfica são reutilizados
    E nenhuma secção apresenta tamanhos visivelmente arbitrários quebrando a escala

  Cenário: Botões partilham o mesmo vocabulário visual
    Dado que vejo CTAs e botões em hero, narrativa, footer, banner de cookies e setas do carrossel
    Quando passo o cursor sobre cada um e clico
    Então os estados de repouso, hover e clique seguem o mesmo padrão da paleta
    E a transição é fluida em todos sem comportamentos diferentes entre componentes

  Cenário: Nav do hero comunica claramente o que é navegável
    Dado que estou no topo da página
    Quando olho para os itens do menu superior
    Então o item que tem destino real é claramente clicável e leva-me ao conteúdo correspondente
    E os itens sem destino real estão sinalizados como "em breve" e não são activados por clique nem por teclado

  Cenário: Carrossel sugere conteúdo cortado nas extremidades
    Dado que vejo o carrossel "Skins em destaque"
    Quando observo as bordas esquerda e direita do track de cards
    Então cada borda apresenta um fade suave para o fundo da página
    E essa pista visual sugere que há mais cards para além do que vejo

  Cenário: Cards do carrossel respondem ao cursor de forma sutil
    Dado que estou no carrossel
    Quando passo o cursor sobre um card e clico
    Então o card eleva-se ligeiramente em hover e oferece feedback tátil ao clicar
    E o estado de foco por teclado é visível e respeita o formato do card

  Cenário: Setas do carrossel comunicam estado claramente
    Dado que estou no carrossel no início do track
    Quando olho para as setas de navegação
    Então a seta para a esquerda parece desactivada e não responde a clique
    E a seta para a direita parece activa e responde ao cursor com a mesma transição dos outros botões da página

  Cenário: Narrativa "Continua a história" mostra dados de credibilidade ao lado do copy
    Dado que rolei até à secção narrativa após a galeria pinada
    Quando olho para o lado direito do bloco de texto em desktop
    Então vejo um conjunto de números em destaque com etiquetas curtas
    E esse conjunto reforça a sensação de plataforma activa, sem competir com o copy principal

  Cenário: Footer organiza informação por colunas com hierarquia clara
    Dado que rolei até ao final da página
    Quando observo o footer
    Então identifico claramente quatro áreas: marca + sociais, navegação, suporte e legal
    E o topo das colunas alinha-se visualmente sem desencaixe perceptível
    E os ícones sociais têm o mesmo tamanho

  Cenário: Footer adapta-se a mobile preservando legibilidade
    Dado que abro a página num ecrã pequeno
    Quando vejo o footer empilhado
    Então a barra inferior com copyright, CNPJ e disclaimer da Valve quebra com respiro vertical adequado
    E nenhuma linha de texto fica colada à borda do ecrã

  Cenário: Banner de cookies não domina a página em desktop
    Dado que entro pela primeira vez na página em desktop
    Quando o banner de cookies aparece em baixo
    Então o banner ocupa uma faixa central limitada e não atravessa toda a largura do ecrã
    E a sombra do banner integra-se discretamente sem competir com o conteúdo

  Cenário: Banner de cookies respira em mobile
    Dado que entro pela primeira vez num ecrã pequeno
    Quando o banner de cookies aparece em baixo
    Então o banner respeita as margens laterais da página
    E os botões "Aceitar todos", "Só essenciais" e "Configurar" são tocáveis sem se tocarem entre si

  Cenário: Estados de hover respondem por CSS, sem flickers de JavaScript
    Dado que tenho a página aberta com a aba do DevTools focada em performance
    Quando passo rapidamente o cursor sobre vários botões e links em sequência
    Então as transições de cor, fundo e borda acontecem de forma fluida
    E nenhuma re-renderização de componente é provocada apenas por hover

  Cenário: Foco por teclado percorre a página em ordem natural
    Dado que navego apenas com Tab a partir do topo
    Quando passo pelo skip-link, pelos itens do nav, pelo CTA do hero, pelas setas do carrossel, pelo CTA da narrativa, pelos links do footer e pelos botões do banner de cookies
    Então o anel de foco aparece em cada elemento focável na ordem visual esperada
    E o skip-link continua a funcionar para saltar a animação da galeria

  Cenário: Movimento reduzido respeitado em hover e em scroll
    Dado que tenho a preferência de "movimento reduzido" activa no sistema
    Quando interajo com botões, links e secções da página
    Então as transições de cor em hover continuam a funcionar de forma sóbria
    Mas as transições activadas por scroll degradam para fade simples como já acontecia

  Cenário: Skin do hero mantém leitura sem coluna direita de mídia
    Dado que abro a página em desktop largo
    Quando vejo o hero
    Então o headline ocupa a coluna principal sem deixar uma área vazia visível à direita
    E o parágrafo descritivo encaixa abaixo do nav com a mesma origem horizontal das outras secções
