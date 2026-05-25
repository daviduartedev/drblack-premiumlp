# Plano (delta) — Plataforma: loja, Supabase e UX operacional (Q2 2026)

**Ciclo:** `cycles/Q22026/0524-platform-skins-store-backend/`

## Baseline canônico

- `spec/features/rebrand-2026-q1/` — LP, galeria pinada, nav, tokens, mobile (`UpgradeShowcaseMobile`), carrossel `#skins-destaque`.
- `spec/features/painel-admin-ruby-safira/` — admin, dashboard, ficha técnica, calculadora, repositório local, contrato Supabase “futuro”.
- Código: `ScrollDrivenHeroGallery` (desktop GSAP + mobile separado), `AdminPanel` com ficha sempre visível, seed em `lib/ruby-safira-*`, login com credenciais de teste exibidas.

## Decisões refinadas (produto)

| Tema | Decisão |
|------|---------|
| Rota da vitrine | **`/loja`** — catálogo de skins à venda (somente `em_estoque`). |
| Rifas | Permanecem em **`/rifas`**; skins `em_rifa` não entram na loja. |
| LP | Carrossel **`#skins-destaque`** mantido como destaque; nav **“Catálogo”** → `/loja` (hero, footer, mobile). |
| Nav “Rifas” (hero) | Continua **“Em breve”** (`aria-disabled`, sem link ativo), mesmo com `/rifas` existente. |
| Card público (referência visual) | Categoria (tipo de arma), **Disponível**, nome, badges **StatTrak** + **desgaste** (ex. FT), imagem, faixa de **float** com valor numérico, **preço** e **preço sugerido** (quando houver), stickers opcionais (quando cadastrados). Sem custo, lucro, bilhetes ou observações internas. |
| CTA do card | Primário **“Quero esta skin”** → WhatsApp (`wa.me` + texto com nome da skin). Sem carrinho/checkout; ícone de carrinho do mock vira ação de contato. Menu ⋮ fora deste ciclo. |
| Lista vazia | Copy: *“Nenhuma skin disponível no momento. Volte em breve ou chama no WhatsApp.”* + CTA WhatsApp. |
| Grid loja | Hover/transições estilo Framer; **sem** busca/filtros/ordenação neste ciclo; **lista única** (sem paginação até ~30 itens). |

## Decisões refinadas (admin — Stage 2)

| Tema | Decisão |
|------|---------|
| Formulários | **Ficha de skin** e **fluxo de rifa** fechados por padrão. |
| CTAs | Dois botões: **“Cadastrar skin”** (abre ficha) e **“Cadastrar rifa”** (abre fluxo com calculadora atual). |
| Cancelar | **Descarta rascunho** e volta à listagem sem overlay preso. |
| Upload (Stage 2) | Apenas URL/campo de imagem; **upload Blob no Stage 3**. |

## Decisões refinadas (dados — Stage 3)

| Tema | Decisão |
|------|---------|
| Supabase | Projeto **já existe**; env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ `SUPABASE_SERVICE_ROLE_KEY` só servidor). |
| Auth | **Supabase Auth** neste ciclo; login refatorado (**sem** cartões de credenciais de teste na UI). |
| Seed | **Banco vazio** + seed SQL/script aplicado após migrations (não migrar `ruby-safira-seed.ts` antigo). |
| Blob | URLs **públicas** no store Vercel Blob (imagens de vitrine); path prefixado `skins/{id}/`. |
| Upload | Apenas **admin autenticado** via Route Handler / Server Action com sessão Supabase + escrita com service role. |
| Deploy | Foco **produção Vercel**; `.env.example` documenta variáveis; validação por build/agente (usuário não roda local). |
| Tabelas mínimas | `profiles`, `skins`, `raffles`, `tickets`, `purchases`, `financial_entries` (últimas três para dashboard cliente/admin já existente). |

### Campos públicos vs internos (`skins`)

