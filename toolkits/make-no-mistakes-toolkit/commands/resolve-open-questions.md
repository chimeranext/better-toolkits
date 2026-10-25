---
description: Sweep session for open decisions buried in prose; resolve in batch via fixed-choice AskQuestion/AskUserQuestion with recommendation first. Scope optional via $ARGUMENTS.
argument-hint: "[optional scope, e.g. 'only PR state']"
priority: 70
---

# /resolve-open-questions — open decisions → structured ask

Invoke the `resolve-open-questions` skill from the make-no-mistakes plugin.

**Harness (validated first, not assumed):** OpenCode (`opencode` available) → `AskQuestion` + numbered options + explicit reply; Claude → `AskUserQuestion`; Cursor → `AskQuestion`. **Validate harness (OpenCode / Claude / Cursor); use AskUserQuestion (Claude) or AskQuestion (OpenCode / Cursor) accordingly; do not default to Claude.** Sub-agents → `pause`; orchestrator asks.

1. **Sweep**: collect ALL open session decisions — last report questions, unresolved follow-ups, pending HITL checkpoints (push/PR/merge/Linear/cleanup), unfiled issues. If `$ARGUMENTS` provides scope, restrict sweep to that.
2. **Batch**: build fixed-choice questions — recommended option FIRST with "(Recommended)", trade-off per description, multi-select when not exclusive. Claude: up to 4 per `AskUserQuestion`. Cursor: prefer one `AskQuestion` per message if runtime limits; second round if >4 decisions.
3. **Decision log + execution**: after responses, emit `decision → action` per item and execute immediately without re-asking. One approval = one action.

Anti-triggers: active socratic investigation (prose, not menus), direct action handoffs, plan-approval (that goes through the platform's plan-approval flow).
Anti-boilerplate / anti-mojibake: no decorative `echo`, no hidden `2>/dev/null` redirects in scripts, no mixed-language option text (fix options in clear English/en-es per target).
