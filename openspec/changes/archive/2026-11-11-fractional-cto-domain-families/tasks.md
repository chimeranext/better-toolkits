# Tasks — fractional-cto-domain-families

## Family organization

- [x] Restructure `skills/` into family folders per the design (Engagement,
      Process Engineering, Requirements, Standards, Strategy, Architecture,
      Metrics, Risk & Resilience, GRC, Threat / Defense).
- [x] Drop `cto-` prefixes from any proposed names (toolkit is the context).

## New families (author from references)

### Strategy
- [x] Author `skills/strategy/roadmap` (roadmapping, business alignment, portfolio).
- [x] Author `skills/strategy/portfolio` (tech portfolio management, R&D strategy).
- [x] Author `skills/strategy/rnd-alignment` (align R&D to business goals).

### Architecture
- [x] Author `skills/architecture/decision` (ADRs, decision framing).
- [x] Author `skills/architecture/stack-evaluation` (tech stack assessment/tradeoffs).
- [x] Author `skills/architecture/migration` (legacy-to-cloud/modernization guidance).

### Metrics
- [x] Author `skills/metrics/dora` (DORA: deployment frequency, lead time, MTTR, CFR).
- [x] Author `skills/metrics/reliability` (SLO/SLI, availability).
- [x] Author `skills/metrics/velocity` (engineering velocity analysis).
- [x] Author `skills/metrics/team-health` (team health KPIs).
- [x] Author `skills/metrics/exec-reporting` (executive dashboards/metrics narrative).

### Risk & Resilience
- [x] Author `skills/risk/audit` (security/compliance audit framing).
- [x] Author `skills/risk/incident-response` (IR plan, roles, runbook linkage).
- [x] Author `skills/risk/disaster-recovery` (DR strategy, RPO/RTO).
- [x] Author `skills/risk/resilience` (resilience engineering, fault injection links).

### GRC / Universal
- [x] Author `skills/grc/iso27001`.
- [x] Author `skills/grc/iso27701`.
- [x] Author `skills/grc/iso42001`.
- [x] Author `skills/grc/nist-800-53`.
- [x] Author `skills/grc/nist-csf`.
- [x] Author `skills/grc/nist-ai-rmf`.
- [x] Author `skills/grc/soc2`.
- [x] Author `skills/grc/pci-dss`.
- [x] Author `skills/grc/swift-csp`.
- [x] Author `skills/grc/cis-controls`.
- [x] Author `skills/grc/wcag`.
- [x] Author `skills/grc/tprm`.
- [x] Deepen `fedramp`, `nist-csf`, `tsa`, `iso27001` protocols with benchmark-level detail (FedRAMP lifecycle readiness→ATO→ConMon; CSF 2.0 + D3FEND; TSA SD-01; ISO 27001 Annex A + 27701/42001 links).

### GRC / Regional (USMCA · LATAM · APAC · EMEA)
- [x] Author `skills/grc/hipaa` (US).
- [x] Author `skills/grc/fedramp` (US).
- [x] Author `skills/grc/cmmc` (US).
- [x] Author `skills/grc/sox-itgc` (US).
- [x] Author `skills/grc/section-508` (US).
- [x] Author `skills/grc/tsa` (US).
- [x] Author `skills/grc/ear` (US export).
- [x] Author `skills/grc/itar` (US export).
- [x] Author `skills/grc/ccpa` (US/California).
- [x] Author `skills/grc/lgpd` (Brazil).
- [x] Author `skills/grc/dpdpa` (India).
- [x] Author `skills/grc/ism` (Australia).
- [x] Author `skills/grc/nzism` (New Zealand).
- [x] Author `skills/grc/vietnam-pdpl` (Vietnam).
- [x] Author `skills/grc/china-pipl` (China — PIPL/DSL/CSL data & cyber; Shenzhen/Guangdong/Yiwu hubs; DataGuidance + Latham & Watkins refs).
- [x] Author `skills/grc/china-trademarks` (China — first-to-file; Madrid Protocol vs Direct National Filing; CNIPA sub-classes; Corsearch/Woodburn/Trademark Partners/CBL/China Briefing refs).
- [x] Author `skills/grc/hong-kong-pdpo` (Hong Kong).
- [x] Author `skills/grc/singapore-pdpa` (Singapore).
- [x] Author `skills/grc/japan-appi` (Japan).
- [x] Author `skills/grc/south-korea-pipa` (South Korea).
- [x] Author `skills/grc/taiwan-pdpa` (Taiwan/Taipei).
- [x] Author `skills/grc/gdpr` (EU).
- [x] Author `skills/grc/eu-ai-act` (EU).
- [x] Author `skills/grc/dora` (EU).
- [x] Author `skills/grc/csrd` (EU).
- [x] Author `skills/grc/nis2` (EU).
- [x] Author `skills/grc/tisax` (EU/auto).
- [x] Author `skills/grc/cyber-essentials` (UK).
- [x] Author `skills/grc/uae-grc` (UAE).
- [x] Author `skills/grc/saudi-arabia-grc` (Saudi Arabia).
- [x] LATAM gaps — author jurisdiction profiles (or mark to-author) for: Costa Rica,
      Colombia, Mexico, Panama, Guatemala, El Salvador, Chile, Argentina.

