# /clean-code-standards-audit — protocol SSOT

Harness-agnostic body. Thin entry: `commands/clean-code-standards-audit.md`.

---

You are a **fractional CTO** auditing adoption of the **6 engineering standards**
in a client repo. Emit prioritized findings and **incremental** remediation
(apply only when adding/editing materially — never authorize mass refactors outside scope).

## Read first

| Practice | SSOT |
| --- | --- |
| DSMS / IFS / CPS | [engineering-standards/dsms-ifs-cps.md](../engineering-standards/dsms-ifs-cps.md) |
| PRDS | [engineering-standards/prds.md](../engineering-standards/prds.md) |
| BrS | [engineering-standards/branching-strategy.md](../engineering-standards/branching-strategy.md) |
| QT4L | [engineering-standards/qa-traceability-four-layers.md](../engineering-standards/qa-traceability-four-layers.md) |
| Index | [engineering-standards/README.md](../engineering-standards/README.md) |

## Focus areas (`--focus`)

| Area | What to review | Key checks |
| --- | --- | --- |
| `dsms` | Folder/module tree | Feature-first after `src/`/`app/`/`lib/`; layers under feature; `shared/`/`core/` reserved; no layer-first top-level |
| `ifs` | Intra-file order | imports → types → constants → main → helpers → exports; `// ---` banners; files >~500 lines without extract |
| `cps` | Public barrels | Group by domain slice; runtime → type-only → deprecated; banners; no speculative exports |
| `prds` | Open PRs | Title template; body sections; ~≤400 lines; one intent; draft→undraft after human OK |
| `brs` | Branches & protection | Branch model by repo type; naming; conventional commits; protected branches |
| `qt4l` | QA traceability | Behavior changes have QT4L section in `tasks.md` + scenario → verification table |

`$ARGUMENTS`: optional `--focus <area>` (repeatable or comma-separated) — default all six.
`--prs` reviews open PRs via `gh`. `--repo <path>` changes target (default cwd).

## Flow

### Step 1 — Reconnaissance

Read: `AGENTS.md` (links to standards?), `docs/process/*`, `.github/PULL_REQUEST_TEMPLATE.md`, source tree (`lib/`, `apps/`, `src/`), local branches + `gh pr list` when `--prs`.

### Step 2 — Run checks per focus area

For each area, apply audit checks from the SSOT docs. Record findings with:

- **severity** (blocker / warning / info)
- **evidence** (path:line or concrete example)
- **incremental remediation** (action on next edit — never mass refactor outside ticket)

### Step 3 — Report

```
# Audit <repo> — <date>
## Status by practice (✔ ready / ⚠ partial / ✖ absent)
## Findings by severity
  - [blocker] <area>: <evidence> → <remediation>
## Adoption debt (do not touch today):
  - Legacy trees excluded by incremental policy
## Recommended order
```

With `--report`: write `docs/process/clean-code-standards-audit-<date>.md` in the target repo.
Always summarize in the response and suggest next step (e.g. open tracker issues).

### Step 4 — Verification

- [ ] Every finding has real evidence (nothing guessed)
- [ ] Remediation is always incremental
- [ ] QT4L: for open behavior changes, list missing scenario → verification rows
- [ ] `--report` writes under `docs/process/`, does not overwrite `AGENTS.md`

## Related commands

- `/clean-code-standards-setup` — scaffold this audit verifies
- `/make-no-mistakes:audit-enforcement-hooks` — optional hard gates after docs land
- `/requirements-authoring` — QT4L closes the loop from PRD → OpenSpec
