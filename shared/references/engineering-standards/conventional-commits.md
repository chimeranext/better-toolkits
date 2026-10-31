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

## Application

- **Agents** (Better profile): use `type(scope): description` on each commit
  (see also **CLG** for semantic grouping).
- **Enforcement:** the `conventional-pre-commit` hook (see **PCH**) validates the
  format at `commit-msg`.
- **Types:** the hook's allowed-types list MUST match this standard's list.

## References

- Specification: https://www.conventionalcommits.org/
- Related: **CLG** (semantic grouping), **PCH** (enforcement via pre-commit).
- `branching-strategy.md` §Commits references this standard.
