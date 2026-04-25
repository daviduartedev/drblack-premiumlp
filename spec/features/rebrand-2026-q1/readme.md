# Feature: Rebranding 2026 Q1 (cores e copy)

**Ciclo de origem:** `cycles/Q12026/0001-rebranding-cores-e-copy/`

## Objetivo

Uniformizar a experiência com uma UI **escura, contraste alto e vibe gamer** (CS2, rifas), com **paleta fixa** e **textos curtos e casuais em pt-BR**, com exclusões explícitas.

## Cores de marca (fixas)

| Papel | Hex | Uso |
|--------|-----|-----|
| Primário / CTA e destaques fortes | `#FF5C0A` | Botão primário, acentos que substituem o antigo dourado |
| Secundário / destaque suave | `#EED9C4` | Badges, labels, subtítulos de suporte, realces de texto |
| Texto em fundo escuro | `#FFFFFF` | Títulos e leitura principal sobre base escura |
| Contra-CTA (texto sobre o laranja) | `#0A0A0A` | Sempre no botão primário e em qualquer superfície cujo fundo seja o laranja de marca (legibilidade mínima) |
| Fundo / contraste com claro | `#0A0A0A` | Base da UI escura, texto sobre creme se necessário |

Não introduzir cores fora desta tabela, exceto **opacidade** (alpha) aplicada a estas mesmas chaves, ou misturas em gradiente **só** entre pares aprovados (ex.: laranja ↔ creme para brilho/metal).

## Tokens derivados (contrasto e interação)

Implementado em `app/globals.css` (`:root` + `@theme inline`). Nomes atuais:

- `--background` #0A0A0A · `--background-raised` #141414
- `--foreground` #FFFFFF · `--foreground-muted` (branco ~68% opacidade)
- `--paper` e `--highlight` #EED9C4 · `--ink` e `--on-accent` #0A0A0A
- `--accent` #FF5C0A · `--accent-soft` #FF7A3D · `--accent-deep` #CC4A08
- Utilitário de título: classe `.accent-shine` (gradiente laranja/creme; antigo `gold-shine` removido)

Diretriz (histórica):

- **Laranja:** além de `#FF5C0A`, manter `accent-soft` / `accent-deep` (ou nomes finais) como **tints** do laranja para estados *hover* / *pressed* e gradientes (ex. scan do loader, brilho no título) — nunca reintroduzir dourado #c9a24b como eixo cromático.
- **Creme #EED9C4:** pode aparecer em **bordas**, *icons* em monotonal secundária, *hover* de link “muted” (ex. branco 100% → creme) e linhas; para bordas, preferir EED9C4 com alfa (ex. 0.2–0.45) em fundo #0A0A0A.
- **Texto secundário** sobre escuro: preferir `rgba(255,255,255,0.65–0.72)` a cinzas genéricos fora do sistema.
- **Fundo** da página: `#0A0A0A`; leves variações de camada (cards, *elevations*) com cinzas muito escuros (ex. #141414) se necessário, sem chamar atenção mais que o laranja/creme.

## Regras de uso (UI)

- **Botão primário:** fundo `#FF5C0A`, texto/ícones `#0A0A0A`.
- **Texto principal** em seções com fundo escuro: `#FFFFFF` (e secundário via token *muted*).
- **Destaques/labels** (pílulas, *eyebrow*, *badges*): creme #EED9C4, ou branco com ênfase tipográfica conforme o layout, sem competir com o laranja do CTA.
- **Backgrounds:** base escuro; *hero* e loader podem usar gradientes e malhas, desde que leiam como laranja/creme/preto, não dourado.
- **Legibilidade e performance:** evitar efeito visual excessivo; *motion* alinhada ao existente, só recolorido.
- **Mobile:** mesma árvore de prioridade: contraste e tamanho tocável adequados (sem mudar mecânica, só aplicação visual).

## Copy (pt-BR)

- **Direção:** frases **curtas**, **casual**, **sem tom formal** nem *copy* de persuasão tradicional, alinhada ao posicionamento “skins, rifa, CS2, direto ao ponto”. Exemplos de referência no `request.md` do ciclo.
- **Exclusões (não forçar o tom casual** — linguagem clara, neutra ou informativa é OK): **notícias**, **termos/legais**, **blocos de rodapé** institucional. Nesses trechos, priorize precisão e *tone* informativo.
- **Metadados** (título/descrição do *browser*): pt-BR, alinhado ao rebranding, sem o slogan antigo por obrigação — ajuste conforme título/claim final aprovado na implementação; documentar a string final abaixo quando congelar.

**Strings congeladas (metadata `app/layout.tsx`):**

- Título: `DR Black Skins | Skins de CS2, rifa, direto`
- Descrição: `Seu ponto de skins e rifas. Compra, vende, concorre — sem enrolação.`

## Ativos (imagens)

- **Código, SVG, gradientes, cores parametrizadas** (incl. constantes de *shader* e `envColor` na galeria): **devem** migrar para a paleta.
- **Arquivos raster** em `public/gallery` (JPG, PNG) **não** são reprocessados em lote nesta feature: podem reter cromia das fotos; backlog opcional trocar artes. Evitar *design* do site a depender de *mockups* que ainda concentrem o dourado antigo como se fosse interfaced — preferir ajuste via CSS onde possível.

## Dependências técnicas

- *Tokens* canônicos em `app/globals.css` e mapeamento Tailwind `@theme inline` onde usado.
- Componentes conhecidos: `Loader3D`, `Hero`, `ScrollDrivenHeroGallery`, `app/page.tsx`, `app/layout.tsx`.

## Critério de conclusão

- Nenhum dourado #c9a24b (ou família) como eixo cromático principal; *spotlight* e CTA lêem laranja/creme.
- Cenários em `cycles/.../scenarios.feature` satisfeitos em *review* humano.
- Título/descrição do layout preenchidos e copiados para “Strings congeladas” acima.
