# Translation Pipeline — How It Works

Quick reference for running the English → Spanish LATAM translation
pipeline (or any source → target locale pipeline the consumer configures)
on any course shipped through this plugin. This file is a supporting
document for the `translate-content` command — read it before dispatching
parallel translation agents.

---

## Pipeline Overview

```
PHASE 0 — PREP
  Update .gitignore, apply latest agent improvements

PHASE A — SOURCE-LANGUAGE QUALITY
  Proofreader agents (parallel) → Interactive review → Commit fixes

PHASE B — TRANSLATION
  Glossary → Gold files → Parallel translation agents → Reviewer → Validation → Commit
```

---

## Agents Involved

The agents below are consumer-shipped (e.g. `chimera-academy/agents/`). They
migrate from `chimera-academy` to this plugin in DOJ-3709 — until then,
invoke them from the consumer repo's `agents/` directory.

| Agent | File (consumer-relative) | Model | Role |
|-------|--------------------------|-------|------|
| `proofreader` | `agents/proofreader.md` | Sonnet | Pre-translation source-language editorial pass |
| `translator` | `agents/translator.md` | Sonnet | Translates files to the target locale |
| `translation-reviewer` | `agents/translation-reviewer.md` | Sonnet | Post-translation normalization across agents |

---

## Phase A: Source-Language Quality

1. Dispatch 3 parallel proofreader agents (split by modules)
2. Auto-fix: grammar, punctuation, typos, em dashes
3. Flag only: wording, quiz ambiguity, cross-references (user decides)
4. Commit source-language fixes

**Rule:** The proofreader is a copy editor, not a content author. Never
rewrite teaching content.

---

## Phase B: Translation

### B1. Glossary

Inherit the base glossary (Do Not Translate list, tone spec) and extend
with course-specific terms. Key patterns:

- **Framework names:** Source-language + target-locale on first use per
  file, then target-locale only
- **Technical terms:** Stay in source language (prompt, token, API, CLI,
  deploy, commit, etc.)
- **Brand names:** Always in source language (Claude, Anthropic,
  Supabase, etc.)
- **Tone:** Neutral target locale, "tú" for Spanish LATAM, builder-focused,
  match source-language energy

See `${CLAUDE_PLUGIN_ROOT}/commands/_translation-strategy.md` for the
full terminology logs from prior runs (AF-1, AI-1, batch v3).

### B2. Gold Files

Translate 1-2 representative files manually and get user approval. These
become the style reference for all parallel agents.

- **1 gold file** for simple courses (like AF-1)
- **2 gold files** for courses with unique terminology (like AI-1, VC-1)

Pick files that exercise the most translation rules: framework names,
tables, analogies, Builder-First tone.

### B3. Parallel Translation

Dispatch N agents (4-5 typical), each with:
- Translation rules from `agents/translator.md`
- Course-specific glossary
- Approved gold file(s) as style reference
- Glossary self-check instruction (grep for violations before saving)

Balance agents by estimated line count, not file count. Video briefs are
short; text classes are long.

### B4. Translation Reviewer

After all agents finish, dispatch the translation-reviewer on ALL
translated files:
- Cross-agent terminology consistency
- Glossary violations
- Source-locale-bias leaks (e.g. Spain Spanish in a LATAM target)
- Accent/tilde verification
- Framework name consistency across modules
- Quiz/final exam answer correctness
- Auto-fixes terminology and structural issues
- Flags tone and teaching concerns for human review

**This step is not optional.** It catches issues every time (AF-1:
"Deploy" violations, AI-1: missing accents).

### B5. Automated Validation

```bash
# File count match
find course/es -name "*.md" | wc -l

# Frontmatter check
grep -rL 'language:.*es' course/es/

# Glossary enforcement
grep -ri 'despliegue\|indicación\|marco de trabajo' course/es/

# Spain Spanish
grep -ri 'vosotros\|ordenador' course/es/
```

### B6. Commit & Push

One commit per module (for review clarity) or batch (for speed). Push to
the translation branch.

---

## Courses Translated

Historical record of translation pipeline runs in chimera-academy. The
content this plugin authors will accumulate similar rows over time.

