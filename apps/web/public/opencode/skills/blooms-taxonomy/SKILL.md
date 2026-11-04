---
name: blooms-taxonomy
description: >
  Builder's Bloom's — cognitive scaffolding for course design. Use when planning learning objectives,
  sequencing modules, writing assessment criteria, designing challenge progression, or reviewing
  whether a course builds toward higher-order thinking. Activated when discussing cognitive levels,
  objective writing, or skill progression.
---

# Builder's Bloom's — Cognitive Scaffolding for Builders

You are an expert in applying Bloom's Taxonomy to builder-first education. This is an adaptation of the classic 6-level cognitive framework — translated from academic language into builder actions. Use it to ensure courses don't just teach facts, but build toward real creative capability. (Consumer plugins may extend this with their own voice overlay — for example, chimera-academy ships `skills/academy-philosophy/SKILL.md` for Builder-First framing.)

## Why Builders Need Cognitive Scaffolding

Most online courses stall at levels 1-2: students recognize terminology and can explain concepts, but never reach the point where they can build, evaluate, and ship independently. Builder-first courses are designed to push students into levels 3-6 as fast as possible — that's where real builder capability lives.

Builder's Bloom's gives course designers a diagnostic tool:
- **Are your objectives climbing?** If every module objective is "understand X," the course is flat.
- **Are your assessments matching?** If objectives say "build" but quizzes only test recall, there's a gap.
- **Are you reaching Create?** If the capstone doesn't require original design decisions, the course stopped too early.

## The 6 Builder Levels

| Level | Bloom's | Builder Translation | What It Looks Like | Where in Course |
|-------|---------|--------------------|--------------------|-----------------|
| 1 | Remember | **Recognize** | Identify tools, patterns, terminology by name | Pre-work, early text classes, glossary callouts |
| 2 | Understand | **Explain** | Describe why a pattern works, compare approaches in own words | Text class concept sections, discussion prompts |
| 3 | Apply | **Build** | Use a tool/framework to produce a working result | BUILD sections, guided challenges, exercises |
| 4 | Analyze | **Debug & Evaluate** | Break down what went wrong, assess output quality, trace cause-effect | Review/QA modules, AI output evaluation, debugging exercises |
| 5 | Evaluate | **Decide** | Choose between approaches, justify trade-offs, defend a design decision | Architecture decisions, capstone planning, peer review |
| 6 | Create | **Ship** | Design and deploy an original project with novel decisions | Capstone, final challenges, portfolio pieces |

## Level Details

### Level 1: Recognize

**Builder description**: You can identify the thing when you see it. You know what tools exist and what they're called.

**Action verbs**: identify, name, list, recognize, locate, match, label, recall

**Assessment methods**: Multiple-choice quiz, matching exercises, "which tool would you use for X?"

**Course placement**: Module 1 text classes, pre-work materials, first encounters with new tools.

**Example objective**: "You'll recognize when a problem calls for an API vs. a database query."

---

### Level 2: Explain

**Builder description**: You can describe how it works and why it matters. You can compare approaches without having used them yet.

**Action verbs**: explain, describe, compare, contrast, summarize, interpret, predict, distinguish

**Assessment methods**: Short-answer quiz questions, "explain in your own words," comparison tables in text classes.

**Course placement**: Text class concept sections, early modules where mental models are being built.

**Example objective**: "You'll explain why component-based architecture beats monolithic templates for maintainability."

---

### Level 3: Build (Apply)

**Builder description**: You can use the tool/framework to produce a working result by following a pattern you've learned.

**Action verbs**: build, implement, use, execute, deploy, configure, set up, create (guided), solve

**Assessment methods**: Challenges with clear specs, BUILD sections in text classes, "make this work" exercises.

**Course placement**: BUILD sections in every text class, module challenges, guided exercises.

**Example objective**: "You'll build a REST API endpoint that handles authentication using the pattern from this module."

---

### Level 4: Debug & Evaluate (Analyze)

**Builder description**: You can break down a system, trace what went wrong, assess quality, and identify root causes.

**Action verbs**: debug, trace, diagnose, compare outputs, assess quality, deconstruct, differentiate, test, audit

**Assessment methods**: "Find the bug" challenges, AI output evaluation exercises, code review tasks, quality rubric application.

**Course placement**: Mid-course modules, QA/review lessons, AI discernment exercises (is this output good?).

**Example objective**: "You'll evaluate AI-generated code for security vulnerabilities and performance issues."

---

### Level 5: Decide (Evaluate)

**Builder description**: You can choose between competing approaches, justify your choice with trade-offs, and defend your decision.

**Action verbs**: choose, justify, defend, prioritize, recommend, critique, rank, argue for/against

**Assessment methods**: Architecture decision records, "which approach and why?" challenges, capstone planning documents, peer review exercises.

**Course placement**: Late-course modules, capstone planning phase, architecture decisions.

**Example objective**: "You'll choose between SSR and client-side rendering for your capstone and justify the trade-offs."

---

### Level 6: Ship (Create)

**Builder description**: You design and deploy something original — not following a tutorial, but making real design decisions and shipping the result.

**Action verbs**: design, ship, architect, compose, invent, produce, launch, publish, deploy (original)

**Assessment methods**: Capstone projects, portfolio pieces, public deployments, original tool/product creation.

**Course placement**: Final module challenges, capstone projects, course-level deliverables.

**Example objective**: "You'll ship a production-ready SaaS feature that solves a real user problem you identified."

---

## Scaffolding Progression for Multi-Module Courses

Multi-module courses aren't weekend workshops — they have room to climb the full taxonomy. Here's the typical progression:

### Module Progression Pattern

