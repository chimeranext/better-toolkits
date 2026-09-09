# Contributing to better-toolkits

Thanks for your interest. This monorepo is curated by **Luis Andres Pena Castillo /
ChimeraNext** and licensed under **BSL-1.1** (source-available). Read
[LICENSE](LICENSE), [NOTICE](NOTICE), and the Legal Disclaimer in [README.md](README.md)
before contributing or redistributing.

## Who this is for

Freelancers and startups who want a disciplined agent-assisted development lifecycle —
audits, implementation discipline, design-system hygiene, GTM, and related toolkits —
**inside their own repos and client engagements**.

## Acceptable use

| Allowed | Not allowed |
|---------|-------------|
| Install plugins for development, auditing, and testing in your (or your client's) repos | Repackage / rebrand better-toolkits (or a toolkit) as your own commercial product |
| Open PRs for fixes, docs, and portable hooks under the same licenses | Host or sell a rival marketplace / “Claude toolkit suite” derived from this work |
| Reference the ecosystem in consulting proposals (as Pre-existing IP) | Treat the toolkits as “work for hire” transferred to a client |

The Additional Use Grant in each `LICENSE` is the binding text. In short: **use for
development; do not turn this into a competing product.**

## How to contribute

1. Prefer issues and PRs against [chimeranext/better-toolkits](https://github.com/chimeranext/better-toolkits).
2. Branch names: `feat/…`, `fix/…`, `docs/…` — no employer-specific ticket prefixes in public branch names.
3. Keep commits focused. If you touch `hooks/`, add or update the relevant synthetic tests.
4. Do not commit secrets. Do not silence stderr with `2>/dev/null` in agent harness commands (see make-no-mistakes stderr hooks).
5. **HITL is repo doctrine** ([`docs/hitl.md`](docs/hitl.md)): after a plan whose natural next step mutates shared state (`gh pr merge`, tracker → Done, force-with-lease on published history, …), ask and wait — Claude `AskUserQuestion` / Cursor equivalent. Do not bury the happy path behind `--execute`.
6. Legal/license parameters are generated from `scripts/legal/` — prefer editing the
   template and re-running `python3 scripts/legal/render-bsl.py` over hand-editing
   eleven LICENSE copies.

## Consulting / client work

The toolkits in this marketplace are **Pre-existing IP** of the Consultant. Client
deliverables (application code, schemas, product logic written for that engagement)
can still be work-made-for-hire for the Client. Use the template in
[docs/legal/pre-existing-ip-clause.md](docs/legal/pre-existing-ip-clause.md) when
drafting contracts — have counsel review it; it is not legal advice.

## Code of conduct

Be respectful. Assume good intent. Disagreements stay about the work, not the person.
