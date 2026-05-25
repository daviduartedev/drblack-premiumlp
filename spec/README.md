# Especificacoes (hub)

Ponto de entrada para o comportamento e a intencao do produto versionada no repositorio.

- **Features por pasta:** `spec/features/<id>/` - um `readme.md` por feature com tokens, regras de conteudo, exclusoes e links para ciclos que implementaram a mudanca.
- **Ciclos de trabalho:** `cycles/Q{Y}{N}/{id}-{slug}/` - contem `request.md`, `plan.md` (delta), `tasks.md` e `scenarios.feature` para a entrega agentica.

## Features canonicas

- `spec/features/rebrand-2026-q1/` - feature ativa de rebranding publico. Inclui ciclos 0001 a 0005: cores/copy, hero, narrativa interativa, transicoes KPR e padronizacao pos-rebrand.
- `spec/features/painel-admin-ruby-safira/` - feature criada no ciclo `cycles/Q12026/0006-painel-admin-ruby-safira/`. Define novas secoes/efeitos Ruby/Safira, dashboard cliente, painel admin, ficha tecnica, calculadora de lucro, loja `/loja`, Supabase Auth, Vercel Blob e RLS (ciclo `cycles/Q22026/0524-platform-skins-store-backend/`).
