---
name: ship-first-design
description: >
  Ship-First Design — backward design for builders. Use when planning a new course, structuring
  modules, aligning assessments to objectives, designing challenges, or reviewing whether content
  connects to ship milestones. Activated when discussing course planning, curriculum design,
  assessment alignment, or backward design.
---

# Ship-First Design — Backward Design for Builders

You are an expert in backward course design adapted for a builder-first philosophy. Ship-First Design is an adaptation of Understanding by Design (UbD) — instead of starting with content and hoping students learn, you start with what students will SHIP and design backward from there. (Consumer plugins ship their own voice/philosophy overlay — for example, chimera-academy ships `skills/academy-philosophy/` for the Builder-First framing.)

## Why Ship-First Beats Content-First

Most course creators start with: "What do I want to teach?" Then they write lessons, add quizzes at the end, and hope students can apply the material.

Ship-First Design flips it:

1. **Define what they ship** — the tangible deliverable
2. **Define how you'll know they built it** — the evidence
3. **Then design the content that gets them there** — and nothing else

This eliminates the two biggest curriculum diseases:
- **Coverage obsession**: "We should also cover X" when X doesn't connect to the ship milestone
- **Assessment afterthought**: Quizzes bolted on after content is written, testing random recall

## The Three Stages

### Stage 1: What They Ship

*UbD equivalent: Desired Results*

Start here. Before writing a single text class, answer:

| Question | What It Produces |
|----------|-----------------|
| What's the capstone? | The final deployed/public deliverable for the whole course |
| What's the module ship milestone? | The tangible output at the end of each module |
| What must they be able to DO? | Measurable learning objectives (use Builder's Bloom's verbs — see `skills/blooms-taxonomy/SKILL.md`) |
| What will they UNDERSTAND? | Mental models and frameworks they need |
| What will they RECOGNIZE? | Tools, patterns, and terminology they'll encounter |

#### Ship Milestone Escalation

Builder-first courses follow a deliberate escalation pattern. Each module's ship milestone should be more public and more real than the last:

| Module Phase | Ship Level | Example |
|-------------|-----------|---------|
| Module 1-2 | **Build locally** | Working prototype on localhost, first component built |
| Module 3-4 | **Deploy** | Deployed to staging/preview, accessible via URL |
| Module 5-6 | **Share** | Shared with a peer, posted in community, first user feedback |
| Module 7+ | **Post publicly** | Published on social media, blog post, or portfolio |
| Capstone | **Ship to production** | Live product with real users, public repo, deployed SaaS |

Every module milestone should be a SUBSET of the capstone — a stepping stone, not a detour. If a module's output doesn't contribute to the final project, question whether it belongs.

#### Stage 1 Output Template

```markdown
## Course: [Course Name]

### Capstone
[One sentence: what the student ships at the end]

### Module Ship Milestones
| Module | Milestone | Ship Level | Contributes to Capstone? |
|--------|-----------|-----------|-------------------------|
| 1 | ... | Build locally | Yes — becomes the... |
| 2 | ... | Build locally | Yes — becomes the... |
| 3 | ... | Deploy | Yes — becomes the... |
| ... | ... | ... | ... |

### Learning Objectives (by module)
| Module | Objective | Bloom's Level |
|--------|-----------|--------------|
| 1 | You'll build... | Build |
| 1 | You'll explain... | Explain |
| 2 | You'll deploy... | Build |
| ... | ... | ... |
```

---

### Stage 2: How We Know They Built It

*UbD equivalent: Acceptable Evidence*

Before writing content, design the evidence. For each objective, define how you'll verify the student achieved it.

| Evidence Type | What It Tests | Where It Lives |
|--------------|--------------|----------------|
| **Challenge** | Can they build it? (Apply, Create) | Module challenge class |
| **Quiz question** | Do they understand the concept? (Recognize, Explain) | Module quiz class |
| **Capstone rubric** | Can they ship independently? (Decide, Ship) | Final module challenge |
| **Code review criteria** | Can they evaluate quality? (Analyze, Evaluate) | Challenge evaluation rubric |

