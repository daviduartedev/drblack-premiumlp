# Tasks — 0525 Fix produção Supabase login

## Pré-requisitos operacionais (humano — antes de executar o agente)

- [ ] Verificar no painel Vercel → Settings → Environment Variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` presente e aponta para o projeto correto
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` presente
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` presente (server-only; não começa com `NEXT_PUBLIC_`)
  - [ ] `NEXT_PUBLIC_SITE_URL` = `https://drblack-premiumlp.vercel.app` (ou domínio canônico)
- [ ] Supabase Dashboard → Authentication → URL Configuration:
  - [ ] Site URL = `https://drblack-premiumlp.vercel.app`
  - [ ] Redirect URLs inclui `https://drblack-premiumlp.vercel.app/**`
- [ ] Confirmar que migration `001_initial_schema.sql` está aplicada (tabela `profiles` existe, trigger `on_auth_user_created` existe)
- [ ] Confirmar que `teste@teste.com` (ou admin equivalente) tem linha em `profiles` com `role = 'admin'`
  - Se não tiver: rodar SQL de bootstrap (ver runbook na spec)

---

## Stage 1 — Fix `getCurrentProfile` (causa principal)

- [x] Guia Next.js em `node_modules/next/dist/docs/` — pasta ausente; sem restrições identificadas
- [x] `lib/ruby-safira-repository.ts` — `getCurrentProfile`:
  - [x] Removida chamada a `supabase.auth.getSession()`
  - [x] Usando somente `supabase.auth.getUser()` para obter o usuário autenticado no servidor
  - [x] Chamada a `resolveProfile` inalterada após obter `verifiedUser`
  - [x] Tipagem `User | null` do retorno preservada
- [x] `npm run build` — sem erros de TypeScript

## Stage 2 — Fix cookie options em `/auth/session` e `/auth/login`

- [x] `app/auth/session/route.ts`:
  - [x] Helper `secureCookieOptions` criado: mescla defaults seguros com options do `@supabase/ssr`
  - [x] `secureCookieOptions` aplicado em `response.cookies.set` dentro de `pendingCookies.forEach`
  - [x] Guard: `pendingCookies.length === 0` → retorna `{ error: "session_not_persisted" }` com status 500
- [x] `app/auth/login/route.ts` — mesmo helper `secureCookieOptions` aplicado
- [x] `npm run build` — sem erros

## Stage 3 — Diferenciação de erro na UI de login

- [x] `app/login/LoginForm.tsx`:
  - [x] `session_not_persisted` e `profile_creation_failed` adicionados ao mapa `ERROR_MESSAGES`
  - [x] `handleSupabaseLogin`: lê `syncRes.json()` antes de checar `ok`; mapeia `body.error` para `ERROR_MESSAGES` com fallback
- [x] Sem navegação quando há erro (`window.location.assign` não é chamado em path de erro)

## Stage 4 — Hardening de `ensureProfile`

- [x] `lib/supabase/ensure-profile.ts`:
  - [x] `console.warn` adicionado quando `SUPABASE_SERVICE_ROLE_KEY` ausente
  - [x] `console.error` adicionado no fallback anon insert quando erro; retorna `null` sem relançar

## Stage 5 — Runbook na spec

- [x] `spec/features/painel-admin-ruby-safira/readme.md`:
  - [x] Seção `## Runbook operacional de auth` adicionada (feito no refine)
  - [x] Seção de auth atualizada com `getUser()` como padrão exclusivo (feito no refine)

**Conteúdo da seção a adicionar:**

```markdown
## Runbook operacional de auth

### Sequência de triagem (loop de redirect para /login)

1. **Env vars** — verificar todas as quatro na Vercel (URL, anon key, service role, site URL)
2. **Migration** — confirmar tabela `profiles` e trigger `on_auth_user_created` no Supabase
3. **Profile** — confirmar linha em `public.profiles` para o usuário + role correto
4. **Redirect URLs** — Site URL e Redirect URLs no Supabase Auth apontam para o domínio real
5. **Cookies** — DevTools → Application → Cookies: após login, cookies `sb-*-auth-token` presentes; após navegação, são enviados na request a `/admin`

### Checks SQL

-- Usuário existe em Auth
SELECT id, email, created_at FROM auth.users WHERE email = 'usuario@exemplo.com';

-- Profile existe e tem role correto
SELECT id, email, role FROM public.profiles WHERE email = 'usuario@exemplo.com';

-- Bootstrap: criar/promover profile de usuário Auth sem linha em profiles
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = 'usuario@exemplo.com'
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

### Env vars Vercel (produção)

| Variável | Valor esperado |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase (ex. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon/publishable do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (server-only, nunca exposta) |
| `NEXT_PUBLIC_SITE_URL` | `https://drblack-premiumlp.vercel.app` |

### Redirect URLs Supabase (Authentication → URL Configuration)

- Site URL: `https://drblack-premiumlp.vercel.app`
- Redirect URLs: `https://drblack-premiumlp.vercel.app/**`

### Diagnóstico via DevTools (Network + Application)

Sequência esperada após login bem-sucedido:

1. `POST /auth/token?grant_type=password` → 200 (Supabase direto)
2. `POST /auth/session` → 200 com `Set-Cookie: sb-*-auth-token=...`
3. Navegação para `/admin` → 200 (não RSC 304 em `/login`)
4. Application → Cookies → `https://drblack-premiumlp.vercel.app`: cookies `sb-*` presentes com `HttpOnly`, `Secure`, `SameSite=Lax`
```

## Stage 6 — Atualizar spec canônica

- [x] `spec/features/painel-admin-ruby-safira/readme.md` confirmada:
  - [x] `getUser()` como método exclusivo no servidor
  - [x] Bootstrap automático com `role = customer`; promoção admin via SQL
  - [x] Runbook operacional presente na spec

---

## Validação após deploy (humano)

- [ ] Network: `token` 200 → `/auth/session` 200 com `Set-Cookie` visível → `/admin` 200
- [ ] Application → Cookies: `sb-*-auth-token` presentes após login; enviados em requests subsequentes
- [ ] Refresh em `/admin` mantém sessão (não volta para `/login`)
- [ ] Login com senha incorreta → permanece em `/login` com mensagem de erro
- [ ] `teste@teste.com` (admin) → `/admin` carrega sem loop
- [ ] Usuário com `role = customer` → `/dashboard`, não `/admin`
