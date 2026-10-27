# Revenue Ops Triage Skill — Multi-Tool Reference

## Purpose

This skill turns a messy revenue pipeline/backlog into **agent-ready, prioritized work** — applying the "triage" pattern (backlog → agent-ready) to RevOps and B2G. It consumes outputs from `pipeline_analyzer.py`, `forecast_accuracy_tracker.py`, and `b2g/rfp_analyzer.py`, and produces ordered action items.

## Capabilities

- **Prioritize by cost of delay / urgency**: aging deals, coverage gaps, high-bias forecasts, tender deadlines
- **Categorize**: fix/coach/strategic/ignore per item
- **Emit agent-ready work**: each item becomes a concrete, actionable task for an agent
- **B2G bridge**: converts matched tenders and RFP requirements into bid-prep work

## Usage

Given "triage my pipeline / what should I work on / prioritize these tenders", run the relevant analyzers and then this skill to emit ordered work items.

## Inputs

- `scripts/pipeline_analyzer.py` output
- `scripts/forecast_accuracy_tracker.py` output
- `scripts/b2g/tender_match.py` + `rfp_analyzer.py` output (B2G)
