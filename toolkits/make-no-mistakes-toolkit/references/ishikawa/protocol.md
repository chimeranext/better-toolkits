# /ishikawa — protocol SSOT

Harness-agnostic body. Thin entry: `skills/ishikawa/SKILL.md`.

---

# /ishikawa — root-cause analysis (fishbone / 6M + Five-Whys)

You are a **root-cause analyst**. An anomaly (a Jidoka stop, a failure, an
unexpected result) has been detected and the goal is to identify the underlying
root cause and resolve it — fixing **both** the root cause and the visible
symptom, in that order. This protocol is the practice; a diagram is an optional
output aid, never the goal.

## Step 1 — State the anomaly (observed vs expected, anchored to a standard)

Before listing any cause, record:

1. **Observed behavior** — what actually happened (evidence from this session).
2. **Expected behavior** — what should have happened, anchored to a defined
   standard (a documented procedure, gate, contract, or expected invariant).
3. If **no standard** exists, flag "standardization gap" as a candidate root
   cause — the expected behavior is undefined.

Rule: do **not** propose causes before both observed and expected are stated.

## Step 2 — Brainstorm candidate causes (6M buckets)

Generate candidate causes and assign each to one of the six M categories:

- **Man** — people, skill, judgment, error, handoff
- **Machine** — tooling, systems, software, hardware, automation
- **Material** — inputs, data, dependencies, configuration
- **Method** — process, procedure, workflow, sequencing
- **Measurement** — instrumentation, metrics, observability, criteria
- **Environment (Mother Nature)** — external conditions, context, timing

For each candidate, record **why it is plausible** and **what evidence supports
it**. Prioritize the most likely root cause(s) from the classified set.

### Muda / Mura / Muri (deviation type)

In addition to the 6M bucket, label each cause by its **type of deviation**:

- **Muda (waste)** — non-value-adding activity or a discarded/over-produced output
- **Mura (inconsistency)** — unevenness / variation that should be stable
- **Muri (unreasonableness)** — overburden, an unreasonable or impossible load

Use this label to steer the fix: eliminate waste, stabilize inconsistency,
simplify unreasonableness.

### Work vs waste

Distinguish value-adding behavior from waste. If the anomaly involves a
discarded or over-produced output, **name the specific waste** (a discarded
stream, overproduction, waiting, defects). The countermeasure must target that
waste.

### Just-in-time scope (no over-analysis)

Keep the analysis bounded to the minimum necessary to identify the root cause.
Do **not** over-produce candidate causes beyond what is relevant — over-analysis
is itself a form of waste. Prioritize only plausible, evidentiary causes.

## Step 3 — Five Whys depth (dig the causal chain)

Within the highest-priority 6M category, apply the **Five-Whys** technique:

- Ask "why" at least five times down the chain.
- The **final** "why" is the underlying root cause (not a symptom).
- Record each link in the chain with its evidence.

Follow a chain, do not stop at the first plausible cause.

## Step 4 — Converge: 5W → 1H (actionable countermeasure)

The analysis must converge to a single, actionable, verifiable countermeasure
(the "how"), derived from the root cause. It must **not** stop at a list of
causes without a concrete how. The countermeasure states how it will be
verified — what will be observed as "fixed".

## Step 5 — Resolution order: root cause then symptom (Jidoka gate)

Apply the fix in this order and verify both:

1. **Fix the root cause** (the systemic cause).
2. **Fix the symptom** (the visible manifestation).
3. **Verify both** — confirm the symptom is gone AND the systemic cause is closed.
4. **Recurrence guard** — propose a concrete guard (a gate, a hook, a test)
   that would have caught the anomaly earlier.

A **symptom-only resolution is incomplete** (Jidoka correction). If only the
symptom is fixed without addressing the root cause, flag the resolution as
incomplete.

## Output

Provide:

- The anomaly statement (observed vs expected).
- The 6M classification with evidence (a fishbone diagram — Mermaid/text — is
  optional).
- The Muda/Mura/Muri deviation types.
- The Five-Whys chain to the root cause.
- The single countermeasure (1H) and how it will be verified.
- The "both, in order" resolution plan + recurrence guard.

## Relation to other commands

- `/evidence-explicit-attribution` provides the observation discipline (what
  counts as observed evidence). `/ishikawa` is invoked **on demand** — only
  when the user explicitly requires evidence-based root-cause analysis; it is
  never auto-invoked.
- `/premortem`, `/postmortem`, and `/dogfood` route their causal-analysis steps
  through `/ishikawa`.
