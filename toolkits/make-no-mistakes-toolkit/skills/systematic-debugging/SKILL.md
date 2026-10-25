---
name: systematic-debugging
id: obra-superpowers-systematic-debugging
description: >
  Structured debugging approach for AI agents and systems — systematic
  isolation of variables, reproduction of failures, root-cause identification,
  and evidence-backed fixes. Source: obra/superpowers (systematic-debugging).
links:
  repository: https://github.com/obra/superpowers/tree/main/skills/systematic-debugging
  reference: https://github.com/obra/superpowers/blob/main/skills/systematic-debugging/SKILL.md
installed: true
---
# Systematic Debugging

## Overview

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue: test failures, bugs in production, unexpected behavior, performance problems, build failures, integration issues.

**Use this ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

**Don't skip when:**
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Manager wants it fixed NOW (systematic is faster than thrashing)

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully** — don't skip past errors; read stack traces completely; note line numbers, file paths, error codes.
2. **Reproduce Consistently** — can you trigger it reliably? What are the exact steps? If not reproducible → gather more data, don't guess.
3. **Check Recent Changes** — git diff, recent commits, new dependencies, config changes, environmental differences.
4. **Gather Evidence in Multi-Component Systems** — when the system has multiple layers (CI → build → signing; API → service → database):
   - Log what data enters component
   - Log what data exits component
   - Verify environment/config propagation
   - Check state at each layer
   - Run once to gather evidence showing WHERE it breaks, THEN identify failing component, THEN investigate that component.
5. **Trace Data Flow** — see `root-cause-tracing.md` (reference: obra/superpowers). Quick version: trace backward — where does bad value originate? What called with bad value? Keep tracing up until source; fix at source, not symptom.

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**
1. Find working examples (similar working code in same codebase).
2. Compare against references (if implementing pattern, read reference implementation COMPLETELY — don't skim, understand fully before applying).
3. Identify differences (list every difference, however small; don't assume "that can't matter").
4. Understand dependencies (what other components does it need? What settings/config? What assumptions?).

### Phase 3: Hypothesis and Testing

**Scientific method:**
1. Form single hypothesis (`"I think X is root cause because Y"` — write it down; be specific).
2. Test minimally (smallest change to test hypothesis; one variable at a time).
3. Verify before continuing (did it work? Yes → Phase 4. No → form NEW hypothesis. Don't add more fixes on top).
4. When you don't know: say "I don't understand X"; ask for help; research more.
5. **If 3+ fixes failed: Question Architecture** — see Phase 4.5 below.

### Phase 4: Implementation

**Fix the root cause, not the symptom:**
1. Create failing test case (simplest reproduction; automated test preferred; use `superpowers:test-driven-development` skill).
2. Implement single fix (address root cause — ONE change at a time; no "while I'm here" improvements; no bundled refactoring).
3. Verify fix (test passes; no broken tests; issue resolved; use `superpowers:verification-before-completion` before claiming success).
4. If fix doesn't work → STOP. Count fixes tried. **If ≥ 3 fixes → STOP and question architecture (step 5).** Don't attempt Fix #4 without architectural discussion.

### Phase 4.5: If 3+ Fixes Failed — Question Architecture

**Pattern indicating architectural problem:** each fix reveals new shared state/coupling/problem in a different place; fixes require "massive refactoring"; fixes create new symptoms elsewhere.

**STOP and question fundamentals:**
- Is this pattern fundamentally sound?
- Are we "sticking with it through sheer inertia"?
- Should we refactor architecture vs. continue fixing symptoms?
- Discuss with your human partner before attempting more fixes.

This is NOT a failed hypothesis — this is a wrong architecture.

## Red Flags — STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see"
- "Add multiple changes, run tests"
- "Skip test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt differently"
- "Here are the main problems" (lists fixes without root-cause evidence)
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problem in different place**

**ALL mean: STOP. Return to Phase 1.**

**If 3+ fixes failed:** Question architecture (Phase 4.5).

## Your Human Partner's Signals You're Doing It Wrong

Watch for these redirections:
- "Is that not happening?" — you assumed without verifying
- "Will it show us...?" — you should have added evidence gathering
- "Stop guessing" — proposing fixes without understanding
- "Ultra-think this" — question fundamentals, not just symptoms
- "We're stuck?" (frustrated) — approach isn't working

When you see these: STOP. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
| "Issue simple, no process" | Simple bugs have root causes. Process is fast for them. |
| "Emergency, no time" | Systematic is FASTER than guess-check thrashing. |
| "Just try first, investigate later" | First fix sets pattern. Do right from start. |
| "Write test after fix" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes save time" | Can't isolate what worked. Creates bugs. |
| "Reference too long, adapt" | Partial understanding guarantees bugs. Read fully. |
| "I see problem, fix it" | Symptoms ≠ root cause. |
| "One more fix attempt" (after 2+) | 3+ = architectural problem. Question pattern, don't fix again. |

## Quick Reference

| Phase | Key | Success Criteria |
| 1. Root Cause | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| 2. Pattern | Find working examples, compare | Identify differences |
| 3. Hypothesis | Form theory, test minimally | Confirmed or new theory |
| 4. Implementation | Create test, fix, verify | Resolved + passing tests |

## When Process Reveals "No Root Cause"

If systematic investigation reveals issue is truly environmental, timing-dependent, or external:
1. Completed process
2. Documented what was investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future

**But:** 95% of "no root cause" cases = incomplete investigation.

## Supporting Techniques

These are part of systematic debugging and available in this directory:
- `root-cause-tracing.md` — trace bugs backward through call stack
- `defense-in-depth.md` — add validation at multiple layers after finding root cause
- `condition-based-waiting.md` — replace arbitrary timeouts with condition polling
- `test-driven-development` (skill) — write proper failing tests before fixing
- `verification-before-completion` (skill) — confirm fix before claiming success
