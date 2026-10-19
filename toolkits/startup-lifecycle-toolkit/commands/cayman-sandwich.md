# /startup-lifecycle:cayman-sandwich

Guide to the Cayman Sandwich structure for LATAM startups raising venture capital.

## Audience

LATAM startups with operations outside the US that want to raise venture capital and optimize taxes on exits.

## What is the Cayman Sandwich?

3-tier structure:

```
Cayman Islands TopCo (holding company)
    └── Delaware LLC (pass-through buffer)
        └── Local OpCo (local operations)
```

| Tier | Entity | Purpose |
|------|--------|---------|
| **TopCo** | Cayman Islands | Investments, equity ownership, governance. Option pool. |
| **MidCo** | Delaware LLC | Pass-through buffer. Flexibility for exit structuring. |
| **OpCo** | Local (e.g., Costa Rica) | Operations: employees, IP, customers, revenue. |

## Why use it?

### Advantages

| Advantage | Description |
|-----------|-------------|
| **Tax treatment** | Avoids 21% US corporate tax on exits. More favorable for non-US investors |
| **Predictable law** | Cayman corporate law mirrors Delaware. Well-developed and consistent |
| **Flexibility** | Easier to flip from Cayman to Delaware than vice versa |
| **Investor friendly** | VCs are familiar with Cayman TopCo |

### Disadvantages

| Disadvantage | Description |
|--------------|-------------|
| **Cost** | 3 entities in 3 jurisdictions = higher formation and maintenance costs |
| **Complexity** | Need advisors in multiple jurisdictions |
| **US buyers** | If your buyer is US-based, the Cayman sandwich doesn't avoid the 21% tax |
| **European investors** | Some avoid Cayman due to potential regulations |

## When to use it?

### Use it if

- You expect significant institutional funding (US or elsewhere)
- Your main exit strategy is NOT a US-based buyer
- The majority of your team/operations are outside the US

### Don't use it if

- Your expected exit is a US-based buyer
- Operations are based in the US
- You expect heavy investment from local funds or European investors

## Flips (LATAM → Cayman/Delaware)

If you already have a LATAM entity and want to raise venture capital, you need to do a "flip":

1. **Shareholders of the LATAM entity** exchange their shares for shares in the new entity (Cayman or Delaware)
2. **The LATAM entity becomes** a wholly owned subsidiary of the new entity
3. **Key issues**: tax, timing, cap table, governance, jurisdiction

### When to flip

| Timing | Difficulty |
|--------|------------|
| Before any equity round | Easy |
| After SAFEs/convertible notes | Moderate (with holder agreement) |
| After priced round | Complicated, maybe not feasible |

### Issues to consider

| Issue | What to consider |
|-------|------------------|
| **Tax** | May trigger tax obligations for some shareholders |
| **Timing** | Earlier = easier |
| **Cap table** | More equityholders = more complicated |
| **Governance** | SHAs, side letters, pactos can complicate |
| **Jurisdiction** | Cayman vs Delaware — depends on your buyer/investor |

## Alternative structure: Sister Entities (ChimeraNext Model)

Instead of Cayman Sandwich, ChimeraNext uses Sister Entities:

```
Founder (You)
├── 100% → ChimeraNext Shared Services LLC (Wyoming Single-Member LLC)
├── Class A → AltruPets Inc. (Delaware PBC) — Impact VCs
├── Class A → Vertivo Inc. (Delaware PBC) — DeepTech VCs
├── Class A → HabitaNexus Inc. (Delaware PBC) — PropTech VCs
└── Class A → AduaNext Inc. (Delaware PBC) — GovTech VCs
```

**Advantages over Cayman Sandwich**:
- No holding company
- Each venture with clean cap table
- Risk isolation between ventures
- Simpler and cheaper

**Disadvantages**:
- Doesn't have the tax optimization of Cayman Sandwich for exits
- Less flexible for US-based buyers

## References

- [`references/cayman-sandwich/protocol.md`](../../references/cayman-sandwich/protocol.md) — Detailed protocol
- [Cooley GO — Cayman Sandwich](https://www.cooleygo.com/the-cayman-sandwich-a-potential-corporate-structure-solution-for-latam-startups/)
- [Cooley GO — Flips](https://www.cooleygo.com/what-latam-founders-need-to-know-about-flips/)
