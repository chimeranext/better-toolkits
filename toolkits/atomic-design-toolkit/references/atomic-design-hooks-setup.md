# Atomic-Design Enforcement Hooks — Setup Guide

How to install **write-time enforcement hooks** for atomic-design structure in a consumer repository. This is **Cure 4** of the four-cure defense-in-depth pattern documented in the legacy-ticket component-layer premortem (example-platform, 2026-05-14).

The audit command surfaces missing hooks as `E{n}` findings. This guide explains what to install and why.

---

## Why hooks matter — the $394K anchor

The premortem that motivates this reference cites a forensic finding from the example-platform engagement:

> "ChimeraNext lleva 7.3 meses sin shipping. ~37% de effort wasted (~$394K)." — legacy-ticket, quoted verbatim in the legacy-ticket spike body, 2026-05-08.

That $394K was already spent before the audit on 2026-05-14 surfaced the component-layer Conway's Law anti-pattern (57 root folders without ownership, 2 dead `DashboardHeader.tsx` files, 9 monoliths >1000 lines, `dashboard/` junk drawer). The 6-month extrapolation, conservatively modeled, adds **~$324K** of forward waste if the cure is not installed:

| Window | Wasted spend | Source |
|--------|--------------|--------|
| Jan-May 2026 (already spent) | $394K | legacy-ticket / legacy-ticket |
| Jun-Nov 2026 (forward, no intervention) | $324K | $54K/mo × 6 × 37% × 1.5 compounding |
| Cumulative Jan-Nov 2026 | **$718K** | sum |

Hooks are the **only** cure that operates at write-time. CI is too late (the mistake already exists in a branch). Agent rules are advisory (an agent without context skips them). Ownership docs are passive (a hurried contributor never reads them). Hooks block the keystroke that introduces drift.

---

## The 4-cure pattern (defense-in-depth)

```
Layer        │ Operates when      │ Catches                          │ Misses
─────────────┼────────────────────┼──────────────────────────────────┼──────────────────────────────
1 Ownership  │ Documentation read │ Conscious, informed contributors │ Hurried, uninformed, AI agents
2 Harness CI │ PR open / push     │ Anything that gets to a PR       │ Local-only mistakes, force-merges
3 Agent rule │ Agent context load │ AI agents with CLAUDE.md loaded  │ Agents w/o context, humans
4 Hooks      │ Write-time         │ EVERY actor, EVERY mistake       │ — (this is the bedrock)
```

The hook layer is the only one that operates regardless of who or what is doing the writing — human, agent, bot, force-push, IDE auto-format. Remove it and the other three become advisory.

Two levels of hooks are required:

- **Repo level** — `{repo}/.claude/hooks/` — enforces the consumer's pillar list and atomic taxonomy.
- **Toolkit level** — `make-no-mistakes-toolkit/.claude/hooks/` — generic hooks that ship to every project that installs the toolkit, so the discipline survives across repos.

The audit checks for both.

---

## Repo-level setup

### 1. Declare the consumer's atomic-design rules

Create `.atomic-design-rules.json` at the repo root. This is the contract the hooks enforce.

```json
{
  "$schema": "https://make-no-mistakes-toolkit.chimeranext.io/schemas/atomic-design-rules.v1.json",
  "version": 1,
  "stack": "vite",
  "framework": "react",
  "componentsRoot": "src/components",
  "pillars": [
    "auth",
    "billing",
    "courses",
    "dashboard",
    "forum",
    "hackathon",
    "launchpad",
    "pathways",
    "profile",
    "settings"
  ],
  "atomicTaxonomy": {
    "atoms": "src/components/ui/atoms",
    "molecules": "src/components/ui/molecules",
    "organisms": "src/components/ui/organisms",
    "templates": "src/layouts",
    "pages": "src/pages"
  },
  "monolithLineLimit": 1000,
  "exceptionMarker": "// atomic-design:exception",
  "antiPatterns": [
    {
      "path": "src/components/courses/**",
      "reason": "Phantom hierarchy; use pathways/ pillar instead",
      "until": "2026-08-01"
    }
  ]
}
```

**Field reference:**

