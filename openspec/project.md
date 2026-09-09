# better-toolkits — OpenSpec / OPSX

> **Planning SSOT** for this monorepo. Product code lives under `toolkits/`, `apps/`, `shared/`.

## OPSX workflow (Fission-AI OpenSpec)

Configured per [OpenSpec OPSX](https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md):

| Step | Cursor | Claude Code |
| --- | --- | --- |
| Propose | `/opsx-propose` | `/opsx:propose` |
| Explore | `/opsx-explore` | `/opsx:explore` |
| Apply | `/opsx-apply` | `/opsx:apply` |
| Update artifacts | `/opsx-update` | `/opsx:update` |
| Sync living specs | `/opsx-sync` | `/opsx:sync` |
| Archive | `/opsx-archive` | `/opsx:archive` |

**CLI:** `openspec doctor`, `openspec list`, `openspec validate <change>`, `openspec view`

**Store id:** `better-toolkits` (`.openspec-store/store.yaml`). Register locally:

```bash
openspec store register --id better-toolkits --yes .
```

**Planning context for agents:** `openspec/config.yaml` (`context:` + `rules:`). Prefer that over this file for new work.

## Spec domains

Every change belongs to one domain (GitHub label):

| Domain | Label | Scope |
| --- | --- | --- |
| Toolkit | `toolkit:<name>` | `toolkits/<name>/**` |
| Web | `area:web` | `apps/web/**` |
| Docs | `area:docs` | `docs/**`, README |
| Meta | `area:meta` | marketplace, shared hooks, governance |

## Change layout

```text
openspec/changes/YYYY-MM-DD-<slug>/
├── .openspec.yaml
├── proposal.md
├── design.md
├── tasks.md
└── specs/<capability>/spec.md   # unless skip_specs: true
```

Living specs (post-archive): `openspec/specs/<capability>/spec.md`

**Do not** create `openspec/changes/` inside individual toolkits — use this monorepo store only.

## Lifecycle

1. **Propose** — `/opsx-propose` or `openspec new change <slug>`
2. **Review** — human HITL on proposal/design/specs/tasks
3. **Apply** — `/opsx-apply` on a feature branch + draft PR
4. **Archive** — `/opsx-archive` after ship (human OK only)

Legacy changes predating OPSX (no `.openspec.yaml`) remain under `openspec/changes/` until normalized or archived.

## Enforcement

`.claude/hooks/pre-write-require-openspec.sh` (see root `openspec/project.md` history in git): planning artifacts only under `openspec/changes/`; `apps/` writes require an active change.
