# /digital-nomad:maintain-llc-abroad

Keep your Wyoming Single-Member LLC alive and compliant while your physical
address is a student address in Germany, Canada, Ireland, or Australia.

## Audience

Freelancers and digital nomads whose US Single-Member LLC must survive
**years** of study abroad without active operations triggering problems.

## Annual maintenance checklist

| Item | Cadence | Notes |
|------|---------|-------|
| **Registered agent** | Annual | Wyoming agent renewal fee keeps your statutory address alive |
| **Wyoming annual report** | Annual | Secretary of State; minimum license tax applies |
| **IRS filings** | Annual | Per your classification — see [`tax-compliance`](tax-compliance.md); do not skip because you are abroad |
| **Banking address** | On change | Mercury/Wise/Relay expect a **US** address — keep the virtual address, never swap in a foreign residential one (see [`banking`](banking.md)) |
| **Stripe profile** | On change | Same rule: US business address + US payout account stay consistent |
| **EIN address** | On change | Form 8822-B if the LLC's address of record changes |
| **Mail forwarding** | Ongoing | Scan-and-forward service handles IRS/state mail; check monthly |
| **Bookkeeping** | Monthly | Even at zero activity — a clean zero-year return is easier than reconstructing one |
| **W-9 on file** | As requested | Your EIN + LLC name are what clients need; no home address |

## The golden rule while studying

**Maintenance is not self-employment.** Renewing registrations, filing
returns, and moving zero-activity months through the books is keeping an
entity alive — it is not delivering services from foreign soil. The moment
you answer a client call, ship a feature, or negotiate a contract *from the
study country*, you cross into activity governed by that country's rules
([`study-in-germany`](study-in-germany.md),
[`study-in-canada`](study-in-canada.md),
[`study-in-ireland`](study-in-ireland.md),
[`study-in-australia`](study-in-australia.md)).

## Address-change trigger list

| Event | Update |
|-------|--------|
| Virtual US address provider change | Registered agent, SOS, EIN (8822-B), bank, Stripe, client W-9s |
| Moving between student housing | Nothing in the US — foreign addresses do not belong in US records |
| Bank asks "where do you live?" | Give the foreign residential address **for KYC** but keep the business address US — they are different fields; answer honestly, never fabricate |
| Client requests proof of address | Use the US virtual address documents |

## Dormancy options (if you want zero activity)

- **Dormant year**: file zero returns; keep the agent paid. Cheaper than dissolving and re-forming later (re-formation = new EIN, new bank history, new Stripe account age).
- **Dissolve** only if you are certain you will not resume — dissolution ends your banking/Stripe/credit history permanently.
- **Do not** let the SOS mark the LLC inactive: reinstatement fees + lost good standing ripple into banking.

## Bank and platform hygiene from abroad

| Platform | Watch out for |
|----------|---------------|
| **Mercury / Relay** | US address of record; foreign login geography can trigger reviews — keep documents ready |
| **Wise** | Personal vs business account rules differ by country of residence |
| **Stripe** | Payout account + business address must stay consistent |
| **Credit cards** | US cards with a foreign IP for years → review risk; maintain a clean pattern |

**Banking, tax, and state rules change — confirm current requirements with
your registered agent, bank, and tax preparer.**

## References

- [`references/maintain-llc-abroad/protocol.md`](../../references/maintain-llc-abroad/protocol.md) — Detailed protocol
- [`tax-compliance`](tax-compliance.md) — Filing obligations
- [`banking`](banking.md) — Remote account opening and maintenance
- [`entity-formation`](entity-formation.md) — How the LLC was built