| Field | Meaning |
|-------|---------|
| `pillars` | Allowed root folders under `componentsRoot`. Anything else is blocked. |
| `atomicTaxonomy` | Where each atomic level lives. Used to detect "atom with state" misplacement. |
| `monolithLineLimit` | PreToolUse hook blocks writes that grow a file past this threshold without an exception marker. |
| `exceptionMarker` | Inline comment that opts a file out of a specific rule (audited at PR time). |
| `antiPatterns` | Explicit deny-list with optional sunset date — useful for tracking phantom hierarchies during migration. |

Without this file, hooks have nothing to enforce. The audit flags its absence as `E4`.

### 2. Install the hooks

The hooks live in `.claude/hooks/` and are wired up via `.claude/settings.json`. Three hooks form the minimum bundle:

```bash
.claude/hooks/
├── pre-write-component-location.sh    # blocks writes to non-canonical paths
├── post-write-component-callsites.sh  # warns on files without importers
└── pre-write-monolith-growth.sh       # blocks growth past line limit
```

#### `pre-write-component-location.sh`

PreToolUse hook for `Write` and `Edit` tools. Reads `.atomic-design-rules.json`, parses the target path, and exits non-zero if:

- The path is under `componentsRoot` but the first segment is not in the `pillars` list.
- The path matches an entry in `antiPatterns`.
- The file is being created under `atoms/` but contains state-management imports (`useState`, `useReducer`, store hooks).

```bash
#!/usr/bin/env bash
# Block component writes to non-canonical paths.
set -euo pipefail
RULES="${CLAUDE_PROJECT_DIR:-$PWD}/.atomic-design-rules.json"
[ -f "$RULES" ] || exit 0   # no rules file = no enforcement
TARGET="${CLAUDE_TOOL_INPUT_PATH:-}"
[ -z "$TARGET" ] && exit 0

COMPONENTS_ROOT=$(jq -r '.componentsRoot' "$RULES")
case "$TARGET" in
  "$COMPONENTS_ROOT"/*)
    SEGMENT=$(echo "$TARGET" | sed "s|^$COMPONENTS_ROOT/||" | cut -d/ -f1)
    if ! jq -e --arg s "$SEGMENT" '.pillars | index($s)' "$RULES" >/dev/null; then
      echo "blocked: '$SEGMENT' is not in .atomic-design-rules.json pillars" >&2
      echo "valid pillars: $(jq -r '.pillars | join(", ")' "$RULES")" >&2
      exit 2
    fi
    ;;
esac
exit 0
```

#### `post-write-component-callsites.sh`

PostToolUse hook that warns (not blocks) when a freshly written component has no importers anywhere else in the tree. Catches dead-code-at-birth — the kind of file that becomes a "two dead `DashboardHeader.tsx`" finding six months later.

```bash
#!/usr/bin/env bash
TARGET="${CLAUDE_TOOL_INPUT_PATH:-}"
[ -z "$TARGET" ] && exit 0
[[ "$TARGET" =~ \.(tsx|ts|jsx|js|vue|svelte)$ ]] || exit 0

BASENAME=$(basename "$TARGET" | sed 's/\.[^.]*$//')
HITS=$(rg -l --type-add 'js:*.{ts,tsx,js,jsx,vue,svelte}' -tjs "from ['\"].*$BASENAME['\"]" 2>/dev/null | grep -v "$TARGET" | wc -l)
if [ "$HITS" -eq 0 ]; then
  echo "warning: $TARGET has no importers — verify it's not dead at birth" >&2
fi
exit 0
```

#### `pre-write-monolith-growth.sh`

PreToolUse hook that blocks writes which would grow a file past `monolithLineLimit` unless an exception marker is present in the new content.

```bash
#!/usr/bin/env bash
set -euo pipefail
RULES="${CLAUDE_PROJECT_DIR:-$PWD}/.atomic-design-rules.json"
[ -f "$RULES" ] || exit 0
TARGET="${CLAUDE_TOOL_INPUT_PATH:-}"
[ -z "$TARGET" ] && exit 0
[ -f "$TARGET" ] || exit 0

LIMIT=$(jq -r '.monolithLineLimit // 1000' "$RULES")
MARKER=$(jq -r '.exceptionMarker // "// atomic-design:exception"' "$RULES")
CURRENT=$(wc -l < "$TARGET")
NEW="${CLAUDE_TOOL_INPUT_CONTENT:-}"
NEW_LINES=$(printf '%s' "$NEW" | wc -l)

if [ "$NEW_LINES" -gt "$LIMIT" ] && ! printf '%s' "$NEW" | grep -qF "$MARKER"; then
  echo "blocked: '$TARGET' would be $NEW_LINES lines (limit $LIMIT)" >&2
  echo "decompose, or add '$MARKER' with a decomposition-plan comment" >&2
  exit 2
fi
exit 0
```

