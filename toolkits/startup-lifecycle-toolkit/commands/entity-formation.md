# /startup-lifecycle:entity-formation

Guide to forming a US entity (Delaware PBC, Wyoming LLC, etc.) + essential legal documents.

## Audience

Founders who have enough savings and want to incorporate a US entity to raise capital.

## 1. What entity to form?

| Entity | When to use it | Cost |
|--------|----------------|------|
| **Delaware PBC** | B Corp + Impact VCs + social mission | $500-$2,000 |
| **Delaware LLC** | Something simple, convert later | $500-$1,500 |
| **Wyoming LLC** | Privacy + low costs | $500-$1,000 |

## 2. State selection criteria

| Criteria | Best state |
|----------|------------|
| Most partners live there | That state |
| Physical operations (office, warehouse) | That state |
| Most commercial activity | That state |
| Foreign residents (no physical presence) | Wyoming, Delaware, New Mexico (lowest taxes) |

### State comparison

| State | Franchise tax | Privacy | Best for |
|-------|---------------|---------|----------|
| **Delaware** | ~$300/year | Moderate | VC-backed startups, PBCs |
| **Wyoming** | ~$50/year | High | Privacy-focused, small LLCs |
| **Nevada** | ~$350/year | High | Tax optimization |
| **New Mexico** | $0 | High | Foreign residents, no state income tax |
| **Florida** | $0 (LLC) | Moderate | Latin American founders (proximity) |

## 3. Steps to incorporate

### Step 1 — Choose formation service

| Service | Cost |
|---------|------|
| Stripe Atlas | $500 |
| Firstbase | $399 |
| Clerky | $599 |
| Doola | $297 |

### Step 2 — Get EIN

| Scenario | Timeline |
|----------|----------|
| With SSN | Immediate to 1 business day |
| Without SSN (ITIN) | ~45 business days |
| Without ITIN | Need to apply for ITIN first (W-7 form) |

### Step 3 — Open bank account

| Bank | Requirements | Remote? |
|------|-------------|---------|
| Mercury | EIN + Certificate of Incorporation | Yes |
| Relay | EIN + Operating Agreement | Yes |
| Wise Business | EIN + Proof of address | Yes |
| Traditional banks | EIN + Operating Agreement + Physical address | Sometimes |

### Step 4 — File BOI Report (REQUIRED)

**What**: Beneficial Ownership Information report to FinCEN.

**When**: Within 90 days of incorporation.

**What it requires**:
- Company info (name, address, jurisdiction, EIN)
- Beneficial owners (name, address, DOB, ID number)
- Company applicants (name, address, DOB, ID number)

**Cost**: Free (filed directly with FinCEN).

**Penalties**: Up to $10,000 and/or 2 years imprisonment for willful failure.

### Step 5 — Registered Agent

**What**: Person or entity designated to receive legal documents on behalf of your company.

**Why it's required**: Mandatory in all US states.

**Options**:
- **Commercial registered agent**: $100-$300/year (e.g., Northwest Registered Agent, Incfile)
- **Self**: Only if you have a physical address in the state of incorporation

### Step 6 — Virtual address

**What**: Remote address to use as your company's principal address.

**Why**: For foreigners, digital nomads, freelancers who don't have a US physical address.

**Providers**: Earth Class Mail, Anytime Mailbox, iPostal1.

**Cost**: $10-$50/month.

## 4. Essential legal documents

### Founder Stock Purchase Agreement (FSPA)

- What it is: Stock purchase agreement between founders and the company
- Why it matters: Without it, founders don't legally own shares

### IP Assignment Agreement

- What it is: Agreement that assigns founder IP to the company
- Why it matters: Without it, the company doesn't own the IP

### Vesting Schedule

- What it is: 4-year vesting + 1-year cliff
- Why it matters: Protects the company if a founder leaves early

### SAFE (Simple Agreement for Future Equity)

- What it is: Agreement to raise capital without setting valuation
- Why it matters: It's the YC standard for early fundraising

### Term Sheet

- What it is: Preliminary document with investment terms
- Why it matters: Framework for negotiating with investors

### Operating Agreement (LLC) / Bylaws (C-Corp)

- **Operating Agreement**: Describes the structure and operational rules of an LLC. Defines member responsibilities, decision-making processes, and profit distribution. **Highly recommended** even if not legally required.
- **Bylaws**: Similar to Operating Agreement but for C-Corps. Regulates relationships and functions of owners.

## 5. Tax obligations for non-residents

| Scenario | Tax implication |
|----------|-----------------|
| Non-resident, no US operations | Income may be non-taxable in the US |
| Non-resident, US operations | Subject to US taxes on US-sourced income |
| Tax treaty country | May reduce withholding taxes |

**Important**: Even with no activity, you may need to file annual reports with the state and IRS.

## 6. Reporting obligations

| Report | Frequency | Where |
|--------|-----------|-------|
| **Annual report** | Annual | State Secretary of State |
| **Franchise tax** | Annual | State tax authority |
| **BOI Report** | One-time (update on changes) | FinCEN |
| **Federal tax return** | Annual | IRS |
| **State tax return** | Annual | State tax authority |

## 7. Resources

| Resource | Link |
|----------|------|
| **SBA** (Small Business Administration) | [sba.gov](https://www.sba.gov) |
| **IRS** (Internal Revenue Service) | [irs.gov](https://www.irs.gov) |
| **USPTO** (Patent and Trademark Office) | [uspto.gov](https://www.uspto.gov) |
| **SEC** (Securities and Exchange Commission) | [sec.gov](https://www.sec.gov) |
| **BusinessUSA** | [businessusa.gov](https://businessusa.gov) |
| **SelectUSA** | [selectusa.gov](https://selectusa.gov) |
| **FinCEN** (BOI filing) | [fincen.gov/boi](https://www.fincen.gov/boi) |

## 8. Sister Entities Structure (ChimeraNext Model)

```
Founder (You)
├── 100% → ChimeraNext Shared Services LLC (Wyoming Single-Member LLC)
├── Class A → AltruPets Inc. (Delaware PBC) — Impact VCs
├── Class A → Vertivo Inc. (Delaware PBC) — DeepTech VCs
├── Class A → HabitaNexus Inc. (Delaware PBC) — PropTech VCs
└── Class A → AduaNext Inc. (Delaware PBC) — GovTech VCs
```

## References

- [`references/entity-formation/protocol.md`](../../references/entity-formation/protocol.md) — Detailed protocol
- [`references/fast-agreement/protocol.md`](../../references/fast-agreement/protocol.md) — FAST Agreement
- [`references/vc-term-sheets/protocol.md`](../../references/vc-term-sheets/protocol.md) — VC Term Sheets
- [LLC Hub — Guide to Start a Business](https://llchub.us)
- [FinCEN — BOI Filing](https://www.fincen.gov/boi)
