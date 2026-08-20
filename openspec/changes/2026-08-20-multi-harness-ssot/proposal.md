# Proposal — Multi-harness SSOT + stderr baseline

**Change:** `2026-08-20-multi-harness-ssot`
**Domain:** `area:meta`
**Status:** Proposed
**Date:** 2026-08-20

## What we will build

Two orthogonal SSOTs for the entire `better-toolkits` monorepo:

1. **Protocol SSOT** — markdown under `toolkits/<name>/references/` (+ `templates/`),
   consumed by thin harness entries (Claude `commands/`, Cursor `skills/`,
   OpenCode2 / Antigravity adapters). Same contract for every toolkit command.
2. **Runtime SSOT (stderr)** — one `detect.py` + adapters under `shared/hooks/stderr/`,
   wired into **every** toolkit install path so any Bash/shell from any command
   is guarded without per-command edits.

Plus: OpenCode install/merge on toolkits that lack it today, always registering stderr.

## For whom

- Maintainers shipping toolkits to Claude Code, Cursor, OpenCode2, Antigravity, Codex, etc.
- Consumers who install **one** toolkit and must still get stderr (no silent hole).
- Agents running `/implement`, `/ship-*`, `/write-*`, skills — same protocol shape.

## Why now

- `/implement` is a 499-line monolito; Bilingual Format is triplicated.
- Stderr exists only where MNM (or manual Cursor/OpenCode wiring) is installed —
  install-only-IDT / aaarrr leaves Bash unprotected.
- Cursor `/` surfaces skills, not Claude `commands/` — without a multi-entry model,
  “protocol” looks like a Cursor-vs-Claude dichotomy (it is not).
- Repo governance (`openspec/project.md`) requires durable HOW before XL refactors.

## Success criteria

- [ ] Active OpenSpec change exists; first implementation commit is `docs(openspec): …`.
- [ ] Session with **only** aaarrr (or only IDT) installed → `2>/dev/null` Bash blocked.
- [ ] `/implement` (and Cursor skill `implement`) are thin orchestrators over `references/implement/*`.
- [ ] `templates/bilingual-issue-brief.md` is the fill-in SSOT; spike/spec no longer embed full template.
- [ ] Contract doc `docs/multi-harness-ssot.md` describes both SSOTs + harness matrix.
- [ ] Fat cmds (>150 lines) migrate by olas without behavior change (HITL / OpenSpec Phase 0 / 15-file rule intact for implement).

## Out of scope

- Renaming packages or plugin slugs.
- Cloning `detect.py` into each toolkit (wire-up only; single SSOT).
- Making prod-write / observability **mandatory** without consumer JSON (same wire-up model, later priority).
- Rewriting all fat commands in a single PR.

---

## UML — Protocol SSOT (component, vertical)

Which markdown is authoritative for a command protocol:

```mermaid
flowchart TB
  subgraph harnessEntries [Harness entries thin]
    cmd["Claude commands/foo.md"]
    skill["Cursor skills/foo/SKILL.md"]
    ocEntry["OpenCode2 / Antigravity entry"]
  end
  subgraph protocolSSOT [Protocol SSOT]
    refs["toolkits/X/references/foo/*.md"]
    tmpl["templates/ or assets/templates/"]
  end
  cmd --> refs
  skill --> refs
  ocEntry --> refs
  refs --> tmpl
```

## UML — Protocol load activity (vertical)

Agent resolves and loads SSOT (no harness-specific body in references):

```mermaid
flowchart TB
  start([User invokes /foo or skill foo]) --> entry[Load thin entry for this harness]
  entry --> orch[Read phase table / Read and follow list]
  orch --> loadRefs[Load references/foo/*.md in order]
  loadRefs --> tmplQ{Needs fill-in artifact?}
  tmplQ -->|yes| loadTmpl[Load templates/*]
  tmplQ -->|no| run[Execute protocol]
  loadTmpl --> run
  run --> endNode([Done or HITL stop])
```

