# Skill `owasp-nhi-top10` — protocol SSOT

## Purpose

Assess non-human identity (NHI) risk using the OWASP Non-Human Identities Top
10 (2025). NHIs are programmatic identities — tokens, service accounts,
machine identities, API keys, workload identities, and agent credentials —
that are as exploitable as human accounts but are often unmanaged. The skill
inventories NHIs, maps them to the ten risk categories, and produces a ranked
hardening plan. It is critical for AI and agentic systems, where the number of
machine identities grows quickly.

## When to use

- A client runs CI/CD pipelines, cloud workloads, or SaaS integrations that
  rely on machine credentials.
- A client is deploying AI agents or LLM-backed services that need their own
  identities and permissions.
- A review found secrets in source control, logs, or chat channels.
- A client wants an NHI-specific posture before an audit or after a breach.

## Model / taxonomy (2025)

The list ranks risks using the OWASP Risk Rating Methodology over real-world
breaches, surveys, and CVE data:

| ID | Risk | Core problem |
| --- | --- | --- |
| NHI1 | Improper Offboarding | NHIs not deactivated/removed when no longer needed; unmonitored deprecated services remain exposed |
| NHI2 | Secret Leakage | API keys, tokens, encryption keys, and certificates leaked to unsanctioned stores during the SDLC |
| NHI3 | Vulnerable Third-Party NHI | Compromised IDE extensions or third-party SaaS can steal credentials or abuse granted permissions |
| NHI4 | Insecure Authentication | Deprecated, weak, or obsolete authentication mechanisms used by NHIs |
| NHI5 | Overprivileged NHI | NHIs granted more privilege than their function requires; compromise escalates |
| NHI6 | Insecure Cloud Deployment Configurations | CI/CD credentials (static or OIDC) improperly validated; over-broad claims |
| NHI7 | Long-Lived Secrets | Secrets with distant or no expiration give attackers unbounded access |
| NHI8 | Environment Isolation | Same NHI reused across dev/test/staging/production, especially test-to-prod |
| NHI9 | NHI Reuse | One NHI shared across apps/services; a single compromise spreads |
| NHI10 | Human Use of NHI | Humans performing manual tasks under an NHI, losing accountability and audit |

## Mappings

- NHI risk → OWASP Top 10 (secrets and authentication categories overlap with
  A07, A05, A02).
- NHI risk → MITRE ATLAS and ATT&CK techniques for agent/service-account
  abuse, bridging to the other threat-defense skills.
- NHI risk → AIDEFEND controls for AI/agent workloads (see ai-defense).

## Method

1. **Inventory**: enumerate every service account, API key, token,
   certificate, OIDC workload identity, and agent credential; record owner,
   scope, and lifetime.
2. **Classify**: map each identity to one or more NHI categories.
3. **Rate**: score likelihood and impact using the OWASP risk matrix; order
   by risk.
4. **Plan**: for each item, define remediation (rotate, revoke, scope down,
   isolate, automate offboarding, shorten lifetime).
5. **Prevent**: recommend guardrails — secret scanning, dynamic secrets,
   short-lived tokens, environment isolation, offboarding automation.
6. **Continuously monitor**: audit identity inventory on a cadence; flag
   drift and new NHIs.

## Outputs

- NHI inventory table (identity kind, scope, lifetime, owner, risk).
- Ranked risk list with remediation per item.
- Prevention recommendations (process and tooling).
- IA plan for agent/LLM workloads.

## Sources

- OWASP Non-Human Identities Top 10 2025 documents in the evidence clone
  (index, top-10 list, per-risk pages); used as taxonomy reference only, not
  copied verbatim.

## Contract

- Vendor-neutral and client-neutral.
- Inventory is evidence-based, not assumed; each NHI has an owner and a
  scope.
- The skill prepares content and plans; the client executes rotations and
  revocations.
- Handover: inventory, risk list, and remediation plan to the security
  owner.