# Skill `taiwan-pdpa` — protocol SSOT

## Purpose

Assess and support compliance with Taiwan's Personal Data Protection Act
(PDPA), the primary law on the collection, processing, and use of personal
data in Taiwan. It applies broadly, including to foreign organizations that
collect/process/use personal data of individuals in Taiwan.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes personal data of individuals in Taiwan (including via
  the Taipei hub).
- A client operates in Taiwan or serves Taiwanese users.
- A client transfers personal data out of Taiwan.

## Method

1. **Map the collection/processing/use basics**: the PDPA requires a specific
   purpose and one of the lawful bases (consent, contract, legal obligation,
   public interest, or legitimate interest, among others); notice of purpose
   and usage is required at collection.
2. **Handle special categories**: sensitive personal data (health, criminal
   records, biometrics, political opinions, etc.) may only be processed in
   the statutory exceptional circumstances; document the basis per category.
3. **Honor data subject rights**: inquiry, review, copy, correction,
   deletion, and cessation of use; build a request-handling workflow.
4. **Check cross-border transfer restrictions**: the competent authority may
   restrict international transfers of personal data (e.g., where the
   destination lacks adequate protection or the transfer harms national
   interest); verify whether a restriction applies to the client's flows.
5. **Security and breach**: implement measures to prevent unauthorized
   access/use; the PDPA and implementing rules expect notification and
   mitigation on leakage.
6. **Operate**: records, consent logs, retention limits, processor contracts,
   and staff training.

## Artifact

A PDPA pack: processing checklist, special-category register, rights workflow,
transfer-restriction check, and records.

## Contract

- Sensitive-data processing is justified under the statutory exceptions.
- Transfer analysis is confirmed with local counsel, especially for
   cross-strait flows.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — checklist, registers, open items.
- Verify against the current PDPA and the competent authority's regulations.
