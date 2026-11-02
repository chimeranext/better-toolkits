# Skill `japan-appi` — protocol SSOT

## Purpose

Assess and support compliance with Japan's Act on the Protection of Personal
Information (APPI), as amended (fully enforced since 2023), supervised by the
Personal Information Protection Commission (PPC). It applies to "personal
information handling business operators" (PIHBOs) processing personal data in
Japan, including foreign operators that handle Japanese residents' data.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client processes personal data of individuals in Japan.
- A client operates in Japan or serves the Japanese market.
- A client transfers personal data into or out of Japan.

## Method

1. **Identify the operator's role**: PIHBO (business operator) vs. subcontractor
   (entrusted party); map the data flows and the personal data categories.
2. **Apply the core obligations**:
   - Use of personal data limited to the specified purpose; obtain consent
     for changes to purpose.
   - Provide notification of purpose at collection.
   - Correct handling of sensitive personal data (explicit consent) and of
     "need-to-know" limits.
   - Ensure accuracy and security; restrain leakage and unauthorized access.
3. **Honor data subject rights**: disclosure, correction, cessation of use,
   and deletion requests; keep the prescribed response procedures.
4. **Cross-border transfers**: when transferring personal data to a third
   party overseas, either (a) the recipient is in a country recognized by the
   PPC as having an equivalent level of protection, or (b) the recipient has
   taken measures consistent with APPI (e.g., a data-transfer agreement under
   the PPC guidelines); verify which route applies and document it.
5. **Pseudonymized/anonymized data**: note the lighter regimes for
   pseudonymized and anonymized data if the client uses them.
6. **Records and registers**: maintain handling records, consent logs, and
   transfer documentation.

## Artifact

An APPI pack: role map, obligation checklist, rights-handling workflow,
cross-border transfer note, and records.

## Contract

- Transfer analysis identifies the PPC-recognized country or the required
  measures; it is confirmed with local counsel.
- Sensitive-data handling is explicit and consented.
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — checklist, transfer notes, open items.
- Verify against the current APPI guidelines and PPC Q&A.
