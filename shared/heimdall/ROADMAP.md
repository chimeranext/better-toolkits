# Roadmap — Heimdall

Follow-ups identificados. Ninguno bloquea el MVP (CLI local + GitHub Actions $0).

## 1. Eval harness — calidad medible del reviewer

Heimdall **es** un LLM-as-a-judge (un modelo NIM juzgando PRs), así que conviene
evaluarlo con esa misma metodología. Patrón de referencia: el flujo **"LLM-as-a-judge"
del NeMo Evaluator** de NVIDIA
(<https://docs.nvidia.com/nemo/microservices/25.12.0/evaluate/flows/llm-as-a-judge.html>).

Plan homegrown (sin el microservicio NeMo):

- **Golden set** de PRs-fixture con issues conocidos (bugs, gaps de seguridad, nits) y el
  veredicto esperado.
- **Scoring**: un juez LLM (o labels humanos) puntúa si Heimdall detectó cada issue
  → métricas agregadas (recall de issues, consistencia, falsos positivos).
- **Benchmark por lane NIM** (Kimi / GLM / DeepSeek / Qwen / …) sobre el mismo golden set
  → elegir el mejor modelo **por token**. NeMo LLM-as-judge NO hace comparación A/B nativa,
  así que la comparación entre lanes es agregación *offline* de evals single-model.
- Reusa el `FixtureGitHubAdapter` + el provider registry que ya existen.

> **Decisión (consistente con agentic-core / timeseries_core):** adoptar el **patrón**
> homegrown; **diferir** el microservicio NeMo Evaluator (infra pesada: Evaluator +
> Entity/Data Store + endpoints NIM) hasta tener volumen que lo justifique.

## 2. Presupuesto de tokens / rate limit (hallazgo de dogfooding 2026-06-22)

- Revisar un spec grande (PR #14) costó **~408k tokens / 9 iteraciones**.
- Las NIM keys `_INTERNAL_STAGING` y `_PUBLIC_PROD` comparten la **misma cuenta NVIDIA**
  → el rate limit (HTTP 429 de `integrate.api.nvidia.com`) es a nivel de **cuenta**, no de
  key; cambiar de key no lo evita.
- Follow-up: cap de iteraciones / tamaño de diff / `max_tokens`, y/o un **tier NIM más alto**
  para uso cross-repo (5 monorepos).

## 3. Scoring estructurado

Endurecer el contrato de confianza/severidad a un **JSON schema estricto** (lección
anti-NaN del flujo NeMo: structured output > parsing por regex para consistencia).

## 4. Identidad de bot (GitHub App)

El MVP postea como `github-actions[bot]` (token ambiente de Actions). Upgrade aditivo:
postear como `heimdall[bot]` vía token de la GitHub App "Heimdall".

## 5. Deploy webhook server

`Cloudflare Workers + Workflows` (pipeline durable del loop) + `Durable Objects`
(dedup/lock por-PR, rate-limit gate), o Dokploy/Cloud Run. Ver `docs/` → Topología.
