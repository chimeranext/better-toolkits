# apps/docs — Mintlify documentation site

A [Mintlify](https://mintlify.com) project that publishes the better-toolkits
repo doctrine and reference content as a proper docs site. It replaces the
Next.js `/doctrine/` subpage in `apps/web` as the home for this content
(`apps/web` and its subpage are left in place).

## What is ported here

| Page | Source of truth (canonical) |
| --- | --- |
| `index.mdx` — landing | — (site index) |
| `multi-harness-ssot.mdx` | `docs/multi-harness-ssot.md` |
| `conventions.mdx` | `shared/references/conventions/README.md` |
| `engineering-standards.mdx` | `shared/references/engineering-standards/README.md` + `index.md` |
| `setup.mdx` | `shared/bootstrap/references/toolkits-initial-setup/protocol.md` |

The source files remain the single source of truth. This site is a faithful
rendering of them, not a second source.

## Run locally

```bash
npm i -g mint
cd apps/docs
mint dev
```

Then open the printed localhost URL (default `http://localhost:3000`).

## Layout

- `docs.json` — Mintlify config (name, colors, navigation: Overview,
  Multi-harness SSOT, Conventions, Engineering Standards, Setup).
- `*.mdx` — the ported pages, one per navigation group.
