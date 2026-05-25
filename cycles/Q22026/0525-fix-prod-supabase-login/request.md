## Context

Em producao (`drblack-premiumlp.vercel.app`), o login via Supabase Auth falha silenciosamente: o browser autentica (`token?grant_type=password` → 200), `POST /auth/session` retorna 200, mas a navegacao redireciona de volta para `/login` (requests RSC `304` na pagina de login).

Incidente operacional ja observado:
- Usuario criado manualmente em Supabase Auth (`teste@teste.com`) sem linha correspondente em `public.profiles` (trigger `handle_new_user` nao rodou — usuario criado antes da migration).
- Apos INSERT manual em `profiles` e UPDATE para `role = 'admin'`, o loop de login persiste — indicando problema de persistencia de sessao/cookies no servidor, nao apenas de role ou profile ausente.

Fluxo atual relevante:
- `app/login/LoginForm.tsx` — login client-side Supabase + sync via `/auth/session`
- `app/auth/session/route.ts` — grava cookies HTTP-only
- `lib/supabase/middleware.ts` — refresh de sessao
- `lib/ruby-safira-repository.ts` — `getCurrentProfile`
- `lib/supabase/ensure-profile.ts` — bootstrap de profile

Specs e referencias:
- `spec/features/painel-admin-ruby-safira/readme.md` — auth, roles, rotas (`/login`, `/dashboard`, `/admin`)
- `supabase/migrations/001_initial_schema.sql` — tabela `profiles`, trigger `on_auth_user_created`, RLS
- `supabase/seed.sql` — exemplo de usuarios dev
- `cycles/Q22026/0524-platform-skins-store-backend/validation.md` — item pendente "Migration aplicada no projeto Supabase"

---

## Intent

Permitir login operacional em producao (`/admin` e `/dashboard`) sem loop de redirect para `/login`, e reduzir tempo de debug quando Auth e `profiles` estiverem dessincronizados.

Tres frentes:
1. Diagnosticar e corrigir persistencia de sessao/cookies entre browser, `/auth/session`, middleware e Server Components.
2. Endurecer bootstrap de `profiles` quando usuario existe em `auth.users` mas nao tem linha em `profiles`.
3. Documentar runbook de validacao de autenticacao e usuarios em producao.

---

## Scope

### 1. Corrigir persistencia de sessao apos login em producao

Diagnosticar por que cookies de sessao Supabase nao chegam ou nao sao lidos no servidor apos redirect client-side para `/admin` ou `/dashboard`.

Areas a revisar (nao limitado a):
- Resposta `Set-Cookie` de `POST /auth/session`
- Opcoes de cookie (`Secure`, `SameSite`, `Path`, `Domain`)
- Middleware `updateSession` e leitura de cookies na request seguinte
- `getCurrentProfile` / `getSession` vs `getUser` no servidor
- Timing de `window.location.assign` apos sync de sessao
- Env vars na Vercel: `NEXT_PUBLIC_SITE_URL`, chaves Supabase, `SUPABASE_SERVICE_ROLE_KEY`

Resultado esperado: admin com profile valido acessa `/admin`; customer acessa `/dashboard`.

### 2. Endurecer bootstrap de `profiles`

- Garantir criacao/atualizacao de profile no primeiro login quando trigger `handle_new_user` nao rodou
- Diferenciar erro de profile ausente vs sessao ausente (evitar loop silencioso para `/login`)
- Mensagem de erro clara na UI quando `/auth/session` retorna ok mas servidor nao mantem sessao

### 3. Runbook de validacao auth/usuarios

Documentar checks operacionais (spec ou notas do cycle):

| Check | Como validar |
|-------|----------------|
| Usuario no Auth | `SELECT id, email FROM auth.users WHERE email = '...'` |
| Profile existe | `SELECT id, email, role FROM public.profiles WHERE email = '...'` |
| Role admin | `role = 'admin'` para acessar `/admin` |
| Migration aplicada | Tabela `profiles` + trigger `on_auth_user_created` |
| Env Vercel | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` |
| Redirect URLs Supabase | Dominio de producao nas Site URL / Redirect URLs |
| Login end-to-end | Network: `token` 200 → `session` 200 → `/admin` 200 (nao RSC 304 em `/login`) |
| Cookies | Apos login, cookies `sb-*` presentes; request a `/admin` envia cookies |

SQL de bootstrap para usuario existente sem profile:

```sql
INSERT INTO public.profiles (id, email, name, role)
SELECT id, email, split_part(email, '@', 1), 'admin'
FROM auth.users WHERE email = '...'
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
```

---

## Constraints

- Producao usa Supabase Auth; credenciais mock (`*.local`) permanecem apenas para dev sem Supabase
- Nao quebrar fallback local quando `!isSupabaseConfigured()`
- Nao alterar schema além do necessario; bootstrap de profile via codigo + SQL documentado
- Redirect URLs e env vars validados contra dominio Vercel real
- UI de login nao exibe credenciais de teste (regra da spec)
- Secrets somente em env; nada de credenciais no repo

---

## Out of scope

- Reset de senha self-service na UI (continua via Supabase Dashboard)
- Novos papeis alem de `customer` / `admin`
- Refactor completo de auth (OAuth, magic link, etc.)
- Migration de dados de skins/rifas
- QA visual mobile/desktop alem do smoke de login
- Renomear e-mail de `teste@teste.com` para `admin@drblackskins.dev` (operacional, fora do codigo)

---

## Open questions

1. `SUPABASE_SERVICE_ROLE_KEY` esta configurada na Vercel?
2. `NEXT_PUBLIC_SITE_URL` na Vercel aponta para `https://drblack-premiumlp.vercel.app`?
3. Redirect URLs no Supabase incluem esse dominio?
4. Apos login, cookies `sb-*-auth-token` aparecem em Application → Cookies?
5. Runbook permanente na spec ou apenas notas do cycle?

---

## Success criteria

- Login admin em producao (`teste@teste.com` ou usuario equivalente com `role = admin`) → `/admin` carrega sem voltar a `/login`
- Network pos-login: `token` 200 → `session` 200 → request a `/admin` retorna 200 (nao apenas RSC 304 em `/login`)
- Refresh em `/admin` mantem sessao autenticada
- Usuario Auth sem linha em `profiles` → profile criado automaticamente ou erro explicito na UI (sem loop silencioso)
- Usuario com `role = customer` → login redireciona para `/dashboard`, nao `/admin`
- Senha incorreta → permanece em `/login` com mensagem de erro
- Runbook de validacao auth/usuarios documentado e utilizavel por operador humano
