# CFM — Customer-facing management documents (voice)

## Purpose

How **management plans** the customer representative signs must read — especially
ISO/IEC/IEEE **16326** SPMPs and ISO/IEC/IEEE **16085** risk management /
treatment plans. The same voice applies to the filled software requirements
specification, architecture description, architecture decision, and architecture
evaluation. Complements **ODT** ([ops-documentation-taxonomy.md](ops-documentation-taxonomy.md)):
those documents are explanation / commitment documents for humans, **not** how-to
runbooks for agents.

Toolkit English templates may stay short. The **emitted customer copy** follows
these rules in the engagement working language.

## Audience

| Document type | Voice |
| --- | --- |
| SPMP, risk management plan, risk treatment plan, similar signed management plans | Descriptive / executive. Named subjects. |
| Software requirements specification, architecture description, architecture decision, architecture evaluation | Descriptive / executive. Named subjects. |
| Runbook, protocol step for an agent, skill procedure | Imperative controlled language is appropriate (ASD-STE100 in English; ESP-TS in Spanish) |

Do **not** apply procedure-imperative STE / ESP-TS to management-plan body text
just because toolkit SSOT templates pass a structural linter. Lint on
`templates/*.md` is for structural English SSOT. **Filled customer plans** use
the voice below — descriptive / executive, **no** bare imperatives.

## Mechanical gate (filled customer-facing copy)

Route by the **language of the file the client reads** (engagement working
language). Do not run the English STE linter on Spanish CFM prose, and do not
run ESP-TS on English CFM prose.

| Filled CFM language | Linter | Notes |
| --- | --- | --- |
| English | `shared/references/asd-ste100/scripts/asd-ste100-lint.py` (ASD-STE100 structural) | Voice stays descriptive; passing STE does not authorize procedure imperatives in CFM |
| Spanish | `shared/references/esp-ts/scripts/esp-ts-lint.py` (ESP-TS; lexical SSOT `vocabulary.yml`) | Same voice rule: descriptive / executive, no bare imperatives |

ESP-TS = Español Técnico Simplificado. See [`../esp-ts/README.md`](../esp-ts/README.md).

## Required voice

1. **Subject + verb.** State who does what (“The construction team publishes a
   weekly status report”). Do not open sentences with bare commands
   (“Publish…”, “Maintain…”, “Measure…”, “Direct…”, “Keep…”).
2. **Platform vs product module.** If the plan replaces a current system, say
   clearly what the **new system / engine** is and which **first module or
   baseline deliverable** stands in for that replacement. Do not leave a vague
   “counterpart of the old system” without that split.
3. **Jargon in-section.** Operational terms (service packages/combos, customer
   check-in vs staff timekeeping, migration vs live API cutover, “platform” as
   hosting/runtime) get a plain-language gloss **in the same section**. Do not
   assume the reader has vault facts open.
4. **No ISO packing jargon.** Prefer “delivered as software in the agreed repo
   and environment” over “no physical media / packaging” unless the customer
   asked for that ISO wording.
5. **Risk response column.** Prefer descriptive labels:
   - “Mitigation: …” (not “Mitigate.”)
   - “Ongoing monitoring; escalate in the weekly report” (not “Monitor. Escalate.”)
   - “Risk accepted if …” (not “Accept.”)
6. **Markdown tables + wikilinks.** Inside table cells, do **not** use
   `[[path|alias]]` — the `|` splits the cell. Use `[[path]]` or
   `[label](path)` instead.
7. **Change history.** Record ownership, scope, and decision changes as version
   rows. Pure editorial voice passes need not get a history row unless the human
   asks.

## Before / after (short)

**Before (agent / STE imperative — forbidden in customer management plans):**

> Direct the project through baseline close-out. Keep the schedule. Measure
> compliance with section 1.4. Read this plan: the customer representative and
> the construction team.

**After (descriptive / executive — required):**

> This plan covers project management through baseline close-out. The schedule
> stays under the controls in section 6. Compliance is measured against the
> acceptance criteria in section 1.4. Readers: the customer representative and
> the construction team.

**Risk table — before:** `Mitigate: seed staging. Monitor.`

**Risk table — after:** `Mitigation: seed or migrate staging data. Ongoing monitoring until the threshold is met.`

## Related

- [ODT — Ops Documentation Taxonomy](ops-documentation-taxonomy.md)
- [ESP-TS — Español Técnico Simplificado](../esp-ts/README.md)
- Fractional CTO SPMP authoring:
  `toolkits/fractional-cto-toolkit/references/software-project-management-plan-authoring-ieee16326/protocol.md`
- Requirements pipeline:
  `shared/references/requirements-authoring-ieee29148/protocol.md`,
  `toolkits/fractional-cto-toolkit/references/architecture-description-ieee42010/protocol.md`,
  `toolkits/fractional-cto-toolkit/references/architecture-decision-ieee42010/protocol.md`,
  `toolkits/fractional-cto-toolkit/references/architecture-evaluation-ieee42030/protocol.md`
