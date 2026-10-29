---
description: "Dogfooding — confirm the product you are currently working on works with real credentials and active functionality (eat your own dog food). Generic; follow the SSOT protocol. Not bound to a specific framework."
argument-hint: ""
priority: 85
---
# /dogfood

Dogfood the work in progress: read and follow [`references/dogfood/protocol.md`](../references/dogfood/protocol.md) (protocol SSOT).

Purpose: confirm the component you are building **responds with real credentials** — not
placeholders, not a silent `exit 0`.

Steps (per protocol):

1. Real credentials env exists locally (via `/secret-input`); no `REPLACE_WITH_*`.
2. Scope/permissions selected opt-in (not hardcoded).
3. Product loads and connects — active output, not silent success.
4. Report what was verified: component, credential source, observed response.

This is **not** `/ready-to-review-mergeable` verification. That readiness gate has its own
command and step-by-step evidence format; do not conflate the two.
