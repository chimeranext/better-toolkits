# /startup-lifecycle:fundraising

Complete guide to raising venture capital: SAFE notes, equity split, cap table, demo prep, financial modeling.

## Audience

Founders who have their US entity formed and want to raise venture capital.

## 1. SAFE Notes

### Types of SAFE

| Type | What it does | When to use it |
|------|--------------|----------------|
| **Valuation Cap** | Investor converts at the lower of the cap or the round price | Default. When you can agree on a number with the investor |
| **Discount** | Investor converts at a discount (10-20%) to the next round | When a round is imminent and valuation is unknown |
| **MFN (Most Favored Nation)** | Investor gets the best terms you give any other SAFE investor | What YC uses for the $375K of its $500K deal |

### Post-money vs Pre-money SAFE

**Post-money SAFE** (recommended): The investor's ownership percentage is immediately transparent and calculable.

### YC Deal: $500K for 7%

| Tranche | Amount | Terms |
|---------|--------|-------|
| 1 | $125,000 | 7% post-money SAFE |
| 2 | $375,000 | Uncapped MFN SAFE |

### YC SAFE Tool

```bash
curl -fsSL https://bookface.ycombinator.com/cli/install.sh | bash
yc login --device
yc safes list
yc safes create
yc safes send <id>  # WARNING! Cannot be undone
```

## 2. Equity Split

### YC Principle: 50/50

- Paul Graham: "If you can't agree on an equal split, you probably shouldn't be co-founders"
- Vesting: 4 years + 1-year cliff

### When NOT to do 50/50

| Scenario | Suggested split |
|----------|-----------------|
| Co-founder joining late (12+ months after) | 10-30% for the newcomer |
| Very unequal capital | Adjust, but consider loan or preferred stock |
| 3+ co-founders | 33/33/33, with 2-5% CEO bonus |

## 3. Cap Table

### What it is

A cap table (capitalization table) shows who owns what percentage of the company.

### Basic structure

| Shareholder | Shares | % |
|-------------|--------|---|
| Founder A | 450,000 | 45% |
| Founder B | 450,000 | 45% |
| Option Pool | 100,000 | 10% |
| **Total** | **1,000,000** | **100%** |

### Tools

| Tool | Price | Link |
|------|-------|------|
| **Carta** | Free for early-stage | [carta.com](https://carta.com) |
| **Cake Equity** | Free for early-stage | [cakeequity.com](https://cakeequity.com) |
| **Pulley** | Paid | [pulley.com](https://pulley.com) |

## 4. Demo Day Prep

### Artifacts

| Artifact | Description |
|----------|-------------|
| **Application** | Written application to the demo day |
| **Deck** | 10-slide standard |
| **Script** | 3-minute pitch |
| **Q&A bank** | 50+ questions and answers |

### Pitch structure (3 min)

1. **Problem** (30 sec) — What problem do you solve?
2. **Solution** (30 sec) — How do you solve it?
3. **Market** (30 sec) — How big is the market?
4. **Traction** (30 sec) — What metrics do you have?
5. **Business model** (30 sec) — How do you make money?
6. **Ask** (30 sec) — How much are you raising and for what?

## 5. Financial Model

### Structure

| Section | Content |
|---------|---------|
| **Setup** | Currency, fiscal year, business model preset |
| **Assumptions** | Revenue drivers, fixed/variable costs, hiring plan |
| **Calculations** | Monthly P&L years 1-2, annual 3-5, cash flow, runway |
| **Financial Statements** | Income statement, balance sheet, cash flow statement |
| **Executive Summary** | Chart specs, key metrics |

### Presets by model

| Model | Sanity checks |
|-------|---------------|
| **SaaS** | Gross margin > 70%, CAC payback < 12 months |
| **DTC** | Gross margin > 50%, inventory turnover |
| **Marketplace** | Take rate, GMV growth |
| **Fintech** | LTV/CAC, regulatory capital |

## References

- [`references/fundraising/protocol.md`](../../references/fundraising/protocol.md) — Detailed protocol
- [`references/vc-term-sheets/protocol.md`](../../references/vc-term-sheets/protocol.md) — VC Term Sheets
- [`references/saas-metrics/protocol.md`](../../references/saas-metrics/protocol.md) — SaaS Metrics
- [YC SAFE](https://www.ycombinator.com/safe)
- [YCInsight — YC Deal](https://ycinsight.com/yc-deal)
- [YCInsight — YC Equity Split](https://ycinsight.com/yc-equity-split)
- [Growth Equity Interview Guide — VC Term Sheets](https://growthequityinterviewguide.com/venture-capital/venture-capital-term-sheets)
- [PostHog — Growth Metrics](https://posthog.com/founders/growth-metrics-for-startups)
