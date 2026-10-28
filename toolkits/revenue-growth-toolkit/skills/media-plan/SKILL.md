# Media Plan Skill — Multi-Tool Reference

## Purpose

This skill turns an objective into a draft media plan (campaign matrix per network) using the shared `social-media-ads-mcp` MCP. Drafts-first: nothing is created active; campaigns/campaignives are born draft/paused until human confirmation.

## Capabilities

- **Objective → channel mix**: awareness/traffic/engagement/leads/app_promotion/sales/search
- **Budget split**: per network + stage, respecting configured spend caps
- **Draft plan**: produce a `create_campaign`/`create_creatives` draft via the MCP (apply=false)
- **Multi-network matrix**: Meta/TikTok/LinkedIn/Google/YouTube/Spotify normalized model

## Usage

Given "build a media plan for <objective> with <budget>", the agent runs the MCP `capability_report`, `list_accounts`, then creates draft campaigns (apply=false) and presents the plan for human approval.

## References

- MCP: `shared/mcp/social-media-ads-mcp` (ViteMCP stateless).
