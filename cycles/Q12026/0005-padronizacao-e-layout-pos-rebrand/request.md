## Context

Na cycle anterior (intervencao manual fora do sistema de cycles) foram introduzidos:

- Tokens de design fechados em `app/globals.css` (escala tipografica, escala de espacamento 8px, gutters, classes utilitarias `.t-eyebrow / .t-h1 / .t-h2 / .t-h3 / .t-body / .t-body-sm / .t-card-title / .t-card-sub / .t-cta`, e helpers `.section-padding`, `.section-padding-x`, `.content-wrap`).
- Novo carrossel **Skins em destaque** (`components/SkinsCarousel.tsx`) — 6 cards com `scroll-snap-type: x mandatory`, montado pos-reveal em `app/page.tsx`.
- **Footer** institucional (`components/Footer.tsx`) com 4 colunas (Marca + sociais / Navegacao / Suporte / Legal) + barra inferior com CNPJ placeholder e disclaimer Valve.
- **Cookie banner** LGPD (`components/CookieBanner.tsx`) montado em `app/layout.tsx` — persiste consentimento em `localStorage["dr.consent"]`.
- Tres rotas legais: `app/termos/page.tsx`, `app/privacidade/page.tsx` (com ancora `#lgpd`), `app/cookies/page.tsx`.
- `KprCard` foi atualizado para consumir as classes utilitarias novas (`.t-card-title`, `.t-card-sub`) em vez de tamanhos inline.

A intencao do design system saiu correta no nivel dos tokens, mas **o resultado visual pos-integracao ficou desalinhado** — especificamente nas areas que misturam o sistema novo (tokens + classes utilitarias) com o codigo antigo do `Hero` e do `ScrollDrivenHeroGallery` (que ainda usa `text-[Npx]`, `tracking-[Nem]`, `px-[5vw]` e estilos inline).

Esta cycle pega cada elemento visivelmente desalinhado e o reconcilia com os tokens, sem mexer nas transicoes 3D do `ScrollDrivenHeroGallery` (Fases 0/A/B/C continuam exatamente como estao — escopo da cycle 0004).

---

## Intent

- **Reconciliar** os componentes legacy (`hero.tsx`, partes nao-3D do `ScrollDrivenHeroGallery.tsx`) com os tokens introduzidos: substituir todo `text-[Npx]`, `tracking-[Nem]`, `px-[5vw]`, `py-[N]` por consumo das classes/variaveis novas.
- **Corrigir** problemas visuais decorrentes da injecao do carrossel + footer:
  - alinhamento horizontal entre hero, galeria pinada, carrossel e footer (mesmo gutter `var(--gutter)`),
  - alinhamento vertical (mesmo `var(--section-py)` em todas as secoes pos-hero),
  - tamanho do hero (hoje `min-h-[115vh]` cria espaco morto em monitores grandes),
  - paragrafo "Skins de CS2..." preso na borda esquerda do hero,
  - container `max-w-6xl` da narrativa com conteudo `max-w-xl` (sobra 4xl vazio),
  - nav com 4 itens sem ancora real para 3 deles,
  - CTA "ENTRAR" e CTA "Ver mercado" com handlers JS de hover (devem virar CSS puro).
- **Refinar** o carrossel novo:
  - hover dos cards mais sutil,
  - estado das setas (disabled vs habilitado) mais visivel,
  - fade nas extremidades do track ("vinheta" lateral) para sugerir conteudo cortado,
  - alinhamento do header da secao com o gutter usado pelo carrossel (hoje `content-wrap` mas o track sangra o gutter — proposital, mas precisa ajuste).
- **Refinar** o footer:
  - distribuicao das colunas em desktop (1.4fr/1fr/1fr/1fr esta ok mas o gap horizontal precisa subir em telas largas),
  - alinhamento vertical do bloco de marca + sociais com o topo das outras colunas (hoje as colunas alinham pelo topo do `<h3>`, fica ligeiramente fora),
  - barra inferior em mobile precisa quebrar com `gap` consistente.
- **Refinar** o cookie banner:
  - em desktop, o banner ocupa toda a largura — limitar `max-width: var(--content-max)`,
  - sombra muito forte; reduzir para casar com o resto.

---

## Referencia