### Threat / Defense
- [x] Author `skills/threat-defense/owasp-top10` (OWASP Top 10 2025, A01–A10 + X01, 11 idiomas).
- [x] Author `skills/threat-defense/owasp-nhi-top10` (OWASP Non-Human Identities Top 10 2025).
- [x] Author `skills/threat-defense/mitre-atlas` (ATLAS 2026.09, formato v6; SAFEAI report).
- [x] Author `skills/threat-defense/mitre-attack` (ATT&CK Enterprise v20; provenance oficial/derivado/analista).
- [x] Author `skills/threat-defense/mitre-d3fend` (D3FEND 106 técnicas; Detect 59 · Harden 19 · Isolate 16 · Deceive 9 · Evict 3).
- [x] Author `skills/threat-defense/ai-defense` (AIDEFEND 311 controles defensivos AI; ATLAS/NIST AI RMF align).

## Handover procedures

- [x] Author `skills/handover-risk-to-cro` (Risk & Resilience → Chief Risk Officer).
- [x] Author `skills/handover-grc-to-cco` (GRC Universal/Regional → Chief Compliance Officer).
- [x] Author `skills/handover-metrics-to-vpeng` (Metrics → VP Engineering).
- [x] Author `skills/handover-architecture-to-principal` (Architecture → Principal Architect).
- [x] Author `skills/handover-strategy-to-board` (Strategy → CEO / Board).
- [x] Author `skills/handover-engagement-to-board` (Engagement → CEO / Board).
- [x] Author `skills/handover-process-to-ops` (Process Engineering → Ops / COO).
- [x] Author `skills/handover-requirements-to-cpo` (Requirements → CPO / Product).
- [x] Author `skills/handover-standards-to-vpeng` (Standards → VP Engineering).

## Integration

- [x] Update `toolkits/fractional-cto-toolkit/README.md` skills table + Mermaid diagram with new families.
- [x] Extend `/engineering-standards-audit` with new family focus areas.
- [x] SSS refactor: `domain-driven-advisor` SKILL.md → thin shim; triage moved to
      `references/domain-driven-advisor/protocol.md`; command reference updated (approved in-PR scope).
- [x] Hotfix (in-PR): `/verify-evidence` spec/protocol — invariant claim SHALL use the
      **Specula-based pipeline** (analyze → specgen → validate; local TLC core;
      external agent CLI optional), not a mandatory external agent CLI.
- [x] Marketplace plugin version bump (plugin.json) for fractional-cto-toolkit.
- [x] Dogfood on `vertivolatam/monorepo` (audit → setup → verify) — audit real (AGENTS.md 12.9KB, 6 apps, 5 PRs abiertos, sin docs/process ni PR template); setup scaffold aplicado al clone descartable (pointer AGENTS.md + docs/process + PR template + QT4L + OST stub); verify links OK.

## Verification

- [x] Model check (TLC): `src/audit/models/AdvisorRouting.tla` — routing invariants (ENF last, full sweep on empty signals, no dup, canonical order) verified PASS (32 states).
- [x] No third-party skill files copied into the toolkit (grep for repo names).
- [x] No `cto-` prefix on skill names.
- [x] `check-skills-catalog.py` passes (skills registered in package.json catalog).
