---
description: HITL bug-squash on localhost only — one environment per round, headed Chrome DevTools MCP, semantic UI locators. Accepts optional domain label as $ARGUMENTS.
argument-hint: "[domain label, e.g. 'Checkout' or 'Agency Home']"
priority: 85
---
# /bug-squash-locally

Local-first HITL QA round: **localhost only**, **headed Chrome DevTools MCP**, **semantic UI locators** (role + name + copy — not CSS or kit-internal attributes).

Full multi-environment protocol (`/make-no-mistakes:bug-squash`) is in progress — OpenSpec `2026-09-09-generalize-bug-squash`. This command is the **minimal viable local entry** until that ships.

## Read first (mandatory)

| Order | SSOT |
| --- | --- |
| 1 | [`references/bug-squash/semantic-ui-locator-policy.md`](../references/bug-squash/semantic-ui-locator-policy.md) |
| 2 | [`references/bug-squash/disconnected-pattern-library-anti-pattern.md`](../references/bug-squash/disconnected-pattern-library-anti-pattern.md) |
| 3 | Consumer repo `bug-squash.config.json` (copy from [`bug-squash.config.example.json`](../bug-squash.config.example.json)) |

## Before Chrome MCP

1. Resolve repo root (git root or configured root in `make-no-mistakes.config.json`).
2. If `bug-squash.config.json` is missing → copy example → set `environments.localhost.baseUrl` (default `http://localhost:8080`) → create `roundDir` if absent. **Ask the operator** to confirm URLs before browser work.
3. **Fix environment to `localhost` for this command** — do not switch to staging/prod mid-round. Other environments require a separate round (future `/bug-squash` or a consumer overlay).
4. Confirm the app is running at the configured `baseUrl` (operator or `curl` health check — log stderr to a file, never `2>/dev/null`).
5. Open or resume `round.md` under `{roundDir}/<domain>-<YYYY-MM-DD>/` with header fields:
   - **Environment:** `localhost`
   - **Base URL:** from config
   - **Round ID**, **Ref**, **Operator**, **Status:** `open`
6. Set `$MNM_QA_ORIGIN` (or equivalent) to the round **Base URL** before any mutating browser action.

HITL ask-and-wait before shared-state mutations: [`docs/hitl.md`](../../../docs/hitl.md) (monorepo) or consumer equivalent.

## N2 browser (layer 4)

- **Tool:** Chrome DevTools MCP — **headed only** (no `--headless`).
- **Flow:** `take_snapshot` → locate by **role + accessible name** → `click`/`fill` by **`uid`** → re-`take_snapshot` → `take_screenshot` into the round directory.
- **Forbidden:** `evaluate_script` + `querySelector`, CSS classes, kit-internal attributes, Playwright headless as substitute.

Map Storybook `getByRole` / `getByText` intent to snapshot lines — see semantic locator policy.

## Writes on localhost

When `environments.localhost.writesAllowed` is `true`, mutating actions are allowed for repro/fix verification. Still prefer read-only exploration for initial triage. Non-localhost environments in config must stay **`writesAllowed: false`** unless the consumer overlay documents explicit arming.

## Close gate (minimal)

Before marking **Status:** `closed`, `round.md` must include non-placeholder sections:

- **Traceability** — case IDs ↔ OpenSpec scenarios or SOP bullets
- **Not executed, and why** — no empty waiver text

Full five-section close gate ships with the complete bug-squash protocol.

## `$ARGUMENTS`

Optional domain label (e.g. `Checkout`) for the round folder name and `round.md` title. If omitted, infer from the operator’s issue or ask once.
