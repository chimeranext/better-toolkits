# Skill `resilience` — protocol SSOT

## Purpose

Apply resilience engineering to a client's systems: assume failure, understand
how the system degrades and recovers, and verify that behavior through fault
injection, game days, and blameless postmortems.

Grounded in the CTO-role references: Splunk (reliability), Devox (security &
privacy), and the resilience-engineering literature (anticipation and
recovery over prediction), plus the fault-injection gate (AFIF) in the
engineering-standards audit.

## When to use

- When a client claims a system is "reliable" but it has never been observed
  under failure.
- Before a critical launch, migration, or major change, to de-risk the
  failure modes.
- When a production incident exposed unknown behavior and the postmortem found
  no systemic fix.

## Method

1. **Assess the resilience posture.** For each critical service, ask: what are
   the known failure modes, how does the system behave under each, and what
   will it take to restore service? If the answers are "unknown", that itself is
   a finding.
2. **Anticipate, do not just predict.** Build a failure-mode inventory:
   upstream dependency loss, region/zone loss, data corruption, credential
   expiry, traffic spikes, bad deploys, and human error. Resilience is about
   graceful degradation and recovery, not about preventing every failure.
3. **Inject faults safely.** Design experiments with:

   - A defined **blast radius** (one service, one region, a percentage of
     traffic — never production-wide by default).
   - A **rollback path** and abort criteria.
   - A scheduled window with stakeholders aware.
   - Observability (metrics/logs/traces) capturing the behavior.
   Use chaos tooling where available; when not, game days and tabletop
   exercises still exercise the plan.
4. **Run game days.** Simulate an incident with the on-call team using real
   runbooks. The goal is to discover where the runbook and the system disagree —
   a game day that "goes perfectly" is suspect.
5. **Postmortem blamelessly.** After any real incident or failed experiment,
   write a postmortem that identifies contributing factors and systemic fixes,
   not individual blame. Track action items to closure.
6. **Report.** A resilience posture assessment: failure-mode inventory,
   experiment log with results, gaps found, and prioritized hardening actions.

## Artifact

A resilience assessment and fault-injection plan stored in the engagement
workspace (for example, `./fractional-cto/risk/resilience.md`).

## Contract

- "Never seen fail" is not evidence of resilience; only observed behavior under
  failure counts.
- Every experiment has a blast radius, abort criteria, and a rollback path.
- Findings are systemic and blameless; action items have owners.
- Resilience work links back to the engineering-standards fault-injection gate
  (AFIF) and to the incident-response runbooks.
