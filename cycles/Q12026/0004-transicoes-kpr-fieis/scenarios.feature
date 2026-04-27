# language: pt

# Cenários de negócio — Transições KPR fiéis
# Âmbito de aceitação: experiência web de secretária (pointer fino).
# Detalhes de implementação (easings, percentagens de fase, opacidades de glow,
# nome da lib de path morph) vivem no plan.md e no readme.md da feature, não
# nestes cenários. Os cenários aqui descrevem o que o utilizador vê e sente.

Funcionalidade: Transições da galeria scroll-driven com fidelidade KPR
  Como visitante em desktop
  Quero rolar a galeria pinada e sentir cada transição entre fases como um movimento contínuo de "mão de designer"
  Para reconhecer a marca pelo ritmo das animações, não só pela paleta

  Cenário: Continuidade entre fases sem cortes percetíveis
    Dado que rolei do topo da galeria pinada até à secção narrativa
    Quando observo a sequência de transições
    Então não consigo apontar exatamente onde uma fase termina e a outra começa
    E o ritmo é coerente do princípio ao fim, sem saltos de velocidade

  Cenário: Shape do card alinhado com a referência KPR
    Dado que vejo um card no carrossel da galeria
    Quando comparo o seu contorno com o sticker da referência ANIMUS CHARACTER
    Então o shape lê como o mesmo molde, com cantos generosos e tratamento próprio dos lados
    E nenhum card apresenta entalhe agressivo ou mordida grande nos cantos

  Cenário: Morph fluido do shape ao entrar na galeria
    Dado que estou a entrar na galeria pelo topo
    Quando a imagem inicial encolhe do estado fullscreen para o formato de card
    Então a transição do contorno do card lê como uma deformação contínua
    E não há um instante visível em que o shape "aparece" subitamente

  Cenário: Card do hero ganha vida durante a expansão
    Dado que rolei até à fase em que a animação principal está a correr no card central
    Quando observo o card durante o scrub dos frames pré-renderizados
    Então sinto que estou a olhar para dentro do sticker, não para uma imagem chapada
    E há um realce subtil de borda e um brilho interior que não distraem do conteúdo

  Cenário: Saída do hero com peso cinematográfico
    Dado que estou a chegar ao fim da galeria pinada
    Quando o card do hero recua e cede o palco à secção seguinte
    Então a sombra cresce e depois alivia, simulando uma fonte de luz a afastar-se
    E há uma torção subtil no momento final em que o card abandona o palco

  Cenário: Narrativa emerge antes do hero terminar de sair
    Dado que estou na transição final da galeria
    Quando o card do hero ainda está a recolher
    Então a secção "Continua a história" já está a aparecer por baixo, com leve parallax
    E a leitura visual sente-se como sobreposição contínua, não como sequência

  Cenário: Profundidade extra na chegada à narrativa
    Dado que a secção "Continua a história" começa a entrar no enquadramento
    Quando o hero acima ainda não saiu por completo
    Então existe um efeito de profundidade que se dissipa conforme o hero termina de sair
    E quando a secção está totalmente visível, esse efeito já não interfere com a leitura

  Cenário: Reverso preserva a continuidade
    Dado que rolei até à narrativa e estou agora a rolar para cima
    Quando atravesso as transições no sentido inverso
    Então cada fase reverte de forma contínua, sem flickers ou snaps visuais
    E o estado inicial da galeria reaparece como cheguei a ele

  Cenário: Movimento reduzido respeitado, leitura preservada
    Dado que tenho a preferência de "movimento reduzido" ativa no sistema
    Quando percorro a galeria do topo até à narrativa
    Então as transições degradam para fade simples entre fases, sem morphs nem glows
    Mas a sequência narrativa mantém-se compreensível e a paleta continua coerente

  Cenário: A galeria liberta o scroll a tempo
    Dado que terminei a sequência pinada
    Quando saio da última fase
    Então o pin é libertado e a página continua a rolar normalmente
    E nenhum dos efeitos refinados captura scroll ou foco