## UML — Multi-harness entry sequence (vertical)

Same SSOT, three harnesses:

```mermaid
sequenceDiagram
  participant U as User
  participant H as Harness_UI
  participant E as Thin_entry
  participant R as references_SSOT
  participant T as templates

  U->>H: Invoke implement
  alt Claude_Code
    H->>E: commands/implement.md
  else Cursor
    H->>E: skills/implement/SKILL.md
  else OpenCode2_or_Antigravity
    H->>E: adapter docs or CLI skill
  end
  E->>R: Read and follow phases
  R->>T: Bilingual gate if needed
  R-->>E: Contract HOW
  E-->>U: Work / HITL
```

## UML — Runtime stderr SSOT (component, vertical)

One detector; N wire-ups; applies to ALL commands once session has hook:

```mermaid
flowchart TB
  subgraph sharedStderr [Runtime SSOT shared/hooks/stderr]
    detect["detect.py"]
    adClaude["adapters/claude-pre-bash.sh"]
    adCursor["adapters/cursor-before-shell.sh"]
    adOC["adapters/opencode-plugin.ts"]
    adCLI["docs Antigravity Codex Kiro"]
  end
  subgraph wireUps [Install wire-ups required]
    mnmHooks["MNM hooks.json"]
    otherHooks["Every toolkit hooks.json"]
    ocMerge["Every OpenCode merge"]
    curHooks["Cursor beforeShellExecution"]
  end
  mnmHooks --> adClaude
  otherHooks --> adClaude
  ocMerge --> adOC
  curHooks --> adCursor
  adClaude --> detect
  adCursor --> detect
  adOC --> detect
  adCLI --> detect
```

## UML — Stderr on any command (sequence, vertical)

Why we do not edit each `commands/*.md`:

```mermaid
sequenceDiagram
  participant Cmd as Any_toolkit_command
  participant Agent as Agent
  participant Shell as Harness_Bash_or_Shell
  participant Hook as stderr_adapter
  participant Det as detect_py

  Cmd->>Agent: Protocol says run shell
  Agent->>Shell: tool_call Bash
  Shell->>Hook: PreToolUse / beforeShellExecution
  Hook->>Det: command string
  alt discard_or_bare_fold
    Det-->>Hook: exit_2_block
    Hook-->>Agent: blocked
  else allowed_sink
    Det-->>Hook: exit_0
    Hook-->>Shell: allow
    Shell-->>Agent: result
  end
```

## UML — Install-path activity “sin excepción” (vertical)

```mermaid
flowchart TB
  install([Consumer installs toolkit T]) --> hasHooks{T has hooks.json?}
  hasHooks -->|no| createHooks[Create hooks.json with stderr Bash matcher]
  hasHooks -->|yes| addStderr[Add stderr adapter beside domain hooks]
  createHooks --> ocQ{OpenCode surface?}
  addStderr --> ocQ
  ocQ -->|yes| mergeOC[merge-opencode-config includes stderr plugin]
  ocQ -->|no| cursorDoc[Document Cursor / Antigravity wire-up]
  mergeOC --> cursorDoc
  cursorDoc --> verify[Verify only-T session blocks 2>/dev/null]
  verify --> done([Toolkit T baseline OK])
```

## UML — Dual-SSOT ownership (package, vertical)

```mermaid
flowchart TB
  subgraph meta [area_meta]
    shared["shared/hooks/stderr"]
    contract["docs/multi-harness-ssot.md"]
    openspecCh["openspec/changes/2026-08-20-..."]
  end
  subgraph eachToolkit [toolkit_star]
    refsProto["references/ protocol"]
    thinEntry["commands + skills thin"]
    hooksWire["hooks.json wire-up only"]
  end
  openspecCh --> contract
  contract --> shared
  contract --> refsProto
  shared --> hooksWire
  refsProto --> thinEntry
```
