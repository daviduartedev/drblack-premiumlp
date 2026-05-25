# Review — 0525 Fix produção Supabase login

## Scope adherence

- Implementação limitada às três frentes do `request.md`: sessão/cookies, bootstrap de profiles, runbook.
- Sem alterações de schema, rotas, UI além do necessário.
- Fallback local (`!isSupabaseConfigured()`) inalterado.

## Qualidade do código

- `getCurrentProfile` agora usa somente `getUser()` — alinhado com recomendação oficial Supabase SSR.
- `secureCookieOptions` isolado como helper puro; zero duplicação entre `/auth/session` e `/auth/login`.
- Guard de `pendingCookies.length === 0` transforma falha silenciosa em erro observável (500 com `error: "session_not_persisted"`).
- Mensagens de erro na UI mapeadas por código de erro; fallback genérico mantido.
- Logs de `console.warn` / `console.error` em `ensureProfile` ajudam triagem sem expor dados sensíveis.

## Riscos e observações

- **Cookie options:** os defaults aplicados (`httpOnly`, `secure`, `sameSite: lax`, `path: /`) são conservadores e não devem quebrar o fallback local (em dev `secure: false`).
- **`pendingCookies` vazio:** o guard está correto para o caso de `setSession` não emitir cookies, mas a causa raiz de `setSession` não emitir cookies pode indicar problema de configuração Supabase (token expirado, projeto errado) — o log de produção deve evidenciar isso quando ocorrer.
- **Middleware deprecation warning:** `next build` emite `⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.` — warning pré-existente, fora do escopo deste cycle.

## Blockers

Nenhum.

## Tech debt identificado

- Migrar `middleware.ts` para convenção `proxy` (warning do Next.js 16) — fora do escopo deste ciclo.
- Considerar Server Action para login Supabase em ciclo futuro (elimina round-trip cliente → `/auth/session`).

## Veredicto

Code-complete. Pronto para deploy e validação manual em produção.
