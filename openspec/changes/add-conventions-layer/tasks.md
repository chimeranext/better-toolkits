# Tasks — add-conventions-layer

## 1. Plantilla convention-record (árbol)

- [x] 1.1 Crear `shared/references/conventions/_template.md` con todas las secciones del schema (cabecera versionada con `level`, SOURCES con peso, RULES por mecanismo, COUNTEREXAMPLES, GATES dual-lane, LESSONS, RECEIPT) y verificar que cada sección obligatoria tiene marcador de "requerido/opcional"
- [x] 1.2 Agregar `shared/references/conventions/README.md` (el árbol `language/<id>/` + `frameworks/<fw>.md`, ramas `platform/`/`dataset/` reservadas, regla shared-vs-toolkit, licencias: reinterpretar con atribución, AGPL solo referencia) y verificar links a plantilla + records ejemplares

## 2. Records ejemplares language/elixir + frameworks/phoenix (dogfood)

- [x] 2.1 Extraer lista exacta de checks Credo desde hexdocs y fijar pin `~> 1.7`, volcando SOURCES con peso en `shared/references/conventions/language/elixir/README.md` y verificar que cada RULE traza a fuente load-bearing
- [x] 2.2 Redactar RULES por mecanismo + ≥1 COUNTEREXAMPLE (wrong/right) y verificar que ningún RULE menciona MQTT/broker/tópicos (arquitectura excluida)
- [x] 2.3 Crear `shared/references/conventions/language/elixir/frameworks/phoenix.md` con SOURCES propias (overview + contexts de Phoenix) que referencia los gates del padre sin duplicarlos, y verificar herencia exacta de versiones
- [x] 2.4 Declarar GATES dual-lane pineados (local: compile --warnings-as-errors + format --check + credo --strict; CI: + dialyzer vía `dialyxir` + toolchain Elixir/OTP en `.tool-versions` + flavor elixir) y verificar que el local es subset documentado del CI

## 3. Dogfood end-to-end

- [ ] 3.1 Decidir ubicación del sandbox (ver Open Question en design.md), crear módulo Elixir sample y verificar que pasa los 4 gates pineados con versiones impresas en el log
- [ ] 3.2 Emitir receipt del dogfood (candidate_sha + risk tier + lenses + verdict) y verificar tree-check-at-commit: un byte distinto invalida

## 4. Integración y cierre

- [x] 4.1 Correr `openspec validate --change add-conventions-layer` y verificar que pasa sin errores
- [x] 4.2 Registrar follow-ups como issues (change `add-conventions-exemplars` para Rust/Flutter/TypeScript con fuentes ya pineadas, rama `dataset/cv-finetune`, rama `platform/openplc` → #74, framework Ash → #75, delta RDD de receipts en assurance-governance → #76, OpenSpec MQTT en vertivo por decisión separada) y verificar que ningún scope fugado queda en esta change
