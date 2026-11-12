# Skill `requirements-authoring-ieee29148` — protocol SSOT

---

# Software requirements specification

Turn a client's product idea into a versioned `software-requirements-specification.md`.
The engagement parallelogram cites **ISO/IEC/IEEE 29148:2018**. Section structure
inherits the ISO/IEEE 830 template. That file is the **source of truth** for
requirements. Do not emit a separate `PRD.md`: the product vision already lives in
the Product Overview section. OpenSpec, issues, branches, and PRs are **derived
from that specification**.

## Critical order (requirements first)

```
1. software-requirements-specification.md → written FIRST (29148; structure inherited from 830), author = Product Owner
2. OpenSpec        → DERIVED from the specification (implementation guides for the issues)
3. Linear issue    → Bilingual Layer brief (HUMAN LAYER + AGENT LAYER)
4. /opsx-explore   → think, do NOT implement
5. /opsx-propose   → planning only (drafts the plan; human reviews)
6. human review    → human-in-the-loop (HITL) — DO NOT skip
7. /opsx-apply     → code in the satellite repos (working repos)
8. linked PR       → new PR linked to the Linear issue
9. /opsx-sync      → optional; reconciles specs
10. /opsx-archive  → ONLY with a human yes
```

> **Forbidden anti-pattern:** derive the specification from OpenSpec, or treat
> OpenSpec as the requirements source of truth. OpenSpec describes *how* the
> system implements the requirements that `software-requirements-specification.md`
> already fixed.

## Normative references

| Standard | Role |
| --- | --- |
| **ISO/IEC/IEEE 29148:2018** | Current standard — *Systems and software engineering — Life cycle processes — Requirements engineering*. Replaces the SRS portion of IEEE 830. |
| **ISO/IEEE 830:1998** | Historical standard — *IEEE Recommended Practice for Software Requirements Specifications*. Withdrawn, still cited; its section structure is the base of the template. |

In practice: write with the **bare template structure** (inherited from 830) and
meet the **29148 requirement-quality criteria** (unique, atomic, verifiable,
traceable, unambiguous, free of implementation jargon). In the file the client
reads, the obligation words are in the engagement working language. In Spanish:
**debe / no debe / debería / puede**. The bare template keeps shall / should / may.

## Template structure

Blank template: [`srs-bare-template.md`](srs-bare-template.md) — vendored from
[`jam01/SRS-Template`](https://github.com/jam01/SRS-Template) (`srs-template-bare.md`,
CC0 1.0, credited in the file header).

Sections (canonical order):

1. **Introduction** — document purpose, product scope, glossary, references, overview.
2. **Product Overview** — perspective, functions, constraints, user characteristics,
   assumptions and dependencies, apportioning.
3. **Requirements** — external interfaces, functional, quality of service (performance,
   security, reliability, availability, observability), compliance, design and
   implementation, AI/ML.
4. **Verification** — Requirement × Verification method × Evidence.
5. **Appendixes**.

Each file generated for the client says that the engineering standards are the
index of 36 norms
([`engineering-standards/index.md`](../engineering-standards/index.md))
and that the client does not operate them yet. Implementing them is part of the
value the consulting team adds in the deliverable. Do not write that the client
already adopts them, and do not present them as the norms of an internal codename.
The file does not list four code practices as if they were that index. This
specification does not rewrite the index.

## Language and voice

The bare template stays in English. The file the client reads is in the engagement
working language (default **Spanish**). The header uses `Preparado por` and
`Versión`. The first version of that file is **0.1**, and that number does not
continue the project-plan version series. A technical term with no plain equivalent
is glossed in the same section.

Voice follows
[CFM — Customer-facing management docs](../engineering-standards/customer-facing-management-docs.md):
descriptive prose, named subjects, no procedure imperatives. The file carries no
skill names, no `generated_by`, no dogfood, and no toolkit `ssot:` paths. A table
cell does not use `[[path|alias]]`.

## Output directory

Preference, when the vault follows `business-brain-template` or was scaffolded
from it:

```
plans/<YYYY-MM-DD>-plan-proyecto-<slug>.md          # SPMP, already its own file
projects/<slug>/requirements/
    ├── software-requirements-specification.md
    ├── requirements-checklist.md
    └── verification.md
```

Cross-links are Obsidian wikilinks, `[[plans/...]]` and
`[[projects/<slug>/requirements/...]]`. Inside a table cell, do not add an
alias: `[[path]]` only, because `|` splits the cell.

Fallback: a venture may refuse that template, or may not keep a separate brain
repo. Then write the filled files next to the customer documents that already
exist. Do not create a directory named `fractional-cto`. If neither the
template layout nor an existing customer folder is obvious, ask before writing.

## Skill flow

### Step 1 — Get the product context

