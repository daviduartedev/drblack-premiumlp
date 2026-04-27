# Especificações (hub)

Ponto de entrada para o comportamento e a intenção do produto versionada no repositório.

- **Features por pasta:** `spec/features/<id>/` — um `readme.md` por feature com tokens, regras de conteúdo, exclusões e links para ciclos que implementaram a mudança.
- **Ciclos de trabalho:** `cycles/Q{Y}{N}/{id}-{slug}/` — contém `request.md`, `plan.md` (delta), `tasks.md` e `scenarios.feature` para a entrega agêntica.

Feature ativo de rebranding: `spec/features/rebrand-2026-q1/` (inclui após o ciclo 0002 a secção *Hero: slot de mídia e scroll*, após o ciclo 0003 a secção *Continua a narrativa: ponte interativa*, após o ciclo 0004 a secção *Transições KPR fiéis* — shape refinado, easings por fase, morph fluido com `flubber`, frame highlight + glow Fase B e saída cinematográfica refinada — e, após o ciclo 0005, a secção *Padronização e layout pós-rebrand* — sistema unificado de botões `.btn-ghost`/`.btn-solid`/`.btn-icon`/`.btn-icon-sm`/`.footer-link`, hero sem `mediaSlot` com altura `min-h-screen`, narrativa em 2 colunas com bloco de stats placeholder, vinheta lateral no carrossel, footer com bordas únicas e alinhamento baseline e cookie banner em max-width 980px).
