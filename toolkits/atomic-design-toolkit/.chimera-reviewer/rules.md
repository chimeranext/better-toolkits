# atomic-design-toolkit reviewer rules

These rules calibrate review SEVERITY for the atomic-design-toolkit repo — a
Claude Code PLUGIN whose source is markdown command / skill / reference files
(the prompts agents execute), not runtime application code. Map each finding to
the right tier (P1 / P2 / P3) so severity is consistent across reviews and
cosmetic issues are not inflated into blockers. Without this file the reviewer
free-wheels: lax on some PRs, overkill on others.

## Rule 1 — Severity tiers (use these exact labels)

- **P1 — REQUEST_CHANGES / block merge.** A command or skill instruction that is
  genuinely destructive or unsafe to run against a CONSUMER repo — a shell
  snippet that deletes/overwrites files, mutates a database, exfiltrates
  secrets, or guidance that would corrupt the consumer's codebase if followed.
  Reserve P1 for real harm; most doc changes are never P1.
- **P2 — should fix before merge.** Correctness/consistency defects that make a
  command produce wrong output or contradict the toolkit's own rules: a broken
  cross-reference between commands (e.g. the `:report` → `/migrate` contract), a
  wrong file path / glob / shell snippet that won't match, a missing or
  out-of-order step, contradictory guidance, or an atomic-taxonomy / pillar
  inconsistency. Comment-level; expect a fix or a written defer rationale.
- **P3 — nit / suggestion.** Wording, formatting, naming, minor redundancy,
  example polish. Non-blocking. Prefer this tier for anything cosmetic.

When unsure between two tiers, pick the LOWER one and say why.

## Rule 2 — This is a prompt repo, not a code repo

- There is almost no runtime code, so SECURITY / DATA-LOSS findings apply only to
  the **shell snippets** a command tells the agent to run against a consumer
  repo. Judge those by what they do to the CONSUMER, not to this repo.
- "The command is long" or "this overlaps another command" is at most P3 unless
  it produces a wrong result — decomposition is tracked separately (legacy-ticket).
- Cross-command contracts ARE load-bearing: `/audit :report` writes a schema
  `/migrate` consumes, and `/storybook-setup`, `/storybook-audit`, `/audit`
  reference each other. A broken contract or a dangling `/atomic-design-toolkit:*`
  reference is a real P2.

## Rule 3 — Do not free-wheel

Calibrate to THIS repo's purpose (atomic-design enforcement tooling). Do not
import severity intuitions from an app repo: "missing test" or "no error
handling" rarely applies to a markdown command. Anchor every finding to a
concrete defect in the proposed diff, with `file:line`.

## Rule 4 — APPROVE requires a real walkthrough

Never post a bare `Approved — no findings. 5.00/5.00` with zero substance. An
APPROVE must name what you actually checked — which commands' contracts, which
shell snippets, which cross-references — so a hollow natural-completion-empty
pass is distinguishable from a genuine clean review. A pass-1 that finds nothing
must still run the adversarial second pass before approving.
