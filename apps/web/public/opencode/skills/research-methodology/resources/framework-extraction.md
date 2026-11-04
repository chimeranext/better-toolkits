# Framework Extraction Methodology

## What Makes a Teachable Framework

A research finding becomes a named framework when it passes ALL 5 criteria:

| # | Criterion | Test | Fail Example |
|---|-----------|------|-------------|
| 1 | **Models a decision** | Would a student face this choice in real work? | "Python is a programming language" (fact, not decision) |
| 2 | **Has structure** | Can it be rendered as a table, matrix, tree, or checklist? | "Be careful with auth" (advice, not structure) |
| 3 | **Has a memorable name** | Would a student remember and reference it by name? | "The thing about choosing databases" (not memorable) |
| 4 | **Has a worked example** | Can you show it applied to a concrete scenario? | Pure abstraction with no application |
| 5 | **Is testable** | Could you write a quiz question about it? | "Software is complex" (no testable content) |

## Framework Types

Look for these patterns in research findings:

| Type | What It Models | Recognition Signal | Example |
|------|---------------|-------------------|---------|
| **Decision tree** | When to choose X vs Y | "It depends on..." or "Use X when..." | "The Model Selection Tree" |
| **Comparison matrix** | How options differ across dimensions | Multiple options with trade-offs | "The Transport Protocol Matrix" |
| **Hierarchy / layers** | How things stack or nest | "There are N levels..." | "The 8-Level Memory Hierarchy" |
| **Workflow / cycle** | Steps in a repeatable process | "First... then... finally..." | "The VIBE Cycle" |
| **Anti-pattern catalog** | What NOT to do | "A common mistake is..." | "The 5 Hook Anti-Patterns" |
| **Spectrum / scale** | Degrees of a dimension | "From X to Y..." | "The Autonomy Spectrum" |
| **Checklist** | Must-verify items before proceeding | "Before you X, verify..." | "The Pre-Deploy Checklist" |
| **Formula / equation** | Relationship between variables | "X depends on Y and Z" | "The Budget Formula" |

## Extraction Process

### Step 1: Scan Research for Decision Points

Read through RESEARCH.md and look for every place where:
- Two or more options exist
- Trade-offs are discussed
- "It depends on..." appears
- A recommendation is conditional

Each of these is a framework candidate.

### Step 2: Filter Through the 5 Criteria

For each candidate, run the 5-criterion test. Discard anything that fails.

### Step 3: Name It

Good names are:
- **Specific** — "The Context Pyramid" not "The Framework"
- **Memorable** — "The 3-Layer Review" not "Multi-Stage Quality Assurance Process"
- **Noun-based** — "The Delegation Spectrum" not "How to Delegate"

Bad names: anything generic, anything that starts with "The Approach" or "The Method."

### Step 4: Structure It

Every framework needs a primary artifact — usually a table:

| Framework Type | Primary Artifact |
|---------------|-----------------|
| Decision tree | Table: Situation → Decision → Why |
| Comparison matrix | Table: Options as rows, dimensions as columns |
| Hierarchy | Table or ASCII diagram: levels with descriptions |
| Workflow | Table: Steps in order with actions |
| Anti-pattern catalog | Table: Pattern → Symptom → Fix |
| Spectrum | Table or visual: endpoints with positions |
| Checklist | Checkbox list with specific, verifiable items |

### Step 5: Write a Worked Example

Apply the framework to a concrete scenario the target student would recognize. The example should be:
- **Realistic** — a situation they'd actually encounter
- **Complete** — walks through the entire framework
- **Specific** — names, numbers, details (not abstract)

### Step 6: Cross-Reference

Check the consumer plugin's framework inventory if it ships one (e.g. chimera-academy ships `content/_framework-inventory.md`):
- Does this framework already exist under a different name? → Reference it, don't duplicate
- Does a similar framework exist in another course? → Cross-reference it
- Is this genuinely new? → Mark as "New — add to inventory after course ships"

## Output Format

Produce `framework-extraction.md` with this structure:

```markdown
# Framework Extraction: {Course/Topic}

## Summary
{N} frameworks extracted. {X} new, {Y} reuse from existing courses.

## Frameworks

### 1. {Framework Name}
**Type:** {decision tree / comparison matrix / hierarchy / etc.}
**Module fit:** M{N} — {module name}
**Teaches:** {what decision or concept it helps with}

{Primary artifact — table/matrix/checklist}

**Worked example:** {concrete scenario}

**Cross-reference:** New / Reuse from {course} / Extends {existing framework}

---

### 2. {Next Framework}
...

## Inventory Summary

| # | Framework | Type | Module | Status |
|---|-----------|------|--------|--------|
| 1 | {name} | {type} | M{N} | New |
| 2 | {name} | {type} | M{N} | Reuse from {course} |
```

## Quality Gate

Before delivering framework-extraction.md:
- [ ] At least 1 framework per planned module
- [ ] No duplicates with existing framework-inventory.md
- [ ] Each framework has name + table + worked example
- [ ] Framework types are mixed (not all the same pattern)
- [ ] Every framework is actionable (student can use it to decide something)
- [ ] Names are memorable and specific
