# Validação — 0525 Fix produção Supabase login

## Automatizada (executada localmente)

| Check | Resultado |
|-------|-----------|
| TypeScript | PASS — `next build` sem erros de tipo |
| Lint | PASS — zero erros em todos os arquivos alterados |
| Build | PASS — `next build` exitou 0 (Next.js 16.2.4 Turbopack) |
| E2E | N/A — não configurado; validação manual em produção necessária |

## Manual — pré-deploy (humano)

- [ ] Verificar env vars na Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- [ ] Supabase Dashboard → Authentication → URL Configuration: Site URL e Redirect URLs incluem domínio de produção
- [ ] Migration `001_initial_schema.sql` aplicada (tabela `profiles` + trigger `on_auth_user_created`)
- [ ] `teste@teste.com` (ou admin equivalente) tem linha em `profiles` com `role = 'admin'`

## Manual — pós-deploy (humano)

- [ ] Network: `POST /auth/token` 200 → `POST /auth/session` 200 com `Set-Cookie: sb-*-auth-token` visível → `GET /admin` 200
- [ ] DevTools → Application → Cookies: `sb-*-auth-token` presentes com `HttpOnly`, `Secure`, `SameSite=Lax`
- [ ] Refresh em `/admin` mantém sessão (não volta para `/login`)
- [ ] Login com senha incorreta → permanece em `/login` com mensagem de erro
- [ ] `teste@teste.com` (admin) → `/admin` carrega sem loop
- [ ] Usuário com `role = customer` → `/dashboard`, não `/admin`

## Cenários de aceite (scenarios.feature)

| Cenário | Validação |
|---------|-----------|
| Admin acessa /admin após login | Pendente — validação manual pós-deploy |
| Cliente acessa /dashboard após login | Pendente — validação manual pós-deploy |
| Credenciais inválidas mantêm em /login | Pendente — validação manual pós-deploy |
| Auth sem perfil → profile criado automaticamente | Pendente — validação manual pós-deploy |
| Falha de persistência → erro explícito na UI | Pendente — validação manual pós-deploy |
| Acesso direto sem sessão → redirect para /login | Pendente — validação manual pós-deploy |
| Redirecionamento pós-login por papel | Pendente — validação manual pós-deploy |
