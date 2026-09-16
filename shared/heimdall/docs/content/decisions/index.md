# Decisiones de diseño

Por qué Heimdall está armado como está. Cada decisión cierra una alternativa
razonable; acá está el porqué.

Decisiones con página propia:

- [Routing de OpenRouter](openrouter-routing.md) — Fusion / free router / `:free`
  / Pareto: qué se mapea al registry hoy y qué queda diferido a fase 2.

## No consumir `agentic-core`

Heimdall **no** depende de un framework agéntico compartido (`agentic-core`).
El loop de review es deliberadamente pequeño y propio (`runReviewLoop`):

- El reviewer es un flujo **headless de backend** con necesidades acotadas:
  iterar, llamar tools, emitir un review. No usa persona routing, adaptadores de
  canal, memoria de sesión ni rate-limit por usuario.
- Atarlo a un core genérico heredaría su superficie y su versionado sin ganancia
  funcional. Mantener el loop propio lo deja **auditable y estable**.

## Lane Kimi-NIM como default

El lane por defecto es **`nim-kimi`**: `moonshotai/kimi-k2.6` servido en
`https://integrate.api.nvidia.com/v1`, con `NVIDIA_API_KEY` como bearer.

- **Un solo bearer** autentica el catálogo de modelos de NVIDIA NIM, así que
  agregar lanes nuevos no multiplica secretos.
- El endpoint es **OpenAI-compatible**, lo que permite reusar
  `openai-agent-loop.ts` sin un cliente a medida por proveedor.
- El registry soporta **fallback-chain**, así que el default no encierra: se
  puede degradar a otro lane sin tocar el motor.

## Bypass del gateway (POST directo)

El reviewer hace un **POST directo** al API del proveedor en vez de pasar por un
gateway conversacional. Es estructural, no una conveniencia: el gateway aporta
maquinaria (persona, canales, sesión) que el reviewer no usa, y enrutar por ahí
sólo heredaría su fragilidad.

## Extracción standalone

Heimdall vive como un repo **standalone** (`@chimeranext/heimdall`), no
incrustado en un monorepo más grande:

- Bun ejecuta TypeScript directo, así que el binario corre **sin build**.
- Se distribuye e invoca con `bunx github:chimeranext/heimdall`, sin
  publicar a un registry.
- Su ciclo de vida (issues, releases, versionado) es **independiente** del
  producto que lo consume.

## Licencia MIT

A diferencia de otros proyectos, Heimdall se libera bajo **MIT**:

- Es una **herramienta de tooling/CI** pensada para uso amplio y para que otros
  repos la adopten sin fricción de licencia.
- MIT maximiza la **adopción** de un reviewer que se invoca como dependencia
  externa (`bunx`, reusable workflow), donde una licencia restrictiva sería un
  freno sin contrapartida.
