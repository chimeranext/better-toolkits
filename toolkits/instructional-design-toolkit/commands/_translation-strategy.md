# Translation Strategy v1 — Learnings from AF-1

This file is a historical learning log from translation pipeline runs in
chimera-academy. It is preserved as-is so future runs of `translate-content`
on any consumer can inherit prior glossary decisions and known-issue
fixes. See `${CLAUDE_PLUGIN_ROOT}/commands/_translation-pipeline.md` for
the canonical pipeline procedure.

---

First course translated: **AI Fluency (AF-1)** — 42 files, ~6,200 lines.
Date: 2026-04-08
Branch: `feat/translator-agent`

---

## Pipeline Summary

```
Phase A — Source-Language Quality (before translation)
  1. Proofreader agents (3 parallel) scan all source-language files
  2. Auto-fix grammar/punctuation, flag everything else
  3. Interactive review with user — present options, user decides
  4. Commit source-language fixes

Phase B — Translation
  1. Define glossary + tone spec
  2. Translate 1 gold-standard file as anchor (user approves)
  3. Dispatch 4 parallel translation agents with gold file as reference
  4. Translation-reviewer agent normalizes across all agents
  5. Automated validation (file count, frontmatter, glossary enforcement)
  6. Structured commits (1 per logical unit)
```

---

## What Worked

### Parallel agents with a gold anchor
4 agents translating simultaneously cut the time dramatically. The
gold-standard file (`text-01-ai-fluency-at-a-glance.md`) gave all agents
a concrete tone/style reference. Without it, tone drift would have been
worse.

### Proofreading before translation
Found 5 quiz questions where the answer contradicted how the framework
was taught. If we'd translated first, we'd have translated wrong answers
into Spanish and then had to fix both versions. The English-first pass
saved double work.

### Translation-reviewer agent
Caught the one real cross-agent inconsistency ("Deploy" translated as
"Despliegue" in 6 files across 3 different agents). Without this
normalization pass, the glossary violation would have shipped.

### Interactive review protocol
Presenting 3-5 flags at a time with options (A/B/C) kept the review fast
and focused. The user made decisions on all 47 flags in ~4 batches. No
bottleneck.

### Automated validation
Simple grep checks caught what humans would miss — glossary violations,
missing frontmatter fields, Spain Spanish leaks.

---

## What Broke or Drifted

### "Deploy" glossary violation (6 files)
The most common error. 3 of 4 agents translated "Deploy" as "Despliegue"
despite the glossary explicitly listing it as "do not translate." The
agent that handled Module 5 (where Deploy appears most heavily in
context) got it right. The others defaulted to translating it.

**Root cause:** The Do Not Translate list was in the agent prompt, but
agents processing files where "Deploy" appeared only once or twice
didn't have enough contextual reinforcement. The Module 5 agent saw it
repeatedly and internalized it.

**Fix for next course:** Add a "glossary violation self-check" step to
the agent prompt — before saving each file, grep the output for common
violation patterns.

### Workbook section headers
Minor inconsistency in how the Content Formula headers were translated.
All agents converged on Contexto/Concepto/Construye/Entrega/Reflexiona,
but the path there wasn't guaranteed — one agent could have chosen
"Construir" instead of "Construye." The gold file didn't contain
workbook formula headers (it was a text class), so the workbook agent
had to decide independently.

**Fix for next course:** Include a workbook-specific terminology table
in the workbook agent prompt.

### .DS_Store files
macOS `.DS_Store` files snuck into one commit. Not a content issue but
messy. Should add to `.gitignore`.

---

## Agent Quality Comparison

| Agent | Files | Quality | Notes |
|-------|-------|---------|-------|
| Agent 1 (Overview + M1) | 7 | High | Had gold file in same scope, strong consistency |
| Agent 2 (M2 + M3) | 12 | High | Clean output, correct framework name handling |
| Agent 3 (M4 + M5) | 12 | High | Best glossary compliance (Deploy correct in M5) |
| Agent 4 (Workbook) | 10 | High | Longest files, good formula preservation |

