# Skill `mitre-attack` — protocol SSOT

## Purpose

Use MITRE ATT&CK (Enterprise, v20) as the unifying threat taxonomy for threat
modeling, detection engineering, and telemetry correlation. The skill maps
CVEs/weaknesses into technique-level coverage, correlates telemetry to
techniques (e.g., container CLI/API abuse), and produces gap analysis and
prioritized detections.

## When to use

- A client needs to threat-model a system or a new feature.
- A detection engineering or SOC program wants coverage analysis against a
  recognized standard.
- A client wants to trace a CVE/weakness to the adversary behavior it enables.
- An incident must be mapped to technique-level actions for reporting and
  future detection.

## Model / taxonomy

ATT&CK is a knowledge base of adversary tactics and techniques. Enterprise
ATT&CK (v20.0 in the evidence) organizes techniques and sub-techniques under
tactics (e.g., Initial Access, Execution, Persistence, Privilege Escalation,
Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection,
Command and Control, Exfiltration, Impact). Objects include techniques,
tactics, groups, software, campaigns, mitigations, analytics (with data
components and log-source references), and relationships.

The CVE2CAPEC pipeline builds the chain: CVE → CWE → CAPEC → ATT&CK technique
→ D3FEND/ATLAS (cve2cwe.py, cwe2capec.py, capec2technique.py,
technique2defend.py, technique2atlas.py). Provenance conventions:
`official` (published by MITRE), `derived` (computed from parent/sub-technique,
revoked-ID replacement, or F3/ATLAS links), `analyst` (analyst assertions).

## Method

1. **Define scope**: platforms, data flows, and trust boundaries.
2. **Map the environment**: from architecture and asset inventory, identify
   relevant techniques/sub-techniques.
3. **Correlate telemetry**: e.g., map container/API audit events to technique
   T1059.013 (Container CLI/API). Telemetry coverage matches collected log
   sources against the log-source references MITRE publishes on each analytic.
4. **Evaluate detections**: given detection rules mapped to ATT&CK IDs,
   classify each in-scope technique as covered, partial, or uncovered; rank
   gaps by how many groups ATT&CK links to the technique.
5. **Produce coverage artifacts**: technique coverage matrix, gaps, and
   recommended detection/analytic additions.
6. **Report**: management narrative plus technique-level detail.

## Outputs

- Technique/sub-technique coverage matrix for the target system.
- CVE/CWE → CAPEC → ATT&CK mapping table for relevant findings.
- Telemetry-to-analytic correlation result (covered/partial/uncovered).
- Prioritized detection/analytic backlog.

## Sources

- ATT&CK v20 Enterprise STIX 2.1 bundle (referenced in the countermap clone
  sources.lock.json).
- CVE2CAPEC clone scripts and resources (cve2cwe, cwe2capec,
  capec2technique, technique2defend/atlas).
- Kestrel clone as a reference example of normalizing container security
  telemetry against ATT&CK T1059.013.

## Contract

- Vendor-neutral and client-neutral.
- Coverage claims are computed from the client's actual telemetry/rules, not
  assumed; basis notes say what was computed and from what.
- Provenance labels are preserved on all mappings.
- Handover: coverage matrix, gap list, and detection backlog to the client
  security operations owner.