# Tasks — Policies machine-readable enforcement

## Implementation

### Policy SSOT

- [x] P1: Create `shared/references/policies/policies.yml` (merge policy default).
- [x] P2: Create `shared/references/policies/policies.schema.json` (JSON Schema).
- [x] P3: Create `shared/references/policies/README.md` (usage + permission notes).
- [x] P4: Make `policies.yml` validate against the schema (test).

### Propagation (GitHub App via Actions)

- [x] P5: Write `shared/references/policies/propagate-policies.sh` (reads YAML →
       emits `repository_dispatch` to consumers).
- [x] P6: Write `shared/references/policies/apply-policies.sh` (materializes policy
       into `linear-setup.json`, ruleset, hooks; opens PR on drift).
- [x] P7: Add `.github/workflows/propagate-policies.yml` (policy repo).
- [x] P8: Add `shared/bootstrap/scripts/setup-policies.sh` (installs
       `apply-policies.sh` + consumer workflow during setup).
- [ ] P9: Wire `setup-policies.sh` into `/toolkits-initial-setup` adapter.

### Audit

- [x] P10: Write `shared/references/policies/audit-policies.sh` (drift report).
- [x] P11: Add `/audit-policies` command (references the audit script).

### Discipline

- [x] P12: `agents/better.md` — add "OpenSpec pipeline mandatory (no shortcuts)".
- [x] P13: `/toolkits-initial-setup` protocol — add the pipeline discipline note.
- [x] P14: internal-handbook `better-mode.md` — add the "No shortcuts" section.

## Verification

- [x] Schema validation test passes.
- [x] `no-squash` detect.py still blocks `--squash` (exit 2).
- [ ] `propagate-policies.sh --dry-run` lists consumers + payload.
- [x] `apply-policies.sh --dry-run` reports would-be drift (squashMerge=true→false).
- [x] `/audit-policies` reports `GAP` on a repo with `squashMerge: true`.
- [ ] `openspec validate 2026-10-30-policies-machine-readable-enforcement` valid.
