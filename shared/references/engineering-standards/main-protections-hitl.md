# MPH — Main Protections & HITL Merge Guard (doctrina)

## Purpose

Make merging to the default branch (`main`) **fail-closed by design**: even a
mistake by an authorized person (a founder, an admin, a bot) must be blockable.
The control is layered: policy (ruleset), identity (2FA), and tool boundary
(pre-execution human approval). Startup-agnostic.

## Doctrine

1. **Default branch is protected by a ruleset**, not by convention:
   - Only a small, named team may bypass (e.g. `founders`). No other actor.
   - Required reviews and status checks are always on.
   - Direct pushes to the default branch are forbidden; changes arrive via PR.
   - **Merge method by flow (GitFlow):** feature branches integrate into `develop`
     by **rebase** (linear). `develop` integrates into `main` by **merge commit**
     (first-parent traceability). Squash is always forbidden (NSQ).
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
6. **Approval concentration (release cut):** human approval concentrates at the
   **release cut** (`develop`→`main`), not per feature PR. The CTO owns the QA
   audit (QT4L). The CTO opens the single consolidated cut PR. A **second human
   reviewer** (a founder) is the single approval gate to PROD (REL). Feature PRs
   to `develop` do not require founder review. CI + audit GGT + PRDS gate them.

## Failure modes this prevents

- Accidental `--admin` merge (fat-finger) by a founder/admin.
- Stale or pre-approved bypass used later (TTL prevents).
- A hidden or hardcoded bypass (no environment-variable shortcuts; interactive
  elevation required).
- Non-founders bypassing protections (ruleset allows only the named team).
- Forced pushes (no force-push) and squash merges (NSQ).

## Application (generic)

- **Ruleset:** name it after the guard team (e.g. `main-founders-only`);
  `bypass_actors` = that team only; rules include `pull_request` (≥1 review,
  thread resolution, last-push approval, `allowed_merge_methods` = `merge` on
  `main`), `required_status_checks` (strict), `deletion`, `non_fast_forward`.
  No `required_linear_history` on `main` (merge commits are allowed there);
  rebase is the convention for feature→`develop`.
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
