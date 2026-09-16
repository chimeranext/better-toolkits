# Disconnected pattern library (anti-pattern)

**Avoid this anti-pattern** in app hosts, Storybook plays, browser automation, and HITL bug-squash rounds.

## What it means (and what it does not)

| Term | Meaning |
| --- | --- |
| **Disconnected pattern library** | The product host integrates with the design system by **copying or matching implementation details** (markup, CSS class names, internal DOM attributes) instead of consuming **published components and documented props**. |
| **Pattern Lab** (Atomic Design workshop) | Historical tool for navigating patterns in a sidebar — ancestor of Storybook. The anti-pattern is **disconnected integration**, not “do not use a pattern library.” |
| **Connected design-system integration** | The host imports the kit package, renders published **templates/organisms**, and handshakes through **props**. Markup, styles, and a11y stay inside the kit. |

Background: [Storytime with Chantastic](https://www.youtube.com/watch?v=jR0Gefa4lpg), [Pattern Lab + Storybook (Brad Frost)](https://bradfrost.com/blog/post/using-atomic-design-pattern-lab-to-build-a-better-storybook/).

## How it failed historically

Pre-React pattern libraries shipped minified CSS and HTML snippets. Product teams **recreated** those snippets in server templates or CMS blocks and kept them in sync by **matching Bootstrap class names**. When Bootstrap renamed a class, the host broke even though the “pattern” looked the same in the workshop.

The modern shift (**prop-based ingest**): the design system owns markup, styles, and accessibility; the host passes data and callbacks through an API (props), not through DOM archaeology.

## Common manifestations (forbidden)

| Anti-pattern | Example | Why it fails |
| --- | --- | --- |
| Attribute scraping | Host CSS targeting `[data-ds-component="…"]` or similar kit internals | Couples host to kit DOM; breaks when identity attrs are retired |
| Framework class matching | `.MuiButton-root`, `.btn-primary` overrides in host or tests | Implementation detail; refactors rename generated classes |
| Host layout override | Host `sx` / wrappers that restyle kit chrome | Violates “fix layout in the kit, not the host” |
| Test selectors on kit internals | `document.querySelector('[data-ds-component="…"]')` | Tests implementation, not user-visible outcome |
| Test-only DOM flags | Emit internal markers only on devel/stage | Prod/SSR parity breaks; QA learns the wrong contract |

**Retired contract (do not reintroduce):** internal DOM identity attributes used only for tests or host CSS. Atomic vocabulary lives in **Storybook `title:`** and component paths — not in production DOM.

## Correct handshake (connected)

1. **Publish** templates/organisms from the design-system repo (npm package).
2. **Compose** in the host with documented props — e.g. a boolean prop to toggle a sub-form instead of hiding it in CSS.
3. **Assert** behavior with **accessible roles, names, and copy** — see [Semantic UI locator policy](./semantic-ui-locator-policy.md).
4. **Fix layout/chrome in the kit**, not with host styling overrides.

Workshop **pages** (Storybook-only flows with hardcoded data) validate UX. They are **not** exported as-is. Hosts recreate flows with live data; they do not copy page markup.

## Who enforces this

| Layer | Enforcement |
| --- | --- |
| Living spec | OpenSpec delta requirements in user language |
| Storybook ESLint / import gates | Code review for template import boundaries |
| Storybook CI | `tags: ['test']` plays must not query kit-internal attributes |
| Docs | This file + semantic locator policy |
| HITL | Bug-squash uses Chrome DevTools MCP a11y snapshot — same semantic rule, no attribute scraping |

## Related

- [Semantic UI locator policy](./semantic-ui-locator-policy.md)
- [QA traceability — four layers](../../fractional-cto-toolkit/references/engineering-standards/qa-traceability-four-layers.md)