All 4 agents performed well. No agent produced output that needed
rewriting — only the "Deploy" terminology fix was needed.

---

## Terminology Decisions Log

| English | Spanish | Decision |
|---------|---------|----------|
| AI Fluency | AI Fluency (Fluidez en IA) | English + Spanish first use per file |
| The 4D Framework | The 4D Framework (El Framework 4D) | Keep English name |
| Delegation/Description/Discernment/Diligence | Delegación/Descripción/Discernimiento/Diligencia | Translate freely |
| The Delegation Spectrum | The Delegation Spectrum (El Espectro de Delegación) | English + Spanish first use |
| The Description Formula | The Description Formula (La Fórmula de Descripción) | English + Spanish first use |
| The Discernment Checklist | The Discernment Checklist (La Lista de Discernimiento) | English + Spanish first use |
| Full Human / Full AI | Solo Humano / Solo IA | Translate freely |
| Sycophancy | Servilismo | Translate freely |
| Hallucination | Alucinación | Translate freely |
| Last Mile Problem | Problema del Último Kilómetro | LATAM-natural (not "última milla") |
| Ship milestone | Entregable del módulo | Translate freely |
| AI Map | AI Map (Tu Mapa de IA) | English + Spanish first use |
| AI Operating Manual | AI Operating Manual (Tu Manual Operativo de IA) | English + Spanish first use |
| sub-competencies | sub-competencias | Translate freely |
| Prompt, Deploy, Capstone, API, CLI, framework | Keep in English | Never translate |
| Build It / Ship It / Reflect | Construye / Entrega / Reflexiona | Workbook formula headers |

---

## Timing

| Step | Duration |
|------|----------|
| Proofreader agents (3 parallel) | ~5 min |
| Interactive review (4 batches) | ~15 min (user decision time) |
| Gold standard translation | Already done from prior session |
| Translation agents (4 parallel) | ~15 min |
| Translation reviewer | ~4 min |
| Automated validation | <1 min |
| Commits + push | ~3 min |

**Total pipeline time: ~45 min** for 42 files / ~6,200 lines.

---

## Recommendations for Next Course

1. **Add glossary self-check to agent prompts** — before saving, grep
   output for known violations
2. **Include workbook formula headers in terminology guide** — don't
   rely on agents inferring them
