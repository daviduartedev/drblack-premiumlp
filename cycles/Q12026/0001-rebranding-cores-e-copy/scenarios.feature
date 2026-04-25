# language: pt

# Cenários de negócio — Rebranding 2026 Q1 (visual + copy)
# Foco: o que o usuário percebe na interface. Detalhe de implementação fica no readme do feature.

Funcionalidade: Identidade visual e tom de voz
  Como visitante do site
  Quero perceber uma identidade coerente, escura, com laranja e creme, e textos em português adequados ao contexto
  Para me orientar e confiar na plataforma de skins e rifas

  Esquema do Cenário: Cores básicas da experiência
    Dado que estou acessando qualquer tela publicada do produto nesta versão
    Quando a página se estabiliza após o carregamento
    Então a interface usa fundo majoritariamente <fundo> com realces em laranja e creme, sem voltar à antiga identidade dourada como cor principal
    E textos de interface em conteúdo geral e marketing permanecem em <idioma> legível e em alto contraste onde aplicável

    Exemplos:
      | fundo  | idioma  |
      | escuro | pt-BR  |

  Cenário: Tom casual onde faz sentido
    Dado que estou vendo títulos e chamadas de destaque (hero, benefícios, botões) do site
    Quando leio a copy
    Então a linguagem soa curta, direta e informal, consistente com o posicionamento gamer
    E áreas de notícias, termos legais e rodapé de informações institucionais não adotam obrigatoriamente o mesmo grau de informalidade

  Cenário: Chamada a ação fácil de enxergar
    Dado que há um botão ou ação primária na tela
    Quando procura-se o CTA
    Então a apresentação reforça laranja e contraste (texto escurecido no botão laranja) frente a fundo escuro

  Cenário: Jornada principal continua
    Dado que completo a introdução (ex.: transição pós-loader)
    Quando navego pelo conteúdo principal, incluindo a galeria
    Então a experiência permanece com a mesma lógica de jornada de antes, apenas com a nova aparência e voz, sem exigir novos passos inesperados

  Cenário: Dispositivo móvel
    Dado que acesso a partir de um telefone em orientação comum
    Quando percorro o bloco de introdução e o conteúdo seguinte
    Então a interface permanece utilizável, sem sobreposições grosseiras e com CTAs acessíveis (área mínima razoável)
