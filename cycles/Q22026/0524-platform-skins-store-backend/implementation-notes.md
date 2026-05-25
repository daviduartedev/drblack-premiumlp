# Notas de implementação — 0524

## Stage 1 — scroll frames

**Causa raiz:** o overlay `heroFilmRef` tinha `style={{ opacity: 0 }}` no JSX. Cada `setExpansionProgress` no `onUpdate` do ScrollTrigger provocava re-render e **resetava a opacidade para 0**, mantendo os frames invisíveis mesmo com progresso correto.

**Correção (diff mínimo):**
- Opacidade controlada só via GSAP (`gsap.set` + timeline).
- `ScrollFilmFrames` montado sempre (sem gate `expansionProgress > 0`).
- Throttle de re-render: `setState` só quando o step de frame muda (~100 steps).
- `z-[4]` no overlay do film.

## Stage 2 — admin UX

- `panelMode`: `list | skin | raffle` — default `list`.
- CTAs **Cadastrar skin** / **Cadastrar rifa** no header.
- Drawer full-screen (mobile) / modal (desktop); cancelar descarta rascunho.
- Estoque em grid empilhado; ficha e calculadora só no drawer.

## Stage 3 — Supabase + Blob

- Pacotes: `@supabase/supabase-js`, `@supabase/ssr`, `@vercel/blob`.
- `lib/supabase/*` + `middleware.ts` (refresh sessão).
- Login via Supabase Auth; fallback seed local se env ausente (build/dev).
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` aceito como alias do anon key.
- Migrations: `supabase/migrations/001_initial_schema.sql`, seed: `supabase/seed.sql`.
- Upload: `POST /api/admin/upload-skin-image` → Vercel Blob → `skins.image_url`.
- `lib/server-session.ts` mantido apenas para fallback local (sem UI de credenciais).

## Stage 4 — loja

- Rota `/loja`, `LojaSkinCard`, `getPublicStoreSkins()`.
- Nav **Catálogo** → `/loja` (hero, footer, mobile).
- WhatsApp centralizado em `lib/whatsapp.ts`.

## Stage 5 — mobile

- CTAs ≥ 44px (login, loja, admin drawer).
- Grid loja 1 col → multi-col; admin drawer ocupa viewport em mobile.
- Form upload e login com touch targets adequados.

## Pendências operacionais (humano)

1. Aplicar migration + seed no Supabase existente.
2. Configurar env na Vercel: Supabase keys, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_SITE_URL`.
3. Promover usuário admin via `profiles.role = 'admin'`.
4. `/update-spec` após validação.
