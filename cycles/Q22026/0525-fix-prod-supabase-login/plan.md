# Plan: Fix produção Supabase login — 0525

## Diagnóstico

Com base na leitura do código atual, três causas prováveis para o loop `/login`:

### Causa 1 — `getSession()` no servidor (alta probabilidade)

`getCurrentProfile` em `lib/ruby-safira-repository.ts` chama `supabase.auth.getSession()` antes de `getUser()`. O Supabase SSR **não recomenda** `getSession()` no servidor — ele retorna a sessão do cookie sem validar o JWT contra a rede, e em alguns contextos do App Router o resultado é `null` mesmo com cookies presentes. Quando `getSession()` retorna null, o código cai no `getUser()` (correto), mas se o cookie simplesmente não chegou, ambos falham → `null` → `redirect('/login')`.

**Fix:** remover `getSession()` de `getCurrentProfile`; usar somente `getUser()`.

### Causa 2 — Cookie options incompletas em `/auth/session` (média probabilidade)

`app/auth/session/route.ts` e `app/auth/login/route.ts` repassam as `options` que chegam do `@supabase/ssr` sem adicionar defaults explícitos. Se as options não incluírem `secure: true` + `sameSite: 'lax'` + `path: '/'`, o browser em HTTPS pode rejeitar ou não enviar os cookies na request seguinte.

**Fix:** mesclar defaults seguros nas options antes de chamar `response.cookies.set`.

### Causa 3 — `setAll` nunca chamado / pendingCookies vazio (baixa probabilidade, mas silencioso)

Se `setSession` falhar internamente sem propagar o erro (ex.: token expirado enviado pelo cliente), `setAll` nunca é chamado, o timeout de 4 s esgota, `pendingCookies` fica vazio, o response retorna `{ ok: true }` mas sem nenhum `Set-Cookie`. O cliente recebe 200 e navega para `/admin`, mas o servidor não tem sessão.

**Fix:** detectar `pendingCookies.length === 0` após o await e retornar erro distinto.

---

## Delta — o que muda

### Frente 1: Sessão e cookies

| Arquivo | Mudança |
|---------|---------|
| `lib/ruby-safira-repository.ts` | `getCurrentProfile`: remover `getSession()`; usar somente `getUser()` |
| `app/auth/session/route.ts` | (a) defaults de cookie seguros; (b) retornar `{ error: "session_not_persisted" }` quando `pendingCookies` vazio após await |
| `app/login/LoginForm.tsx` | Tratar `session_not_persisted` com mensagem distinta |

### Frente 2: Bootstrap de profiles

| Arquivo | Mudança |
|---------|---------|
| `lib/supabase/ensure-profile.ts` | `console.warn` quando `SUPABASE_SERVICE_ROLE_KEY` ausente (antes de tentar anon insert) |
| `app/login/LoginForm.tsx` | Adicionar `profile_creation_failed` ao mapa de erros |

### Frente 3: Runbook na spec

Seção `## Runbook operacional de auth` adicionada a `spec/features/painel-admin-ruby-safira/readme.md` com:
- Tabela de checks (env vars, migration, profile, cookies, redirect URLs)
- SQL de bootstrap para usuário sem profile
- Passos DevTools para diagnosticar cookies
- Sequência de triagem: env → migration → profile → cookies → redirect URLs

---

## O que não muda

- Schema Supabase (sem migrations neste ciclo)
- Fallback local (`!isSupabaseConfigured()`) — comportamento inalterado
- Rotas `/admin`, `/dashboard`, `/login`, middleware
- UI de login (exceto mensagem de erro para `session_not_persisted`)
- `app/auth/login/route.ts` recebe o mesmo fix de cookie options (mesma raiz)

---

## Pré-requisitos operacionais (humano, antes do deploy)

Estes passos não são código — são configurações de infra que precisam estar corretas para qualquer fix de código funcionar:

1. **Env vars na Vercel** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL=https://drblack-premiumlp.vercel.app` presentes e corretas no projeto de produção.
2. **Redirect URLs no Supabase** — Site URL = `https://drblack-premiumlp.vercel.app`; Redirect URLs inclui `https://drblack-premiumlp.vercel.app/**`.
3. **Migration aplicada** — tabela `profiles` e trigger `on_auth_user_created` existem no banco de produção.
4. **Profile do admin** — `teste@teste.com` (ou usuário equivalente) tem linha em `profiles` com `role = 'admin'`.

---

## Critérios de aceitação

- Admin (`role = admin`) → `/admin` 200, sem loop de redirect
- Network pós-login: `token` 200 → `/auth/session` 200 → request a `/admin` retorna 200
- Refresh em `/admin` mantém sessão autenticada
- Usuário Auth sem linha em `profiles` → profile criado automaticamente com `role = customer`; sem loop silencioso
- Senha incorreta → permanece em `/login` com mensagem de erro
- Falha de persistência de cookie → mensagem explícita em `/login` (não loop)
- Customer → `/dashboard`, não `/admin`
