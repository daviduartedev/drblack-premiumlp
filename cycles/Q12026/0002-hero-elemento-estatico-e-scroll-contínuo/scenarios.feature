# language: pt

# Cenários de negócio — Hero com placeholder e scroll contínuo
# Âmbito de aceitação: experiência web de secretária (ver plan.md).

Funcionalidade: Capa com mídia substituível e jornada por scroll
  Como visitante em desktop
  Quero ver um elemento de destaque na área da hero que não pertence ao carrossel horizontal seguinte
  Para sentir continuidade e controlo ao rolar, alinhado à referência de produto

  Cenário: Slot de mídia na hero, independente do carrossel
    Dado que a página principal carregou e a transição pós-loader completou
    Quando vejo a secção de capa
    Então existe uma área de mídia substituível claramente posicionada na composição da hero
    E essa área não se move horizontalmente em conjunto com a fileira de cards da galeria scroll-driven

  Cenário: O destaque da capa não acompanha a galeria
    Dado que estou a rolar para a secção imediatamente a seguir à hero
    Quando a galeria scroll-driven ocupa a minha atenção visual principal
    Então o elemento de destaque da capa já não faz parte da composição “capa” que estava por cima da dobra inicial

  Cenário: Rolagem contínua como modo principal de progressão
    Dado que estou na jornada com animações associadas ao scroll
    Quando rolo a página de forma contínua com roda do rato ou trackpad
    Então a animação ou scrub acompanha o movimento de forma coerente com a referência de ritmo
    E saltos grandes de posição de scroll não produzem a mesma sensação de controlo fino que a rolagem incremental, conforme o plano desta cycle

  Cenário: Acessibilidade mínima
    Dado que existem modos de navegação por teclado ou tecnologias de apoio
    Quando avanço pela página
    Então consigo aceder a conteúdo essencial após a secção narrativa sem ficar preso na capa, conforme o plano desta cycle
