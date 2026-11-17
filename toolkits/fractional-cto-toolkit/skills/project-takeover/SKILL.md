---
name: project-takeover
description: >
  Conversational interview (one question at a time). Emits the takeover pack
  only after explicit approval: CTO playbook (when/why), Diátaxis client guide,
  formal delivery request, and breach notice. Use when the user mentions
  "takeover", "handover", "transferencia de proyecto", "project transfer",
  "code handover", "el dev anterior", "me pasaron un proyecto", "asumir un
  proyecto", "recibir un proyecto", "onboarding de proyecto", or when risk
  assessment is done and operational handover docs are needed.
  CTO artifact is a PLAYBOOK (/playbook-authoring), not an SOP.
  NOT for deep risk assessment (/takeover-assessment), contracts, or
  SPMP/16085 (/contract-psa + Milestone 1). Generic ops:
  /document-this → /playbook-authoring|/runbook-authoring|/sop-authoring.
---

# project-takeover

English ASD-STE100 skill body. Protocol SSOT (also STE100):
[`references/project-takeover/protocol.md`](../../references/project-takeover/protocol.md).

## Purpose

Interview the human. Calibrate handover risk. Emit four pack files under
`./fractional-cto/takeover/` only after an explicit yes.

## Emits (slug at the end)

1. `playbook-{slug}.md` — CTO when/why. Adapt from `01-takeover-playbook.md`.
2. `client-guide-{slug}.md` — Diátaxis ×4 for the lead. Fill `02-client-guide.md`.
3. `legal-template-delivery-request-{slug}.md` — signed at the meeting.
4. `legal-template-breach-notice-{slug}.md` — counsel draft on breach.

## Apprentice bare outlines

These show expected shape in better-toolkits. Do not copy them to the client folder.

- `references/01-takeover-playbook-bare.md`
- `references/02-client-guide-bare.md`
- `references/legal-template-delivery-request-bare.md`
- `references/legal-template-breach-notice-bare.md`

## Hard rules

- Follow the protocol step by step. Do not skip the Step 3 approval gate.
- Do not write files before an explicit yes.
- CTO artifact is a playbook. It is not an SOP. It is not a runbook.
- Do not emit SPMP or 16085 here. Point to `/contract-psa` after the pack.
- Fill tokens use `{{PLACEHOLDERS}}`. Do not use `[[…]]` for fills.

## Out of scope

- Deep risk assessment → `/takeover-assessment`
- Contracts → `/contract-nda`, `/contract-psa`, `/contract-retainer`
- Generic ops typing → `/document-this`
