# Audit checklist — Hardcoded URLs and filesystem cross-refs in chimera-academy

**Audited:** 2026-05-01
**Repo state:** `chimeranext/chimera-academy@main` at commit `f45ebcb`
**Method:** `grep -rEn` over `content/courses/` for the patterns below.

## Findings summary

| Pattern | Count | Action |
|---|---|---|
| `https://*.chimeranext.io/app/...` | **0** | None — no platform URLs hardcoded today ✓ |
| `/app/courses/...` | **0** | None ✓ |
| `/app/pathways/...` | **0** | None ✓ |
| `chimeranext.io/app...` (any host) | **0** | None ✓ |
| `[text](../../path/to/file.md)` cross-refs to other course `.md` | **1 confirmed**, more likely | Migrate to symbolic refs |

The good news: **no platform URLs are hardcoded in content today**. The bad news (mild): there are filesystem `.md` cross-references that work on disk but break in the rendered platform. These are the migration target.

## Confirmed cross-references to migrate

### `content/courses/agentic-coding/module-06-review-qa-and-ship/classes/text-04-pr-review-setup.md`

```
line 236:
  This is the same compounding dynamic you saw in
  [Context Engineering](../../../agentic-coding/module-04-context-engineering/module-overview.md).
```

**Migrate to:**

```
This is the same compounding dynamic you saw in
[Context Engineering][module:agentic-coding/module-04-context-engineering].
```

## How to repeat the audit

```bash
cd chimera-academy
grep -rEn "\]\(\s*\.\./[^)]+\.md" content/courses/ | grep -v "/assets/"
grep -rEn "\]\(/app/" content/courses/
grep -rEn "chimeranext\.io[/\"]" content/
grep -rEn "\]\(\s*https://[^)]+\.md" content/courses/
```

## What is NOT a violation

- **Image references** (`![alt](../../assets/foo.png)`) — these are filesystem paths to image assets, intentionally relative. They are NOT cross-references to learning units and do NOT need symbolic refs. The platform serves them as static files via the same relative path.
- **External URLs** (`[OpenAI docs](https://platform.openai.com/...)`) — links to the wider world stay literal. Symbolic refs only apply to internal cross-references between course content.
- **Anchors within a single lesson** (`[See above](#section-id)`) — same-page anchors are standard Markdown, no symbolic ref needed.
- **Links to chimera-academy itself on GitHub** (e.g. `[playbook](https://github.com/chimeranext/chimera-academy/...)`) — the GitHub URL is the *source* location, not a runtime route. Stays literal.

## When new violations appear

The lint task in `tasks.md` (Phase 3, sibling) ships a CI check that flags any new content using filesystem `.md` targets in cross-link positions. Until then, run the grep commands above on each PR touching `content/`.
