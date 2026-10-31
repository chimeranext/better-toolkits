# /dogfood — Protocol SSOT

Conceptual slash command (`/dogfood`): practice of using your own product internally before launching (`eating your own dog food`). Not a file-based restriction-check script, not a `BLOCKED (§5 NEVER merge)` gate, not a static verification file.

References: https://bubble.io/blog/dogfooding-startup-tech/ · https://blog.jetbrains.com/life-at-jetbrains/2026/05/dogfooding-at-jetbrains/ · https://testomat.io/blog/what-is-dogfooding-a-complete-guide/

---

## Purpose

Check that the product the developer is currently working on works with **real configuration values** — not placeholders (`REPLACE_WITH_*`), not dummy defaults, not `exit 0` with empty output.

> **"Real configuration values"** = the actual values the product needs to operate against a real system. These values include authentication credentials when the product authenticates. They also include endpoints, resource IDs, scopes, tenants, regions, and env config. The test is "does it respond actively", not "do I hold a credential".

---

## Precondition — real configuration values required (generic pattern)

A component-specific environment file must exist locally with real configuration values collected via `/secret-input` — never in the repo. Scope or permission selection must be opt-in (not hardcoded). See separate instance docs for concrete form fields, checklist, or env format.

---

## Scope selection (component-specific opt-in)

Select scopes or permissions via checklist. Write the results to the environment file. See instance docs for checklist format.

---

## Check the product works

Check that the product the developer is currently working on loads and connects with real configuration values. Check through the harness, native command, or the appropriate mechanism for the product type. The result must show active functionality — not a silent empty exit (`exit 0` with no output).

---

## Check connection (conditional — generic)

Check that the product connects with real configuration values. Show active functionality, not an empty success (`exit 0` with no output). The check method depends on the product type.

---

## Cross-platform notes

Linux (`zenity` / `kdialog` native), macOS (`brew install zenity` / `osascript` / `kdialog` fallback), Windows (`powershell` checklist / WSL `zenity`). The local environment path is consistent across platforms.

---

## What failure looks like (and is NOT dogfooding)

- `REPLACE_WITH_*` still in env → not real configuration values.
- Component environment file missing → no auth source.
- Empty `exit 0` with no output → product loaded but did not respond.
- Connection fails or needs auth → flow incomplete.

The real test: with real configuration values and right opt-in selection, the product responds — it does not exit silently.

---

## Jidoka stop → route to /ishikawa

When a `/dogfood` check detects an anomaly, do NOT just patch the symptom and
continue. An anomaly is a Jidoka stop: unexpected output, an error, an empty
response, or a suppressed signal. Route the anomaly through **`/ishikawa`** to
identify the root cause. Fix **both** the root cause and the symptom, in that
order. This is a hard stop: the check does not pass until the cause is
understood and fixed at the source.

---

## Related standards (SSOT pointers)

This protocol builds on the shared engineering standards. Read them before you
write evidence or fix an anomaly:

- **StS** (stderr/stream): evidence must come from a real captured log. Never
  silence stderr to pass a check.
  `shared/references/engineering-standards/stderr-stream-standards.md`
- **Jidoka**: stop on anomaly and record boundary + hypothesis before continuing.
  `shared/references/engineering-standards/jidoka.md`
- **/explain §4.5 (ASD-STE100)**: write the dogfood report with controlled
  language (short sentences, active voice, one meaning per word).
- **Verification chain**: `/verify-evidence` runs the real tool and
  `/evidence-explicit-attribution` formats the evidence (observed vs inferred).
  A dogfood PASS is only as strong as its observable evidence.

Never duplicate these texts here. Reference them by path.

---

## Local validation prerequisite

This protocol assumes a mechanism already exists for validating credentials locally (e.g., `supabase` CLI local-development workflow for project-level auth). See `https://supabase.com/docs/guides/local-development/cli-workflows#move-an-existing-project-to-local-development` for an example of local credential validation before `/dogfood` runs.