- Os tokens definidos em `app/globals.css` (cycle anterior) sao a fonte da verdade. Nenhum componente deve declarar `font-family: oswald` inline; deve sempre via `.t-h1/.t-h2/.t-h3` ou herdado.
- Site de inspiracao continua sendo `https://kpr.studio/` para ritmo visual; nao para layout (KPR e mais minimal que DR Black Skins precisa ser).
- Footer de referencia (estrutura/credibilidade): `https://www.skinport.com/` ou `https://buff.market/` — colunas claras, legal proeminente, social discreto.

---

## Requisitos funcionais

### 1. Hero (`components/hero.tsx`) — padronizar tipografia e espacamentos

- Substituir headline atual por `className="t-h1"` (remover `style={{ fontFamily, fontSize, lineHeight, letterSpacing, fontWeight, textTransform }}` do `<h1>`).
- Eyebrow de nav: trocar `text-[11px] tracking-[0.28em] uppercase` por `className="t-eyebrow"`.
- Botao "ENTRAR": trocar `text-[10px] font-semibold tracking-[0.28em]` por `className="t-cta"`. Remover `onMouseEnter/onMouseLeave` JS — usar `:hover` em CSS (criar `.btn-ghost` em `globals.css` ou inline com pseudo-classe via styled-jsx ou class condicional). Resultado: estado hover via CSS puro.
- Paragrafo descritivo: trocar `text-[13px] leading-relaxed` + `max-w-md` por `className="t-body-sm"` + `style={{ maxWidth: "44ch" }}` (consistente com o sub do carrossel).
- Padding horizontal: substituir `px-[5vw]` por `className="section-padding-x"` em todos os blocos da hero.
- Altura: trocar `min-h-[115vh]` por `min-h-screen` + `padding-bottom: var(--space-7)`.
- Coluna direita do flex: hoje recebe `mediaSlot` opcional que nunca e passado em `app/page.tsx`. **Decisao**: ou (a) montar o slot com o `Dragon3D` ja existente, ou (b) remover a coluna direita e centralizar/realinhar a coluna do headline. Esta cycle vai pela opcao (b) para reduzir ruido visual; a (a) fica para uma cycle futura.
- Nav: reduzir os itens para os que tem destino real:
  - "Catalogo" -> ancora `#skins-destaque` (ja existe),
  - "Rifas" -> manter como `#` ate ter rota,
  - "Sobre" -> manter como `#`,
  - **remover** "Colecoes" ate existir destino.

### 2. Galeria pinada (`components/ScrollDrivenHeroGallery.tsx`) — apenas o que NAO e 3D

**Importante**: as Fases 0/A/B/C, GSAP timeline, expansao do knife, recuo cinematografico, frame scrub e shape KPR **nao podem ser tocados**. Sao escopo da cycle 0004.

Areas seguras de mexer (puramente "container" da secao, antes/depois do pin):
- O titulo "DE O UPGRADE QUE VOCE MERECE." (linha ~747): hoje tem 6 propriedades de style inline. Trocar por `className="t-h2"`.
- A secao narrativa "Continua a historia." (`<motion.section id="continua-narrativa">`):
  - container externo: `max-w-6xl` -> `var(--content-max)` via `className="content-wrap"`,
  - bloco de copy interno: `max-w-xl` mantido, mas adicionar segunda coluna a direita (mockup ou stats simples — 3 numeros com label, ex. "+12k SKINS · +3.4k USUARIOS · 24/7"),
  - padding: `py-28 md:py-36` -> `className="section-padding"`,
  - eyebrow `text-[11px] tracking-[0.28em] uppercase` -> `t-eyebrow`,
  - h2 `clamp(42px, 6vw, 92px)` etc. -> `className="t-h2"` (mantendo o stagger de palavras do framer-motion),
  - sub `text-[14px]` -> `className="t-body"`,
  - CTA "Ver mercado" `text-[11px] tracking-[0.22em]` -> `className="t-cta"`. Remover handlers JS de mouse — implementar `:hover/:active` via CSS.

### 3. Carrossel (`components/SkinsCarousel.tsx`) — refinos

