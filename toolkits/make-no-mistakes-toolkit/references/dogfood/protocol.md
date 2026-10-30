# /dogfood — Protocol SSOT

Conceptual slash command (`/dogfood`): practice of using your own product internally before launching (`eating your own dog food`). Not a file-based restriction-check script, not a `BLOCKED (§5 NEVER merge)` gate, not a static verification file.

References: https://bubble.io/blog/dogfooding-startup-tech/ · https://blog.jetbrains.com/life-at-jetbrains/2026/05/dogfooding-at-jetbrains/ · https://testomat.io/blog/what-is-dogfooding-a-complete-guide/

---

## Purpose

Confirm the product the developer is currently working on works with **real configuration values** — not placeholders (`REPLACE_WITH_*`), not dummy defaults, not `exit 0` with empty output.

> **"Real configuration values"** = the actual values the product needs to operate against a real system. This includes authentication credentials (tokens, API keys, IAM) *when the product authenticates*, but is not limited to them: endpoints, resource IDs, scopes, tenants, regions, and env config also count. The test is "does it respond actively", not "do I hold a credential".

---

## Precondition — real configuration values required (generic pattern)

A component-specific environment file must exist locally with real configuration values collected via `/secret-input` — never in the repo. Scope or permission selection must be opt-in (not hardcoded). See separate instance docs for concrete form fields, checklist, or env format.

---

## Scope selection (component-specific opt-in)

Select scopes or permissions via checklist. Results are written to the environment file. See instance docs for checklist format.

---

## Verify the product works

Confirm the product the developer is currently working on loads correctly and connects with real configuration values. Verify through the harness, native command, or appropriate verification mechanism for the product type. The result must show active functionality — not a silent empty exit (`exit 0` with no output).

---

## Confirm connection (conditional — generic)

Verify the product connects with real configuration values — active functionality, not an empty success (`exit 0` with no output). The verification method depends on the product type.

---

## Cross-platform notes

Linux (`zenity` / `kdialog` native), macOS (`brew install zenity` / `osascript` / `kdialog` fallback), Windows (`powershell` checklist / WSL `zenity`). The local environment path is consistent across platforms.

---

## What failure looks like (and is NOT dogfooding)

- `REPLACE_WITH_*` still in env → not real configuration values.
- Component environment file missing → no auth source.
- Empty `exit 0` with no output → product loaded but did not respond.
- Connection fails or needs auth → flow incomplete.
- An assertion is written without observable evidence → not a BDD pass.
- An anomaly is detected and the verification continued anyway → Jidoka failure.
- An assertion passes only by silencing a signal (stderr, cast, swallowed error,
  arbitrary delay, monkey-patch) → No-Workarounds failure.

The real test: with real configuration values and correct opt-in selection, the product responds — it does not exit silently.

---

## Behavior-driven verification (BDD)

**Sources** — this protocol consumes two SSOT files; you do not navigate them by hand:
- Gates (Jidoka / No-Workarounds) — `assurance-toolkit/references/testing/e2e-protocol.md`.
- Multi-language matcher translation (Chai/Jest/pytest/Dart/…) — `conventions/matcher-contract.md`.

Confirm the product **behaves** as specified, expressed as natural-language assertions —
not raw technical asserts. Format every claim as:

```
Given <real precondition>
When  <I exercise the real path>
Then  <observable behavior is true>
      <evidence: observed output, not a string>
```

Rules:

- **Given** states the real configuration precondition (credential/endpoint/scope).
- **When** exercises the real, active code path — not a mock, not a stub.
- **Then** asserts the behavior in natural language and names the concrete observed evidence.
- Every assertion is **falsifiable**: it states what would falsify it.
- A "Then" that cannot be tied to observed evidence is not a pass.

---

## Jidoka gate — stop on anomaly

If any assertion fails, or an anomaly is detected (unexpected output, error, timeout,
empty response), the verification **STOPS**. Record:

1. The exact anomaly (observed behavior vs expected).
2. The owning boundary where the signal was lost or distorted.
3. The root-cause hypothesis (5-Whys) before any fix.

The verification is not passing until the anomaly's cause is understood and the source
corrected — not merely suppressed.

---

## No-Workarounds gate — a suppressed signal is a failure

Each assertion must be satisfied **without** a workaround. The verification FAILS if
passing required:

- Silencing stderr/stdout to hide an error.
- Casting/ignoring a type error instead of fixing the type truth.
- Swallowing an exception in a catch block.
- Adding an arbitrary delay/retry to "wait for it to settle".
- Monkey-patching a boundary you do not own.
- Copy-paste "adaptation" that does not actually fit.

The `Escape Valve` applies only when the root cause is genuinely external and the
workaround is isolated, commented, tracked with a canary test and a review date — and
even then the assertion must state the external limitation explicitly.

---

## Local validation prerequisite

This protocol assumes a mechanism already exists for validating credentials locally (e.g., `supabase` CLI local-development workflow for project-level auth). See `https://supabase.com/docs/guides/local-development/cli-workflows#move-an-existing-project-to-local-development` for an example of local credential validation before `/dogfood` runs.
