## Context

A página principal termina, hoje, na secção “Continua a narrativa” renderizada inline no fim de `components/ScrollDrivenHeroGallery.tsx` (após a galeria pinada). O fundo é creme `#EED9C4` herdado do ciclo 0001 e o conteúdo é estritamente narrativo (H2 + parágrafo curto), sem ponte para o mercado.

Esta cycle introduz um **background interativo** nesse bloco usando `public/skininterativa.png`, alinhado ao rebrand 2026 (laranja/creme/preto, vibe gamer/CS2): a secção passa para fundo escuro `#0A0A0A`, a imagem ocupa o background com tratamento cromático leve, e ao **passar o cursor por cima** a imagem reage com um **3D subtil** — tilt + paralax + glow seguindo o ponteiro — devolvendo ao estado neutro quando o cursor sai.

A intenção é que esta secção deixe de ser apenas uma “despedida narrativa” e passe a funcionar como **ponte para o produto**: refinar copy curta/casual e adicionar um CTA primário em laranja.

---

## Intent

- Trocar o fundo creme da secção “Continua a narrativa” por base escura `#0A0A0A` com `public/skininterativa.png` como **background interativo**.
- Implementar um efeito **3D leve** que reage ao cursor:
  - tilt subtil (`±5°` em rotateX/rotateY),
  - paralax translate (`±12px`) em sentido oposto ao tilt,
  - leve `scale 1.02` ao entrar com o cursor,
  - glow radial laranja `#FF5C0A` seguindo a posição do ponteiro.
- Quando o cursor sai, retornar suavemente ao estado neutro.
- Em `prefers-reduced-motion`, **manter** uma profundidade 3D *estática* (perspective + rotateX residual + sombra interna + overlay laranja sutil) para a interação “fazer sentido” mesmo sem movimento ativo, sem violar a preferência do utilizador.
- Refinar a copy da secção (curta, casual, rebrand 2026) e adicionar um CTA primário (`Ver mercado`).
- Manter a UX/UI condizente com a paleta atual; não introduzir cores fora da tabela canónica de `spec/features/rebrand-2026-q1/readme.md`.

---

## Referência

- Imagem: `public/skininterativa.png` — ativo concreto desta cycle.
- Paleta e tokens: `spec/features/rebrand-2026-q1/readme.md` (cores fixas, tokens em `app/globals.css`).
- Ritmo/composição: ciclos 0001 e 0002 já estabeleceram o tom (loader + hero + galeria scroll-driven).

---

## Requisitos funcionais

1. **Fundo da secção “Continua a narrativa”**
   - Base `#0A0A0A`. Não restam superfícies creme `#EED9C4` neste bloco (a paleta cumpre — creme reservado a labels, bordas, hovers “muted”).
   - `public/skininterativa.png` ocupa o background da secção em `object-cover`, com tratamento cromático para ler como rebrand (overlays laranja/creme/preto controlados via CSS).

2. **Interatividade 3D (cursor)**
   - Apenas em pointer fino (desktop/trackpad). Em `(pointer: coarse)` (touch), a imagem fica estática.
   - Hover na zona da imagem inicia o efeito; sair retorna suavemente ao estado neutro (sem snap).
   - Movimento limitado: tilt no intervalo `[-5°, +5°]`; translate ≤ `12px` em qualquer eixo; `scale ≤ 1.02`.
   - Glow radial laranja segue o cursor, com opacidade ≤ 28% sobre a imagem.

3. **Composição e legibilidade**
   - O conteúdo textual (eyebrow, H2, parágrafo, CTA) permanece **legível** sobre o background interativo (vinheta + camada escura nas zonas do texto se necessário).
   - O CTA primário usa `#FF5C0A` com texto `#0A0A0A`, alinhado às regras de uso da paleta (`spec/features/rebrand-2026-q1/readme.md`).

4. **Acessibilidade e preferências**
   - Respeitar `prefers-reduced-motion: reduce` (sem rastreamento ativo de cursor; manter 3D estático subtil).
   - Manter foco visível e ordem natural de tab no CTA; não capturar eventos de teclado.

5. **Copy (proposta a confirmar na implementação)**
   - Eyebrow: `06 · NARRATIVA`
   - H2: `Continua a história.`
   - Sub: `Cada skin é um novo começo. Bora virar a tua?`
   - CTA: `Ver mercado` (destino real definido na implementação — âncora na própria página ou link futuro).

---

## Non-goals (para não expandir o scope)

- Redesenhar paleta, copy global ou ativos de outras secções (ciclo 0001).
- Refazer a galeria scroll-driven, o pin ou a expansão 3D do hero (ciclo 0002).
- Introduzir efeito 3D em outras secções fora de “Continua a narrativa”.
- Reprocessar `public/skininterativa.png` em batch (a imagem é o ativo entregue; tratamento via CSS/overlays).
- Suporte a gyroscope/orientation em mobile/tablet — touch é estático.

---

## Constraints

- Manter desempenho: efeito de cursor não pode causar re-renders por frame da árvore React. Usar `useMotionValue` + `useTransform` (ou equivalente) para escrever direto em transformações CSS.
- Não introduzir dependências novas: `framer-motion` já está no repo.
- Respeitar `prefers-reduced-motion` com caminho explícito.
- Não introduzir cores fora da tabela canónica.
- A secção não deve “roubar” foco do utilizador a meio do scroll (sem pin nem timeline scroll-linked nesta cycle).

---

## Ficheiros prováveis (para o plano delta)

- `components/ScrollDrivenHeroGallery.tsx` — alterar o `<section>` final “Continua a narrativa” (fundo, copy, slot do background interativo, CTA).
- `components/InteractiveSkinBackground.tsx` (novo) — encapsular a imagem + camadas de overlay + lógica de cursor (motion values).
- `spec/features/rebrand-2026-q1/readme.md` — adicionar secção “Continua a narrativa: ponte interativa” com regras desta cycle.
- `spec/README.md` — referenciar o ciclo 0003.
- (Não previsto) `app/page.tsx` — apenas se for necessária reordenação; o plano é manter a secção inline.

---

## Skills

- ui-design (rebrand 2026, paleta laranja/creme/preto)
- framer-motion (motion values + springs)
- accessibility (`prefers-reduced-motion`, pointer media queries)

---

## Superpowers

- Reutilizar `framer-motion` (já presente no `Hero` e noutros pontos) em vez de introduzir biblioteca de tilt dedicada.
- Validar visualmente contra a paleta canónica e contra o ritmo das secções 0001/0002.
