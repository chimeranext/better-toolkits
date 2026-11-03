# Proposal — add-holocron-docs

Change ID: `add-holocron-docs`

## Why

`docs/` is a flat markdown set with no structure, no sidebar, no generator.
Four files are in Spanish. `multi-harness-ssot.md` is a flat file that should be
a sidebar grouping. There is no "playbook" layer (when/why to use each toolkit)
— only skills (runbooks) inside each toolkit.

## What Changes

- Adopt **Holocron** (open-source, self-hosted, drop-in Mintlify replacement) as
  the docs generator. Rename config to `docs.json`; add `vite.config.ts`.
- Build a declarative sidebar (tabs/groups/pages) — approved structure:
  tabs Docs (Get Started / Development & Quality / Product & Growth / Startup &
  Studio / Engineering & Manufacturing / Operating) + Reference.
- Split `multi-harness-ssot.md` into a `multi-harness/` grouping.
- Create playbooks per toolkit (when/why — Diátaxis how-to+explanation) from
  each toolkit README + skills inventory.
- Translate the 4 Spanish files to English.
- Evolve `ops-documentation-taxonomy.md` to adopt Diátaxis explicitly.

## Impact

- New: `docs.json`, `vite.config.ts`, `package.json` (site), `docs/**` reorganized.
- New playbooks: 16 (one per toolkit).
- `docs/multi-harness-ssot.md` split into `docs/multi-harness/`.
- `shared/references/engineering-standards/ops-documentation-taxonomy.md` expanded.
