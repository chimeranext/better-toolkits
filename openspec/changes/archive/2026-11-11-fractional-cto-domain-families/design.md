# Design — fractional-cto-domain-families

## 1. Family model (per FFF)

The toolkit's skills are organized as **families × internal taxonomy**. The
toolkit name is the context; skills do not repeat a `cto-` prefix.

| Family | Status | Internal taxonomy | Handover owner (organic executive) |
| --- | --- | --- | --- |
| Engagement | existing → extend | nda, assessment, takeover, psa, retainer | CEO / Board |
| Process Engineering | existing → refine | standardization, triage, sop, playbook, runbook, document-it/this | Ops / COO |
| Requirements | existing → refine | requirements-authoring | CPO / Product |
| Standards | existing → extend | engineering-standards-setup/audit | VP Engineering |
| Strategy | **new (author)** | roadmap, portfolio, rnd-alignment | CEO / Board |
| Architecture | **new (author)** | decision (ADR), stack-evaluation, migration | Principal Architect / Engineering |
| Metrics | **new (author)** | dora, reliability, velocity, team-health, exec-reporting | VP Engineering |
| Risk & Resilience | **new (author)** | audit, incident-response, disaster-recovery, resilience | **Chief Risk Officer (CRO)** |
| GRC / Universal | **new (author)** | iso27001, iso27701, iso42001, nist-800-53, nist-csf, nist-ai-rmf, soc2, pci-dss, swift-csp, cis-controls, wcag, tprm | **Chief Compliance Officer (CCO)** |
| GRC / Regional | **new (author)** | see jurisdiction table below (USMCA · LATAM · APAC · EMEA) | **Chief Compliance Officer (CCO)** |
| Threat / Defense | **new (author)** | owasp-top10, owasp-nhi-top10, mitre-atlas, mitre-attack, mitre-d3fend, ai-defense | CISO / Security |

### GRC / Regional — jurisdiction table (region → country)

| Region | Country | Frameworks |
| --- | --- | --- |
| USMCA | US | hipaa, fedramp, cmmc, sox-itgc, section-508, tsa, ear, itar, ccpa |
| USMCA | Mexico / Canada | *(gap — to author)* |
| LATAM | Brazil | lgpd |
| LATAM | Costa Rica | *(gap — to author)* |
| LATAM | Colombia | *(gap — to author)* |
| LATAM | Mexico | *(gap — to author)* |
| LATAM | Panama | *(gap — to author)* |
| LATAM | Guatemala | *(gap — to author)* |
| LATAM | El Salvador | *(gap — to author)* |
| LATAM | Chile | *(gap — to author)* |
| LATAM | Argentina | *(gap — to author)* |
| APAC | India | dpdpa |
| APAC | Australia | ism |
| APAC | New Zealand | nzism |
| APAC | Vietnam | vietnam-pdpl |
| APAC | China (Shenzhen · Guangdong · Yiwu) | `china-pipl` (PIPL/DSL/CSL data & cyber) · `china-trademarks` (defensive first-to-file for importers: Madrid vs Direct National Filing, CNIPA sub-classes, white-label anti-theft) | *(gap — to author)* |
| APAC | Hong Kong | *(gap — to author: PDPO)* |
| APAC | Singapore | *(gap — to author: PDPA)* |
| APAC | Japan | *(gap — to author: APPI/PIPA)* |
| APAC | South Korea | *(gap — to author: PIPA)* |
| APAC | Taiwan (Taipei) | *(gap — to author: Taiwan PDPA)* |
| APAC | Others | *(gap — to author)* |
| EMEA | EU | gdpr, eu-ai-act, dora, csrd, nis2, tisax |
| EMEA | UK | cyber-essentials |
| EMEA | UAE | uae-grc |
| EMEA | Saudi Arabia | saudi-arabia-grc |
| EMEA | Others | *(gap — to author)* |

## 2. Authoring sources (evidence, not clone)

Each new skill is authored from the CTO-role references:

| Family | Primary references |
| --- | --- |
| Strategy | MIT CTO Program (roadmapping, portfolio, R&D), Devox (Visionary), amazingCTO |
| Architecture | MIT, Splunk (product/platform leadership), Devox (architecture) |
| Metrics | Splunk (reliability, velocity, team health), DORA; benchmark: cto-os-skills |
| Risk & Resilience | Splunk (cybersecurity & compliance), Devox (security & privacy); benchmark: cto-os-skills |
| GRC / Compliance | Splunk, Devox, Sushegaad GRC (benchmark only) |
| GRC / Regional — China | PIPL/DSL/CSL: DataGuidance (interplay), Latham & Watkins (Network Data Security Management Regulations). Trademarks: Corsearch (first-to-file vs first-to-use), Woodburn (China 2026 rules), Trademark Partners (first-to-file), CBL Translations (China trademarks FAQ), China Briefing (register before market entry). Madrid vs Direct comparison as provided. |
| Threat / Defense | OWASP Top 10 (2003–2025, multilingüe), OWASP Non-Human Identities Top 10 2025, MITRE ATLAS (Adversarial Threat Landscape for AI Systems; SAFEAI report), MITRE ATT&CK Enterprise v20 (provenance oficial/derivado/analista), MITRE D3FEND (106 técnicas: Detect 59 · Harden 19 · Isolate 16 · Deceive 9 · Evict 3; `d3fend.csv` canónico), AIDEFEND (311 controles defensivos AI, evaluados contra 9 frameworks; ATLAS/NIST AI RMF align). Benchmark only: Claude-Skills-GRC (Jandyoverseas977), CVE2CAPEC, countermap, Kestrel, Cyber-Sentinel. |

Third-party skill repos are used **as benchmark/evidence only** — never copied.

## 3. Integration

- New skills land in `toolkits/fractional-cto-toolkit/skills/<family>/…`.
- The README skill table + engagement Mermaid diagram are updated to include the
  new families.
- `/engineering-standards-audit` (already parallelizable per family) gains the
  new families as focus areas.
- Marketplace plugin version bump (plugin.json) for the toolkit.

## 4. Non-goals

- No cloning/importing third-party skill content.
- No prefixed `cto-` skill names.
- No new toolkit (stays within fractional-cto-toolkit).

## 5. In-PR maintenance scope (approved)

This PR also carries a **structural maintenance refactor** of
`domain-driven-advisor` (in `make-no-mistakes-toolkit`) to the SSS standard:
SKILL.md becomes a thin shim; the triage content moves to
`references/domain-driven-advisor/protocol.md`. Approved by the user as
in-PR scope (not a separate change) — tracked in tasks.md for traceability.
