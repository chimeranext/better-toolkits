# Skill `mitre-d3fend` — protocol SSOT

## Purpose

Select defensive countermeasures from MITRE D3FEND, a knowledge graph of
cybersecurity countermeasures (the defensive counterpart of ATT&CK). The skill
maps offensive techniques (ATT&CK or ATLAS) to concrete D3FEND countermeasures
and produces an actionable defensive coverage plan with explicit gap reasons.

## When to use

- A client needs the defensive side of a threat model — what to deploy to
  detect or block a technique.
- A detection/hardening program wants a structured mapping from techniques to
  countermeasures.
- A review must show which attack techniques have no mapped defense.
- A client wants a technique-to-countermeasure table for a specific attack
  path.

## Model / taxonomy

D3FEND is a knowledge graph of countermeasures expressed as techniques. The
canonical data source (d3fend.csv) has fields: `d3fend-id`, `tactic`,
`label`, `definition`, `how-it-works`, `url`. The 2025 dataset contains 106
techniques distributed across five defensive tactics:

- **Detect** — 59 techniques (e.g., platform monitoring, process monitoring,
  file analysis, user behavior analysis).
- **Harden** — 19 techniques (e.g., credential hardening, application
  hardening, platform hardening).
- **Isolate** — 16 techniques (e.g., execution isolation, network isolation,
  sandboxing).
- **Deceive** — 9 techniques (e.g., decoy objects — files, credentials,
  sessions).
- **Evict** — 3 techniques (e.g., account locking, authentication cache
  invalidation, process termination).

Each technique has an ID like `D3-XXXX` and a canonical URL on d3fend.mitre.org
(e.g., `https://d3fend.mitre.org/technique/d3f:AuthenticationCacheInvalidation`).
The accompanying parser (`d3fend.py`) loads the D3FEND JSON-LD ontology and
generates the CSV.

## Mappings

- **ATT&CK / ATLAS technique → D3FEND countermeasure**: the CVE2CAPEC
  pipeline (technique2defend.py) links techniques to D3FEND defenses; countermap
  renders countermeasure graphs with digital-artifact paths connecting an
  attack step to its defense.
- Countermeasures are mapped per tactic (Detect, Harden, Isolate, Evict,
  Deceive) and prefer a defense acting on the same artifact as the attack.
- **Gap reasons** when no countermeasure exists: `no_mapping` (D3FEND knows
  the technique but maps nothing), `predates` (technique not in the loaded
  ontology), `none_in_tactic` (countermeasures exist but not in the requested
  tactic), `unavailable` (data missing — unknown, not a gap).

## Method

1. **Identify target techniques**: from a threat model (ATT&CK/ATLAS).
2. **Look up countermeasures**: for each technique, retrieve D3FEND
   countermeasures with their digital-artifact paths.
3. **Prefer official mappings**: use MITRE-published links first; mark
   analyst-added countermeasures as `analyst`.
4. **Classify coverage**: covered / partial / uncovered with gap reason.
5. **Produce plan**: a defensive coverage matrix (technique × countermeasure)
   and prioritized implementation recommendations.

## Outputs

- Technique → countermeasure mapping table (with artifact paths).
- Defensive coverage matrix by tactic.
- Gap report with explicit reasons.
- Prioritized countermeasure implementation backlog.

## Sources

- InternetNZ/d3fend clone: `d3fend.csv` (canonical dataset) and `d3fend.py`
  (ontology parser).
- CVE2CAPEC clone: `technique2defend.py` and `defend_db.jsonl`.
- countermap clone: D3FEND ingest, countermeasure rendering, and provenance
  rules.

## Contract

- Vendor-neutral and client-neutral.
- Only mapping published by MITRE is treated as official; derived/analyst
  links are labeled.
- A missing countermeasure is reported with a reason — never silently treated
  as safe.
- Handover: coverage matrix, gap report, and implementation backlog to the
  client security owner.