#### Challenge Design Principles

1. **Test what the text class teaches.** If the text class teaches component composition, the challenge should require composing components — not something tangential.
2. **Escalate autonomy.** Early challenges provide structure (starter code, clear specs). Late challenges provide goals (requirements, not instructions).
3. **Real deliverables.** "Submit a screenshot of your deployed app" beats "answer these reflection questions."
4. **Clear success criteria.** The student should know whether they passed without ambiguity. Define what "done" looks like.

#### Quiz Design Principles

1. **Match the Bloom's level.** A Build-level module should have application questions, not just terminology recall.
2. **Test understanding, not memory.** "Which approach would you use for X scenario?" over "What does Y stand for?"
3. **Use scenarios.** Present a situation and ask for the best response — mirrors real builder decisions.
4. **5-10 questions per module quiz.** 70% pass threshold. Quality over quantity.

#### Stage 2 Output: Alignment Matrix

Every objective gets matched to its assessment BEFORE content is written:

```markdown
## Module [N] Alignment Matrix

| Objective | Bloom's Level | Assessment Type | Assessment Detail |
|-----------|--------------|-----------------|-------------------|
| You'll build a REST endpoint... | Build | Challenge | Deploy endpoint, submit URL |
| You'll explain auth vs authz... | Explain | Quiz Q3 | Scenario: which pattern? |
| You'll debug a CORS error... | Debug & Evaluate | Challenge (bonus) | Fix the broken starter code |
| You'll choose between JWT and sessions... | Decide | Quiz Q7 | Trade-off scenario |
```

**Rule: No orphaned objectives.** If an objective has no assessment, either add one or cut the objective. If an assessment tests something with no objective, either add the objective or cut the assessment.

---

### Stage 3: What Gets Them There

*UbD equivalent: Learning Experiences*

NOW — and only now — design the content. Every piece of content exists to prepare the student for an assessment defined in Stage 2.

| Content Type | Purpose | Design From |
|-------------|---------|-------------|
| **Text class** | Teach the concept needed for the challenge | Stage 2: what does the challenge require them to know? |
| **Video (talking head)** | Frame the module, motivate the work | Stage 1: why does this module matter? |
| **Video (screen demo)** | Show the build process for students who need it | Stage 2: what does the challenge look like when done? |
| **Exercises in text classes** | Practice before the challenge | Stage 2: what skills does the challenge test? |
| **Module sequence** | Order that builds capability progressively | Stage 1: which objectives depend on which? |

#### Content Design Questions

For every piece of content, ask:

1. **Which objective does this serve?** If you can't name one, the content might not belong.
2. **Which assessment does this prepare them for?** If no assessment tests this, why teach it?
3. **Is this the minimum needed to succeed?** Teach enough to act. Save the deep dive for a later course.
4. **Does the text class prepare them for the challenge?** A student who reads the text class carefully should be able to complete the challenge.

#### Stage 3 Output: Module Content Map

```markdown
## Module [N] Content Map

### Sequence
1. Video (talking head): [Title] — frames why this matters
2. Text class: [Title] — teaches [concepts needed for challenge]
3. Text class: [Title] — teaches [additional concepts]
4. Screen demo: [Title] — shows the build process (optional)
5. Quiz: [Title] — checks understanding before challenge
6. Challenge: [Title] — the module's BUILD deliverable

### Content-to-Assessment Mapping
| Content | Prepares Student For |
|---------|---------------------|
| Text class 1 | Challenge tasks 1-3, Quiz Q1-Q4 |
| Text class 2 | Challenge tasks 4-5, Quiz Q5-Q7 |
| Screen demo | Challenge overall approach |
```

---

## Ship-First Validation Checklist

Run this checklist after designing a module or course. Every box should be checked.

### Alignment

- [ ] Every learning objective has a corresponding challenge or quiz question
- [ ] Every challenge tests what the text class teaches
- [ ] Every text class prepares the student for a challenge or quiz
- [ ] No orphaned content — every piece connects to an objective and assessment
- [ ] Module ship milestones escalate toward the capstone

### Ship Milestones

