# Business model: B2G

B2G = selling to **governments** (national/local) via tenders/licitaciones or
public-private partnerships (PPP). Requires procurement/legal compliance.

## What drives revenue here

- **Tender discovery + match** — `b2g/tender_normalizer.py`, `unspsc_map.py`, `tender_match.py`
- **RFP analysis** — `b2g/rfp_analyzer.py` → actionable requirements
- **Prioritization** — `revenue-ops-triage`
- **Offer/PPP strategy** — `pricing-strategist`
- **Landscape** — `skills/b2g/references/procurement-platforms.md`

## Skills dominant in B2G

`b2g`, `revenue-ops-triage`, `pricing-strategist`.

## Note

Classic ad-CAC/LTV may not apply; instead use win rate, tender pipeline coverage,
and bid-to-win conversion. Country-agnostic across SICOP, CompraNet, SECOP, etc.
