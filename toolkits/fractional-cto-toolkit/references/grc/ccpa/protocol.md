# Skill `ccpa` — protocol SSOT

## Purpose

Assess and support compliance with the California Consumer Privacy Act (CCPA)
as amended by the California Privacy Rights Act (CPRA). The law applies to
for-profit businesses that meet revenue, volume, or proportion thresholds and
collect California consumers' personal information.

Grounded in the CTO-role references (Splunk, Devox; Sushegaad GRC as benchmark
only).

## When to use

- A client collects personal information from California residents.
- A client must decide whether the CCPA thresholds apply to it.
- A client needs to implement consumer-rights handling and notices.

## Method

1. **Determine applicability**: check the thresholds — annual gross revenue
   over $25M; or buy/sell/share personal information of 100,000+ California
   consumers/households; or derive 50%+ of revenue from sharing/selling
   personal information.
2. **Inventory personal information**: data categories (identifiers, geolocation,
   biometric, sensitive PI, etc.), sources, purposes, and retention (the
   record-of-practice basis for the law's data maps).
3. **Map consumer rights**: access (know), delete, correct, opt-out of
   sale/share, limit use of sensitive personal information, and
   non-discrimination (the right to equal service).
4. **Design intake workflow**: a verified-request process (identity
   verification), timelines (45 days + 45-day extension), and handling of
   requests across systems.
5. **Publish notices**: privacy policy (collection at or before collection),
   notice of right to opt-out (Do Not Sell or Share link), and the
   "Limit the Use of My Sensitive Personal Information" notice where it
   applies.
6. **Contract with service providers**: agreements limiting use and requiring
   compliance (contractors/service providers) per Section 1798.140.
7. **Stand up training and records**: train staff; log requests and
   responses; update the privacy policy annually.

## Artifact

A CCPA pack: applicability determination, personal-information inventory,
rights-handling workflow, notice inventory, and contract template updates.

## Contract

- Rights are honored within statutory timelines; denials are documented and
   reasoned.
- The opt-out of sale/share is implemented for all selling/sharing channels
   (including advertising and cross-context behavioral advertising).
- Vendor-neutral and client-neutral.
- Handover: on engagement end, transfer to the Chief Compliance Officer (CCO)
  — applicability, inventory, open items.
- Verify against the current CCPA/CPRA regulations and the CPPA (California
  Privacy Protection Agency) rulemaking.
