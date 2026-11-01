# The orchestrator's formal model (without needing to know TLA+)

This document explains **why** `/parallel-subagents` is accompanied by a formal
model (written in TLA+ and verified with the TLC model checker), and **what it
means** for you as someone using the orchestrator. You do not need to read or
understand TLA+ to use `/parallel-subagents` — this document exists so you know
*what* is being guaranteed and *why*.

---

## 1. The problem the model targets

When you launch several subagents in parallel, the danger is not that they
"clobber files" — that is already handled by **separate worktrees** (each agent
works in its own isolated directory).

The real danger is subtler: **two agents touch the same logical resource from
different files**, and the result is textually compatible but mutually
invalidating at the level of intent.

### Example

- Agent A changes `calculate_total()` to round to 2 decimals (a new billing
  requirement).
- Agent B changes `apply_discount()` to use the un-rounded total (it assumes the
  old behavior).
- Git merges the two files **with no textual conflict**. Tests pass. The system
  compiles.
- But in production, every invoice discounts against a total that no longer
  exists.

That is a **silent semantic conflict**: Git does not see it, tests do not see
it, and it only surfaces late — in production, or when a human reviews and
guesses which intent was correct.

---

## 2. Textual vs. semantic conflict

| Type | Does Git detect it? | Is it easy to resolve? |
|---|---|---|
| **Textual** — two agents touched the same lines | Yes, it flags it | Yes, mechanical |
| **Semantic** — textually compatible, intent-incompatible changes | **No** | Surfaces late and costly |

Resolving a *textual* conflict is cheap. Resolving a *semantic* conflict later
costs re-analysis, re-implementation of one (or both) branches, re-testing, and
the risk that in the meantime the system delivered incorrect behavior.

---

## 3. What the model does

The model is a **state machine** describing the orchestrator's flow:

```
init → harness_detected → graph_built → wave_dispatched → wave_gated → reviewed → finished
```

It declares **invariants**: rules that must hold in every reachable state. The
three main ones:

### INV1 — Capability gate
A wave is never dispatched (`wave_dispatched`) before verifying that the harness
and its tools exist. This avoids "firing blind" at an environment that is not
ready.

### INV2 — Overlap check
Two different waves never touch **the same logical resource** (not just the same
physical file). This is the rule that prevents the `calculate_total` /
`apply_discount` example.

### INV3 — No auto-merge
Finishing (`finished`) is always a human decision. The orchestrator never merges
on its own.

---

## 4. How to read a result

The **TLC** model checker explores all possible states of the model and checks
the invariants. Two possible outcomes:

- **"Model checking completed. No error has been found."** → the invariants
  hold across all possible behaviors of the orchestrator.
- **A counterexample** (a trace of states) → TLC found a sequence of steps that
  violates an invariant. That path is the **proof** that a gate is missing —
  and usually the exact clue about where to add it.

> Rule of thumb (from formal verification): *a check you have never seen fail
> proves nothing.* That is why the model deliberately includes "bad" actions
> (e.g. a dispatch that would allow overlap, an auto-merge) to demonstrate that
> TLC **can** detect them. Only once we know the verification can fail can we
> trust it when it passes.

---

## 5. When this actually matters

The model is not a magical requirement for every use of `/parallel-subagents`. It
is worthwhile when:

- Multiple agents touch a **shared core** (API, data schema, business
  invariants) — logical overlap is likely.
- The cost of a late conflict is high (billing, security, real concurrency, a
  production incident).
- Orchestration is a recurring team mechanism, not a one-off use.

It is **overkill** when:

- Tasks touch genuinely disjoint domains (UI vs backend, docs vs code) — logical
  overlap is unlikely and the cost of reworking a branch is low.
- The cost of writing and maintaining the model exceeds the expected cost of the
  conflicts it prevents.

The intuition of "do I really need this?" is correct and welcome. The model does
not replace human judgment: it **informs** it, by making explicit which risk is
(or is not) being verified.

---

## 6. Relationship to the rest of the stack

- `/ishikawa` analyzes an anomaly and proposes root causes.
- `/verify-evidence` proves a claim against real tools (Graphify, Open
  Ontologies, Specula).
- `/evidence-explicit-attribution` formats the evidence with its chain.
- This formal model contributes the *preventive* piece: it verifies the
  orchestration **before** the problem occurs, instead of detecting it after.

---

## 7. Where the model lives

The orchestrator's TLA+ model (`orchestrator.tla` + `orchestrator.cfg`) is a
prototype. Before it is considered part of the `/parallel-subagents` deliverable,
it must go through the same process as everything else: the gate discipline
(stderr, hashes), an OpenSpec change, and dogfood.