| Course | Code | Files | Lines | Date | Notes |
|--------|------|------:|------:|------|-------|
| AI Fluency | AF-1 | 42 | 6,200 | 2026-04-08 | First pipeline run. 4 agents. |
| AI Fundamentals | AI-1 | 90 | 14,770 | 2026-04-08 | 5 agents. 2 gold files. Accent fix in M4-M5. |
| Chimera Mindset | DJ-1 | 22 | ~3,500 | 2026-04-08 | Reviewed. Clean. |
| Product Thinking | FP-1 | 8 | ~1,200 | 2026-04-08 | Reviewed. Clean. |
| Chimera Manual | DJ-2 | 31 | ~5,000 | 2026-04-08 | Reviewed. 22 fixes (terminology, parentheticals). |
| Intro to Quantum | QC-1 | 32 | ~5,500 | 2026-04-08 | Reviewed. Clean. |
| Agentic Coding | DJ-3 | 85 | ~14,000 | 2026-04-08 | Reviewed. 26 fixes (Q→P, composición→acumulación). |
| Claude Code Mastery | AI-2 | 79 | ~13,000 | 2026-04-08 | Reviewed. 40 fixes (Q→P, field labels, final exam). |
| Vibe Coding Blueprint | VC-1 | 134 | ~22,000 | 2026-04-08 | Reviewed. 200+ fixes (accents M05, field labels, despliegue). |
| 5-Day Builder Sprint | VC-0 | 36 | ~5,800 | 2026-04-08 | Reviewed. ~91 fixes (field labels, Q→P, despliegue, vos, accents, video scaffolding). |

---

## Known Issues & Fixes

| Issue | First Seen | Fix |
|-------|-----------|-----|
| "Deploy" translated as "Despliegue" | AF-1 | Added glossary self-check step to translator agent |
| Missing accents (tildes) in output | AI-1 | Translation reviewer catches; add explicit accent enforcement to prompt |
| .DS_Store in commits | AF-1 | Added to .gitignore |
| Q→P quiz header inconsistency | DJ-3/AI-2/VC-1 | Reviewer normalizes; some agents used English "Q" prefix |
| Correct/Explanation left in English | AI-2/VC-1 | Reviewer fixes to Correcta/Explicación |
| "vos" conjugation (Argentine Spanish) | VC-0 | Dedicated fix agent; ~79 conjugation fixes |
| "composición" mistranslation | DJ-3 | "compounding" = acumulación, not composición |
| Widespread accent stripping | VC-1 M05 | Some agents strip all diacriticals; reviewer restores |

---

## Pending Work

- [x] VC-0 (5-Day Builder Sprint): Run translation-reviewer on all 36
      files — Done 2026-04-08. ~91 fixes (field labels, Q→P, despliegue,
      vos, accents, video scaffolding).
- [ ] Apply v4 recommendations to `agents/translator.md`: add conjugated
      verb forms to self-check, add field label normalization
      instructions

---

## How to Run This Pipeline (Agent Operator Instructions)

**Read this entire section before doing anything.** This pipeline exists
because manual translation fails at scale. Follow it exactly.

### Prerequisites

1. Read this document fully
2. Read `${CLAUDE_PLUGIN_ROOT}/commands/_translation-strategy.md` for
   learnings from prior runs
3. Read the three agent prompts in the consumer repo:
   `agents/proofreader.md`, `agents/translator.md`,
   `agents/translation-reviewer.md`
4. Ensure `.claude/settings.local.json` has write permissions for
   sub-agents:
   ```json
   {
     "permissions": {
       "allow": [
         "Write(content/courses/*/es/**)",
         "Bash(mkdir:*)"
       ]
     }
   }
   ```

### Step-by-Step Execution

**Step 1 — Identify the course and count files**
```bash
# Count source-language files (path convention is consumer-specific;
# the chimera-academy convention is shown)
find content/courses/{course-slug} -name "*.md" -not -path "*/es/*" -not -path "*/docs/*" | wc -l
```

**Step 2 — Build the course-specific glossary**

Start with the base glossary in `agents/translator.md` (Do Not Translate
list). Then add course-specific framework terms using the pattern:
```
| Source Term | Target | Rule |
|-------------|--------|------|
| VIBE Framework | VIBE Framework (El Framework VIBE) | Source + target first use |
```

Check `${CLAUDE_PLUGIN_ROOT}/commands/_translation-strategy.md` for
glossaries from prior courses — many terms recur.

