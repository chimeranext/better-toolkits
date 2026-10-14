# Proposal — add-conventions-layer

Change ID: `add-conventions-layer`

## Why

Los aprendices generan código en stacks heterogéneos (Elixir, Rust, Python, TypeScript) sin una fuente pineada de "qué es código bien escrito" por lenguaje: las convenciones viven en links sueltos, docs sin versionar o memoria de sesión que se pierde. Cuando se intentó aterrizar el caso Elixir se mezcló con arquitectura MQTT/mMTC — prueba de que falta el molde: sin schema genérico, cada convención se vuelve un documento ad-hoc imposible de enforcear. Esta change crea la capa (`shared/references/conventions/`) con el método + schema versionado, y la dogfoodea con el primer caso ejemplar (`language/elixir`, validable por Credo/compilador).

## What Changes

- Árbol parametrizable bajo `shared/references/conventions/` (no plano):
  `language/<id>/README.md` (record de lenguaje: compilador/linter) +
  `language/<id>/frameworks/<fw>.md` (record de framework) +
  ramas reservadas `platform/<id>/` (ej. OpenPLC/IEC 61131-3: POUs,
  variables-datatypes, tasks-instances, python/cpp-blocks) y
  `dataset/<id>/` (ej. `cv-finetune`). Plantilla única con sección
  `level: language | framework | platform | dataset`.
- Nuevo `shared/references/conventions/` + plantilla `convention-record`: id, versión SemVer, status, `extracted_at`/`ttl_expires`; SOURCES pineadas con peso (`load-bearing | context`, Context7 ID + versión/fecha); RULES por mecanismo (no por lenguaje); COUNTEREXAMPLES; GATE dual (local subset rápido + CI completo, ambos pineados); LESSONS numeradas desde PRs cerrados; RECEIPT con `candidate_sha` + risk tier + lenses + verdict.
- Regla de casa: lo transversal vive en `shared/` (precedente `requirements-authoring`, `shared/skills/local-pr-review`); assurance lo consume, no lo ownéa (sin cuarto pillar).
- Separación explícita lenguaje vs arquitectura: lo MQTT/mMTC (broker-vs-cliente, tópicos, QoS, escala) va a un OpenSpec en el monorepo vertivo, NO acá; acá solo "¿está bien escrito el Elixir?".
- Primer record ejemplar `language/elixir` v0.1.0 draft + hijo `frameworks/phoenix`
  como prueba del nivel framework: SOURCES Credo `~> 1.7` (MIT) + hexdocs
  (lista exacta de checks) + mix-otp docs para el lenguaje, y
  `phoenix.hexdocs.pm/overview` + elixir `introduction`/`learning` para el
  framework; GATES `mix compile --warnings-as-errors`, `mix format --check`,
  `mix credo --strict`, Dialyzer vía `dialyxir` (`mix dialyzer`), toolchain
  Elixir/OTP pineada; taxonomía Consistency/Design/Readability/Refactor/Warning.
- Licencias: reinterpretar con atribución (Credo MIT OK; MegaLinter AGPL v3 solo como referencia de catálogo, nunca vendorado; marcas Engram™/Gentle-AI™ no se usan como nombres propios).

## Capabilities

### New Capabilities

- `shared/conventions-record`: schema y método genérico para cualquier lenguaje — árbol `language/<id>/` + `frameworks/<fw>.md` (ramas `platform/`, `dataset/` reservadas), pin de fuentes con peso, reglas por mecanismo, contraejemplos, gates dual-lane pineados, serie de lecciones numeradas, TTL con re-extracción, receipt con `candidate_sha` + tree-check-at-commit.
- `shared/conventions-elixir`: instancia ejemplar para dogfooding — record `language/elixir` + hijo `frameworks/phoenix` (prueba del nivel framework; Ash queda siguiente), convenciones de lenguaje Elixir enforceables por Credo/compilador/format/dialyzer, con gates pineados y módulo sample que los pasa.

### Modified Capabilities

- (vacío — no hay specs previas que cambiar; el delta RDD de receipts de `assurance-governance` va en change separada posterior)

## Impact

- Afecta: `shared/references/conventions/` (nuevo: plantilla + README + records `language/elixir` + `frameworks/phoenix`); ningún toolkit cambia comportamiento.
- Sistemas: Context7 MCP (extracción), MegaLinter como catálogo de referencia, SkillSpector como precedente de gate local-vs-CI.
- Non-goals: arquitectura MQTT/mMTC (OpenSpec en vertivo); instancias `rust-edge` / `cv-finetune`, rama `platform/openplc` (POUs, datatypes, tasks, python/cpp-blocks verificados como fuente real IEC 61131-3) y framework Ash (changes siguientes); implementar gates en CI (solo protocolo + pines); re-extraer las 18 lecciones del hackathon (solo serie seed).
- Éxito verificable: `openspec validate --change add-conventions-layer` pasa; existen plantilla + record ejemplar con todas las secciones; el módulo sample Elixir pasa los 4 gates pineados en sandbox; un revisor puede trazar cada RULE a su SOURCE pineada.
