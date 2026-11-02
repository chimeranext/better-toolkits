# Skill `incident-response` — protocol SSOT

## Purpose

Establish an incident response capability for a client: a plan with defined
roles, severity levels, escalation paths, and explicit linkage to the runbooks
that contain the actual recovery steps.

Grounded in the CTO-role references: Splunk (cybersecurity, reliability) and
Devox (security & privacy), plus standard incident-management practice
(incident commander model, severity-based escalation).

## When to use

- When a production incident is occurring (or imminent) and a response structure
  is needed immediately.
- When a client has no IR plan and the CTO must stand one up.
- To review an existing plan for the classic gaps: unnamed roles, missing
  severity thresholds, or runbooks that are out of date.

## Method

1. **Assign roles before the incident.** A plan with roles assigned only when
   the incident happens is not a plan. Typical roles:

   | Role | Responsibility |
   | --- | --- |
   | **Incident Commander** | Owns the response, decisions, and escalation; time-boxed. |
   | **Communications Lead** | Owns status updates to stakeholders; the only channel to executives. |
   | **Subject-matter expert(s)** | Diagnose and repair; work the runbooks. |
   | **Scribe** | Records a timeline of actions and decisions (feed for the postmortem). |

   One person may cover multiple roles in a small team, but the **Incident
   Commander** and **Communications Lead** must not be the same person.
2. **Define severity levels** with explicit thresholds and response targets:

   | Severity | Example | Engagement | Communication |
   | --- | --- | --- | --- |
   | **SEV-1** | Customer-facing outage, data loss, security breach | Immediate, all hands | Executives immediately, then cadence |
   | **SEV-2** | Major degradation, core feature down | Within minutes, focused team | Executives on escalation |
   | **SEV-3** | Minor degradation, non-critical | Scheduled, next business day | Team channel |
   | **SEV-4** | No user impact, internal | Normal queue | None required |

3. **Define escalation paths.** For each severity: who is notified, how (page,
   call, Slack), and when (immediately, within N minutes). Escalation is
   time-boxed — a SEV-1 does not wait for permission.
4. **Link runbooks.** The IR plan does not contain recovery steps; it points to
   runbooks (`process/playbook/runbook` family). Ensure a runbook exists for
   each likely failure class and that it is current enough to execute. If no
   runbook exists, flag it as a gap before relying on it.
5. **Run the response.** During the incident: declare severity, assign
   commander/communications, work the runbook, keep the timeline, and hold a
   blameless postmortem (see `resilience`) after stabilization.
6. **Verify.** After any incident, update the runbook and the plan; the next
   incident is the test.

## Artifact

An incident response plan (roles, severity table, escalation matrix, runbook
index) stored in the engagement workspace (for example,
`./fractional-cto/risk/incident-response.md`).

## Contract

- Roles are pre-assigned; at incident time the plan is executed, not written.
- Severity has defined thresholds and communication paths; a SEV-1 is never
  silently handled.
- The plan links to runbooks; it does not attempt to replace them.
- The plan is re-verified on a cadence (for example, quarterly tabletop) and
  after every real incident.
