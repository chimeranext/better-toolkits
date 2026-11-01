# AFIF — Anti-Fragility via Fault Injection (doctrine)

> A check you have never seen fail proves nothing. A system that has never been
> stressed has never been hardened.

## Sigla

**AFIF** — Anti-Fragility via Fault Injection.

## Purpose

The goal is not "to prove a check can fail" (that is only the mechanism). The
goal is **anti-fragility** — systems that *strengthen* when injected with
faults, across **every layer of abstraction**. An anti-fragile system does not
merely survive perturbation; it improves because of it, since each injected
failure exposes and closes a weakness. This doctrine is grounded in Nassim
Nicholas Taleb's *Antifragile*: some systems gain from disorder, volatility, and
stress, and grow stronger under pressure.

## Doctrine

### 1. The triad: fragile / robust / anti-fragile

Every component, gate, or process can be classified along the triad:

| Type | Behavior under stress | Under our practice |
|---|---|---|
| **Fragile** (Damocles) | damaged or destroyed by shocks | the defect we must remove |
| **Robust** (Phoenix) | survives stress unchanged | the minimum acceptable bar |
| **Anti-fragile** (Hydra) | *grows* and improves under stress | the target state |

A verification artifact that is merely robust has never been hardened. We aim
for the Hydra: each injected fault should leave the system with a new defense it
did not have before.

### 2. Anti-fragility > resilience

Resilience = the system survives the fault (does not fall over).
Anti-fragility = the system becomes *better* after the fault.

Fault injection is the *training*; anti-fragility is the *outcome*: every
injected failure must leave the system with a permanently stronger defense — a
new gate, a new test, a new standard.

### 3. Domain dependence

A system can be anti-fragile in one domain and fragile in another. The doctrine
therefore applies **per layer**: a check that is anti-fragile at the code level
may say nothing about the infrastructure level. We classify and harden each
layer in its own domain.

### 4. Asymmetry (convexity)

Anti-fragile systems exhibit **asymmetric payoffs**: the potential gain from a
stressor exceeds the potential harm. Under AFIF, an injected fault is a convex
bet — the cost of running the negative case is small, while the benefit of
discovering a missing gate is large. This asymmetry is why the practice is worth
it: the downside is bounded (a failing test), the upside is unbounded (catching
a production-harming defect early).

### 5. Optionality (experimentation over rigidity)

Taleb's optionality argues for experimentation over rigid designs. AFIF
follows: the injected-fault cases are cheap, bounded experiments that give us
the *option* to discover weaknesses. We do not need to predict where the
weakness is — we sample it adversarially.

### 6. Skin in the game

Every injected-fault discovery must have a clear "owner" who is exposed to the
cost of the weakness (the gate author, the subsystem owner, the reviewer). If no
one is accountable for closing the weakness the fault revealed, the injection
has no teeth. The negative case is not a formality — it is a transfer of
fragility from the system to the owner, who must act.

### 7. The golden rule (the mechanism)

A check that has never failed is not proven — it is unproven. Therefore every
gate, invariant, test suite, or formal model must include **at least one
deliberately negative case** (a mutation, a violation, an injected fault) and
demonstrate that it detects it.

### 8. Injection layers (all abstractions)

The same principle applies at every level:

| Layer | Fault injection | What is hardened |
|---|---|---|
| **Code** | mutation testing: mutate a guard, invert a comparison, delete a return | the test suite (detection) |
| **Formal models** | verifier self-test: break an invariant in TLA+ | the model checker (must produce a counterexample) |
| **Infrastructure** | chaos engineering: kill instances, latency, network partition | runtime resilience |
| **Gates/processes** | inject a forbidden input (stderr pattern, hardcoded hash) | the gate (must block, exit ≠ 0) |
| **Orchestration** | launch tasks with deliberate logical overlap | the orchestrator (must sequence / detect) |

Each layer uses the same adversarial pattern — *fault injection* — but on the
abstraction that corresponds to it. The anti-fragility of the whole system is the
sum of the anti-fragility of each layer.

### 9. "Never seen fail" is not a pass

A check that has never failed SHALL be treated as **unverified**, not as green.
When adding a new gate, the negative case travels in the same change; until it is
demonstrated, the gate is provisional.

### 10. Mandatory strengthening (the anti-fragile close)

Each injected fault that is detected must leave a **permanent defense**:
- the negative test remains recorded (never deleted),
- the gate/standard that detects it is documented,
- the finding feeds the root-cause analysis (`/ishikawa`) — it is not discarded
  as "just a test".

If an injected fault is detected but produces no permanent improvement, the
injection did not fulfill its anti-fragile purpose.

### 11. Relationship to other standards

- **Jidoka** → stop on anomaly; AFIF proves the stop actually triggers.
- **StS** → the stderr gate must be demonstrated to block a forbidden redirect.
- **No-Workarounds** → a suppressed signal is a failure; AFIF requires proving
  the detection path is not suppressed.
- **QT4L** → traceability includes the negative demonstration per requirement.
- **Former name (AVV)** → this doctrine is the evolution of "Adversarial
  Verification": the mechanism remains adversarial, but the declared goal is
  anti-fragility, not mere verification.

## Consequence

- New gates ship with their negative case in the same change.
- A formal model is not "verified" until its counterexample path has been seen at
  least once.
- Reviewers ask, for any new check: "show me it failing."
- Every detected injected fault leaves a permanent defense (test, gate,
  standard, or root-cause finding) — that is the anti-fragile close.
