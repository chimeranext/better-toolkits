---
description: "Design a high-conversion landing page with guided CRO brainstorming"
argument-hint: "[optional: --b2g | --b2b | --b2b2c | --b2c | --what-if for simulation mode]"
---

# /landing-page

Read and follow the protocol SSOT at
`toolkits/business-model-toolkit/references/landing-page/protocol.md`
(monorepo-relative). Behavior is unchanged — only structure moved for
multi-harness reuse. AAARRR funnel context: output dir
`./business/04-landing-pages/` (spec + ADR + copy).

If business-model-toolkit is not installed (standalone flywheel install),
fall back to this toolkit's local guides: `references/cro-methodology.md`,
`references/landing-b2b.md`, `references/landing-b2b2c.md`,
`references/landing-b2c.md`, `references/visual-language.md`.

`$ARGUMENTS` = audience flags (`--b2g` / `--b2b` / `--b2b2c` / `--b2c`) and/or `--what-if` simulation mode.
