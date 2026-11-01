# Policies Machine-Readable Enforcement Spec

## ADDED Requirements

### Requirement: Policy SSOT is machine-readable and validatable

The toolkit SHALL provide a machine-readable policy source of truth at
`shared/references/policies/policies.yml`, validated against
`policies.schema.json` (JSON Schema). Prose docs (e.g.
`docs/git-merge-policy.md`) SHALL reference the YAML, not replace it.

#### Scenario: validating the policy file

- **WHEN** `policies.yml` is validated against `policies.schema.json`
- **THEN** validation succeeds for a well-formed file and fails with a schema
  error for a malformed one.

### Requirement: Merge policy default and prohibition

The default `merge.method` in `policies.yml` SHALL be `merge` (merge commit), and
`merge.methods_forbidden` SHALL include `squash` and `rebase` unless overridden.
The `no-squash` hook SHALL continue to block `gh pr merge --squash` and
`git merge --squash`.

#### Scenario: forbidden method enforced by hook

- **WHEN** an agent or shell attempts `gh pr merge <N> --squash`
- **THEN** the `no-squash` detector exits `2` and blocks the command.

### Requirement: Propagation to consumer repos by GitHub App

The policy repo SHALL ship `.github/workflows/propagate-policies.yml` that runs
`propagate-policies.sh` on `policies.yml` changes and emits `repository_dispatch`
(`policies-updated`) to each configured consumer monorepo.

Each consumer monorepo SHALL run an `apply-policies.sh` (installed by the setup)
on that dispatch that materializes the policy: `linear-setup.json`
`defaults.squashMerge` per the policy, the GitHub ruleset merge method, and the
local hooks.

#### Scenario: dispatch reaches a consumer

- **WHEN** `policies.yml` changes in the policy repo
- **THEN** a `repository_dispatch` with `event_type: policies-updated` is sent to
  each consumer repo, and `apply-policies.sh` runs there.

### Requirement: Startup-agnostic drift audit

A `/audit-policies` command SHALL compare the local `policies.yml` against the
actual enforcement state (`linear-setup.json`, GitHub rulesets, installed hooks)
and report per-check `OK` / `GAP` / `no-enforced`, exiting non-zero on any `GAP`.

#### Scenario: report drift

- **WHEN** a consumer repo has `linear-setup.json` `squashMerge: true` while
  `policies.yml` forbids squash
- **THEN** `/audit-policies` reports a `GAP` for that check and exits non-zero.

### Requirement: Setup enforces the pipeline and policy discipline

`/toolkits-initial-setup` SHALL install the agent profile that mandates the
OpenSpec pipeline, and SHALL install `apply-policies.sh` + the consumer workflow
into each monorepo it bootstraps.

#### Scenario: pipeline is mandatory

- **WHEN** the agent is asked whether to implement a change directly on a working
  branch
- **THEN** the agent refuses and routes through `/opsx:propose` → worktree →
  `/opsx:apply` → `/dogfood` → `/ready-to-review-mergeable` → approved PR.