3. **Add `.DS_Store` to `.gitignore`** before starting
4. **Scale gold file coverage** — for courses with unique terminology
   (e.g., VC-1's VIBE Framework), translate 2 gold files instead of 1
5. **Consider a final-exam-specific agent** — AF-1 doesn't have one, but
   courses with final exams need extra quiz safety
6. **Reuse this terminology log** — future courses should inherit the
   base glossary and extend it with course-specific terms
7. **Translation reviewer is essential** — even with a good glossary,
   parallel agents will drift. The normalization pass is not optional.

---

## Files Produced

```
content/courses/ai-fluency/es/
├── course-overview.md
├── module-01-the-ai-moment/
│   ├── module-overview.md
│   └── classes/ (6 files)
├── module-02-delegation/
│   ├── module-overview.md
│   └── classes/ (5 files)
├── module-03-description/
│   ├── module-overview.md
│   └── classes/ (5 files)
├── module-04-discernment/
│   ├── module-overview.md
│   └── classes/ (5 files)
├── module-05-diligence/
│   ├── module-overview.md
│   └── classes/ (5 files)
└── docs/
    ├── ch-01-the-ai-moment/ (2 lessons)
    ├── ch-02-delegation/ (2 lessons)
    ├── ch-03-description/ (2 lessons)
    ├── ch-04-discernment/ (2 lessons)
    └── ch-05-diligence/ (2 lessons)
```

42 files total. All with `language: "es"` in frontmatter.

---
---

# Translation Strategy v2 — Learnings from AI-1

Second course translated: **AI Fundamentals (AI-1)** — 90 files,
~14,770 lines.
Date: 2026-04-08
Branch: `feat/translator-agent`

---

## V1 Improvements Applied

| Recommendation | Applied? | Result |
|---|---|---|
| Glossary self-check in translator prompts | Yes | Zero glossary violations (Deploy issue from AF-1 did not recur) |
| `.DS_Store` to `.gitignore` | Yes | No .DS_Store in commits |
| 2 gold files instead of 1 | Yes | Stronger style calibration across 5 agents |
| Final-exam validation in reviewer | Yes | All 12 synthesis questions verified correct |
| Terminology inheritance | Yes | AF-1 base glossary + AI-1 extensions worked cleanly |

---

## What Worked

### Glossary self-check eliminated the #1 AF-1 error
Zero instances of "Deploy" being translated. The self-check step in the
translator agent prompt prevented the violation pattern entirely.

### 2 gold files gave better coverage
Gold File 1 (text-01-how-ai-actually-works.md) covered foundational AI
terminology. Gold File 2 (text-01-context-engineering-mastery.md)
covered the 5-Layer Pyramid and technical depth. Together they exercised
most of the AI-1-specific glossary.

### Translation reviewer caught a critical quality issue
Modules 4 and 5 were translated without Spanish accents (tildes) — 500+
missing accents across ~20 files. The reviewer caught and fixed all of
them. Without this pass, the course would have shipped with broken
Spanish in 2 of 8 modules.

### 5 parallel agents worked well for 90 files
Balanced by estimated line count rather than file count. No bottleneck.

---

## What Broke or Drifted

### Missing accents in Modules 4-5 (~500 fixes)
The most significant issue. Two translation agents produced text without
Spanish diacritical marks — "codigo" instead of "código", "mas" instead
of "más", all "-cion" words missing the accent. Other modules
(1, 2, 3, 6, 7, 8) had proper accents throughout.

**Root cause:** Agent-specific — likely the agents that translated M4-M5
had different character encoding behavior. Not a prompt issue.

**Fix for next course:** Add explicit instruction to translator prompt:
"Ensure all Spanish accents/tildes are present. Never output Spanish
without proper diacritical marks."

### No other glossary violations
The self-check eliminated the pattern seen in AF-1.

---

## Agent Quality Comparison

| Agent | Files | Quality | Notes |
|-------|-------|---------|-------|
| Agent 1 (Overview + M1) | 10 | High | Had gold file in scope, strong consistency |
| Agent 2 (M2 + M3) | 21 | High | Clean output, proper accents |
| Agent 3 (M4 + M5) | 26 | Medium → High after fixes | Missing accents fixed by reviewer |
| Agent 4 (M6 + M7) | 21 | High | Proper accents, good technical term handling |
| Agent 5 (M8 + Final Exam) | 10 | High | Final exam synthesis questions well handled |

---

## AI-1-Specific Terminology Decisions

| English | Spanish | Rule |
|---------|---------|------|
| 5-Layer Context Pyramid | La Pirámide de Contexto de 5 Capas | English + Spanish first use |
| 5-Part Prompt Anatomy | La Anatomía del Prompt en 5 Partes | English + Spanish first use |
| Four Pillars of an Agent | Los Cuatro Pilares de un Agente | English + Spanish first use |
| The Agentic Stack | El Stack Agéntico | English + Spanish first use |
| Chain-of-Thought (CoT) | Chain-of-Thought (CoT) | Keep in English |
| Few-Shot Learning | Few-Shot Learning | Keep in English |
| Meta-Prompting | Meta-Prompting | Keep in English |
| Function Calling | Function Calling | Keep in English |
| Streaming | Streaming | Keep in English |
| RAG | RAG | Keep acronym |
| MCP | MCP | Keep acronym |
| Fine-tuning | Fine-tuning | Keep in English |
| Tokens | Tokens | Keep in English |
| Context window | Ventana de contexto | Translate freely |
| CLAUDE.md / .cursorrules | Keep as-is | File names |

---

## Recommendations for Next Course

1. **Add accent enforcement to translator prompt** — explicit instruction
   to never output accentless Spanish
2. **Glossary self-check is proven** — keep it mandatory
3. **2 gold files is the standard** for courses with unique frameworks
4. **Translation reviewer remains essential** — it caught a course-breaking
   issue
5. **For video-heavy courses** — video briefs are fast to translate but
   still need accent/glossary review
6. **Final exam handling worked** — no special agent needed, just extra
   reviewer scrutiny

---

## Files Produced

```
content/courses/ai-fundamentals/es/
├── course-overview.md
├── module-01-how-ai-works/
│   ├── module-overview.md
│   └── classes/ (9 files)
├── module-02-prompt-engineering/
│   ├── module-overview.md
│   └── classes/ (10 files)
├── module-03-context-engineering/
│   ├── module-overview.md
│   └── classes/ (10 files)
├── module-04-ai-tools-landscape/
│   ├── module-overview.md
│   └── classes/ (10 files)
├── module-05-building-with-ai-apis/
│   ├── module-overview.md
│   └── classes/ (14 files)
├── module-06-agents-mcp/
│   ├── module-overview.md
│   └── classes/ (10 files)
├── module-07-ai-limits-ethics/
│   ├── module-overview.md
│   └── classes/ (9 files)
└── module-08-your-ai-workflow/
    ├── module-overview.md
    └── classes/ (9 files, includes final exam)
```

90 files total. All with `language: "es"` in frontmatter.

---

## v3 Learnings — Batch Translation of 8 Courses (2026-04-08)

### Scale
427 files across 8 courses translated in a single session using parallel
Sonnet agents + mandatory reviewer pass. This is the largest batch run
of the pipeline.

### New Issues Found

1. **Q→P quiz header inconsistency**: Some translator agents used English
   "Q1, Q2..." prefix instead of Spanish "P1, P2..." (Pregunta). Also
   "## Questions" instead of "## Preguntas". The reviewer catches and
   normalizes this every time. Affected: DJ-3 (3 quizzes), AI-2
   (1 quiz + final exam), VC-1 (3 quizzes + final exam).

2. **Field label inconsistency**: Some agents left `**Correct:**` and
   `**Explanation:**` in English instead of translating to
   `**Correcta:**` and `**Explicación:**`. Pattern: agents handling
   later modules (M05+) were more likely to leave these untranslated.
   Reviewer fixes reliably.

3. **"Composición" vs "acumulación"**: The English "compounding
   principle" (compound interest metaphor) was translated as "principio
   de composición" (putting things together) instead of "principio de
   acumulación" (accumulation over time). The reviewer caught this
   because it changes the teaching meaning.

4. **Accent stripping**: VC-1 Module 05 had ZERO accented characters in
   quiz + challenge (100+ missing). This appears to be an agent-level
   failure where the entire diacritical system was dropped. The
   reviewer restored all accents.

5. **"Vos" conjugation leak**: VC-0 Day 04 files used Argentine "vos"
   form (tenés, sos, cerrás) instead of neutral LATAM "tú". ~79
   conjugation fixes required. Root cause: likely training data bias in
   the translator model.

6. **"Despliegue" spread**: Despite glossary self-check (Step 5.5), 42
   files across 7 courses had "despliegue/desplegar/desplegado"
   variants. The self-check catches the noun "despliegue" but misses
   conjugated verb forms. A dedicated fix agent with broader regex
   patterns was needed.

### What Worked Well

- **Translation reviewer is non-negotiable**: Found issues in EVERY
  course. Zero courses came through clean without it. The reviewer
  caught 300+ issues across 8 courses.
- **Parallel agent dispatch**: 4-5 Sonnet agents per course, split by
  module groups, balanced by line count. Effective at scale.
- **Gold files**: Using existing translations as style references for
  new agents maintained consistency.
- **Course-specific glossaries**: Each course has unique frameworks that
  need custom glossary entries. The base glossary alone is insufficient.

### Recommendations for v4

- Add conjugated verb forms to glossary self-check:
  `desplegar|despliega|desplegado|desplegando` not just `despliegue`
- Add field label check to translator agent: `Correct→Correcta`,
  `Explanation→Explicación`, `Questions→Preguntas`, `Q#→P#`
- Consider adding accent verification as a post-translation automated
  step (grep for common Spanish words without accents)
- The reviewer should run on ALL files, not just priority files — the
  M05 accent issue was in non-priority files too
