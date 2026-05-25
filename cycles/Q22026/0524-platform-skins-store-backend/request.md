## Context

A plataforma DrBlack opera com dados mockados/locais, painel admin com UX incompleta, sem vitrine publica de skins e sem persistencia real de fotos. A animacao scroll-driven na LP esta quebrada. O projeto usa Next.js com mudancas especificas — antes de alterar codigo, ler os guias relevantes em `node_modules/next/dist/docs/`, conforme instruido no `AGENTS.md`.

Cycles anteriores relevantes:
- `cycles/Q12026/0006-painel-admin-ruby-safira/` — criou admin, dashboard cliente, ficha tecnica, calculadora, repositorio local preparado para Supabase.
- `cycles/Q12026/0004-transicoes-kpr-fieis/` — timeline GSAP, scroll-driven gallery.
- `cycles/Q12026/0005-padronizacao-e-layout-pos-rebrand/` — tokens, layout, tipografia canonica.
- `cycles/Q12026/0001-rebranding-cores-e-copy/` — paleta, identidade visual.

Specs canonicas:
- `spec/features/rebrand-2026-q1/readme.md` — galeria pinada, nav, tokens, mobile.
- `spec/features/painel-admin-ruby-safira/readme.md` — admin, repositorio, Supabase/Vercel futuro.

---

## Intent

Levar a plataforma de mock/local para operacao com dados e imagens reais, vitrine publica de skins e painel admin usavel — com LP e loja funcionais em mobile.

Cinco frentes em stages sequenciais:
1. Corrigir animacao scroll-driven na LP.
2. Melhorar UX do painel admin.
3. Integrar Supabase + Vercel Blob.
4. Criar vitrine publica de skins.
5. Pass responsivo mobile.

---

## Stage 1 — fix-upgrade-scroll-frames

Corrigir a animacao frame-to-frame no scroll na secao **"DE O UPGRADE QUE VOCE MERECE"** (`ScrollDrivenHeroGallery`).

O que deve acontecer:
- Scroll na secao avanca frames de forma continua e sincronizada.
- Scroll reverso mantem coerencia (sem frames travados ou pulando).
- `prefers-reduced-motion: reduce` nao quebra a pagina (fallback conforme spec).

O que NAO fazer:
- Nao alterar copy, tipografia (`.t-h2`), layout ou CTAs da secao.
- Nao mexer em easings, morph flubber, glow Fase B, parallax/blur da narrativa, salvo se forem causa direta do bug.
- Nao adicionar dependencias.

Referencia: `spec/features/rebrand-2026-q1/readme.md` — galeria pinada, timeline GSAP, scrub.

---

## Stage 2 — admin-panel-ux-layout

Melhorar layout e UX de `/admin`:

1. Formulario de nova skin **fechado por padrao** — nao deve estar visivel ao abrir `/admin`.
2. Abrir via acao explicita: botao/CTA tipo "Cadastrar produto" ou "Cadastrar rifa" (definir label adequado).
3. Cancelar/fechar o formulario restaura a listagem sem overlay preso.
4. Melhorar hierarquia, densidade operacional e escaneabilidade do painel, mantendo estetica Ruby/Safira.

O que NAO fazer:
- Nao alterar logica de persistencia (continua local/mock neste stage).
- Nao alterar rotas canonicas (`/admin`, `/dashboard`, `/rifas`).
- Nao redesignar a LP publica.

Referencia: `spec/features/painel-admin-ruby-safira/readme.md` — painel admin, CRUD visual.

---

## Stage 3 — supabase-blob-integration

Integrar backend real:

1. **Supabase** como banco para skins/produtos e entidades minimas para listagem publica e admin.
2. **Vercel Blob** para upload e servir fotos das skins; URLs persistidas no Supabase.
3. Substituir/migrar seed local pela camada de repositorio ja isolada na spec (`lib/ruby-safira-repository.ts` ou equivalente).
4. Politicas **RLS**: admin acessa dados operacionais; publico ve apenas skins publicaveis; dados internos (custo, lucro, observacoes) nunca expostos.
5. Variaveis de ambiente documentadas (Supabase URL/keys, Blob token) — sem commit de secrets.

