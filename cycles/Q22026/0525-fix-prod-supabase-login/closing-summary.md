# Closing Summary — fix-prod-supabase-login

## Cycle: cycles/Q22026/0525-fix-prod-supabase-login
## Tipo: Medium
## Data de fechamento: 2026-05-25

## O que foi entregue

Três fixes de código para resolver o loop de redirect para `/login` em produção:

1. **`getCurrentProfile` usa somente `getUser()`** — removido `getSession()` (não recomendado pelo Supabase SSR no servidor; retorna sessão sem validar JWT).
2. **Cookies com options seguras garantidas** — helper `secureCookieOptions` adicionado a `/auth/session` e `/auth/login`; defaults `httpOnly`, `secure` (prod), `sameSite: lax`, `path: /` aplicados antes das options do `@supabase/ssr`.
3. **Falha silenciosa de cookie → erro observável** — guard de `pendingCookies.length === 0` retorna `{ error: "session_not_persisted" }` com status 500; UI exibe mensagem específica em vez de loop.

Mais hardening de `ensureProfile` (logs de warning/error quando `SERVICE_ROLE_KEY` ausente ou insert falha) e runbook operacional de auth na spec canônica.

## Critérios de aceite

| Critério | Status |
|---|---|
| Admin → `/admin` sem loop | ⚠️ Pendente validação pós-deploy |
| Network: `token` 200 → `session` 200 → `/admin` 200 | ⚠️ Pendente validação pós-deploy |
| Refresh em `/admin` mantém sessão | ⚠️ Pendente validação pós-deploy |
| Auth sem profile → profile criado ou erro explícito | ✅ Implementado (auto-create com `role = customer`) |
| Senha incorreta → permanece em `/login` com erro | ✅ Implementado (inalterado) |
| Falha de cookie → mensagem explícita, sem loop | ✅ Implementado (`session_not_persisted`) |
| Customer → `/dashboard` | ⚠️ Pendente validação pós-deploy |
| Runbook documentado | ✅ Em `spec/features/painel-admin-ruby-safira/readme.md` |

## Arquivos alterados

- `lib/ruby-safira-repository.ts` — edit
- `app/auth/session/route.ts` — edit
- `app/auth/login/route.ts` — edit
- `app/login/LoginForm.tsx` — edit
- `lib/supabase/ensure-profile.ts` — edit
- `spec/features/painel-admin-ruby-safira/readme.md` — edit

## Validação

- Lint: PASS
- Typecheck: PASS
- Build: PASS (`next build` exitou 0)
- E2E: N/A — validação manual em produção necessária

## Specs atualizadas

- `spec/features/painel-admin-ruby-safira/readme.md` — seção de auth (regras `getUser()`, bootstrap de profile) + seção `## Runbook operacional de auth`

## Tech debt identificado

- `middleware.ts` → migrar para convenção `proxy` do Next.js 16 (warning pré-existente)
- Considerar Server Action para login Supabase (elimina round-trip cliente → `/auth/session`)

## Ressalvas

**Validação em produção pendente:** este cycle corrige código, mas o sucesso dos critérios de aceite depende de:
1. Env vars corretas na Vercel (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, etc.)
2. Redirect URLs do Supabase apontando para o domínio real
3. Migration `001_initial_schema.sql` aplicada no banco de produção
4. Profile do usuário admin existente em `public.profiles` com `role = 'admin'`

Checklist completo em `validation.md` e runbook em `spec/features/painel-admin-ruby-safira/readme.md`.

## Status final

✅ Cycle fechado — código entregue, build limpo. Validação em produção pendente (ver ressalvas).
