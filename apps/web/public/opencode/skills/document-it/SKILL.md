---
name: document-it
description: >
  Alias of `document-this` — decide what KIND of operational document to write (SOP,
  playbook, or runbook) and route to the matching authoring skill. Use `/document-it`
  interchangeably with `/document-this` for any "I want to document X" request, or
  when unsure "SOP or playbook or runbook". Identical behavior: it is a thin dispatcher
  that runs the three-way ops taxonomy routing, names the type and its canonical home,
  and hands off to /sop-authoring, /playbook-authoring, or /runbook-authoring. NOT an
  authoring skill itself — it never writes the document. NOT for security-test plans
  (that is /pentest-playbook-setup).
---

# Document-It (alias)

This is an alias of the **`document-this`** skill. It exists for discoverability and
for callers that prefer `/document-it`. It behaves exactly like `document-this`.

The single source of truth is [`document-this/SKILL.md`](../document-this/SKILL.md)
and [`references/documentation-taxonomy.md`](../../references/documentation-taxonomy.md).

## Behavior

Follow `document-this` verbatim:

1. Load the taxonomy (`references/documentation-taxonomy.md`).
2. Capture the user's intent (not the file name).
3. Run the decision tree: SOP / playbook / runbook (or Diátaxis for a site/handbook).
4. Name the type, canonical home, and the authoring skill to invoke.
5. Route; never author the document yourself.

## Routing

- **SOP** → `/sop-authoring` → corporate handbook / business brain.
- **Playbook** → `/playbook-authoring` → the unit/repo.
- **Runbook** → `/runbook-authoring` → the repo/system.
- **Site/handbook** → Diátaxis quadrants (Tutorials / How-to / Reference / Explanation).

## Notes for the model

- `/document-it` never authors. It only routes. If you find yourself writing the
  document, stop and delegate to the matching authoring skill.
- Do not invent a type. If ambiguous, ask one clarifying question before routing.
- Use the Acme universe for examples, as `document-this` does.
