# Proposal — eval-jev-router-lane

Change ID: `eval-jev-router-lane`

## Why

`typesafe/jev-router` existe en OpenRouter con API chat/tools verificada (llms.txt + reference) y nombre de router: candidato a lane de Heimdall que podría bajar costo/latencia frente a `nim-kimi`. Pero los lanes `openrouter-*` rutean upstream opacly (mismo slug, distinto upstream por request) y el reviewer es token-hungry (~400k/review), así que ningún lane entra sin evaluación acotada con decisión registrada. Esta change corre esa evaluación; NO cambia el default.

## What Changes

- Matriz de evaluación acotada (diffs chico/mediano/grande) de `typesafe/jev-router` vía el loop existente (`runReviewLoop`), midiendo tool-calling, costo, latencia y rate-limits contra `nim-kimi`.
- Registro de decisión (APPROVE-lane / REJECT con causa) + receipt de eval.
- Solo si pasa: entrada REGISTRY en `reviewer-providers.ts` (sin secreto nuevo: reusa `OPENROUTER_API_KEY`), documentando los 3 caveats de fase 2 (tool-calling, rate-limit, costo Fusion) si aplican.

## Capabilities

### New Capabilities

- `shared/heimdall-lanes`: evaluación y registro de lanes del reviewer — protocolo de eval acotada (criterios, techo de costo, comparativa ciega vs default) y alta de lane solo con decisión APPROVE.

### Modified Capabilities

- (vacío — `reviewer-providers.ts` solo se toca en apply si el veredicto es APPROVE-lane)

## Impact

- Afecta: `shared/heimdall/src/lib/reviewer-providers.ts` (solo en caso APPROVE), docs de lanes; gasto acotado de eval (techo fijado en tasks).
- Sistemas: OpenRouter API (key existente, nunca impresa), key-chain (`resolveOpenRouterEnv`).
- Non-goals: cambiar el default `nim-kimi`; evaluar free-tier (`:free` ya documentado: solo diffs chicos/dev); prometer latencia sin medirla.
- Éxito verificable: `openspec validate --change eval-jev-router-lane` pasa; existe receipt de eval con métricas y decisión explícita; si APPROVE, el lane corre el loop en un diff real sin regresión de tool-calling.
