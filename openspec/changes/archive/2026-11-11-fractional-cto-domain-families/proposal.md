# Proposal — fractional-cto-domain-families

## Problem

The `fractional-cto-toolkit` covers only a subset of the CTO role. It is strong
on **engagement** (contracts, takeover), **process engineering** (SOP/playbook/
runbook), **requirements-first** (PRD→OpenSpec) and **engineering standards**
(scaffold/audit). Per the CTO-role references (MIT CTO Program, amazingCTO,
Splunk, Devox, freelancermap), the role also requires **strategy/roadmap**,
**architecture decisions**, **engineering metrics**, **risk & resilience**, and
**GRC/compliance** — none of which the toolkit currently covers.

The gap analysis (see `gap-analysis.md`, /tmp/opencode/gap-fcto) identifies
these as the five missing domains. The correct approach is **authoring new
skills from scratch**, grounded in the references — not cloning third-party
skill repos (those serve only as benchmark/evidence of capability).

## Proposal

Restructure the toolkit's skill surface around **domain families** (per the FFF
standard: families × internal taxonomy), without redundant `cto-` name prefixes
(the toolkit is the context). Add five new families authored from the references:

- **Strategy**: roadmap, portfolio, R&D alignment
- **Architecture**: decision (ADR), stack evaluation, migration
- **Metrics**: DORA, reliability, velocity, team health, executive reporting
- **Risk & Resilience**: audit, incident response, disaster recovery, resilience
- **GRC / Universal** — ISO 27001, ISO 27701, ISO 42001, NIST 800-53, NIST CSF,
  NIST AI RMF, SOC 2, PCI DSS, SWIFT CSP, CIS Controls, WCAG, TPRM
- **GRC / Regional** — jurisdiction table (USMCA · LATAM · APAC · EMEA → country);
  includes APAC China (Shenzhen/Guangdong/Yiwu), Hong Kong, Singapore, Japan,
  South Korea, Taiwan (Taipei) and the LATAM country gaps (Costa Rica, Colombia,
  Mexico, Panama, Guatemala, El Salvador, Chile, Argentina) marked as to-author

Existing families are kept and refined (Engagement, Process Engineering,
Requirements, Standards). This change targets the **authoring/tasks**; it does
not clone or import third-party skill content.

---

Tracker: Fixes #177 (https://github.com/chimeranext/better-toolkits/issues/177)
