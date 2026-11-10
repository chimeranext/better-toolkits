# Runbook — Software project takeover recover

| Field | Value |
|---|---|
| **Process** | Read-only diagnose of ownership risk, then recover custody of code and credentials for a software project handover |
| **Trigger** | `/project-takeover` playbook branch §A / §B / §C picked. Assessment done. Legal pack ready or in parallel |
| **Who can run it** | Fractional CTO / takeover lead |
| **Stewards** | Fractional CTO practice. Client technical lead |
| **Command / entrypoint** | `diagnose-project-takeover.sh` then `recover-project-takeover.sh` |
| **Channels** | announce: client lead channel · incidents: counsel when wipe risk is open |
| **Applies to** | GitHub/GitLab orgs, cloud accounts, DNS. Acme-style generic. No hostnames invented |

> ⚠ **Reader's summary** — Confirm who owns git, cloud, and DNS **before** outreach.
> If the prior developer can wipe production, fork or back up first. Rotate
> credentials only after backup. Prove client org owns the canonical remote.
> Pair with `01-takeover-playbook.md` for when/why.

> **Bus-factor-1.** Written assuming the reader operates this alone, with zero
> tribal context. **If a step here disagrees with lived reality, reality wins —
> fix the page.**

---

## Read this first — the mental model

> **Rule zero — outreach is not custody.** Talking to the prior developer does
> not move ownership. Custody moves when the client org owns the git remote,
> deploy credentials, and DNS. Fork or back up **before** hostile or unknown
> outreach on HIGH risk.

This runbook is the **how** after the playbook picks a branch. Do not choose
HIGH vs MEDIUM vs LOW here. That is `/project-takeover` + `01-takeover-playbook.md`.

---

## A) Incident / recovery shape

### Trigger and symptom

Present tense. You need technical custody of a project that still sits under a
prior developer or under unclear ownership.

Typical signals:

- Repo URL under a personal account
- Deploy keys or cloud root still held by the prior developer
- Live users while wipe risk is open

### Diagnosis — confirm the signature

```bash
# Read-only. Exit: 0=no match, 1=detected ownership risk, 2=does not apply
./diagnose-project-takeover.sh
# Expected when risk is open:
# DETECTED: git remote not under client org
# DETECTED: prior developer still has admin on cloud/DNS (manual confirm)
```

> Ship as `diagnose-project-takeover.sh` (read-only, no sudo).

### Root cause

**Part 1 — Custody never moved (high confidence).** The project grew under
personal accounts. No org transfer completed before relationship risk rose.

**Part 2 — Popular advice that is wrong.** "Just ask them to add you as
collaborator" without a fork. On HIGH risk that leaves wipe capability in place
during outreach.

### The fix

Prose first. Then run `recover-project-takeover.sh`.

1. Create or confirm client org.
2. Mirror or fork the repository into the client org. **[APPROVAL REQUIRED]** if
   the mirror is outward-facing or billed.
3. Confirm backup artifact exists before credential rotation.
4. Rotate deploy secrets and revoke prior-developer admin. **[APPROVAL REQUIRED]**
5. Move DNS / cloud ownership when in scope. **[APPROVAL REQUIRED]**
6. Re-run diagnose. Expect exit `0` for git org ownership when recovery succeeded.

Idempotent intent: re-running after success should no-op on already-migrated remotes.

### Verification

```bash
./diagnose-project-takeover.sh
# Expect exit 0 when client org owns the configured remote
git -C "$TAKEOVER_REPO_DIR" remote -v
# Expect client-org URL as origin (or documented canonical remote)
```

Not enough: "friendly call happened" or "they promised a zip".

### Rollback

If recover partially ran:

1. Keep the mirror/fork under client org (do not delete the backup).
2. Pause credential rotation if deploy is mid-cutover.
3. Document remaining prior-developer access for counsel.

`revert-project-takeover.sh` is optional. Prefer keeping the client-org mirror
and fixing forward.

### Tradeoffs and known constraints

- Generic scripts cannot probe every cloud vendor. Manual confirms stay in the
  diagnose checklist.
- Legal delivery request is separate. This runbook does not send counsel notices.

### Debugging lessons

> Real incident pattern: outreach before fork left wipe risk open while talks
> stalled. Fold that into the playbook HIGH branch. Keep recover before outreach.

---

## Related

- Playbook: `references/01-takeover-playbook.md`
- Scripts: `diagnose-project-takeover.sh`, `recover-project-takeover.sh`
- Pack skill: `/project-takeover`
- Authoring: `/runbook-authoring`
