# Tasks — Policies machine-readable enforcement

## Implementation

### Policy SSOT

- [ ] P1: Create `shared/references/policies/policies.yml` (merge policy default).
- [ ] P2: Create `shared/references/policies/policies.schema.json` (JSON Schema).
- [ ] P3: Create `shared/references/policies/README.md` (usage + permission notes).
- [ ] P4: Make `policies.yml` validate against the schema (test).

### Propagation (GitHub App via Actions)

- [ ] P5: Write `shared/references/policies/propagate-policies.sh` (reads YAML →
       emits `repository_dispatch` to consumers).
- [ ] P6: Write `shared/references/policies/apply-policies.sh` (materializes policy
       into `linear-setup.json`, ruleset, hooks; opens PR on drift).
- [ ] P7: Add `.github/workflows/propagate-policies.yml` (policy repo).
- [ ] P8: Add `shared/bootstrap/scripts/setup-policies.sh` (installs
       `apply-policies.sh` + consumer workflow during setup).
- [ ] P9: Wire `setup-policies.sh` into `/toolkits-initial-setup` adapter.

### Audit

- [ ] P10: Write `shared/references/policies/audit-policies.sh` (drift report).
- [ ] P11: Add `/audit-policies` command (references the audit script).

### Discipline

- [ ] P12: `agents/better.md` — add "OpenSpec pipeline mandatory (no shortcuts)".
- [ ] P13: `/toolkits-initial-setup` protocol — add the pipeline discipline note.
- [ ] P14: internal-handbook `better-mode.md` — add the "No shortcuts" section.

## Verification

- [ ] Schema validation test passes.
- [ ] `no-squash` detect.py still blocks `--squash` (exit 2).
- [ ] `propagate-policies.sh --dry-run` lists consumers + payload.
- [ ] `apply-policies.sh --dry-run` reports would-be drift (squashMerge=true→false).
- [ ] `/audit-policies` reports `GAP` on a repo with `squashMerge: true`.
- [ ] `openspec validate 2026-10-30-policies-machine-readable-enforcement` valid.
