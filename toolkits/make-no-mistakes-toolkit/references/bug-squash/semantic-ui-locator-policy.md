# Semantic UI locator policy

**Platform rule:** on design-system surfaces (Storybook, component libraries, Inertia/React hosts), find and assert UI by **accessible role, name, and visible copy** — not by CSS classes, framework internals, or retired DOM identity attributes.

Same user-outcome semantics in Storybook CI and HITL bug-squash rounds; different runtimes (Testing Library vs Chrome DevTools MCP).

**Anti-pattern SSOT:** [Disconnected pattern library](./disconnected-pattern-library-anti-pattern.md).

## One rule, two runtimes

| Runtime | Runner | Locator API | Import / tool |
| --- | --- | --- | --- |
| **Storybook component tests** | Vitest (via `@storybook/addon-vitest`) | Testing Library **queries** + **jest-dom matchers** | `import { expect, userEvent, within } from 'storybook/test'` |
| **HITL bug-squash (N2 browser)** | Chrome DevTools MCP (**headed only**) | Accessibility tree snapshot + **`uid`** clicks | `take_snapshot`, `click` / `fill` with `uid` — **not** `@testing-library/*` at runtime |

Vitest provides `describe` / `it` / `expect`. **`getByRole` is not a Vitest API** — it comes from Testing Library inside the `play` function or test file.

MCP does **not** call `getByRole()` in JavaScript. The agent reads `take_snapshot` output (roles, accessible names, `pressed` / `expanded` / `checked`) and picks the node whose **role + name** match the scenario — the same decision `getByRole('button', { name: /submit/i })` encodes in Storybook.

## Query families (Storybook / Testing Library)

Use these in story `play` functions and component tests.

| Family | Purpose | Preferred APIs |
| --- | --- | --- |
| **Queries** | Find node(s) in the DOM | `getByRole`, `getAllByRole`, `getByText`, `findByRole` (async) |
| **Matchers** | Assert on a found node | `expect(el).toBeVisible()`, `toHaveAttribute('aria-expanded', 'true')`, `toHaveTextContent` |

### Preferred order (design-system components)

1. **`getByRole` / `getAllByRole`** — buttons, links, headings, tabs, dialogs (`name` option = accessible name / regex).
2. **`getByText` / `getAllByText`** — visible copy when role alone is ambiguous.
3. **`getByLabelText`** — form fields with proper labels.
4. **`data-testid`** — only when role + name cannot disambiguate; must be documented on the component.

### Forbidden locators

- Retired kit identity attributes (`data-ds-component`, `data-ds-level`, or equivalent internal markers)
- CSS selectors, generated framework class names (e.g. `.Mui*`), `document.querySelector('.…')`
- XPath unless no accessible alternative exists (rare; document waiver in the PR)

### Duplicate matches

Storybook and production often render the same label twice (e.g. a metric in a card and in a table). Use **`getAllByRole`** / **`getAllByText`** and assert on the intended instance, or scope with `within(canvasElement)` / a landmark region — not `querySelector` to “the second one.”

Example:

```ts
const submitButtons = canvas.getAllByRole('button', { name: /save changes/i });
await expect(submitButtons.length).toBeGreaterThan(0);
await expect(canvas.getAllByText(/\$4,280/).length).toBeGreaterThan(0);
```

## HITL bug-squash flow (Chrome DevTools MCP)

UI steps for layer 4 (N2 browser evidence):

```text
list_pages → navigate_page (round Base URL) → take_snapshot
  → locate node by role + accessible name in snapshot text
  → click(uid=…) / fill(uid=…) / press_key
  → take_snapshot (post-condition) → take_screenshot (evidence in round dir)
```

| Testing Library (Storybook) | MCP equivalent |
| --- | --- |
| `getByRole('button', { name: /Over 18/i })` | Snapshot line: `button "Over 18" uid=…` → `click` that `uid` |
| `expect(btn).toHaveAttribute('aria-expanded', 'true')` | Snapshot shows `expanded` on the node; screenshot for N2 file |
| `getAllByRole(...)` when duplicates | Pick the correct `uid` from multiple snapshot lines with the same name; note which instance in `round.md` |

**Do not** use `evaluate_script` + `document.querySelector('[data-…]')` in bug-squash rounds. That is the [disconnected pattern library](./disconnected-pattern-library-anti-pattern.md) in QA clothing.

**Headed only:** never pass `--headless` or `headless: true` to Chrome DevTools MCP. The operator must see the browser during HITL.

## Mapping to QA four layers

| Layer | Locator policy applies? |
| --- | --- |
| 1 OpenSpec scenarios | Write AC in user language (roles/copy), not DOM attributes |
| 2 Manual SOP | Human checks visible outcomes; same semantics |
| 3 Storybook CI | **Mandatory** Testing Library queries in `tags: ['test']` plays |
| 3 HTTP / browser automation | Prefer API contracts; browser only when UI cannot be asserted otherwise — still no kit-internal attributes |
| 4 Bug-squash round | MCP a11y snapshot + `uid`; evidence under consumer `roundDir` (default `docs/qa/rounds/`) |

See [QA traceability — four layers](../../../fractional-cto-toolkit/references/engineering-standards/qa-traceability-four-layers.md) (fractional-cto-toolkit) or your consumer repo’s copy.

## Agent checklist

- [ ] Storybook `play` uses `getByRole` / `getByText` (or `getAllBy*`), not kit-internal attributes
- [ ] Bug-squash uses `take_snapshot` + `uid`, not CSS attribute scraping
- [ ] Host integration uses props, not CSS that hides kit internals
- [ ] New components expose accessible names (buttons, links, headings) stable enough for both runtimes

## Related

- [Disconnected pattern library anti-pattern](./disconnected-pattern-library-anti-pattern.md)
- [Bug-squash locally command](../../commands/bug-squash-locally.md)
- OpenSpec change `2026-09-09-generalize-bug-squash` — full round protocol (in progress)
