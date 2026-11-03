# Skill `gdpr` — protocol SSOT

## Purpose

Assess and support compliance with the EU General Data Protection Regulation
(GDPR — Regulation (EU) 2016/679). It applies to controllers and processors
established in the EU/EEA and to those processing the personal data of
individuals in the EU/EEA.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only). The GDPR is the baseline that many other privacy regimes mirror.

## When to use

- A client processes personal data of EU/EEA individuals.
- A client sells to or monitors EU/EEA users.
- A client transfers data outside the EEA and needs a Chapter V assessment.

## Method

1. **Determine roles**: controller vs. processor vs. joint controllers; map
   the processing activities and their legal bases (Art. 6, and Art. 9 for
   special categories).
2. **Build a record of processing activities (RoPA)** (Art. 30): purpose,
   categories, recipients, transfers, retention, and security measures — for
   controllers and processors (with the size exemptions).
3. **Assess DPO obligations**: appoint a Data Protection Officer where the
   client is a public authority, engages in large-scale systematic monitoring,
   or processes special categories on a large scale (Art. 37).
4. **DPIA** (Art. 35): run a Data Protection Impact Assessment for high-risk
   processing (systematic evaluation, large-scale special categories, public
   areas monitoring) and consult the supervisory authority if residual risk
   remains.
5. **Data subject rights** (Art. 12–23): access, rectification, erasure,
   restriction, portability, objection, and automated-decision explanation —
   implement a request workflow with the one-month deadline.
6. **Breach handling** (Art. 33–34): notify the supervisory authority within
   72 hours of awareness, and data subjects when high risk.
7. **Cross-border transfers** (Chapter V): validate the route — adequacy
   decision, appropriate safeguards (SCCs, binding corporate rules) plus a
   transfer impact assessment, or a derogation (Art. 49). Document each
   transfer.
8. **Controllers/processors contracts** (Art. 28): put processor agreements,
   sub-processor authorizations, and audit rights in place.

## Artifact

A GDPR pack: role map, RoPA, legal-basis register, DPO decision, DPIA
register, rights workflow, breach flow, and the transfer assessment.

## Contract

- The RoPA is complete and current; it is the backbone of the file.
- Transfers rely on a documented mechanism, not on assumption.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — RoPA, DPIAs, open items.
- Keep pace with EDPB guidance and the enforcement priorities of the relevant
  supervisory authorities.