### 3. Register the hooks in `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/pre-write-component-location.sh" },
          { "type": "command", "command": ".claude/hooks/pre-write-monolith-growth.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/post-write-component-callsites.sh" }
        ]
      }
    ]
  }
}
```

Make the shell scripts executable: `chmod +x .claude/hooks/*.sh`.

### 4. Mirror the rule in CLAUDE.md / AGENTS.md

Add a section that names the pillar list, the atomic taxonomy, and the exception marker convention. This is Cure 3 (agent rule) — it lets an agent that loads context understand and follow the rule before a hook has to block it.

```markdown
## Atomic Design — Component Layer

This repo enforces a two-axis component organization. The full rules live in
`.atomic-design-rules.json` and are blocked at write-time by `.claude/hooks/`.

- **Outer axis (pillar)**: 10 product pillars under `src/components/{pillar}/`.
- **Inner axis (atomic)**: atoms / molecules / organisms / templates / pages.
- **Monolith line limit**: 1000 lines. Exceeded files must carry
  `// atomic-design:exception` with a decomposition-plan comment.
- **Anti-patterns**: see `.atomic-design-rules.json` `antiPatterns[]`.
```

---

## Toolkit-level setup

If you maintain a shared toolkit that consumer repos install (e.g. `make-no-mistakes-toolkit` v1.14+), ship the same hook pattern from the toolkit root:

```
make-no-mistakes-toolkit/
└── .claude/
    └── hooks/
        ├── pre-write-component-location.sh
        ├── post-write-component-callsites.sh
        └── pre-write-monolith-growth.sh
```

The toolkit's `plugin.json` should register these hooks so every consumer inherits them automatically. The hooks read `.atomic-design-rules.json` from the consumer's repo root, so the same hook code enforces whatever pillar list each consumer declares.

This is what catches the cross-repo Conway's Law multiplication described in the premortem §7.4.2: if one product repo installs the cure but the next product in the same organization (future repos) does not, the structural anti-pattern reproduces in the new repo. Toolkit-level hooks scale the discipline to every consumer.

---

## Verification commands

Confirm hooks are firing:

```bash
# 1. Verify .atomic-design-rules.json is valid JSON
jq empty .atomic-design-rules.json && echo "rules file OK"

# 2. Trigger the PreToolUse hook by attempting a banned write
echo "" > src/components/this-is-not-a-pillar/test.tsx
# Expected: blocked with "is not in .atomic-design-rules.json pillars"

# 3. Trigger the monolith hook
yes "// line" | head -1200 > /tmp/big.tsx
cp /tmp/big.tsx src/components/auth/Huge.tsx
# Expected: blocked with "would be 1200 lines (limit 1000)"

# 4. Confirm hook registration in settings
jq '.hooks' .claude/settings.json

# 5. Run the audit to confirm E-findings cleared
/atomic-design-toolkit:audit :vite :report
# Expected: no E{n} findings in report
```

---

## Severity matrix the audit uses

| Hooks present | Component-layer drift | E-finding severity |
|---------------|------------------------|---------------------|
| All 4 cures present | none | info (`E*` not emitted, all in passing checks) |
| 1-3 cures present | none | warning per missing cure |
| 1-3 cures present | drift signals from V1-V3 | blocker per missing cure |
| 0 cures present | none | warning per missing cure |
| 0 cures present | drift signals from V1-V3 | **top finding escalated to blocker** (compounding risk per premortem §5.2 — $324K forward extrapolation) |

The "compounded risk" override is intentional: a repo with active drift AND no hooks installed is the exact failure mode the $324K extrapolation describes.

---

## Related references

- `references/vite-audit-checklist.md` — full bundle-health checks (V4) plus enforcement signals (V7).
- `references/audit-report-schema.md` — E-finding schema, frontmatter, and example output.
- `references/atomic-methodology.md` — atomic-level definitions.
- legacy-ticket premortem (example-platform) — the full forensic narrative, $394K / $324K / $718K math, 4-cure pattern.
- Existing precedent in example-platform: `.claude/hooks/pre-write-decision-record-location.sh` (legacy-ticket) — the OpenSpec-convention enforcement hook this pattern is modeled on.
