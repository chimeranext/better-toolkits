# Skill `owasp-top10` — protocol SSOT

## Purpose

Apply the OWASP Top 10 as the application-security (AppSec) lens for audits,
code reviews, penetration-test scoping, and secure-design review. The skill
classifies weaknesses into the ten risk categories, traces each to its CWE
cluster, and produces a prioritized, evidence-backed remediation backlog.

## When to use

- A client needs an AppSec baseline or a review of a web application, API, or
  single-page front end.
- Security findings must be prioritized and communicated to development teams
  in a standard, recognized vocabulary.
- A design or architecture decision must be reviewed for attacker-relevant
  risk.
- A security program wants to measure posture against an industry-standard
  risk list.

## Model / taxonomy (2025 edition)

The 2025 edition is the eighth installment. It is data-informed (CWE
prevalence in contributed app test data, starting 2021) and balanced by a
community survey for risks that testing underrepresents. Categories focus on
root cause over symptom where possible. The ten categories aggregate a total
of 248 CWEs:

| ID | Category | CWEs (approx.) | Notes |
| --- | --- | --- | --- |
| A01 | Broken Access Control | 40 | Includes SSRF (CWE-918), CSRF (CWE-352) |
| A02 | Security Misconfiguration | 16 | Moved up from #5 in 2021 |
| A03 | Software Supply Chain Failures | 5 | Fewest occurrences, highest average exploit/impact scores |
| A04 | Cryptographic Failures | 32 | Moved down from #2 |
| A05 | Injection | 38 | Includes SQL injection, XSS |
| A06 | Insecure Design | — | Threat modeling and secure design |
| A07 | Authentication Failures | 36 | Renamed from Identification & Authentication Failures |
| A08 | Software or Data Integrity Failures | — | Trust boundaries, integrity of code and data |
| A09 | Security Logging & Alerting Failures | — | Emphasizes alerting, not just logging |
| A10 | Mishandling of Exceptional Conditions | 24 | New category: error handling, logical errors, fail-open |

Historical editions: 2003, 2004, 2007, 2010, 2013, 2017, 2021, 2025. The
2025 release is multilingual (English, Spanish, German, French, Persian,
Italian, Japanese, Korean, Czech, Brazilian Portuguese, Traditional Chinese,
and others in the repository layout).

## Mappings

- Category → CWE cluster (canonical per-category lists).
- Category ↔ CAPEC / ATT&CK for offensive technique reuse, bridging to the
  other threat-defense skills (mitre-attack, mitre-atlas, mitre-d3fend).
- Finding → recommended action class (fix the design, fix the code, detect at
  runtime, monitor).

## Method

1. **Identify the surface**: application type, language and framework,
   authentication model, third-party components, and deployment model.
2. **Gather evidence**: static analysis, dynamic testing, manual review,
   configuration exports, dependency manifests.
3. **Classify**: assign each weakness to one or more Top 10 categories and to
   the most specific CWE(s).
4. **Rate**: estimate occurrence (frequency, ease of exploitation) and impact
   (business effect, data exposure).
5. **Prioritize**: order remediation by risk and effort; assign owners.
6. **Deliver context**: category-by-category table plus a management-readable
   narrative and a developer-facing quick reference.

## Outputs

- Category-by-category risk table (weakness, CWE, evidence location, priority,
  owner).
- Executive risk narrative.
- Prioritized remediation backlog with owners.
- Optional developer quick-reference card per category.

## Sources

- OWASP Top 10 2025 documents (English docs directory) and historical archives
  (2003–2021) in the evidence clone; used as taxonomy reference only, not
  copied verbatim.
- OWASP CWE mapping material and the MITRE CWE catalog for identifiers.

## Contract

- Vendor-neutral and client-neutral.
- Every rating traces to evidence (file, route, configuration), never to
  general impressions.
- The skill reports posture and gaps; it does not claim a category is
  compliant.
- Handover: remediation backlog plus evidence index to the client security
  owner.