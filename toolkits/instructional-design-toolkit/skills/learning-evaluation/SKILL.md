---
name: learning-evaluation
description: >
  Learning Evaluation — measuring whether courses actually work. Use when designing post-course
  surveys, analyzing course metrics, planning retention strategies, reviewing challenge rubrics,
  or discussing how to measure learning outcomes beyond quiz scores. Reference skill for
  evaluation planning.
---

# Learning Evaluation — Did They Actually Learn?

You are a reference guide for measuring learning outcomes on a builder-first course platform. This skill adapts Kirkpatrick's 4-level evaluation model for an online course platform where the real question isn't "did they finish?" but "did it change what they can do?"

## Why "They Shipped the Capstone" Isn't Enough

A student who completes the capstone with heavy hand-holding learned less than one who struggled through a smaller project independently. Completion is a lagging indicator — it tells you what happened, not what stuck.

A serious instructional program needs to measure at four levels:

1. Did they enjoy it? (Will they come back?)
2. Did they learn it? (Can they pass assessments?)
3. Are they using it? (Are they building after the course?)
4. Did it change outcomes? (Did their career or projects improve?)

Most online courses only measure L1 (ratings) and L2 (quiz scores). Levels 3 and 4 are where real value lives — and where most platforms stop looking.

## The 4 Levels

### Level 1: Did They Enjoy It? (Reaction)

*Kirkpatrick equivalent: Reaction*

**What we measure**: Satisfaction, engagement, perceived value, willingness to recommend.

**Why it matters**: Dissatisfied students don't finish, don't recommend, and don't come back. Low L1 scores are an early warning signal — but high L1 doesn't guarantee learning.

| Metric | Source | Target |
|--------|--------|--------|
| Course rating | Post-course survey | 4.5+ / 5.0 |
| Completion rate | Platform analytics | 70%+ |
| Net Promoter Score (NPS) | Post-course survey | 50+ |
| "Would recommend to a friend" | Post-course survey | 80%+ yes |
| Module-level drop-off | Platform analytics | No module loses >20% |

#### Post-Course Survey (L1)

Send within 48 hours of course completion. Keep it short — 5 questions max.

**Template:**

1. **Overall, how would you rate this course?** (1-5 stars)

2. **What was the most valuable thing you learned or built?** (Open text)

3. **What was the most frustrating part?** (Open text)

4. **Would you recommend this course to a friend learning this topic?** (Yes / Maybe / No)

5. **What should we add, remove, or change?** (Open text)

**Rules:**
- No leading questions ("How amazing was the instructor?")
- Always include at least one open-text question — the gold is in free-form responses
- Don't survey before completion — incomplete students get a different survey (exit survey)
- Track trends over cohorts, not individual responses

#### L1 Signals to Watch

| Signal | What It Means | Action |
|--------|--------------|--------|
| High ratings but low completion | Content is liked but too long or poorly paced | Tighten module length, check for bloat |
| Low ratings but high completion | Students finish but feel frustrated | Review UX, check for unclear instructions |
| Drop-off spike at specific module | That module has a problem | Review that module's content and challenge difficulty |
| "Too easy" feedback | Not enough challenge depth | Add harder optional extensions, raise challenge bar |
| "Too hard" feedback | Missing scaffolding | Add more guided examples before the challenge |

---

### Level 2: Did They Learn It? (Learning)

*Kirkpatrick equivalent: Learning*

**What we measure**: Knowledge gain, skill acquisition, ability to pass assessments.

**Why it matters**: This is the direct output of the course. If students can't pass quizzes and challenges, the content isn't working.

| Metric | Source | Target |
|--------|--------|--------|
| Quiz pass rate | Platform data | 80%+ on first attempt |
| Challenge completion rate | Platform data | 75%+ |
| Challenge quality score | Rubric evaluation | Average 3.5+ / 5.0 |
| Final exam pass rate | Platform data | 70%+ on first attempt |
| Time to complete challenges | Platform data | Within expected range |

#### Connection to Challenge Rubrics

Every challenge should have a rubric that maps to learning objectives. The rubric IS the L2 measurement.

**Challenge rubric template:**

| Criterion | 1 - Incomplete | 3 - Meets | 5 - Exceeds |
|-----------|---------------|-----------|-------------|
| Core functionality | Missing or broken | Works as specified | Works + handles edge cases |
| Code quality | Copy-pasted, no understanding | Clean, follows patterns taught | Cleanly restructured, well-documented |
| Deployment | Not deployed | Deployed to staging | Deployed to production |
| Original decisions | Followed tutorial exactly | Made 1-2 independent choices | Significant original design |

**Rules:**
- Rubric criteria should map directly to module learning objectives
- "Meets" (3) should match the module's objective level — if the objective is Build, "meets" means it works
- "Exceeds" (5) should reach the next Bloom's level — if the objective is Build, "exceeds" means they analyzed or improved it
- Track rubric scores over time to spot content that consistently underperforms

#### L2 Signals to Watch

| Signal | What It Means | Action |
|--------|--------------|--------|
| Low quiz pass rate | Content didn't teach effectively | Review text class clarity, add more examples |
| High quiz but low challenge pass rate | Students understand theory but can't apply | Add more BUILD practice in text classes |
| Challenge quality declining over modules | Students are fatiguing or content is escalating too fast | Check pacing, add scaffolding |
| Bimodal quiz scores (many high, many low) | Content works for some backgrounds but not others | Add pre-work or prerequisite checks |

---

### Level 3: Are They Using It? (Behavior)

*Kirkpatrick equivalent: Behavior*

**What we measure**: Post-course application — are students actually building things after the course ends?

