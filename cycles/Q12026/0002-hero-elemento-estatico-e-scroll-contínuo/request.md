## Context

A landing combina a hero pós-loader com secções cujo movimento depende do scroll (carrossel horizontal, expansão, scrub de frames — alinhado ao storyboard de `public/video.mp4` e ao que já documentamos como estilo de referência no componente de galeria).

Neste ciclo, introduzir-se-á um **elemento de mídia na hero (placeholder)**, a substituir mais tarde, que deve **permanecer parado/estático na composição da hero** (não "sair" com o carrossel nem ser arrastado como os cards), mantendo a **mesma ideia narrativa** do vídeo de referência: sensação de continuidade e controlo fino pelo utilizador.

---

## Intent

- Reservar na hero um **slot** (imagem, vídeo silencioso, ou componente 3D leve) com **tamanho/posição estáveis** durante a experiência relevante, para o designer/dev trocar o ativo depois sem refator grande.
- Garantir que a animação **scroll-scrub** (GSAP/ScrollTrigger ou equivalente) **acompanha bem** a rolagem **contínua** (roda do rato, trackpad, arrasto em touch), e **não fica "correta"** quando o utilizador provoca **saltos rápidos** (ex.: clique na **área da trilha** da barra de scroll que faz a página avançar/recuar em bloco).
- O comportamento alvo: **só** "rolar a página a sério" (scroll incremental) produz a progressão fluida que o vídeo de referência transmite; saltos discretos não devem ser o caminho principal de navegação nesta experiência.

---

## Referência

- Vídeo: `public/video.mp4` — **referência de ritmo, composição e ideia** (não obrigatório manter o ficheiro exposto em UI se não fizer sentido).
- Código existente que já aproxima o storyboard: `components/ScrollDrivenHeroGallery.tsx` (comentários e timeline pinada).

---

## Requisitos funcionais

1. **Placeholder na hero**  
   - Um único ponto de integração (ex. componente `HeroMediaPlaceholder` ou prop) com dimensão e ancoragem claras.  
   - Pode ser uma imagem estática provisória em `public/`; documentar onde trocar o ativo.

2. **Estaticidade em relação à hero**  
   - O elemento **não** se move horizontalmente com a fileira de cards da galeria scroll-driven.  
   - Permanece na **zona da hero** (composição "capa" do site), alinhado ao enquadramento do vídeo de referência, dentro do que o layout responsivo permitir.

3. **Scroll "válido" vs saltos**  
   - A progressão do scrub deve ser **pensada para** delta de scroll contínuo.  
   - **Evitar** que o mecanismo de uso principal seja clique na trilha da barra (scroll por páginas) **sem** mitigação (smooth scroll, captura de wheel num wrapper, ou outra abordagem acordada no `plan.md`).  
   - Documentar a solução escolhida (trade-offs acessibilidade/UX) no `plan.md` desta cycle.

---

## Non-goals (para não expandir o scope)

- Redesenhar a paleta ou copy (ciclo [0001](../0001-rebranding-cores-e-copy/)).
- Trocar todos os ativos finais de produção — apenas o hook do placeholder e o comportamento de scroll.

---

## Constraints

- Manter desempenho: evitar re-renders pesados no scroll.  
- Mobile: touch scroll deve manter a mesma lógica de **progressão contínua**; o mesmo problema de "salto" pode aparecer de outra forma (testar).  
- Acessibilidade: se se desactivar ou contornar navegação por teclado/barra, justificar e oferecer alternativa mínima (ex. skip link ou secção acessível abaixo).

---

## Ficheiros prováveis (para o plano delta)

- `components/hero.tsx` — inserir o slot do placeholder.  
- `app/page.tsx` — ordem/composição entre hero e secções pinadas, se for preciso.  
- `components/ScrollDrivenHeroGallery.tsx` — ajustar layering/z-index, pin, ou scroll container, conforme a solução de scroll.  
- Opcional: `spec/features/rebrand-2026-q1/readme.md` — referência a esta cycle se a feature documentada precisar de um link.

---

## Skills

- ui-design
- framer-motion / gsap (conforme o que o repo já usa)

---

## Superpowers

- Reutilizar padrões existentes (`ScrollTrigger` já presente) em vez de introduzir dependência pesada sem necessidade.  
- Validar o comportamento com o vídeo de referência e com scroll real (roda vs clique na trilha).
