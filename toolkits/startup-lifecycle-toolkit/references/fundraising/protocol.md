# Protocol: fundraising

Guide to raising venture capital: SAFE notes, equity split, VC deals.

## SAFE (Simple Agreement for Future Equity)

### Types of SAFE

| Type | What it does | When to use it |
|------|--------------|----------------|
| **Valuation Cap** | Investor converts at the lower of the cap or the round price | Default. When you can agree on a number with the investor |
| **Discount** | Investor converts at a discount (10-20%) to the next round | When a round is imminent and valuation is unknown |
| **MFN (Most Favored Nation)** | Investor gets the best terms you give any other SAFE investor | What YC uses for the $375K of its $500K deal |

### Post-money vs Pre-money SAFE

**Post-money SAFE** (recommended): The investor's ownership percentage is immediately transparent and calculable.

**Pre-money SAFE** (not recommended): The percentage depends on how much additional SAFE money comes in.

### YC Deal: $500K for 7%

| Tranche | Amount | Terms |
|---------|--------|-------|
| 1 | $125,000 | 7% post-money SAFE |
| 2 | $375,000 | Uncapped MFN SAFE |

### YC SAFE Tool

```bash
# Install YC CLI
curl -fsSL https://bookface.ycombinator.com/cli/install.sh | bash

# Login
yc login --device

# List SAFEs
yc safes list
yc safes show <id>

# Create draft
yc safes create

# Send for signature (WARNING! Cannot be undone)
yc safes send <id>
```

## Equity Split

### YC Principle: 50/50

- Paul Graham: "If you can't agree on an equal split, you probably shouldn't be co-founders"
- Michael Seibel: "The extra 5% you fight for at incorporation costs you 100% of the company if your co-founder walks in year 2"

### Vesting: 4 years + 1 year cliff

- **4 years**: Shares vest over 4 years
- **1 year cliff**: If a co-founder leaves before year 1, they get nothing
- **After the cliff**: 1/36 of remaining shares vest monthly

### When NOT to do 50/50

| Scenario | Suggested split |
|----------|-----------------|
| Co-founder joining late (12+ months after) | 10-30% for the newcomer |
| Very unequal capital | Adjust, but consider loan or preferred stock |
| 3+ co-founders | 33/33/33, with 2-5% CEO bonus |

## Common SAFE mistakes

- **Stacking without a model**: 4 SAFEs at 4 different caps = cap table you can't explain to a Series A lead
- **Editing the body**: Custom clauses turn a 2-day close into a 2-week legal review
- **Treating the cap as valuation**: A cap is a ceiling on conversion price, not a statement that your company is worth that number

## Disclaimer

This protocol is an educational guide. **NOT legal, tax, or financial advice**.
Always consult with a lawyer and accountant before making legal or tax decisions.