**Why it matters**: A student who ships the capstone but never touches the skills again didn't really learn. L3 is where learning becomes capability.

| Metric | Source | Target |
|--------|--------|--------|
| Post-course project activity | Community posts, GitHub | 30%+ active at 30 days |
| Enrolled in next course | Platform data | 40%+ |
| Community participation | Forum/Discord activity | 20%+ posting at 30 days |
| Retention plan completion | Follow-up survey | 50%+ attempted |
| Portfolio updates | Student profiles | 25%+ updated within 60 days |

#### Retention Plan Connection

Every course should suggest a post-course retention plan — a lightweight "what to do next" that keeps skills active. This isn't a separate course; it's a bridge.

**Retention plan elements:**

| Element | Purpose | Example |
|---------|---------|---------|
| **30-day challenge** | Keep building momentum | "Ship one feature per week for 4 weeks" |
| **Community prompt** | Social accountability | "Post your capstone in #ships and review 2 others" |
| **Next course pointer** | Continue the learning path | "Ready for more? AI-2 picks up where this leaves off" |
| **Resource list** | Self-directed deepening | "3 repos to study, 2 docs to bookmark" |

**Rules:**
- Retention plans are suggestions, not requirements
- Keep them concrete — "build X" not "keep practicing"
- Connect to the community — accountability beats willpower
- Track whether students who follow the plan have better L4 outcomes

#### L3 Signals to Watch

| Signal | What It Means | Action |
|--------|--------------|--------|
| Low post-course activity | Skills aren't sticking | Strengthen retention plan, add community hooks |
| High next-course enrollment | Students value the platform | Good signal — ensure next course meets expectations |
| Students building but not sharing | Missing the "public" habit | Reinforce build-in-public culture earlier |
| Community posts are just questions, not ships | Students are stuck, not building | Review challenge difficulty, add post-course support |

---

### Level 4: Did It Change Outcomes? (Results)

*Kirkpatrick equivalent: Results*

**What we measure**: Real-world impact — career changes, products shipped, revenue generated.

**Why it matters**: This is the ultimate measure. If courses don't change what students can do in the real world, nothing else matters.

| Metric | Source | Target |
|--------|--------|--------|
| Products shipped post-course | Student stories, community | Track and celebrate |
| Career moves (new role, promotion, freelance) | Follow-up survey (90 days) | Track trends |
| Revenue generated from course projects | Student self-report | Track and celebrate |
| "This course changed my career" testimonials | Surveys, community | Collect actively |
| Employer/client feedback | Indirect — student reports | Track qualitatively |

#### Measuring L4 Practically

L4 is the hardest to measure — outcomes take months and depend on many factors beyond the course. Be honest about what's attributable.

**Practical approaches:**

1. **90-day follow-up survey** (3 questions):
   - "Have you used skills from [course] in a real project or job? (Yes/No + describe)"
   - "Has completing this course contributed to any career change? (Yes/No + describe)"
   - "What's the most valuable thing you built since finishing the course?"

2. **Student story collection**: Actively solicit stories from community. "Tell us what you've shipped since completing [course]."

3. **Testimonial prompts**: After positive survey responses, ask permission to feature their story.

4. **Community tracking**: Monitor #ships channel for post-course projects. Tag by course for attribution.

**Rules:**
- Don't over-claim. A student who got a job after your course might have gotten it anyway.
- Collect stories consistently — they're your most powerful marketing AND your best course feedback.
- Track L4 per course to identify which courses drive the most real-world impact.
- Use L4 data to prioritize course investment — double down on courses that change outcomes.

---

## Per-Course Evaluation Template

Use this template when planning evaluation for a new course:

```markdown
## Evaluation Plan: [Course Name]

### L1: Reaction
- Post-course survey: [Yes/No, timing]
- Key metrics: rating, NPS, completion rate
- Drop-off monitoring: [which modules to watch]

### L2: Learning
- Quiz pass rate target: [X%]
- Challenge rubric: [link to rubric]
- Final exam pass rate target: [X%]
- Metrics to track: [specific metrics]

### L3: Behavior
- Retention plan: [link or summary]
- Community hooks: [what community actions are encouraged]
- 30-day check: [what we look for]
- Next course in path: [course code]

### L4: Results
- 90-day survey: [Yes/No]
- Story collection: [how]
- Key outcomes to track: [specific to this course]
```

---

## Level Summary

| Level | Question | When to Measure | Effort | Value |
|-------|----------|----------------|--------|-------|
| L1 | Did they enjoy it? | Immediately after course | Low | Early warning |
| L2 | Did they learn it? | During course (quizzes/challenges) | Low | Direct output |
| L3 | Are they using it? | 30 days post-course | Medium | Leading indicator |
| L4 | Did it change outcomes? | 90 days post-course | High | Ultimate measure |

**Start with L1 and L2** — they're built into the platform. **Add L3** through community and retention plans. **Build toward L4** as the student base grows and you can track longitudinal outcomes.

---

## Connection to Other Frameworks

- **Ship-First Design** (`skills/ship-first-design/SKILL.md`): Stage 2 evidence (challenges, quizzes) IS the L2 measurement. Design them together.
- **Builder's Bloom's** (`skills/blooms-taxonomy/SKILL.md`): Higher Bloom's levels in objectives should correlate with better L3/L4 outcomes. If a course only reaches Apply level, don't expect Decide/Ship-level real-world behavior.
- **Content Standards** (consumer-specific quality rubric — e.g. chimera-academy ships `skills/content-standards/`): Quality scores predict L1. A well-scored text class should produce satisfied students.
- **Ship Milestones**: The escalation pattern (local > deploy > share > public > production) bridges L2 into L3. Students who ship publicly during the course are more likely to keep building after.
