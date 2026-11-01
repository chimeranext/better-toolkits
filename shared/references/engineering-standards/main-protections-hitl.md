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
7. **CODEOWNERS is mandatory for any reviewed branch.** A branch protected by a
   review gate SHALL have a `CODEOWNERS` file (repository root or `.github/`)
   that references at least one **team** (not only individual logins) as the
   `*` owner, so the required review has a concrete team to auto-assign. If the
   owning team does not exist, create it under the owning organization with the
   maintainers as members, then assign it as the `*` owner. This closes the gap
   where a ruleset requires a review but no reviewer is ever assigned.
8. **CODEOWNERS has a canonical SSOT and is replicated, not authored per-repo.**
   The policy source of truth is a single `CODEOWNERS` file in an organization
   governance repository (e.g. `acme-studio/org-gate`). Every repository with a
   review-gated branch SHALL carry a `CODEOWNERS` **derived** from that SSOT.
   No repository's `CODEOWNERS` is hand-authored independently; it is a mirror.
   An organization-level automation (e.g. a GitHub App with `contents: write`
   and org admin scope) replicates the SSOT to every target repository, so the
   policy is defined once and enforced everywhere.

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
- **CODEOWNERS replication (org admin App):** the canonical source lives in the
  governance repo (`org-gate`, e.g. `acme-studio/org-gate`). The App (e.g.
  `acme-studio-org-admin-tool`, scopes
  `contents: write`, `administration: write`, `organization_administration:
  write`) replicates it:
  1. **Source step** — read `.github/CODEOWNERS` from the governance repo
     (the SSOT). The file uses a template token for the org, e.g.
     `* @{{ORG}}/founders`, so its content resolves per target organization.
  2. **Validation step** — before writing anywhere, resolve the token and verify
     the referenced team exists in the target org (`gh api
     /orgs/{org}/teams/{team}`); abort on a missing team instead of writing a
     broken file.
  3. **Push step** — for each target repo, write `. github/CODEOWNERS`:
     - if the default branch is unprotected → direct commit via the App
       (`contents: write`);
     - if the default branch is review-gated → open a **PR** (same contents
       scope) so the change passes the repo's own review gate; never bypass the
       ruleset with admin write.
  4. **Drift step** — compare the target's current file to the derived content;
     write only when they differ (no churn, no empty commits).
- **Additive, never overriding:** the replicated `CODEOWNERS` is the baseline
  for all paths. A repository MAY append per-repo owner lines below the `*`
  baseline, but the `*` team owner comes from the SSOT and is never removed.

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
