# MPH — Main Protections & HITL Merge Guard (doctrina)

## Purpose

Make merging to the default branch (`main`) **fail-closed by design**: even a
mistake by an authorized person (a founder, an admin, a bot) must be blockable.
The control is layered: policy (ruleset), identity (2FA), and tool boundary
(pre-execution human approval). Startup-agnostic.

## Doctrine

1. **Default branch is protected by a ruleset**, not by convention:
   - Only a small, named team may bypass (e.g. `founders`). No other actor.
   - Required reviews, status checks, and **linear history** are always on.
   - Direct pushes to the default branch are forbidden; changes arrive via PR.
2. **Bypass is an exception, not a right.** The bypass team exists to unblock
   genuine bottlenecks — not to skip quality. Every bypass must be possible to
   audit.
3. **Identity is enforced org-wide.** 2FA is required for all members of the
   organization, including the bypass team.
4. **Tool boundary guard:** a pre-execution hook intercepts any "bypass/admin"
   merge attempt (e.g. `gh pr merge --admin`) and requires **interactive human
   approval** (e.g. pkexec/sudo prompt) before the command runs. The approval is
   short-lived (TTL), root-owned, and never silent. If the prompt is declined or
   unavailable, the merge is **blocked** — ambiguity blocks.
5. **Audit trail:** every approval and every bypass leaves a trace (marker
   timestamp, actor, command). Revoke is explicit and immediate.

## Failure modes this prevents

- Accidental `--admin` merge (fat-finger) by a founder/admin.
- Stale or pre-approved bypass used later (TTL prevents).
- A hidden or hardcoded bypass (no environment-variable shortcuts; interactive
  elevation required).
- Non-founders bypassing protections (ruleset allows only the named team).
- Forced pushes / squash history loss (linear-history + no force-push).

## Application (generic)

- **Ruleset:** name it after the guard team (e.g. `main-founders-only`);
  `bypass_actors` = that team only; rules include `pull_request` (≥1 review,
  thread resolution, last-push approval), `required_status_checks` (strict),
  `deletion`, `non_fast_forward`, `required_linear_history`.
- **Per-repo status contexts:** `required_status_checks` may include repo-specific
  contexts (e.g. `prds-check`). Keep branch rulesets complementary: use one
  ruleset per protected branch, and never overlap the same branch across
  rulesets (e.g. a `PRDS gate` for `develop`/`staging`, and the main guard for
  `main`).
- **Tool-boundary hook:** intercept the bypass/admin command; require interactive
  root elevation to mint a fresh approval marker; check TTL; fail-closed.
- **Org policy:** enforce 2FA for every member.

## Example (implementation-agnostic pseudocode)

```text
on tool-use command C:
  if C matches merge-with-bypass/admin and target is default branch:
    require fresh root-approved marker (TTL 5 min)
      created by interactive elevation (pkexec/sudo)
    if not approved or marker missing/stale: BLOCK
```

## References

- Relates to **BrS** (branching protection), **HITL** doctrine, and
  **SemVer** (merge-queue enforcement).
- A working implementation of the tool-boundary guard pattern lives in
  better-toolkits (`shared/hooks/tooluse/approve-admin-merge.sh`), but this
  standard is generic and not tied to that repo.
