---
name: kill-rules
description: >
  Encodes kill-rule operational thresholds (CPA 2x, ROAS < 1, LTV:CAC collapse)
  and proposes kills/pauses,never auto-executes,using scripts and the MCP. Use
  when deciding which campaigns to pause or kill.
---

# Kill Rules Skill — Multi-Tool Reference

## Purpose

This skill encodes the "kill rule" operational thresholds (CPA 2x, ROAS < 1, LTV:CAC collapse) and *proposes* kills/pauses — never auto-executes. Uses `scripts/kill_rule_engine.py` + the MCP to flag candidates.

## Capabilities

- **Threshold engine**: evaluate metrics against configured kill rules
- **Propose not perform**: emit kill/pause recommendations with numbers
- **Kill funnel**: `kill-funnel` emergency stop (human-confirmed)
- **Cohort-aware**: require sustained signal (e.g. 7+ days) before recommending kill

## Usage

Given "kill check", run `scripts/kill_rule_engine.py --input <data>` and review the proposed flags; then execute pauses only after human approval.
