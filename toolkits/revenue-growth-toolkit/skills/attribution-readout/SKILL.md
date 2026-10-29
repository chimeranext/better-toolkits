---
name: attribution-readout
description: >
  Produces the before/after attribution readout (directional, not a controlled
  experiment) merging multi-network insights into one unified row. Use when
  reporting lift or results across paid-media channels.
---

# Attribution Readout Skill — Multi-Tool Reference

## Purpose

This skill produces the before/after attribution readout (directional, not a controlled experiment) and merges multi-network insights into one unified row. PostHog provides funnel/retention; the MCP provides paid-media insights; Python computes derived metrics.

## Capabilities

- **Unified insights**: canonical row where null and zero are distinct (never coerced)
- **Lift readout**: before/after per recorded change, with confound disclosure
- **Journal**: reads recent changes (automatic + manual) for context
- **PostHog**: retention/funnel queries for the qualitative arc

## Usage

Given "attribution readout", run MCP `get_insights` + `lift_readout`, `journal_list`, and query PostHog for retention. Present confounds explicitly.
