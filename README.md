# better-toolkits

> Source-available Claude Code toolkits monorepo — **pick the toolkits your startup needs.**

A curated set of [Claude Code](https://docs.claude.com/en/docs/claude-code) plugins —
each independently installable — consolidated into one marketplace. Instead of chasing
ten standalone repositories, you add **one** marketplace and install exactly the toolkits
your startup needs, from problem validation through go-to-market. Inspired by the
"pick-your-stack" experience of [create-better-t-stack](https://www.better-t-stack.dev/)
and a sibling to [better-microservices](https://github.com/chimeranext/better-microservices).

## Toolkits

| Toolkit | What it does | Version | Status |
|---|---|---|---|
| [`aaarrr-flywheel-toolkit`](toolkits/aaarrr-flywheel-toolkit) | AAARRR acquisition funnel + Retention/Referral flywheel over the Meta Marketing API — Awareness/Acquisition/Activation/Revenue run as a linear funnel; Retention/Referral close the loop. | 0.1.0 | Available |
| [`app-gtm-release-toolkit`](toolkits/app-gtm-release-toolkit) | Multi-platform app go-to-market and release — ship Flutter, KMP, .NET MAUI, Swift, and PWAs to Google Play, App Store, Microsoft Store, Snap Store, Flathub, and alternative channels. | 2.3.0 | Available |
| [`business-model-toolkit`](toolkits/business-model-toolkit) | Interactive business-model brainstorming — guided dialogue across the full startup lifecycle from problem validation through execution and investor pitch. | 2.0.0 | Available |
| [`fractional-cto-toolkit`](toolkits/fractional-cto-toolkit) | Operational toolkit for freelance and fractional CTOs — SOPs, checklists, and guided workflows for project takeovers, technical audits, client onboarding, and vendor evaluation. | 1.0.0 | Available |
| [`instructional-design-toolkit`](toolkits/instructional-design-toolkit) | Design cmi5-compliant courses and 1-on-1 session plans with the CONTEXT→CONCEPT→BUILD→SHIP→REFLECT formula, Bloom's progression, and Kirkpatrick L1-L4 evaluation. | 1.0.0 | Available |
| [`launchpad-toolkit`](toolkits/launchpad-toolkit) | Founder operations lab — AI intake, cap table, co-founder and investor matching, demo-day prep, and stage tracking, with graceful degradation when live data is unavailable. | 0.5.0 | Available |
| [`ux-research-toolkit`](toolkits/ux-research-toolkit) | Guided UX-research map creation — experience maps, customer journey maps, service blueprints, storyboards, and user story maps, with interactive HTML visualization. | 2.1.0 | Available |
| [`venture-studio-toolkit`](toolkits/venture-studio-toolkit) | Macro portfolio management for venture studios — LATAM corporate structures, Services Hub / MSA templates, accelerator matching, and Three Horizons allocation. | 1.2.0 | Available |
| [`atomic-design-toolkit`](toolkits/atomic-design-toolkit) | Atomic Design for Flutter and Vite — decompose features into atoms, molecules, organisms, templates, and pages; audit component and bundle health; drive phased migration. | 1.2.0 | Available |
| [`make-no-mistakes-toolkit`](toolkits/make-no-mistakes-toolkit) | The disciplined dev lifecycle — implement issues, review PRs, sync releases, test E2E, manage sessions, stash secrets, and enforce manifest-driven tool-call hooks. | 1.33.0 | Available |

Each toolkit keeps its **own license** — see the `LICENSE` file inside each
`toolkits/<name>/`.

## Installation

Add the marketplace once, then install any toolkit by its **plugin name**:

```bash
claude plugin marketplace add chimeranext/better-toolkits
claude plugin install <plugin-name>@better-toolkits
```

For example:

```bash
claude plugin install business-model-toolkit@better-toolkits
claude plugin install app-gtm-release@better-toolkits      # note: plugin name, not dir name
claude plugin install aaarrr-flywheel-toolkit@better-toolkits
```

> The plugin name usually matches the directory, but not always —
> `app-gtm-release-toolkit` installs as `app-gtm-release`, and
> `make-no-mistakes-toolkit` installs as `make-no-mistakes`. The authoritative
> list of installable names lives in
> [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json).

A future documentation and configurator site is planned at **toolkits.chimeranext.dev**.

## Repository layout

```
.claude-plugin/
  marketplace.json    # the marketplace manifest Claude Code reads (one entry per toolkit)
toolkits/             # the toolkits — one git history per toolkit, preserved via git subtree
apps/web/             # (Phase 2) landing-page selector / configurator
docs/site/            # (Phase 2) documentation site → toolkits.chimeranext.dev
```

## Why one monorepo?

These toolkits started life as ten separate repositories. Consolidating them into a
single marketplace means:

- **One install surface.** `claude plugin marketplace add chimeranext/better-toolkits`
  is the single door — no hunting for ten repo URLs.
- **Preserved history.** Each toolkit is imported with `git subtree`, so its full
  commit history survives (`git log toolkits/<name>/`).
- **Independent licensing and versioning.** Every toolkit keeps its own `LICENSE`
  and its own version; the monorepo just curates them.

## History

This monorepo consolidates ten previously-separate repositories with their **full git
history preserved** via `git subtree add`. All ten toolkits are live in
[`marketplace.json`](.claude-plugin/marketplace.json); `atomic-design-toolkit` and
`make-no-mistakes-toolkit` were the last two imported, after their histories were
reconciled.
