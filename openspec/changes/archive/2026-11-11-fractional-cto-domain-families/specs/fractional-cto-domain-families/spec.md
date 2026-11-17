# Specs — fractional-cto-domain-families

## ADDED Requirements

### Requirement: Domain-family organization

The fractional-cto-toolkit SHALL organize its skills into domain families per the
FFF standard, with the toolkit name providing context — no `cto-` prefix on
individual skill names.

#### Scenario: Family layout
- **WHEN** a new skill is added to the toolkit
- **THEN** it lives under a family folder (`skills/<family>/…`) and its name
  does not repeat the `cto-` prefix

### Requirement: New families authored (Strategy, Architecture, Metrics, Risk & Resilience, GRC, Threat / Defense)

The toolkit SHALL add new families, each authored from the CTO-role
references (MIT, amazingCTO, Splunk, Devox, freelancermap, OWASP, MITRE,
AIDEFEND):

- **Strategy** — roadmap, portfolio, R&D alignment
- **Architecture** — decision (ADR), stack evaluation, migration
- **Metrics** — DORA, reliability, velocity, team health, executive reporting
- **Risk & Resilience** — audit, incident response, disaster recovery, resilience
- **GRC / Universal** — ISO 27001, ISO 27701, ISO 42001, NIST 800-53, NIST CSF,
  NIST AI RMF, SOC 2, PCI DSS, SWIFT CSP, CIS Controls, WCAG, TPRM
- **GRC / Regional** — jurisdiction table (USMCA · LATAM · APAC · EMEA → country),
  e.g. EU (GDPR, EU AI Act, DORA, CSRD, NIS2, TISAX), US (HIPAA, FedRAMP, CMMC,
  SOX ITGC, Section 508, TSA, EAR, ITAR, CCPA), Brazil (LGPD), India (DPDPA),
  Australia (ISM), New Zealand (NZISM), Vietnam (Vietnam PDPL), UK
  (Cyber Essentials), UAE (UAE GRC), Saudi Arabia (Saudi Arabia GRC), China
  (Shenzhen/Guangdong/Yiwu hubs), Hong Kong, Singapore, Japan, South Korea,
  Taiwan (Taipei), and the LATAM country gaps (Costa Rica, Colombia, Mexico,
  Panama, Guatemala, El Salvador, Chile, Argentina) marked as to-author
- **Threat / Defense** — OWASP Top 10, OWASP Non-Human Identities Top 10,
  MITRE ATLAS, MITRE ATT&CK, MITRE D3FEND, AI-defense

#### Scenario: Strategy family exists
- **WHEN** a CTO needs a technology roadmap
- **THEN** the `roadmap` skill is available under the Strategy family

#### Scenario: GRC universal framework available
- **WHEN** a CTO needs compliance guidance for ISO 27001
- **THEN** the `iso27001` skill is available under the GRC/Universal family

#### Scenario: GRC regional jurisdiction selects framework
- **WHEN** a CTO serves a client in a specific jurisdiction (e.g. EU)
- **THEN** the GRC/Regional family exposes the frameworks for that country/region
  (e.g. `gdpr`, `eu-ai-act`) without dropping the universal set

#### Scenario: China jurisdiction covers data and trademarks
- **WHEN** a CTO serves a client whose supply chain involves a Chinese
  manufacturer (e.g. importing from an OEM in Shenzhen
  under a white-label agreement)
- **THEN** the GRC/Regional family exposes `china-pipl` (PIPL/DSL/CSL) and
  `china-trademarks`, with the trademark skill covering the **defensive
  first-to-file strategy**: registering the brand in China before engaging the
  factory, so the OEM cannot register the mark first and block the import or
  appropriate the brand

#### Scenario: China trademark as anti-theft control for importers
- **WHEN** a client plans a white-label agreement with a Chinese manufacturer
- **THEN** `china-trademarks` guides registering the mark in China (via Madrid
  Protocol or Direct National Filing with a licensed local agent) before sharing
  brand/design IP, and flags the first-to-file risk if the factory beats them to
  filing

#### Scenario: Threat/Defense family exists
- **WHEN** a CTO needs threat intelligence or defensive guidance (e.g. applying
  OWASP Top 10 or mapping ATT&CK techniques to D3FEND countermeasures)
- **THEN** the `owasp-top10`, `owasp-nhi-top10`, `mitre-atlas`, `mitre-attack`,
  `mitre-d3fend`, and `ai-defense` skills are available under the Threat/Defense
  family

#### Scenario: GRC benchmark deepening
- **WHEN** a CTO needs compliance guidance for FedRAMP, NIST CSF, TSA, or ISO 27001
- **THEN** the `fedramp`, `nist-csf`, `tsa`, and `iso27001` protocols expose
  benchmark-level lifecycle detail (readiness→ATO→ConMon; CSF 2.0 + D3FEND;
  TSA SD-01; ISO 27001 Annex A + 27701/42001 links)

### Requirement: No cloning of third-party skills

The toolkit SHALL NOT clone or import third-party skill content; third-party
repos are used as benchmark/evidence only.

#### Scenario: Authoring provenance
- **WHEN** a new skill is authored
- **THEN** its content is written from the references, and no third-party skill
  file is copied into the toolkit

### Requirement: Integration with standards audit

`/engineering-standards-audit` SHALL expose the new families as focus areas, so
the audit can be parallelized per family (one subagent per family).

#### Scenario: Audit focuses on a new family
- **WHEN** `/engineering-standards-audit --focus metrics` runs
- **THEN** it audits the Metrics family and reports findings

### Requirement: Handover procedures per family

Each family SHALL include a **handover procedure** to its organic executive
owner (the role that owns that domain after the fractional CTO engagement ends):

- **Risk & Resilience** → Chief Risk Officer (CRO)
- **GRC / Universal** and **GRC / Regional** → Chief Compliance Officer (CCO)
- **Metrics** → VP Engineering
- **Architecture** → Principal Architect / Engineering
- **Strategy** → CEO / Board
- **Engagement** → CEO / Board
- **Process Engineering** → Ops / COO
- **Requirements** → CPO / Product
- **Standards** → VP Engineering

#### Scenario: Risk handover to CRO
- **WHEN** a fractional CTO engagement ends while Risk & Resilience work is active
- **THEN** a handover artifact is produced that transfers ownership to the Chief
  Risk Officer (CRO), including current posture, open items, and owner details

#### Scenario: GRC handover to CCO
- **WHEN** a fractional CTO engagement ends while GRC work is active
- **THEN** a handover artifact is produced that transfers ownership to the Chief
  Compliance Officer (CCO), including applicable jurisdiction(s), status, and
  open compliance items

### Requirement: Documentation update

The toolkit README SHALL list the new families in the skills table and in the
engagement Mermaid diagram.

#### Scenario: README reflects families
- **WHEN** a reader opens the toolkit README
- **THEN** all families (existing + new) are present in the skills table and the
  orchestration diagram

### Requirement: Domain-driven-advisor SSS refactor (approved in-PR)

The `domain-driven-advisor` skill (in `make-no-mistakes-toolkit`) SHALL follow
the SSS standard: its `SKILL.md` is a thin shim, and the triage content lives in
`references/domain-driven-advisor/protocol.md`.

#### Scenario: Advisor skill is a thin shim
- **WHEN** a user inspects `skills/domain-driven-advisor/SKILL.md`
- **THEN** it contains frontmatter plus a single reference to
  `references/domain-driven-advisor/protocol.md`, and no triage decision tree
  in the skill body