- [ ] Every module ends with a tangible deliverable
- [ ] Milestones escalate (local > deploy > share > public > production)
- [ ] Each milestone is a stepping stone to the capstone — not a detour
- [ ] The capstone requires original decisions, not just following instructions

### Assessments

- [ ] Challenges have clear, unambiguous success criteria
- [ ] Quiz questions match the Bloom's level of their module
- [ ] Early challenges are more guided, late challenges are more open
- [ ] The capstone sits at Bloom's level 5-6 (Decide/Ship)

### Content

- [ ] Text classes teach everything needed for the module's challenge
- [ ] No text class exists without a connection to an assessment
- [ ] Content covers only what's needed for THIS module's milestone
- [ ] Lesson sequence builds capability progressively

---

## Common Pitfalls

### 1. Activity-First Planning

**Symptom**: "Let's have them build a todo app!" before defining objectives or assessments.

**Why it fails**: The activity might not teach what students need. You end up with a fun exercise that doesn't connect to the course goals.

**Fix**: Start with Stage 1. What will they ship at the end of the course? Work backward to determine what each module should build.

### 2. Coverage Obsession

**Symptom**: "We should also cover middleware, error handling, logging, monitoring, and caching in this module."

**Why it fails**: Modules become bloated. Students are overwhelmed. Most of the content doesn't connect to assessments.

**Fix**: For each topic, ask: "Does the challenge require this?" If no, cut it or move it to a later module/course.

### 3. Assessment Afterthought

**Symptom**: Content is written first, then quizzes and challenges are bolted on at the end.

**Why it fails**: Assessments test random details instead of core objectives. Challenges don't align with what was taught.

**Fix**: Design Stage 2 before Stage 3. Write the challenge spec and quiz questions BEFORE writing the text class.

### 4. Capstone Disconnect

**Symptom**: Module milestones don't contribute to the capstone. Students build separate mini-projects that get abandoned.

**Why it fails**: Students don't see the progression. Work from early modules feels wasted.

**Fix**: Each module milestone should be a component of the capstone. Module 1 builds the foundation, Module 2 adds a feature, etc.

### 5. The Tutorial Capstone

**Symptom**: The final project has step-by-step instructions telling students exactly what to build and how.

**Why it fails**: Following instructions is Bloom's level 3 (Apply). A real capstone should be level 5-6 (Decide/Ship).

**Fix**: Give goals and constraints, not instructions. "Ship a SaaS with auth, payments, and one AI feature" — not "Step 1: Create a Next.js project..."

---

## Ship-First Design in Practice

### Designing a New Course

1. Write the capstone description first (1-2 sentences)
2. Define 5-8 module milestones that escalate toward the capstone
3. Write learning objectives for each module using Builder's Bloom's verbs (`skills/blooms-taxonomy/SKILL.md`)
4. Design challenges and quizzes for each module (Stage 2)
5. Fill in the alignment matrix — objective > assessment > content
6. NOW write text classes, video briefs, and exercises (Stage 3)
7. Run the validation checklist

### Reviewing an Existing Course

1. List all objectives, assessments, and content pieces
2. Build the alignment matrix
3. Flag orphans: objectives without assessments, content without objectives
4. Check milestone escalation
5. Verify capstone requires Decide/Ship-level thinking

### Connection to Other Frameworks

- **Builder's Bloom's** (`skills/blooms-taxonomy/SKILL.md`): Feeds into Stage 1 — objectives use Bloom's verbs, progression targets higher levels
- **Content Formula** (consumer-specific lesson formula — e.g. chimera-academy ships CONTEXT > CONCEPT > BUILD > SHIP > REFLECT in `skills/academy-philosophy/`): The formula for individual lessons. Ship-First Design is the framework for the COURSE level.
- **Content Standards** (consumer-specific quality rubric — e.g. chimera-academy ships `skills/content-standards/`): Ship-First Design is how you plan. Content Standards is how you review what you wrote.
- **Learning Evaluation** (`skills/learning-evaluation/SKILL.md`): Stage 2 evidence maps to Kirkpatrick L2. Ship milestones connect to L3/L4.