**Público (loja + API pública):** `name`, `weapon`, `pattern`, `wear_label`, `is_stat_trak`, `float`, `rarity`, `image_url`, `list_price`, `suggested_price` (nullable), `stickers` (jsonb, opcional), `status` (filtro: só `em_estoque`).

**Somente admin:** `paid_value`, `desired_profit_*`, `ticket_count`, `ticket_price`, `internal_notes`, demais financeiro.

### RLS (resumo)

- **Anon/authenticated customer:** `SELECT` em `skins` onde `status = 'em_estoque'` e colunas públicas via view `public_store_skins` ou policy com column-level equivalente.
- **Admin (`profiles.role = 'admin'`):** CRUD operacional em skins, rifas, financeiro.
- **Customer:** `SELECT` próprio em tickets/purchases vinculados ao `auth.uid()`.

## Delta por stage

### Stage 1 — `fix-upgrade-scroll-frames`

- **Problema:** ao rolar a seção “DÊ O UPGRADE QUE VOCÊ MERECE”, os frames **não avançam** de forma contínua (scrub frame-to-frame quebrado ou parado).
- **Escopo:** desktop — timeline GSAP + `ScrollFilmFrames` em `ScrollDrivenHeroGallery.tsx`; verificar que `expansionProgress` alimenta o índice de frame na Fase B.
- **Mobile:** validar `UpgradeShowcaseMobile` não regrediu; correção GSAP não deve alterar ramo mobile.
- **Não alterar:** copy, `.t-h2`, layout, CTAs, easings/morph/glow salvo causa direta.
- **Aceite:** scroll para frente e para trás mapeia progresso monotônico aos frames; `prefers-reduced-motion` mantém fallback legível.

### Stage 2 — `admin-panel-ux-layout`

- Layout admin: hierarquia estoque → ações → painéis; ficha e rifa em **drawer/modal full-screen em mobile**.
- Implementar dois fluxos independentes conforme CTAs acima.

### Stage 3 — `supabase-blob-integration`

- Substituir `ruby-safira-repository` por implementação Supabase mantendo DTOs.
- Middleware/sessão: `@supabase/ssr` cookies; rotas `/admin` e `/dashboard` protegidas.
- Remover dependência de `server-session` mock e `test-credentials` na UI.
- Documentar setup Vercel (env + Blob store + Supabase redirect URLs).

### Stage 4 — `public-catalog-storefront`

- Nova rota `app/loja/page.tsx` + componente `LojaSkinCard` (visual alinhado ao print: fundo escuro, badges, barra de float, preços).
- Repositório: `getPublicStoreSkins()` filtrando `em_estoque`.
- Centralizar `WHATSAPP_SKIN_URL(name)` em `lib/whatsapp.ts` (reutiliza número de `Footer` / rifas).

### Stage 5 — `responsive-mobile-pass`

- Breakpoints de QA: **375px** e **768px**.
- LP (galeria + carrossel + narrativa), `/admin`, `/loja`.
- Touch targets ≥ 44px em CTAs críticos.

## Fora de escopo (confirmado)

Checkout, carrinho, pagamento, PWA, auth multi-tenant além de customer/admin, segunda rota `/catalogo`, auditoria Lighthouse 100, nav hero “Rifas” ativo.

## Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| RLS expõe colunas internas | View `public_store_skins` ou select explícito no repositório público. |
| Scroll fix regressão KPR | Diff mínimo; cenários da galeria no `scenarios.feature` do rebrand. |
| Prod sem teste local | `npm run build` + checklist manual dos cenários antes de deploy. |

## Atualização de specs (obrigatória ao fechar implementação)

- `spec/features/painel-admin-ruby-safira/readme.md` — Auth Supabase, Blob, loja, admin UX, schema.
- `spec/features/rebrand-2026-q1/readme.md` — nav Catálogo → `/loja`, nota de correção galeria.
- `spec/README.md` — referência ao ciclo Q2 0524.
