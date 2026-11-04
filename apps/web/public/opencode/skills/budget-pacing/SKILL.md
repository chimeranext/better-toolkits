---
name: budget-pacing
description: >
  Monitors delivery vs budget over the last N days and flags
  underdelivery/overspend using the shared social-media-ads-mcp MCP. Use when
  pacing ad campaigns against budget without auto-executing changes.
---

# Budget Pacing Skill — Multi-Tool Reference

## Purpose

This skill monitors delivery vs budget over the last N days and flags underdelivery/overspend using the shared `social-media-ads-mcp` MCP (`pacing_review`). Proposes actions; never performs them silently.

## Capabilities

- **Pacing review**: per-campaign delivery vs budget
- **Over/under delivery flags**: observed value vs threshold
- **Budget updates**: `update_budget` dry-run (apply=false) → diff; apply only on human OK, after the guardrail check
- **Spend caps**: evaluated before any network call (config, not code)

## Usage

Given "review pacing", run `pacing_review`. To change budget, run `update_budget` with `current_budget` and no `apply` to get the local diff; then apply on approval.
