# Skill `disaster-recovery` — protocol SSOT

## Purpose

Define a disaster recovery (DR) strategy for a client: recovery objectives,
recovery tiers, architecture choices, and a testing cadence that proves the
strategy works.

Grounded in the CTO-role references: Splunk (reliability) and standard DR
practice (RPO/RTO definitions, tiered recovery, test-driven recovery).

## When to use

- When a client asks "what happens if we lose the data center / cloud region / a
  run?" and needs a concrete answer.
- When a continuity obligation exists (contract, regulation, or business
  dependence on recovery time).
- When reviewing an existing DR plan for the classic failure: targets that have
  never been tested.

## Method

1. **Set business recovery objectives first.** For each critical system, answer:
   - **RPO (Recovery Point Objective)** — how much data loss is acceptable (for
     example, 15 minutes, 1 hour, 24 hours).
   - **RTO (Recovery Time Objective)** — how quickly must the service be back
     (for example, 1 hour, 4 hours, 24 hours).
   These come from business impact, not from what is easy to build.
2. **Rank systems by tier.**

   | Tier | Definition | Typical RTO | Typical RPO |
   | --- | --- | --- | --- |
   | **Tier 0** | Revenue-critical, must never be down long | Minutes–1h | Minutes |
   | **Tier 1** | Important, short outage acceptable | 1–4h | 1h |
   | **Tier 2** | Internal/back-office, longer outage acceptable | 24h+ | 24h |
   | **Tier 3** | Rebuildable/archival | Rebuildable | N/A |

3. **Choose recovery mechanisms** per tier:
   - Backup + restore (lowest cost; slowest recovery).
   - Replication (data/region/zone) with failover (faster RPO).
   - Active-active/multi-region (fastest RTO; highest cost/complexity).
   Pick the mechanism that meets the target at the lowest sustainable cost; flag
   the tradeoff explicitly.
4. **Plan for the human and process elements.** Who declares a disaster, how
   they are reached, and what steps are executed (link to runbooks). A DR plan
   without an owner and a declared trigger will not be used.
5. **Test on a cadence.** A DR plan is a claim until it is exercised. Run tests
   at a fixed cadence (for example, quarterly tabletop, annual full failover).
   Record the observed RPO/RTO versus target; failures in the test are findings
   to fix, not secrets to hide.
6. **Report.** A DR strategy document: tiers, objectives, mechanisms, trigger
   and owner, test results, and the gap between tested and target performance.

## Artifact

A DR strategy document stored in the engagement workspace (for example,
`./fractional-cto/risk/disaster-recovery.md`), with the test log attached.

## Contract

- RPO/RTO are explicit, per tier, and derived from business impact — never
  defaulted silently.
- Every tier has a named mechanism, owner, and trigger.
- The strategy is tested on a stated cadence; untested targets are reported as
  gaps, not as achieved capability.
- Residual risk (what is not covered) is stated, not hidden.
