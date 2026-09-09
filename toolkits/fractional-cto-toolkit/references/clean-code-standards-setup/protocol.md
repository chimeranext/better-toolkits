# /clean-code-standards-setup — protocol SSOT

Harness-agnostic body. Thin entry: `commands/clean-code-standards-setup.md`.

---

You are a **fractional CTO** preparing a client's engineering baseline. Output is the
**scaffold** that makes the 6 standards enforceable from day one by **linking** to SSOT
references — never duplicating full protocol text in the client repo.

## Read first

| Practice | SSOT |
| --- | --- |
| Index | [engineering-standards/README.md](../engineering-standards/README.md) |
| DSMS / IFS / CPS | [engineering-standards/dsms-ifs-cps.md](../engineering-standards/dsms-ifs-cps.md) |
| PRDS | [engineering-standards/prds.md](../engineering-standards/prds.md) |
| BrS | [engineering-standards/branching-strategy.md](../engineering-standards/branching-strategy.md) |
| QT4L | [engineering-standards/qa-traceability-four-layers.md](../engineering-standards/qa-traceability-four-layers.md) |

## Default outputs (in target `<repo>/`)

- `AGENTS.md` — pointer block: all six standards + PR template + QA traceability; rule “read before opening a PR”.
- `docs/process/engineering-standards.md` — local index (table of 6 practices + adoption order) linking to toolkit SSOT paths or vendored copies.
- `.github/PULL_REQUEST_TEMPLATE.md` — PRDS template ([prds.md](../engineering-standards/prds.md)).
- `docs/process/qa-traceability.md` — QT4L mini-guide: when the `tasks.md` section is mandatory + scenario → verification table stub.

Optional with `--branching`: `docs/process/branching.md` from BrS.

`--standards dsms,ifs,cps,prds,brs,qt4l` restricts subset; default all six.
`--dry-run`: report only, no writes.

## Flow

### Step 1 — Inspect target repo

- Existing `AGENTS.md`? Merge pointers; do not duplicate.
- Existing PR template? Merge sections; do not silently drop client fields.
- Stack (TS/Dart/PHP/K8s)? Note suggested DSMS tree in the index.
- Branches? Document current state in branching doc when `--branching`.

### Step 2 — Generate scaffold

1. Write/merge `AGENTS.md` pointer block (exact SSOT paths).
2. Create `docs/process/engineering-standards.md` with six-practice table + adoption order.
3. Create/merge `.github/PULL_REQUEST_TEMPLATE.md` from PRDS template.
4. Create `docs/process/qa-traceability.md` with QT4L stub.
5. (`--branching`) Write `docs/process/branching.md`.

### Step 3 — Verify and deliver

- [ ] `AGENTS.md` links are verifiable — no full-text duplication
- [ ] PR template has all PRDS sections
- [ ] QT4L stub ready for behavior-change `tasks.md`
- [ ] `--dry-run` produced no writes
- [ ] If client repo is git: commit on feature branch; **HITL** before `gh pr create --draft`

Close by recommending **`/clean-code-standards-audit`** on the same repo to verify adoption, and QT4L sections on any open behavior changes.

## Related commands

- `/clean-code-standards-audit` — verify scaffold + measure adoption
- `/make-no-mistakes:audit-enforcement-hooks` — optional structural gates
- `/requirements-authoring` — PRD → OpenSpec pipeline; QT4L closes the QA loop
