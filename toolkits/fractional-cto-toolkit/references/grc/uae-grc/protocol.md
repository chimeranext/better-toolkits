# Skill `uae-grc` — protocol SSOT

## Purpose

Determine and support the **applicable UAE regime** for data protection and
cybersecurity. The UAE is not a single regime — the applicable law depends on
where the entity is established: mainland, a financial free zone, or the
public sector, plus national cyber standards.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client operates in the UAE or processes UAE personal data.
- A client is establishing (or has) an entity in DIFC, ADGM, or mainland.
- A client is a UAE entity needing a cybersecurity baseline (NESA).

## Method

1. **Determine the governing privacy regime**:
   - **Mainland (Federal)**: Federal Decree-Law No. 45/2021 on the
     Protection of Personal Data (UAE PDPL) — the national law; enforcement
     expectations have been phasing in, with implementing decisions and
     sectoral application.
   - **DIFC** (Dubai International Financial Centre): DIFC Data Protection
     Law No. 5/2020 and the DIFC Commissioner's regulations.
   - **ADGM** (Abu Dhabi Global Market): ADGM Data Protection Regulations
     2021 (Directives/Data Protection).
   - Entities in free zones outside DIFC/ADGM generally remain under the
     federal PDPL; verify with counsel.
2. **Map PDPL obligations** (mainland): legal bases for processing, notice
   and consent, data subject rights, DPO obligations, security measures, and
   cross-border transfer restrictions (transfers only for permitted purposes,
   e.g., with consent or contractual necessity, per the law).
3. **For DIFC/ADGM**: apply the zone's law which is closer to international
   standards (DIFC law is modelled on GDPR-style concepts); handle
   cross-border transfers under those regimes.
4. **Cybersecurity baseline**: apply the NESA (National Electronic Security
   Authority) UAE Information Assurance standards and the UAE Cybersecurity
   Strategy expectations; sectoral rules apply via the Central Bank (CBUAE)
   for financial entities and TRA for telecom.
5. **Gap analysis and remediation plan** across the applicable regime(s).

## Artifact

A UAE GRC pack: applicable-regime determination, obligations mapping, gap
assessment, and a remediation plan.

## Contract

- Where an entity touches multiple regimes (mainland + DIFC/ADGM), each is
   analyzed separately.
- Cross-border transfer analysis is confirmed with UAE counsel; the PDPL's
   transfer restrictions are strict.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — regime map, gaps, open items.
- Verify against current implementing decisions and sectoral regulators'
   guidance (the federal PDPL's practical enforcement continues to develop).