- Header da secao alinhado ao **gutter da pagina** (`section-padding-x`) — o track abaixo continua a "sangrar" para 100vw com `paddingLeft/Right: var(--gutter)` para dar sensacao de continuidade.
- Vinheta lateral no track: dois pseudo-elementos `::before/::after` ou dois `<div>`s absolutos cobrindo `var(--gutter)` de cada lado com gradiente `linear-gradient(to right, var(--background), transparent)` (esquerda) e mirror (direita). `pointer-events: none`.
- Cards:
  - hover: `translateY(-4px)` ja existe; adicionar `box-shadow` mais forte no hover (`0 24px 48px rgba(0,0,0,0.45)`),
  - clique/active: `translateY(-2px) scale(0.99)` para feedback tatil,
  - **focus-visible** dos `<a>`: contorno `var(--accent)` como ja faz o `:where(...)` global, mas `border-radius: 18px` para casar com o card.
- Setas:
  - estado desabilitado: opacidade 0.25 (hoje 0.3) + `cursor: not-allowed` (ja tem),
  - estado normal: borda `var(--line)`,
  - **estado hover**: hoje so muda no JS — mover para CSS puro via classe `.btn-icon` em `globals.css`.

### 4. Footer (`components/Footer.tsx`)

- Mobile: barra inferior empilha com `gap: var(--space-2)` (hoje `gap-3`).
- Desktop largo (>1280px): aumentar gap entre colunas para `var(--space-7)` (64px) — hoje fica visualmente apertado.
- Coluna 1 (Marca): adicionar `padding-right: var(--space-6)` em desktop para o paragrafo nao colar na coluna 2.
- Sociais: tamanho dos icones esta `18px`/`16px` mistos — uniformizar para `18px`.
- Bordas: o `border-top: 1px solid var(--line-soft)` do bloco superior e o do bloco inferior estao colados — remover o de cima do bloco principal (manter apenas o que separa a barra inferior).
- Barra inferior: o "©... CNPJ XX..." precisa de mais respiro vertical em mobile (`padding-block: var(--space-3)`).

### 5. Cookie banner (`components/CookieBanner.tsx`)

- Container externo: ja usa `content-wrap section-padding-x`. **Adicionar** `max-width: var(--content-max)` ao card interno em desktop (hoje ele ocupa todo o `content-wrap` que ja e limitado, mas em mobile ele cola na borda — ajustar com `margin-inline: var(--gutter)`).
- Box-shadow: reduzir de `0 24px 60px / 0 8px 18px` para `0 16px 40px rgba(0,0,0,0.45)` — menos pesado.
- Os botoes: hoje usam handlers JS para hover. Trocar por classes CSS `.btn-ghost` e `.btn-solid` (a serem criadas em `globals.css`).

### 6. Botoes — sistema unificado (`app/globals.css`)

Criar tres classes utilitarias usadas por hero, narrativa, footer, banner:

```
.btn-ghost {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 20px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--highlight);
  border-radius: 999px;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}
.btn-ghost:hover { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.btn-solid {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 24px;
  background: var(--accent);
  color: var(--on-accent);
  border-radius: 999px;
  cursor: pointer;
  transition: background 180ms ease;
}
.btn-solid:hover { background: var(--accent-soft); }
.btn-solid:active { background: var(--accent-deep); }

.btn-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--highlight);
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease, border-color 180ms ease;
}
.btn-icon:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.btn-icon:disabled { opacity: 0.25; cursor: not-allowed; }
```

Substituir os handlers `onMouseEnter/Leave` espalhados nos componentes por essas classes.

### 7. Verificacao de alinhamento

Todas as secoes da pagina (Hero, GaleriaPinada, Carrossel, Footer) devem usar **a mesma origem horizontal** — o eixo esquerdo do conteudo deve cair na mesma linha vertical em todas elas.

- Hero: `section-padding-x`.
- Galeria pinada: o titulo "DE O UPGRADE..." ja usa `px-[5vw]` (alinhar para `section-padding-x`).
- Carrossel: `content-wrap` envolvendo header.
- Narrativa: `content-wrap`.
- Footer: `content-wrap section-padding-x` (ja faz).

Validar visualmente com uma regua/overlay no devtools (a linha vertical do "D" de "DR·BLACK" no nav deve casar com o "S" de "SKINS EM DESTAQUE" e com o "D" de "DR" no footer).

---

## Requisitos nao-funcionais

