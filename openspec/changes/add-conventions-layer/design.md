# Design — add-conventions-layer

## Context

Ver `proposal.md` (Why) y `specs/` (contratos). Estado actual: cero convenciones de lenguaje en el repo (grep `roboflow|detr|dataset card` solo trae ruido); assurance tiene el slot `transversals/receipts/` con formato básico (qué corrió/dónde/baseline/IDs/versión) sin huella de candidato. Precedentes: `requirements-authoring` y `local-pr-review` viven en `shared/`; SkillSpector enseñó que gate local debe ser subset pineado del CI. Restricción: licencias (MIT/Apache-2.0 reinterpretables; AGPL solo referencia) y marcas (Engram™/Gentle-AI™ no se adoptan como nombres).

## Goals / Non-Goals

- Goals: molde genérico versionado + primer record ejemplar que pasa sus propios gates (dogfood real, no solo docs).
- Non-goals (diseño): no se diseña runner propio de gates (se reusan mix/cargo/Credo/MegaLinter); no hay migración (todo aditivo); el delta RDD de receipts de assurance-governance queda fuera (change posterior).

## Decisions

1. **`shared/` sobre pillar de assurance.** Alternativa: cuarto pillar. Rechazada: assurance verifica, no enseña; el usuario ya vetó pillar-sprawl. `shared/` es el hogar de lo transversal por precedente.
2. **Record como markdown versionado, no DB ni servicio.** Alternativa: SQLite/FTS5 estilo Engram. Rechazada: sin queries ni escala que lo justifiquen; markdown es diffable, greppable y PRDS-compatible. Engram queda como referencia, no dependencia.
3. **Peso de fuentes explícito (`load-bearing | context`).** Por el incidente book-vs-`embedded-hal-bus`: el molde fuerza a declarar qué fuente sostiene cada regla por mecanismo, evitando citas prestigiosas pero inexactas.
4. **Dual-lane con subset garantizado.** Por el skew SkillSpector local-v2.11.2-vs-CI-main: el pin vive en el record y el local nunca excede al CI.
5. **Elixir primero, Rust/CV después.** Elixir tiene gate stack completo verificable hoy (compilador + format + Credo MIT + Dialyzer) y caso de uso pedido (migración backend). MQTT/mMTC se excluye aquí por ser arquitectura de producto (vertivo), no convención de lenguaje.
6. **Árbol parametrizado con hijo que hereda.** Alternativa: un archivo por convención (plano). Rechazada: no escala a frameworks (Phoenix vs Ash comparten base Elixir) ni a ramas futuras (`platform/openplc` con POUs/datatypes/tasks verificados como fuente IEC 61131-3 real, `dataset/cv-finetune`). El hijo referencia gates del padre sin duplicarlos; la plantilla declara `level`.

## Risks / Trade-offs

- [Credo fija checks entre versiones] → pin `~> 1.7` + lista exacta desde hexdocs en apply; el record cita versión.
- [TTL arbitrario (90 días)] → es default, cada record lo ajusta según volatilidad de la fuente (Context7 alta rotación = TTL corto).
- [Dogfood sin codebase Elixir propio] → sample aislado en sandbox; primera adopción real en vertivo, fuera de esta change.
- [yt-dlp transcripts como fuente] → solo auto-subs verificadas contra README canónico cuando exista (caso RDD: README mandó sobre el sub garbleteado).

## Migration Plan

Aditivo puro: crea `shared/references/conventions/` (plantilla + README + 2 records + sample + receipt del dogfood). Rollback = borrar el directorio. Sin shims, sin breaking.

## Open Questions

- ~~Ubicación exacta del sandbox del dogfood Elixir~~ RESUELTA en apply:
  `shared/references/conventions/_dogfood/elixir/` (in-repo, CI-runnable).
  Pendiente toolchain en este entorno (ver tarea 3.1).
