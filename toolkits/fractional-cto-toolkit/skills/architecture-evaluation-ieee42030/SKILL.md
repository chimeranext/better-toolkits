---
name: architecture-evaluation-ieee42030
disable-model-invocation: true
description: 'Evaluates the architecture description when M-02 asks for an evaluation. Delivers architecture-evaluation.md under ISO/IEC/IEEE 42030:2019.'
---
# architecture-evaluation-ieee42030

Read and follow [`references/architecture-evaluation-ieee42030/protocol.md`](../../references/architecture-evaluation-ieee42030/protocol.md) (protocol SSOT). `/architecture-description-ieee42010` invokes this skill when M-02 evaluates the architecture. The output is ISO/IEC/IEEE 42030:2019.

## Defaults

- Customer-facing evaluation: no skill/`generated_by`/dogfood attribution; descriptive executive voice per `shared/references/engineering-standards/customer-facing-management-docs.md` (not STE procedure imperatives)
- Filled body in the engagement working language. The protocol shell stays English.
