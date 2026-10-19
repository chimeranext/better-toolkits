# /digital-nomad:study-in-germany

Operate (or keep passive) your US Single-Member LLC while studying in Germany.

## Audience

Freelancers and digital nomads with a US Single-Member LLC who hold — or are
applying for — a German student residence permit (§16b AufenthG).

## The core rule

German immigration and tax law follow your **physical location**
(*Territorialitätsprinzip*), not your invoice. If you are sitting in Berlin
executing work, the service is performed in Germany — the
*Ausländerbehörde* and the *Finanzamt* do not care that the invoice comes
from a Wyoming LLC or that the money lands in Mercury via Stripe.

| Topic | Rule under a student visa (§16b) |
|-------|----------------------------------|
| **Self-employment** (*Selbstständige Tätigkeit*) | **Prohibited by default** — freelance, commercial, or managing your own entity |
| **Dependent employment** (*unselbstständige Beschäftigung*) | Allowed: 140 full days or 280 half days per year, or up to **20 h/week** during term |
| **Werkstudent** (student employment contract) | Legal under §16b, favorable social-security treatment, ≤20 h/week in term |
| **Passive LLC** (no active services from German soil) | Compatible: keep the entity alive, do not bill work performed in Germany |

## The "foreign LLC" myth

Billing clients through your Wyoming LLC via Stripe/Mercury **does not** make
the activity invisible or legal while you are on a student permit. Two
separate exposures apply if you actively work from Germany:

| Exposure | What happens |
|----------|--------------|
| **Immigration** | Unauthorized self-employment → permit violation under §16b AufenthG |
| **Tax (§10 AO)** | If you manage the LLC from Germany, the *Finanzamt* can treat the **place of effective management** (*Ort der Geschäftsleitung*) as German → LLC re-qualified for **Körperschaftsteuer + Gewerbesteuer**, plus penalty risk (*Steuerhinterziehung*) for non-registration |
| **>183 days/year in Germany** | Full German tax residence → taxation on **worldwide income** (*Welteinkommen*) |
| **Scheinselbstständigkeit** | Client work that looks like employment (team leadership, integrated hours) → *Deutsche Rentenversicherung* can demand retroactive social contributions from the client |

## Legal routes while studying

| Route | What it gives you | Realistic for students? |
|-------|-------------------|-------------------------|
| **A. Werkstudent contract** | ≤20 h/week dependent work, legal under §16b | Yes — the standard path |
| **B. §21 Abs. 6 permit (LEA)** | Explicit, discretionary authorization for self-employment alongside studies | Rarely granted for undergraduates; Berlin's LEA usually denies it |
| **C. §21 Abs. 5 Freiberufler visa** | Professional/freelancer residence title — invoice freely | It **replaces** the student route (you are no longer a §16b student); Germany taxes you as a resident |
| **D. Keep LLC passive** | Entity alive (registered agent, filings), **no active services** from Germany | Yes — the default recommendation |

**Recommended sequence**: student visa first → keep the LLC passive
(maintenance only, see [`maintain-llc-abroad`](maintain-llc-abroad.md)) →
switch to a work/freelance title after graduation, or to Freiberufler via
§21 Abs. 5 if studies are not the priority.

## Documentation if you apply for the §21 Abs. 6 exception

- Written **Scope-of-Services letter**: services performed *outside* Germany, or a hard cap — "maximum of 15 to 20 hours per week".
- **Business plan** (clients, revenue projection, hours split vs. ECTS workload).
- **Time-tracking** proving ≤20 h/week in term; weekend/night blocks do **not** legalize self-employment without the permit.
- Contracts predating arrival do **not** exempt you — physical performance governs.

## Study-financing facts (Germany)

| Item | Amount |
|------|--------|
| **Sperrkonto** (blocked account) | ≈ **€11,904/year** (≈ €992/month released) + first-semester tuition payments |
| Sperrkonto providers | ≈ €100–150 (e.g., Expatrio, Fintiba) + ~€100 exchange margin |
| Student jobs | 140 full / 280 half days per year; Werkstudent ≈ €14–20/h in tech |

**Immigration and tax rules change frequently — verify current §16b/§21
practice with the local LEA and a German Steuerberater before acting.**

## References

- [`references/study-in-germany/protocol.md`](../../references/study-in-germany/protocol.md) — Detailed protocol
- [`visa-options`](visa-options.md) — Titles for working (not studying) from abroad
- [`tax-compliance`](tax-compliance.md) — US-side filing obligations
- [`maintain-llc-abroad`](maintain-llc-abroad.md) — Keeping the LLC alive while abroad
