---
name: revenue-strategy
description: >
  Provides the AAARRR funnel + flywheel strategy layer,objective -> channel mix
  -> budget split -> draft plan per network,and lifecycle decisions,
  orchestrating paid-media execution via the MCP and PostHog. Use when setting
  high-level revenue strategy.
---

# Revenue Strategy Skill — Multi-Tool Reference

## Purpose

This skill provides the **AAARRR** (Awareness, Acquisition, Activation, Revenue, Retention, Referral) funnel + flywheel strategy layer — objective → channel mix → budget split → draft plan per network, and lifecycle decisions. It orchestrates the paid-media execution via the shared MCP and PostHog analytics.

## Capabilities

- **Funnel strategy**: TOF/MOF/BOF, awareness → revenue
- **Flywheel**: retention ladder (D7/D30/D90), referral K-factor loop
- **Unit economics**: LTV (gross-margin), CAC blended/paid, payback, LTV:CAC
- **Allocation**: budget split per network/stage; channel selection guidance
- **Orchestration**: consume `social-media-ads-mcp` for execution; query PostHog for funnel/retention insights

## Usage

This skill enables the strategy layer for agents operating across Claude Code, Cursor, and OpenCode. Given "set a launch plan / where do I split budget / kill or scale", the agent runs the strategy commands (`revenue-launch`, `revenue-analyze`, `acquire`, `retain`, `refer`, `revenue`) and the Python metrics.

## References

- McClure, D. (2007). *Pirate Metrics (AARRR)*. 500 Startups.
- van Gasteren, W. (2017). *The AAARRR framework*. 
- HubSpot. (2018). *Funnel vs Flywheel*.
