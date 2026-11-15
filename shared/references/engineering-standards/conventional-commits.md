# CvC — Conventional Commits (doctrine)

> Policy/doctrine SSOT for commit message format. This standard is the formal
> definition; other standards (e.g. `branching-strategy.md` §Commits) **reference**
> it, they do not redefine it.

## Doctrine

1. **Format:** `type(scope): description` — `type` is required, `scope` is
   optional (affected area), `description` is the message.
2. **Allowed types** (per the Conventional Commits spec):
   - `feat` — a new feature.
   - `fix` — a bug fix.
   - `docs` — documentation only.
   - `style` — formatting, no logic change.
   - `refactor` — code change that is neither a fix nor a feat.
   - `perf` — a performance improvement.
   - `test` — adding/correcting tests.
   - `build` — build changes.
   - `ci` — CI changes.
   - `chore` — maintenance tasks.
   - `revert` — revert a previous commit.
3. **Examples** (approved):

   ```
   feat(auth): add login endpoint
   fix(ui): resolve button padding issue
   chore(deps): upgrade serverpod
   ```

## Controlled English (ASD-STE100)

Commit messages are **English** (identifiers / history stay English even when
user-facing prose is Spanish). After the Conventional Commits prefix, the
**subject and body** SHALL pass the structural ASD-STE100 gate:

```bash
python3 shared/references/asd-ste100/scripts/prose_gate.py commit-msg .git/COMMIT_EDITMSG
```

The gate strips `type(scope):` and lints the remaining prose with
`asd-ste100-lint.py` (lexical SSOT `shared/references/asd-ste100/vocabulary.yml`).
Hard findings block. Advisory findings do not. One-shot bypass:
`# hook-bypass: ste-prose-deferred` in the message, or `SKIP_STE_COMMIT_PROSE=1`.

## Application

- **Agents** (Better profile): use `type(scope): description` on each commit
  (see also **CLG** for semantic grouping). Draft the subject/body in controlled
  English, then run (or rely on) the ASD-STE100 prose gate before finishing the
  commit.
- **Enforcement:** the `conventional-pre-commit` hook (see **PCH**) validates the
  **format** at `commit-msg`. The local `asd-ste100-commit-prose` hook (PCH /
  better-toolkits `.pre-commit-config.yaml`) validates **prose**.
- **Types:** the hook's allowed-types list MUST match this standard's list.

## References

- Specification: https://www.conventionalcommits.org/
- Related: **CLG** (semantic grouping), **PCH** (enforcement via pre-commit),
  **ASD-STE100** (`../asd-ste100/README.md`), **PRDS** (same prose gate on PR bodies).
- `branching-strategy.md` §Commits references this standard.
