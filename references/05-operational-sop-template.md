# Operational SOP Template

> **How to use:** Copy this file to `./fractional-cto/sops/{slug}/{slug}-sop.md` and fill in each
> section. Delete this callout and every _italic guidance note_ before publishing. Required vs
> optional sections depend on the SOP's maturity — see the depth table below.

---

## Before you write: the routing test

An **Operational SOP** documents how a team *operates a repeatable process* — the steps someone
executes to do X consistently, with no code required to understand them. It is not the only kind of
documented decision. Mixing them is the most common failure mode. Route your draft first:

| Type | Covers | Where it belongs |
|---|---|---|
| **Operational SOP** | How the team *operates* a repeatable process. Things that happen again and again. | Here (`./fractional-cto/sops/`). |
| **Build Decision** | *What* to build, for whom, and why. Product strategy and scoping. | A product decision record, not an SOP. |
| **Tech Decision** | *How* it is built technically: stack, schema, infra, APIs, env vars. | An architecture decision record, not an SOP. |
| **User Guide** | How an end user *uses* the finished product. | Product documentation, not an SOP. |

> If your draft carries tech stack, schema, or API detail → it is a Tech Decision. If it argues what
> the team *should* build → it is a Build Decision. If it teaches a user to click through the product
> → it is a User Guide. If it describes *the steps an operator follows to run a process* → it is an
> SOP. Keep going.

---

## Depth by maturity

| Stage | Expected depth | Minimum viable SOP |
|---|---|---|
| **Draft / proposed** | Purpose, scope, and a high-level procedure outline. `TBD` is acceptable. | Sections 1, 2, 3, 6 (outline). |
| **In rollout** | Procedure documented; edge cases may still be `TBD`. | Sections 1, 2, 3, 5, 6 complete. |
| **Active production** | Full detail. Every step, tool, and owner specified. No `TBD` in the procedure. | All required sections complete. |

Required sections: header table, 1 Purpose, 2 Scope, 3 Audience, 6 Process, 11 Revision History —
always. Section 5 Roles is required when more than one person executes. Sections 4, 8, 9, 10 are
optional but recommended once the process stabilizes.

---

# SOP: [SOP Name]

| Field | Value |
|---|---|
| **Document Type** | Operational SOP |
| **Audience** | [Who executes/reads this — be specific about role, e.g. "Support lead + on-call engineer"] |
| **Document Owner** | [Role — e.g. "Head of Support". Name owners by role, not person, so the SOP survives turnover.] |
| **Approved by** | [Role] |
| **Version** | 1.0 |
| **Last Updated** | [Month Year] |
| **Status** | Draft / Under Review / Approved |

---

## 1. Purpose

_One paragraph. Why does this SOP exist? What problem does it solve? What outcome does it produce
when followed correctly?_

This SOP defines the process for [doing X]. It exists because [recurring task / compliance need /
knowledge transfer / scaling].

---

## 2. Scope

### In scope

_What this SOP covers. Be explicit._

- [Item 1]
- [Item 2]

### Out of scope

_What this SOP does NOT cover — equally important. Route each excluded item to where it belongs._

- [Excluded item] → see [other SOP / Build Decision / Tech Decision / User Guide]

---

## 3. Audience

**Primary readers:** [Role] — executes the process.
**Secondary readers:** [Role] — approves / supervises / consumes the output but does not execute.

---

## 4. Definitions / Glossary

_Optional. Include if the SOP uses domain- or company-specific terminology a new reader would not know._

| Term | Definition |
|---|---|
| [Term] | [Definition] |

---

## 5. Roles & Responsibilities

_RACI-style. Use role names, not only person names._

| Role | Responsibility | When |
|---|---|---|
| [Role A] | [What they do] | [At which step / phase] |
| [Vendor / Partner] | [What they do] | [When] |

---

## 6. Process / Procedure

_The heart of the SOP. Use phases, numbered steps, or a chronological structure — whichever fits.
Reference real tools, real timelines, real thresholds. Steps are sequential and testable: someone
should be able to execute Step 4 only after finishing Step 3. Use the callouts below for anything the
reader must not miss._

### Phase 1: [Phase name]

**Owner:** [Role]
**Duration:** [Typical timeframe]
**Gate to next phase:** [What must be true to advance]

1. [Step — specific action, named owner, named tool]
2. [Step]

> **DECISION POINT:** [What decision is required here, who makes it, what the options are.]

### Phase 2: [Phase name]

**Owner:** [Role]
**Duration:** [Timeframe]
**Gate to next phase:** [Condition]

1. [Step]

> **SCALE NOTE:** [How this phase changes by volume / team size / region.]

### Phase 3: [Phase name]

_Continue as needed. Some SOPs have 3 phases; some have 11. Match the process._

> **LESSON LEARNED:** [Hard-won advice from past executions.]

---

## 7. Tools & Resources

_Every tool the operator needs, with access info._

| Tool | Purpose | Cost | Access owner |
|---|---|---|---|
| [Tool name] | [Use in this SOP] | [Free / $X/mo / project-billed] | [Role] |

**Templates and assets:**

- [Template name] — [where it lives]

---

## 8. KPIs / Success Metrics

_Optional. Include only if measurable — aspirational metrics belong in a Build Decision, not an SOP._

| Metric | Target | Measured by | Cadence |
|---|---|---|---|
| [Metric] | [Threshold] | [Role / tool] | [Per-execution / weekly / monthly] |

---

## 9. Edge Cases & Exceptions

_Optional but recommended. When does the process change? When can someone deviate, and how?_

### [Edge case name]

**When this happens:** [Trigger condition]
**What changes:** [How the process adapts]
**Who decides:** [Role with authority to deviate]

---

## 10. Related SOPs

- **Upstream:** [SOP name] — [why it precedes this one]
- **Downstream:** [SOP name] — [why it follows this one]
- **Adjacent:** [SOP name] — [why a reader of this one might also need that one]

---

## 11. Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | [Month Year] | [Role / name] | Initial version |

---

## Quality checklist (delete before publishing)

**Routing & scope**
- [ ] This is an Operational SOP, not a Build Decision / Tech Decision / User Guide.
- [ ] No technical implementation detail (stack, schema, APIs, env vars).
- [ ] Scope states what is in AND what is out.

**Structure**
- [ ] Header table filled (owner by role, version, status).
- [ ] All sections required at this maturity stage are present.
- [ ] Revision history filled.

**Content**
- [ ] Steps are sequential, specific, and testable.
- [ ] Owners named by role, not only by person.
- [ ] Tools listed with real names and access info.
- [ ] Real numbers where the process has thresholds (days, dollars, headcount, volume).

**Cross-reference**
- [ ] Related SOPs linked both ways.

> **The bus test:** before publishing, ask — "if I got hit by a bus tomorrow, could a teammate read
> this SOP and run the process?" If no, add detail.
