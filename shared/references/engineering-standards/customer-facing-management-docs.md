# CFM — Customer-facing management documents (voice)

## Purpose

How **management plans** the customer representative signs must read — especially
ISO/IEC/IEEE **16326** SPMPs and ISO/IEC/IEEE **16085** risk management /
treatment plans. Complements **ODT** ([ops-documentation-taxonomy.md](ops-documentation-taxonomy.md)):
those plans are explanation / commitment documents for humans, **not** how-to
runbooks for agents.

Toolkit English templates may stay short. The **emitted customer copy** follows
these rules in the engagement working language.

## Audience

| Document type | Voice |
| --- | --- |
| SPMP, risk management plan, risk treatment plan, similar signed management plans | Descriptive / executive. Named subjects. |
| Runbook, protocol step for an agent, skill procedure | Imperative STE (ASD-STE100) is appropriate |

Do **not** apply procedure-imperative STE to management-plan body text just
because toolkit SSOT templates pass `ste-lint.py`. Lint on `templates/*.md` is
for structural English SSOT. **Filled customer plans** use the voice below.

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
- Fractional CTO SPMP authoring:
  `toolkits/fractional-cto-toolkit/references/software-project-management-plan/protocol-authoring.md`
