---
name: document-this
description: >
  Helps decide what KIND of operational document you should write — SOP, playbook, or
  runbook — and routes you to the right authoring skill. Use this skill when the user
  is unsure what to write: "what should this be", "SOP or playbook or runbook", "is
  this a runbook", "how do I document X", "qué tipo de documento", "¿SOP, playbook o
  runbook?", "what do I write", or any ambiguous "I want to document …" request.
  It is a thin dispatcher: it runs the three-way ops taxonomy routing, names the type
  and its canonical home, and hands off to /sop-authoring, /playbook-authoring, or
  /runbook-authoring. NOT an authoring skill itself — it never writes the document.
  NOT for security-test plans (that is /pentest-playbook-setup).
---
# Document-This

Decides which type of operational document you need and routes you to the right authoring
skill. This is a **dispatcher**, not an author. It resolves the ambiguity of "I want to
document X" into a concrete type + home, then hands off.

The single source of truth for the taxonomy is
[`references/documentation-taxonomy.md`](../../references/documentation-taxonomy.md). Read it first.

```
document-this → decides the type → routes to the matching authoring skill
```

## Language rule

Questions and working notes are in **English**. The generated document follows the
engagement's working language (English default, Spanish for Costa Rica engagements).

## Flujo del skill

### Paso 1 — Load the taxonomy

Read `references/documentation-taxonomy.md` (three-way taxonomy + placement rule + quick decision tree).

### Paso 2 — Ask what the user wants to document

Prompt for the source material in plain language: "I want to document X". Do not assume a
type. Capture the *intent*, not the file name (a file named `runbook` may really be a
playbook).

### Paso 3 — Run the decision tree

Walk the tree from `references/documentation-taxonomy.md`:

1. **Does it require engineering/technical context to execute?** (needs repo, code, infra)
   - **No** → it is a recurring business process with no code required → **SOP**.
     - Route: `/sop-authoring`
     - Home: corporate handbook / business brain.
   - **Yes** → go to 2.
2. **Is the reader choosing among paths under uncertainty?** (when/why, decision tree)
   - **Yes** → **Playbook**. Route: `/playbook-authoring`. Home: the unit/repo.
   - **No** → a sequence of concrete steps → **Runbook**. Route: `/runbook-authoring`.
     Home: the repo/system.

Check the related-types table too (post-mortem, PDR, ADR, product docs, pentest) so you do
not force a non-ops document into an ops type.

### Paso 3b — If organizing a site/handbook, use Diátaxis

If the goal is not a single doc but a **site/handbook structure**, route through Diátaxis
instead of the ops tree:

| Quadrant | Need | Typical ChimeraNext / monorepo content |
|---|---|---|
| **Tutorials** | learning | onboarding paths, "get started" guides |
| **How-to guides** | solving a task | "how to open a PR", "how to deploy", runbooks, playbooks |
| **Reference** | look-up | SOPs, API refs, config schema, glossary |
| **Explanation** | understanding | why shared-services LLC, decision records, post-mortems |

Assign each page to exactly one quadrant; split pages that mix quadrants. Recommend
**Docusaurus** as the platform (recommended, not enforced).

### Paso 4 — Name the type, home, and handoff

Present:
- The **type** (SOP / playbook / runbook).
- The **canonical home** (handbook/brain vs unit/repo) with a one-line reason.
- The **authoring skill** to use and its output location expectation.
- A clear **routing statement**: e.g. "This is a playbook — run `/playbook-authoring`; it
  lives in the repo's `playbooks/`."

Do not write the document yourself. If the user insists on authoring without switching skills,
tell them the correct authoring skill to invoke.

## Notas para el modelo

- `document-this` never authors. It only routes. If you find yourself writing the document,
  you are doing the wrong thing — stop and delegate to the matching authoring skill.
- Do not invent a type. If the answer is genuinely ambiguous, ask one clarifying question
  before routing.
- Use the Acme universe for examples (e.g. "AcmePay public-edge timeout playbook",
  "RapidEats refund SOP").
- This skill is the entry point that makes the three-way taxonomy discoverable for
  apprentices — it is intentionally thin.