| Course Phase | Modules | Primary Levels | What's Happening |
|-------------|---------|---------------|------------------|
| **Foundation** | 1-2 | Recognize + Explain + Build | Students learn the tools, build mental models, produce first guided results |
| **Competence** | 3-5 | Build + Debug & Evaluate | Students build independently, learn to assess quality, debug real problems |
| **Mastery** | 6-7 | Decide + Ship | Students make original decisions, ship real projects, defend choices |
| **Capstone** | Final | Ship | Original project that integrates everything — deployed and public |

### Key Principles

- **Don't linger at Recognize/Explain.** One module of foundation is usually enough. Get to Build fast.
- **Build appears in every module.** Even foundation modules should have hands-on challenges.
- **Debug & Evaluate is the unlock.** Students who can evaluate AI output, debug their own code, and assess quality are the ones who become independent builders. Invest here.
- **Ship requires real decisions.** If the capstone has step-by-step instructions, it's Apply, not Create. The student must make design choices.
- **Spiral, don't stack.** The same concept can appear at multiple levels across modules. Module 2 might introduce APIs at Build level; Module 5 revisits APIs at Decide level (choosing between API architectures).

### Level Distribution Target

For a typical 7-module builder-first course:

| Level | % of Objectives | Rationale |
|-------|----------------|-----------|
| Recognize | 5-10% | Minimal — just enough to name things |
| Explain | 10-15% | Mental models matter, but don't over-invest |
| Build | 30-40% | The core of every module |
| Debug & Evaluate | 15-25% | Critical for independence — the AI discernment layer |
| Decide | 10-15% | Architecture and trade-off decisions |
| Ship | 10-15% | Capstone and final challenges |

## Writing Builder-First Objectives

### The Formula

Every objective follows this pattern:

> **"You'll [action verb] [specific deliverable/outcome] [context/constraint]."**

### Do This / Not This

| Don't Write | Write Instead | Why |
|-------------|---------------|-----|
| "Students will be able to understand REST APIs" | "You'll build a REST endpoint that handles CRUD operations" | Builder-first language, specific deliverable |
| "Learners will demonstrate knowledge of Git" | "You'll ship your first feature branch through a full PR workflow" | Action over demonstration |
| "Understand the difference between SQL and NoSQL" | "You'll choose the right database for your capstone and defend the trade-off" | Pushes to Decide level, not just Explain |
| "Learn about AI prompt engineering" | "You'll evaluate three AI-generated solutions and pick the one that ships" | Debug & Evaluate level, not Recognize |
| "Be familiar with deployment pipelines" | "You'll deploy your project to production with a CI/CD pipeline you configured" | Build level with real outcome |

### Rules

1. **Always use "You'll..."** — never "Students will be able to..." or "Learners will demonstrate..."
2. **One verb per objective.** If you need two verbs, it's two objectives.
3. **The verb determines the level.** Check the verb tables (`references/verb-tables.md`) to make sure you're targeting the right cognitive level.
4. **Include the deliverable.** "You'll build..." what? "You'll ship..." what? The objective should make the output concrete.
5. **Match the assessment.** If the objective says "build," the challenge must require building — not just a quiz.

## Validation Checklist for Course Designers

Use this when reviewing a course plan or module structure:

### Objective Quality

- [ ] Every module has 2-4 explicit learning objectives
- [ ] All objectives use "You'll [verb]..." format
- [ ] Objectives span at least 3 different Bloom's levels across the course
- [ ] No module has only Recognize/Explain objectives (every module reaches Build)
- [ ] The final module reaches Ship level

### Progression

- [ ] Cognitive level increases across the course (early = Build, late = Decide/Ship)
- [ ] Foundation modules (1-2) don't linger — students are building by Module 2
- [ ] Debug & Evaluate appears in mid-course modules (not just "build more")
- [ ] Capstone requires original design decisions, not following instructions

### Assessment Alignment

- [ ] Every objective has a matching assessment (challenge, quiz question, or deliverable)
- [ ] Quiz questions match the Bloom's level of their module (not just recall for a Build module)
- [ ] Challenges escalate: guided early, open-ended late
- [ ] The capstone challenge sits at level 5-6 (Decide/Ship)

### Common Failures

| Failure | Symptom | Fix |
|---------|---------|-----|
| **Flat course** | Every module objective is "build X" at the same level | Add Evaluate and Decide objectives in later modules |
| **Theory-heavy start** | Modules 1-3 are all Recognize/Explain | Move Build into Module 1 — even a small guided build |
| **Tutorial capstone** | Final project has step-by-step instructions | Remove instructions, give constraints and goals instead |
| **Assessment mismatch** | Objectives say "evaluate" but quiz tests recall | Rewrite quiz to match the cognitive level |
| **Missing middle** | Course jumps from Build to Ship without Debug/Decide | Add analysis and decision-making challenges in mid-course |

## Connection to Other Frameworks

- **Content Formula** (CONTEXT > CONCEPT > BUILD > SHIP > REFLECT — consumer-specific, e.g. chimera-academy ships this in `skills/academy-philosophy/`): The formula maps naturally — CONCEPT is levels 1-2, BUILD is level 3, SHIP is level 6. Builder's Bloom's helps you check that your course PROGRESSES through these, not just repeats them.
- **Ship Milestones**: The escalation pattern (local > deploy > share > public > production) maps to cognitive progression. Early milestones = Build level. Production deployment = Ship level.
- **Challenge Design**: Use the level to calibrate challenge difficulty. A Module 2 challenge should be Apply-level (guided build). A Module 6 challenge should be Evaluate/Create-level (open-ended with trade-offs).
- **Ship-First Design** (`skills/ship-first-design/SKILL.md`): Builder's Bloom's feeds directly into Stage 1 of Ship-First Design — defining what students will ship requires knowing what cognitive level they'll reach.
