# Executable SOP Template

> **What this is:** the *runnable* form of an Operational SOP. When `automation-triage` verdicts a
> process as RPA- or AI-automatable, `sop-authoring` emits this alongside the human-readable
> `{slug}-sop.md`. The insight (from the [proceda](https://github.com/vivekhaldar/proceda) SOP-to-agent
> model): **a markdown file *is* the agent definition.** An LLM runtime reads the numbered steps as
> instructions, calls tools through MCP, and pauses at the declarative approval gates below.
>
> **How to use:** copy to `./fractional-cto/sops/{slug}/{slug}-sop.skill.md`, fill the frontmatter and
> steps, and delete this callout and every _italic guidance note_ before shipping.

---

## Design contract

- **The procedure is authoritative.** Editing the markdown changes the agent's behavior. A
  non-technical process owner can safely edit the steps — no code change required.
- **Human-in-the-loop is structural, not bolted-on.** Approval gates are declarative markers in the
  step body, not custom glue code. The runtime *pauses* at each gate until a human resolves it.
- **Tool access is MCP-native.** List the tools in the frontmatter; steps invoke them by name. No
  vendor lock-in.
- **Every state transition is logged.** The runtime emits a replayable event log (one JSON object per
  line) so a run can be audited and replayed.

### Gate markers

| Marker | Meaning |
|---|---|
| `[APPROVAL REQUIRED]` | Pause after this step; a human must approve the result before the run continues. |
| `[PRE-APPROVAL REQUIRED]` | Pause *before* this step; a human must authorize it before the agent acts (use for irreversible or outward-facing actions). |
| `[OPTIONAL]` | The agent may skip this step if its precondition is not met. |

Steps with no marker run autonomously. Match the markers to the per-step verdict in
`{slug}-triage.md`: `Human` and `Human+AI` steps carry a gate; `RPA-unattended` and `AI-agent` steps
usually run unattended.

---

```yaml
---
name: [slug]-sop
description: >
  Executable form of the "[SOP Name]" operational procedure. Runs the process end to end,
  pausing at the approval gates defined in the steps. Triggers: [when this procedure should run —
  e.g. "a new invoice lands in the intake inbox"].
required_tools:
  # MCP tools this procedure calls. Pull these from the RPA/AI steps in {slug}-triage.md.
  - [mcp-tool-name]        # [what the step uses it for]
  - [mcp-tool-name]
---
```

# Executable SOP: [SOP Name]

_One sentence: what running this procedure accomplishes, and what triggers a run._

## Step 1: [Step name]

_Instructions to the LLM for this step. Be specific — name the tool, the input, the success
criterion. This step's triage verdict was: [Human / RPA-attended / RPA-unattended / Hybrid / AI-agent
/ Human+AI]._

## Step 2: [Step name]

[APPROVAL REQUIRED]

_Instructions. Because a human reviews the result of this step, state exactly what they are approving
and what the reject path is._

## Step 3: [Step name]

[PRE-APPROVAL REQUIRED]

_Irreversible or outward-facing action (sends an email, moves money, deletes a record). The runtime
pauses and a human authorizes before the agent acts._

## Step 4: [Step name]

[OPTIONAL]

_Runs only when [precondition]. The agent skips it otherwise._

---

## Run log

_The runtime appends one event per line to `{slug}-sop.run.jsonl` — step start/end, tool calls, gate
pauses, human decisions. Do not edit by hand; it is the replayable audit trail._
