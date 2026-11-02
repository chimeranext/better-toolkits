---
name: gtm-fit
description: "Design your app to sell itself — go-to-market fit strategy for apps before and after store release. Use this skill when the user asks how to get users or sales for their app, says 'nobody downloads my app', 'how do I market my app', 'make my app sell', 'go-to-market strategy', 'product-market fit', 'minimum viable segment', 'SLIP framework', 'my app is ready, now what', 'cómo vendo mi app', 'que se venda solo', or wants to plan demand generation beyond the app stores (website, YouTube videos, WhatsApp sales channel, open-core funnel). Also triggers when choosing between freemium, free trial, and pricing ladders at the strategy level."
---

# GTM Fit: Design Your App to Sell Itself

Shipping to stores gets your app *available*. This skill is about making it *sellable* — before release (design the product so it is easy to buy) and after release (build the organic presence that generates demand the stores alone won't).

Two source frameworks, one shared data flow: **product built → made sellable → presence → conversion**.

1. **Product-company gap + SLIP + MVS** — strategy layer (Chris Gardner, Underscore VC — Harvard Innovation Labs). Read `references/product-company-gap.md` for the full treatment.
2. **Organic presence system** — tactical layer for indie devs and small teams (Héctor de León, hdeleon.net). Read `references/organic-presence.md` for the full treatment.

## The Product-Company Gap

Product-market fit is one step, not the destination. Most products with PMF still fail to become companies because nothing about them was designed for distribution. Two facts to internalize early:

- **Your expenses will flip.** Early on, ~all spend is engineering. At maturity, benchmark SaaS spend is **40% sales & marketing / 20% R&D** (the 40/20/20 rule). If your plan has no answer for "who sells this and how", the plan is half a plan.
- **A great product is not enough.** YouTube pre-Google had the best product on the internet and no economic model. The iPhone's decisive innovation wasn't the touchscreen — it was the App Store + in-app purchases: a *go-to-market architecture*.

## Before Release: Design for GTM Fit

### Minimum Viable Segment (MVS)

Don't launch to "everyone your vision could serve". Find one segment with **consistent needs** where you can *dominate*:

```
        pain points ∩ budget ∩ product use case ∩ channel
                    = your MVS (cluster of demand)
```

- Small enough to dominate; big enough to prove repeatable sales.
- Validate by talking to ~200 potential customers in the universe **before spending money**. Ask "how much would you pay?", "what 4 problems would you pay to solve tomorrow?" — not "do you like my idea?".
- Ignore the other segments until you dominate the first (the Apploi pattern: cut back to "hiring nurses, nothing else" → grew → re-expanded to the full vision).
- Keep the big vision for the pitch; keep the small segment for the build.

### The SLIP framework

Architect the product so it distributes itself. Score your app 0–2 on each letter; anything scoring 0 is a launch risk to fix before Phase 4 of `app-gtm-release:launch-plan`:

| Letter | Meaning | App-centric checklist |
|--------|---------|----------------------|
| **S** — Simple to install & use | Frictionless out-of-box experience | Onboarding under 2 minutes? No account required to reach first value? Web/PWA fallback so users skip the install entirely? |
| **L** — Low to no initial cost | Frictionless trials | Free tier or native store trial configured? (see `app-gtm-release:monetization`) No credit card up front? |
| **I** — Instant & ongoing value | Short time-to-value | First session delivers the core benefit? Enterprise: time-to-value ≤ 3 months? Value recurs (not one-and-done)? |
| **P** — Plays well in the ecosystem | Integrations & partnerships | Integrates with the platforms your MVS already uses? Is there a Klaviyo-style partner whose blessing changes your trajectory? |

### Gain-pain ratio and self-proving value

Adoption pain is the #1 barrier — including **inertia risk** (switching costs, "doing nothing is easier"). Your value proposition must overcome discover → try → buy → deploy → own.

**Startup secret — self-proving value:** if your product improves a process, build the proof *into* the product. Baseline the user's current state on install, then surface dashboards showing improvement against that baseline. The product documents its own ROI (the Pagos pattern).

## After Release: The Organic Presence System

The stores are a discovery channel, not a demand engine. Once you have an MVP that genuinely reduces someone's cost or time, build these three pillars **in order**:

### Pillar 1 — A real website

- Full product description, images, videos, prices, and **at least 3 payment methods** (card, PayPal, MercadoPago, OXXO... whatever your market actually uses — every missing method is a lost sale).
- Own domain + product email (`support@yourproduct.com`).
- This is now AI-critical: when ChatGPT/Gemini/Claude answer "what tool does X?", they land on and cite websites. No website ⇒ invisible to AI-mediated search.
- The website complements the stores: store listing converts installs; the website converts *purchases and contacts* and is the only channel you fully own.

### Pillar 2 — Video-first distribution

Posts die in the feed; videos persist in search and suggestions for years.

- **One long YouTube video** demoing all features — Google indexes YouTube results for product searches.
- **Short per-feature videos** — a user searching "app that does electronic invoicing" finds your feature video even if your app does ten other things.
- Short clips on Instagram/TikTok/YouTube Shorts every few weeks.
- **Every video links to the website** (description + cards).
- Reuse the long video as the store listing promo video (`app-gtm-release:store-listing` covers specs).

### Pillar 3 — A dedicated WhatsApp contact

- A **non-personal number**, exclusive to the product, behind a click-to-chat icon on the website (`https://wa.me/<number>` — never "copy this number").
- People want answers *now*: automate off-hours with n8n or a bot that serves the key info while you sleep.
- Keep email as a fallback for old-school buyers. Telegram doesn't cover the audience that pays — WhatsApp first.
- B2C outside WhatsApp markets: swap in the channel your MVS actually uses; the principle is *one instant, personal, zero-friction contact point*.

### Bonus — Open-core as top-of-funnel

An open-source edition with fewer features can recruit an army of people who distribute and even resell it — and their customers come to you for the complete commercial product. Pairs naturally with `app-gtm-release:alt-distribution` (F-Droid, GitHub Releases) for the free edition. Caution from the strategy layer: **free-forever devalues** — keep a clear, feature-gated ladder from open edition to paid product.

## Handoff to aaarrr-flywheel-toolkit

This skill owns the *decision layer* (what presence you need and why). Deep funnel execution belongs to the `aaarrr-flywheel-toolkit` plugin when installed — do not duplicate its work:

| Pillar / concern | Hand off to |
|------------------|-------------|
| Build the website / landing page | `/aaarrr-flywheel-toolkit:landing-page` (CRO-guided design) |
| Instrument it (Pixel, GA4, PostHog, UTM) | `/aaarrr-flywheel-toolkit:landing-instrument` |
| Video channel as acquisition engine | `/aaarrr-flywheel-toolkit:acquire` |
| WhatsApp conversion + activation flows | `/aaarrr-flywheel-toolkit:activate`, `/aaarrr-flywheel-toolkit:revenue` |
| Open-core word-of-mouth loop | `/aaarrr-flywheel-toolkit:refer` |

If aaarrr-flywheel-toolkit is **not** installed, the inline guidance above is the minimum viable version — offer to proceed with it and mention the plugin for the full funnel.

## Coordination Within This Toolkit

- **Before** `app-gtm-release:launch-plan` — run the MVS + SLIP check; fix any SLIP zero-scores pre-launch.
- **With** `app-gtm-release:monetization` — SLIP's L is implemented there (trials, freemium caution, pricing ladders).
- **With** `app-gtm-release:store-listing` — the long demo video doubles as the promo video; MVS language sharpens descriptions and keywords.
- **With** `app-gtm-release:alt-distribution` — distribution channel for an open-core free edition.