O que NAO fazer:
- Nao acoplar UI diretamente ao client Supabase (manter repositorio/service).
- Nao implementar checkout/pagamento.
- Nao expor dados de custo/lucro/observacoes admin na API publica.

Referencia: `spec/features/painel-admin-ruby-safira/readme.md` — "Dados locais e Supabase futuro".

---

## Stage 4 — public-catalog-storefront

Criar rota publica de vitrine de skins:

1. Rota canonica: `/catalogo` ou `/loja` (uma unica; definir antes de implementar).
2. Visual alinhado a paleta da LP (tokens do rebrand), nao uma pagina generica.
3. Cards interativos estilo Framer: hover, transicoes, imagem da skin, informacoes publicas.
4. Listar apenas skins publicaveis (status adequado no Supabase); skins nao publicadas/arquivadas nao aparecem.
5. Atualizar nav "Catalogo" na LP para apontar para a rota real (substituir `#skins-destaque`).

O que NAO fazer:
- Nao implementar carrinho, checkout ou pagamento completo.
- Nao criar duas rotas publicas (`/catalogo` e `/loja`) sem redirect.
- Nao expor dados operacionais internos nos cards.

Referencia: `spec/features/rebrand-2026-q1/readme.md` — nav "Catalogo".

---

## Stage 5 — responsive-mobile-pass

Pass responsivo em todas as areas tocadas:

1. **LP** (galeria upgrade, carrossel, narrativa): usavel em mobile sem overflow horizontal, CTAs tocaveis.
2. **`/admin`**: layout adaptado (tabelas/cards empilhados, modal/drawer utilizavel em telas pequenas).
3. **Vitrine** (`/catalogo` ou `/loja`): grid de cards responsivo — 1 coluna mobile, multi-coluna desktop.
4. Formularios e upload utilizaveis em touch.
5. Touch targets minimos (~44px) em CTAs criticos.

O que NAO fazer:
- Nao alterar logica de negocio/backend.
- Nao implementar PWA ou app nativo.
- Respeitar `prefers-reduced-motion` e acessibilidade ja definidas no rebrand.

Referencia: `spec/features/rebrand-2026-q1/readme.md` — gutters, `.section-padding`, cookie banner mobile.

---

## Constraints

- Manter tokens/paleta do rebrand; Ruby/Safira conforme spec `painel-admin-ruby-safira`.
- Rotas canonicas existentes (`/admin`, `/rifas`, `/dashboard`) nao mudam.
- Repositorio isolado — sem UI acoplada ao client Supabase.
- Dados internos (custo, lucro, observacoes) nunca na vitrine publica.
- Timeline GSAP da galeria: alterar so o necessario para o fix.
- Secrets so em env; nada de credenciais no repo.
- Checkout/pagamento completo fora deste ciclo.

---

## Out of scope

- Pagamento, carrinho, checkout completo.
- PWA ou app mobile nativo.
- Autenticacao real multi-usuario alem do que a spec ja preve.
- Duas rotas publicas (`/catalogo` e `/loja`) sem redirect.
- Refatoracoes grandes da timeline GSAP nao relacionadas ao bug de frames.
- Performance audit profunda (Lighthouse 100).
- Novas features de produto nao listadas acima.

---

## Open questions

Resolvidas no refine (ver `plan.md`):

1. Rota: **`/loja`**.
2. Admin: **dois botoes** (skin vs rifa); cancelar descarta rascunho.
3. Card: campos do print (categoria, disponivel, nome, StatTrak, desgaste, float, precos, stickers, imagem).
4. CTA card: **WhatsApp** “Quero esta skin”.
5. Supabase: projeto existente; Auth migrado; banco vazio + seed novo.
6. Bug scroll: frames nao avancam no desktop (corrigir scrub GSAP).

---

## Success criteria

- Scroll-driven frames funcionam na secao upgrade (com fallback reduced-motion).
- Admin: formulario fechado por padrao; cadastro abre/fecha por CTA; CRUD continua funcional.
- Admin cadastra skin com foto — persiste em Supabase + Blob.
- Vitrine publica lista skins publicaveis com imagem; sem dados operacionais internos.
- Nav "Catalogo" aponta para a rota real da vitrine.
- Mobile ~375px: LP, admin e vitrine usaveis sem quebra critica de layout.
- O projeto continua compilando sem quebrar rotas existentes.
