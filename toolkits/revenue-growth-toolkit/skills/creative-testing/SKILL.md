# Creative Testing Skill — Multi-Tool Reference

## Purpose

This skill designs and audits creative tests across networks via the shared `social-media-ads-mcp` MCP — batch creative launch (drafts-first), per-creative readout, and pause losers.

## Capabilities

- **Batch creatives**: `create_creatives` into one ad group (all created paused)
- **Per-creative readout**: list ads + insights per creative
- **Creative fatigue**: flag high frequency / CPA degradation
- **Kill rules**: propose pause (never auto-execute) per kill-rule thresholds

## Usage

Given "test creatives for <ad group>", run `create_creatives` drafts (apply=false), review, then `activate`/`pause` only after human OK.