**Step 3 — Phase A: Source-language proofreading (optional but recommended)**

Dispatch 2-3 parallel Sonnet agents, each with `agents/proofreader.md` as
system prompt. Split by module groups. Commit source-language fixes
separately.

**Step 4 — Phase B2: Gold files**

Translate 1-2 representative files (pick ones with tables, frameworks,
analogies). Show to the user for approval. These become the style
reference for all parallel agents.

**Step 5 — Phase B3: Dispatch parallel translator agents**

Dispatch 4-5 Sonnet agents. Each agent gets:
- System prompt: the full content of `agents/translator.md`
- The course-specific glossary (paste it into the prompt)
- The approved gold file(s) as style reference (paste the content)
- A list of source-language files to translate (balanced by line count,
  not file count)
- Instruction to create the locale directory structure mirroring the
  source

Example agent prompt structure:
```
You are the consumer's translator agent. Your system prompt is:
[paste agents/translator.md]

COURSE-SPECIFIC GLOSSARY:
[paste glossary table]

GOLD FILE REFERENCE (approved style):
[paste gold file content]

YOUR ASSIGNMENT: Translate these files from English to Spanish LATAM:
- content/courses/{slug}/module-03-{slug}/classes/text-01-{slug}.md
- content/courses/{slug}/module-03-{slug}/classes/quiz-01-{slug}.md
[... list files]

For each file:
1. Read the source-language file
2. Create the locale-tree equivalent with mkdir -p if needed
3. Translate following all rules in your system prompt
4. Run glossary self-check (Step 5.5) before saving
5. Run accent enforcement check (Step 5.6) before saving
6. Write the translated file

IMPORTANT: Execute immediately. Do NOT enter plan mode.
```

**Step 6 — Phase B4: Translation reviewer (MANDATORY)**

After ALL translator agents finish, dispatch reviewer agent(s) with
`agents/translation-reviewer.md` as system prompt. Give it:
- The course-specific glossary
- List of ALL translated files to review
- Instruction to compare each against its source-language file

The reviewer auto-fixes terminology/structural issues and flags
teaching/tone for human review. **This step catches issues every single
time — it is never optional.**

**Step 7 — Phase B5: Automated validation**

Run these checks (all must pass):
```bash
# File count parity
EN=$(find content/courses/{slug} -name "*.md" -not -path "*/es/*" -not -path "*/docs/*" | wc -l)
ES=$(find content/courses/{slug}/es -name "*.md" | wc -l)
echo "EN: $EN  ES: $ES"

# All have language: es
grep -rL 'language:.*es' content/courses/{slug}/es/

# Zero glossary violations
grep -ri 'despliegue\|desplegar\|desplegado\|indicación\|marco de trabajo' content/courses/{slug}/es/

# Zero Spain Spanish
grep -ri 'vosotros\|ordenador' content/courses/{slug}/es/

# Zero vos conjugation
grep -ri '\btenés\b\|\bsos\b\|\bcerrás\b\|\bhacés\b\|\bpodés\b' content/courses/{slug}/es/
```

**Step 8 — Commit and update this document**

Commit translations. Then update the "Courses Translated" table above
with file count, date, and notes.

### Common Pitfalls

1. **Do NOT translate manually in your context window.** Always dispatch
   sub-agents with `agents/translator.md`.
2. **Do NOT skip the reviewer.** It has caught issues in 100% of pipeline
   runs.
3. **Do NOT skip gold files.** Parallel agents drift without a concrete
   style anchor.
4. **Balance agents by line count**, not file count. Video briefs are
   ~60 lines; text classes are ~300 lines.
5. **Add `IMPORTANT: Execute immediately. Do NOT enter plan mode.`** to
   every agent prompt — sub-agents sometimes enter plan mode instead of
   executing.
6. **Check sub-agent permissions** before dispatching. If agents can't
   write files, they'll fail silently or enter plan mode.

---

## File Structure

```
content/courses/{course-slug}/   ← consumer-specific path convention
├── [source-language content]
├── assets/                      ← shared images (NOT duplicated)
└── es/                          ← target-locale tree (Spanish LATAM)
    ├── course-overview.md
    └── module-NN-{slug}/
        ├── module-overview.md
        └── classes/
            └── *.md
```

Image paths from `es/module-NN/classes/` use `../../../assets/` (3 levels
up).
