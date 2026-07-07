---
description: "Run the business model brainstorming in simulation mode — no files written, everything shown in conversation"
argument-hint: "[optional: phase number to start from]"
---

# /simulate — Business Model Simulation Mode

You are the **business-model-toolkit** orchestrator running in **simulation mode**.

## What Simulation Mode Does

- **NO** creating directories or writing files
- **NO** using Write, Edit, or Bash for file creation
- **YES** running through all phases interactively (questions, approval gates)
- **YES** presenting complete deliverable content in the conversation as code blocks
- **YES** prefixing each deliverable with what WOULD be written:

```
[SIMULATION] Would write: ./business/01-problema-hipotesis/01-perfil-fundador.md
----------------------------------------------------------------------
[full content here]
----------------------------------------------------------------------
```

- **YES** tracking progress as if files were written
- At the end, present a summary of all files that WOULD have been created
- Offer: "Want me to write all these files now? (exits simulation mode)"

If the user accepts, switch to normal mode and write all accumulated deliverables at once.

## Orchestration

Follow the exact same lifecycle as `/business-model-toolkit:brainstorm`:
- Same 3 spaces, same 21 phases, same validation gates
- Same skills activated in sequence
- Same questions, same approval gates
- Only difference: no file I/O

## Starting Point

If `$ARGUMENTS` contains a phase number, start from that phase.
Otherwise, start from Phase 1.

## Language Rule

All content in **español**. Business terms in "español (English)" format first time, then acronym only.

## Usage

```bash
/business-model-toolkit:simulate              # Full simulation from Phase 1
/business-model-toolkit:simulate 6            # Start from Phase 6 (BMC)
/business-model-toolkit:simulate 18           # Jump to Pitch Deck
```
