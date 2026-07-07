# The Organic Presence System — Tactical Reference

Source: Héctor de León (hdeleon.net), "Cómo hacer que tu software se venda SOLO" — https://www.youtube.com/watch?v=caxtR9e76EM

Battle-tested by a 20-year indie dev selling his own products in LATAM. Three mandatory pillars, **followed in order**, each feeding the next. Precondition: you already have at least an MVP that demonstrably reduces a paying customer's cost or time. Don't start this system with nothing to sell.

No pillar guarantees success — they stack probabilities. The flow:

```
Pillar 2 (videos) ──drives──▶ Pillar 1 (website) ──converts via──▶ Pillar 3 (WhatsApp)
      ▲                                                                    │
      └────────────── word of mouth / open-core resellers ◀────────────────┘
```

## Pillar 1 — Website (the foundation, built first)

"Like it's the '90s again" — and more critical than ever:

- **AI search lands on websites.** When users ask an AI "what tool does X?", the AI searches and cites web pages. No website ⇒ no online presence ⇒ invisible to the fastest-growing discovery channel.
- Contents: full product description, images, videos, prices, contact, payment methods.
- **Payment methods: minimum 3, more is better.** Every "but I don't have PayPal" is a rescued sale when you also take cards, MercadoPago, OXXO, etc. Match methods to what *your* market uses, not what's easiest to integrate. Start with 3, add over time.
- Own **domain** and product **email** (`support@yourproduct.com`) — old-school buyers still buy by email.
- Organic search traffic takes months to build. Publish early; the clock only starts when the site exists.

## Pillar 2 — Video-first distribution (spread the word)

A website nobody visits sells nothing. Distribution channel: video, because **posts die in the feed; videos persist** — an old video still surfaces in search results and suggestions years later.

Video portfolio:

| Format | Purpose |
|--------|---------|
| **One long YouTube video, all features** | Google indexes YouTube for product searches; long-form gets platform priority; doubles as your store-listing promo video |
| **Short per-feature videos** | Someone searches "software for electronic invoicing" → finds the video about *that one feature* → discovers your product, even though it does ten other things |
| **Short clips (Reels/TikTok/Shorts) every few weeks** | Regular cadence, virality lottery tickets, top-of-funnel reach |

Non-negotiable: **every video links to the website** — video description, YouTube cards/links, bio links. The video's job is to deliver a visitor to the page with prices and payment methods.

Not spam — strategy: consistent, useful, feature-focused video beats posting links everywhere.

## Pillar 3 — Dedicated WhatsApp (the conversion point)

Visitors who are ready to buy want answers **right now**:

- A **non-personal number used only for the product**, behind a WhatsApp icon on the website's contact section.
- **Click-to-chat, zero friction**: the icon opens the chat directly (`https://wa.me/<number>`). Never "copy this number and add it to your contacts" — every extra step loses buyers.
- **Automate off-hours**: n8n flows or a bot answering the key questions (price, features, how to buy) during your defined rest window (e.g., 8pm–6am). You cover 24h without being awake 24h.
- **WhatsApp over Telegram**: think about who *pays*, not who's technical. Most paying customers have WhatsApp; many will bounce if Telegram is the only option ("I don't have that app — adiós").
- Keep **email** alongside it for the traditional buyers.
- Outside WhatsApp-dominant markets, substitute the instant channel your segment actually uses — the invariant is *one instant, personal, zero-friction contact point*.

## Bonus — Open-core as accidental salesforce

De León open-sourced a reduced-feature edition of one product. Third parties began selling/deploying the open edition — and their customers upgraded to him for the complete commercial product. An unplanned reseller network working top-of-funnel for free.

- Works when the open edition is genuinely useful but clearly feature-gated below the paid product.
- Distribute the free edition through `app-gtm-release:alt-distribution` channels (F-Droid, GitHub Releases, Obtainium).
- Labeled honestly: this was luck amplified by the three pillars being in place — a compounding factor, not a substitute for them.

## Word of mouth

Customers who tell other customers is the endgame — but it *stems from* the three pillars plus a product that actually cuts cost/time. Build the mandatory base first; referrals and campaigns come after (see `/aaarrr-flywheel-toolkit:refer` when that plugin is installed).