Check whether the engagement vault already holds prior context (assessment, business
model vault, project folder, and so on). If it does, load that state and extract product purpose,
users, domain, constraints, and assumptions. If it does not, ask the user (Step 1b).

### Step 1b — Gather input (when it is missing)

Confirm with the user the minimum needed to write:

- Product name and version
- Purpose and boundaries (what it does / what it does not do)
- Users, roles, and access
- External integrations (APIs, prior systems)
- Compliance constraints (regulatory, accounting, privacy)
- Deadline / MVP milestones

### Step 2 — Write software-requirements-specification.md

Use `srs-bare-template.md` as the section shell. Fill each section per 29148:

- Verifiable requirements: `El sistema debe <observable behavior>` plus an
  acceptance criterion per requirement. When the engagement language is English,
  the form is `The system shall`.
- No implementation jargon in §3.2 (functional). Technical decisions go to §3.5
  (Design and Implementation) and to OpenSpec `design.md`.
- Each important functional requirement carries an ID (for example `FR-001`) for
  the verification table.
- Explicit quality-of-service requirements: performance, security, reliability,
  availability, observability.

### Step 3 — 29148 checklist and verification table

Generate `requirements-checklist.md`: for each requirement mark unique / atomic /
verifiable / traceable / unambiguous / implementation-free. Fill `verification.md`
with the method (test, user test, review, demo) and the artifact per requirement.

### Step 4 — Derive OpenSpec from the specification (not the reverse)

Once a human has approved the specification, derive:

- `openspec/config.yaml` — stack context.
- `openspec/specs/{domain}/spec.md` — requirements **derived** from the
  specification in OpenSpec form: each requirement with `MUST/SHALL/SHOULD`
  (RFC 2119) plus GIVEN/WHEN/THEN scenarios. Those words stay in the derived
  OpenSpec. They do not go back into the file the client reads.
- For each change: `openspec/changes/{slug}/{proposal,design,tasks}.md` —
  `proposal.md` cites the specification as the upstream source.

See [`openspec-quick-guide.md`](openspec-quick-guide.md) for the full `/opsx-*` flow.

### Step 5 — Linear issues (Bilingual Layer) and workflow

With the specification approved, create the Linear issue from
**bilingual-issue-brief.md** (see
`make-no-mistakes-toolkit/templates/bilingual-issue-brief.md`), assigning
Type/Size/Strategy from the tracker taxonomy. Then:

```
/opsx-explore (optional, think) → /opsx-propose → human review → /opsx-apply
→ new PR linked to the issue → /opsx-sync (optional) → /opsx-archive (human yes only)
```

### Step 6 — Hand off

Executive summary (Minto): one sentence for the decision, then the arguments and
the evidence. Paths of the files. Next action (step 5).

## Anti-patterns

1. **OpenSpec as the requirements source of truth** — the specification governs; OpenSpec is derived.
2. **Vague or unverifiable requirements** ("the system must be fast" violates 29148).
3. **Skipping the checklist** — each requirement passes unique / atomic / verifiable / traceable.
4. **Writing the specification already as implementation** — §3.2 is functional, not design; the "how" goes to §3.5 and to OpenSpec `design.md`.
5. **Generating the specification after the issues** — the order is software-requirements-specification.md → OpenSpec → issues → PRs.

## Final checklist

- [ ] Specification written from the bare template (830 structure), version 0.1
- [ ] Requirements with an ID, an obligation word in the engagement language, and an acceptance criterion (29148)
- [ ] Checklist unique / atomic / verifiable / traceable / unambiguous / implementation-free
- [ ] Verification table Requirement × Method × Evidence filled
- [ ] Human review of the specification before deriving OpenSpec
- [ ] OpenSpec derived from the specification (the proposal cites the specification as the upstream source)
- [ ] Linear issue with a Bilingual Layer brief plus taxonomy (Type / Size / Strategy)
- [ ] Workflow /opsx-propose → review → /opsx-apply → PR → /opsx-archive (with a human yes)
- [ ] The client file says the engineering standards (index of 36) are implemented as value of the deliverable, and that the client does not operate them yet

## Related

| Resource | Topic |
| --- | --- |
| [`srs-bare-template.md`](srs-bare-template.md) | Blank template (vendored from jam01, CC0) |
| [`openspec-quick-guide.md`](openspec-quick-guide.md) | `/opsx-*` flow and specification → OpenSpec derivation |
| [`../engineering-standards/index.md`](../engineering-standards/index.md) | Engineering standards index (36 norms) |
| [`../engineering-standards/customer-facing-management-docs.md`](../engineering-standards/customer-facing-management-docs.md) | Voice of the file the client reads |
| `jam01/SRS-Template` | Upstream template repo (CC0) |
| `Fission-AI/OpenSpec` | OpenSpec framework (docs/getting-started.md) |
