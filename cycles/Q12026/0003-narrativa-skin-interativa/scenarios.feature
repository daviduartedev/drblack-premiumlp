# language: pt

# Cenários de negócio — “Continua a narrativa” com background interativo
# Âmbito de aceitação: experiência web de secretária (pointer fino).
# Detalhes de implementação (limites de tilt, opacidades, springs) vivem no plan.md
# e no readme.md da feature, não nestes cenários.

Funcionalidade: Ponte narrativa interativa após a galeria
  Como visitante em desktop
  Quero ver uma secção final que reforça a narrativa do produto e me convida ao próximo passo
  Para sentir continuidade entre a história e o mercado, sem fricção

  Cenário: Secção “Continua a narrativa” com background visual integrado à paleta
    Dado que rolei até ao fim da página, depois da galeria scroll-driven
    Quando vejo a secção de ponte narrativa
    Então a base é escura e alinhada ao rebrand 2026 (sem creme como superfície dominante)
    E existe um background visual que ocupa a área da secção e lê como laranja/creme/preto

  Cenário: Reação subtil ao cursor sobre o background
    Dado que estou na secção “Continua a narrativa”
    Quando movo o cursor sobre o background
    Então o background reage com um efeito 3D subtil que acompanha a posição do cursor
    E quando o cursor sai da área, o background retorna suavemente ao estado neutro

  Cenário: CTA primário leva-me ao próximo passo
    Dado que estou a ler o copy desta secção
    Quando vejo o convite principal de ação
    Então existe um CTA destacado em laranja, legível e clicável
    E o foco por teclado alcança esse CTA na ordem natural da página

  Cenário: Movimento reduzido respeitado, profundidade preservada
    Dado que tenho a preferência de "movimento reduzido" ativa no sistema
    Quando vejo a secção “Continua a narrativa”
    Então a imagem não responde ao cursor com animação ativa
    Mas mantém uma leitura de profundidade visual coerente com a interação intencionada

  Cenário: Em ecrãs touch, a secção continua legível sem efeito ativo
    Dado que abro a página num dispositivo cujo apontador é grosso (touch)
    Quando vejo a secção “Continua a narrativa”
    Então o background aparece estático com o mesmo tratamento cromático
    E nada na secção depende de hover para ser percebido ou usado

  Cenário: A secção não rouba o controlo do scroll
    Dado que continuo a rolar a página depois da galeria scroll-driven
    Quando passo pela secção “Continua a narrativa”
    Então a secção não fixa (pin) o ecrã nem captura o scroll
    E consigo continuar a rolagem para conteúdo subsequente sem fricção