- **TypeScript**: `npx tsc --noEmit` deve passar limpo.
- **Sem dependencias novas**: usar apenas o que ja esta no `package.json`.
- **Reduced motion**: nenhuma adicao de transicao quebra `prefers-reduced-motion: reduce`.
- **Acessibilidade**: setas do carrossel mantem `aria-label`, focus-visible global continua valendo, contraste dos textos `t-body-sm` em fundo `--background` >= 4.5:1.
- **Performance**: nao adicionar listeners globais de scroll/resize alem dos ja existentes no carrossel.

---

## Fora de escopo

- Qualquer alteracao nas Fases 0/A/B/C do `ScrollDrivenHeroGallery` (timeline GSAP, scrub de frames, expansao do knife, recuo 3D, shape KPR, clip-path do intro overlay). Tudo isso e da cycle 0004.
- Trocar o conteudo textual do hero, da narrativa ou de qualquer copy.
- Adicionar novas paginas alem das tres legais ja criadas (termos / privacidade / cookies).
- Substituir as imagens do `public/gallery/`.
- Conectar o carrossel a um CMS/Supabase — continua com o array `FEATURED` hardcoded.
- Criar componente `<AmbientBackdrop />` para deduplicar os fundos radiais (mencionado na analise mas adiado para cycle separada).

---

## Criterios de aceitacao

1. **Alinhamento horizontal**: regua vertical no devtools mostra que a borda esquerda do conteudo de Hero, Galeria pinada, Carrossel, Narrativa e Footer cai exatamente na mesma posicao em viewport >= 1024px.
2. **Tipografia uniforme**: nenhum componente da pagina usa `text-[Npx]` ou `tracking-[Nem]` arbitrarios — todos consomem `.t-eyebrow / .t-h1 / .t-h2 / .t-h3 / .t-body / .t-body-sm / .t-card-title / .t-card-sub / .t-cta`. Validacao: `grep -rn "text-\[" components/ app/` deve retornar **zero matches** para tamanhos arbitrarios (excecao permitida: `text-[10px]` se tecnicamente necessario por aspect-ratio, com comentario justificando).
3. **Espacamento uniforme**: `grep -rn "px-\[5vw\]" components/ app/` retorna zero. Idem `py-28`, `py-36`, `mt-[Nvh]`.
4. **Botoes sem JS de hover**: `grep -rn "onMouseEnter" components/ app/` retorna zero (excecao: handlers de pointer da Fase 0 em `ScrollDrivenHeroGallery.tsx`, que sao 3D).
5. **Hero sem "espaco morto"**: em monitor 1920x1080, o headline da hero ocupa o viewport inicial sem scroll; nao ha mais de 20% de altura vazia abaixo do headline antes da galeria pinada comecar.
6. **Carrossel com vinheta**: as bordas esquerda e direita do track tem fade visivel para `var(--background)`, sugerindo conteudo cortado.
7. **Narrativa com segunda coluna**: o `max-w-6xl` deixa de ter 4xl vazio do lado direito — ou tem mockup/stats, ou volta a um max-width consistente com o conteudo.
8. **TypeScript limpo**: `npx tsc --noEmit` sem erros.
9. **Build production**: `npx next build` conclui sem warnings novos.
10. **Reduced motion**: testar com a flag ativada — todas as transicoes de hover continuam funcionando (so as de scroll caem para fade).

---

## Notas de implementacao (sugestoes — nao prescritivo)

- Para a vinheta lateral do carrossel, o jeito mais limpo e adicionar dois `<div aria-hidden>` absolutos dentro do container do track com `width: var(--gutter)`, `pointer-events: none`, `z-index: 2`, e gradiente. Evitar `mask-image` em Safari iOS por inconsistencia.
- Para o tracking do alinhamento horizontal, considerar adicionar uma classe `.debug-rule` durante o desenvolvimento que pinta uma linha vertical no `var(--gutter)` esquerdo — desativada por default, ativada via toggle de teclado em `lib/dev/`. Remover antes do commit final.
- Para a segunda coluna da narrativa, a opcao mais barata e tres "stats" empilhados em desktop e horizontal em mobile, com numero em `t-h3` cor `--accent` e label em `t-card-sub` cor `--foreground-muted`. Texto sugerido (preencher com numeros reais quando houver):
  - "+ 12k" SKINS NEGOCIADAS
  - "+ 3.4k" USUARIOS ATIVOS
  - "24/7" SUPORTE
- Para evitar repetir o `border-top` do footer, mover a regra para um unico container envolvente em vez de dois consecutivos.
