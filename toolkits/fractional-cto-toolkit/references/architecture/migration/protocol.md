# Skill `migration` — protocol SSOT

## Purpose

Provide modernization guidance for legacy systems: assess the current state,
define the target architecture, select a migration pattern, and sequence the
work by risk and value with rollback at every step.

Grounded in the CTO-role references: MIT (architecture), Splunk (product/platform
leadership), Devox (architecture).

## When to use

- Moving legacy systems to the cloud.
- Modernizing an aging stack (language, platform, data layer).
- Consolidating or re-architecting after an acquisition.

## Method

1. **Assess the current state.** Inventory systems, components, and their
   coupling, age, quality, and operational risk. Identify what is business-
   critical and what is disposable.
2. **Define the target architecture.** State the future-state principles
   (modularity, cloud-native, security posture) before choosing patterns.
3. **Select a migration pattern per component** (the "7 Rs" family):
   - **Rehost** — lift and shift, same shape in new infrastructure.
   - **Replatform** — lift, then adjust to managed services.
   - **Refactor** — restructure internals without changing external behavior.
   - **Re-architect** — redesign to the target architecture.
   - **Replace** — buy or rebuild the capability.
   - **Retain / retire** — keep as-is temporarily, or retire.
4. **Sequence by risk and value.** Use the **strangler fig** pattern for
   incremental cutover: build the new path alongside the old, shift traffic
   gradually, remove the old path once empty.
5. **Plan every phase with a rollback** and a measurable exit criterion
   (for example, error rate below threshold, traffic shifted, old path
   decommissioned).
6. **Track and communicate** status per phase; record architecture decisions
   made along the way as ADRs (see the decision skill).

## Artifact

A migration strategy document plus a phased plan: per phase, systems involved,
pattern chosen, sequencing, exit criteria, rollback, and owner.

## Contract

- Migration is a sequence of reversible, value-ordered steps, never a big-bang
  rewrite.
- Every phase has a rollback path and a measurable exit criterion before the
  next phase starts.
- The target architecture is explicit before patterns are chosen; the plan is
  revised when the target changes.
