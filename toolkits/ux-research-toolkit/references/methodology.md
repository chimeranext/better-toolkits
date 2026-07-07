# UX Research Methodology Reference
## Source: NN/g (Nielsen Norman Group) — Condensed for AI Agent Consumption

---

## 1. DEFINITIONS

### Experience Map
- **What it is**: A visualization of an entire end-to-end experience that a generic human being goes through to accomplish a goal, independent of any specific product or service.
- **Scope**: Broad; captures life context, not product interaction.
- **Persona type**: Generic or proto-persona. Represents a segment, not a specific user of your product.
- **Timeline axis**: Temporal (time of day, days of week, life stages).
- **Key question answered**: "What is the complete lived experience of this type of person around this domain?"
- **When to use**: Before a product exists; when you want to identify unmet needs; when understanding life context matters more than product fit.
- **Output**: Empathy, opportunity identification, innovation space mapping.

### Customer Journey Map
- **What it is**: A visualization of the process a specific customer goes through to accomplish a goal with a specific product or service.
- **Scope**: Focused; tracks interaction with a known product/service touchpoint system.
- **Persona type**: Specific; based on research with real users of your product.
- **Timeline axis**: Stage-based (phases of the product lifecycle or purchase funnel).
- **Key question answered**: "How do users actually interact with our product and where does the experience break down?"
- **When to use**: When a product exists; when you want to improve onboarding, retention, or conversion; when diagnosing specific friction.
- **Output**: Actionable UX improvements, prioritized backlog items, service redesign.

---

## 2. NN/G ZONE MODEL

Every map — experience or journey — is structured in three zones.

### Zone A: The Lens
Purpose: Focuses the map. Prevents scope creep. Shared assumptions for all readers.
- **Persona**: Who the map is about (name, role, key context, primary pain).
- **Scenario**: The situation or goal framing the map. What are they trying to accomplish? What is the life or product context?
- Rule: One persona + one scenario per map. Do not blend multiple personas into a single map.

### Zone B: The Experience
Purpose: The core narrative. The row-by-row account of what happens across each phase.
Required rows (layers):
- **Phases / Stages**: The horizontal axis. Discrete segments of time or progression.
- **Actions**: What the user physically does in each phase. Observable, behavioural.
- **Mindsets / Thoughts**: What the user thinks, questions, and believes during each phase.
- **Emotions**: How the user feels. Captured as an emoji, label, and numeric level (1-5).
- **Opportunities**: Design/product interventions that could improve this phase (discovered from frustrations).
Optional rows (depend on map type):
- **Frustrations**: Specific friction, blockers, unmet expectations. (Recommended: always include.)
- **Touchpoints**: What the user interacts with — objects, interfaces, people, services.
- **Channels**: The medium or platform through which touchpoints occur.

### Zone C: The Output
Purpose: Transforms observation into actionable insight.
- **Pain points summary**: Cross-phase synthesis of the most significant user pains.
- **Moments of truth**: The inflection points where the user's perception is made or broken.
- **Opportunities / Ownership**: What should be done, and who owns it.
- **Recommended next map**: If this map surfaces a need for deeper investigation, what is the next artifact to create?

---

## 3. THE 7-POINT ANALYSIS FRAMEWORK

After completing all phase data, apply this framework to fill in Zone C.

### (1) Unmet Expectations
- Where does the user expect something to happen that does not?
- Look at thoughts/mindsets rows. Flag gaps between expectation and reality.
- Output: Pain points list items.

### (2) Unnecessary Touchpoints
- Which touchpoints exist that do not add value for the user?
- Ask: "Would removing this improve the experience?"
- Output: Redesign opportunities, process simplification candidates.

### (3) Low Points / Friction
- Identify the phases with the lowest emotion level (1-2 on the 1-5 scale).
- These are the highest-priority zones for intervention.
- Output: Pain points, critical moments for redesign.

### (4) High-Friction Channel Transitions
- Where does the user move between channels (e.g., from mobile app to phone call to in-person)?
- Channel handoffs are the most common sources of drop-off and frustration.
- Output: Integration opportunities, consistency requirements.

### (5) Time Evaluation
- Are there phases where the user is waiting? Where time feels wasted?
- Is the map missing phases because the team assumed something was "fast"?
- Output: Process streamlining, feedback loop improvements.

### (6) Moments of Truth
- Definition: A point where the user forms or changes a lasting impression of the experience.
- Not every phase is a moment of truth. Identify 1-3 per map maximum.
- Criteria: High emotional stakes + user decision point + long-lasting consequence.
- Examples: First time a pet owner is told their dog may be in pain (experience map); first login after paying (journey map).
- Output: `analysis.moments_of_truth` array entries.

### (7) High Points
- Where does the user feel best? Emotion level 4-5.
- High points reveal what the experience does right. Protect them during redesign.
- High points can become anchor features or referral moments.
- Output: Retention strategy inputs, marketing narrative.

---

## 4. EMOTION CURVE INTERPRETATION GUIDELINES

The emotion curve is a line chart connecting the `emotion.level` value (1-5) across all phases in order.

### Interpretation rules:
- **Flat curve at 3**: Neutral, forgettable experience. Nothing stands out positively or negatively. Symptom of a generic, undifferentiated product.
- **Consistently low (1-2)**: Chronic pain experience. User is only completing the journey because no alternative exists or switching cost is too high.
- **Consistent high (4-5)**: Delight experience. Verify this is real data, not stakeholder wishful thinking.
- **Sharp valley (single low point)**: Isolated friction. High-priority fix — removing one blocker may dramatically improve overall satisfaction.
- **Progressive decline**: Each phase is worse than the last. The experience erodes trust over time. Common in onboarding-heavy products.
- **Progressive improvement**: Slow start but growing satisfaction. Common in learning-curve products. May indicate the onboarding needs improvement.
- **W-shape (alternating high/low)**: Inconsistent experience. The user's journey is unpredictable. Symptom of disconnected product teams or channels.
- **Recovery arc (low then high)**: The product recovers from a bad start. The recovery moment is a candidate moment of truth.

### Plotting rule:
- Use `emotion.level` as the Y axis (1=bottom, 5=top).
- Use phase order as the X axis.
- Connect points with a smooth curve, not bar chart.
- Annotate each point with `emotion.emoji` and `emotion.label`.

---

## 5. PHASE DEFINITION GUIDELINES

### For Experience Maps (temporal phases):
- Phases should represent natural time blocks in a person's day or life cycle.
- Default set: Early morning → Late morning → Afternoon → Evening → Night.
- Adjust granularity to match the domain: a medical journey map may use "Symptom onset → Diagnosis → Treatment → Recovery".
- Rule: Each phase must be meaningfully different from adjacent phases — the persona's goals, energy, or context should shift.
- Avoid: Phases that are too granular (5-minute increments) or too coarse (just "Morning" and "Night").

### For Customer Journey Maps (stage-based phases):
- Phases represent discrete stages in the customer relationship lifecycle.
- Default set: Awareness → Consideration → Acquisition → Onboarding → Usage → Retention.
- Adjust to match the product type: A B2B product may add "Evaluation" and "Renewal" stages.
- Rule: Each phase ends when the user's primary goal or relationship with the product changes.
- Avoid: Confusing internal process stages with customer-facing stages. Phases must reflect what the user is doing, not what the company is doing.

---

## 6. PERSONA REQUIREMENTS BY MAP TYPE

### Experience Map persona:
- Generic: Represents a segment, not an individual.
- Does NOT need to be a known user of your product.
- Should be grounded in real research (interviews, observations, desk research).
- Required fields: name, role, location, primary_pain, context.
- Optional but recommended: age, avatar_emoji.
- The `context` field must explain the life situation, not the product situation.

### Customer Journey Map persona:
- Specific: Derived from research with actual users of the product being mapped.
- Should reflect a specific user archetype defined through segmentation.
- Required fields: same as experience map, plus the product being used must be referenced in `context`.
- The `context` field must include the product/service relationship.

---

## 7. COMMON PITFALLS TO AVOID

1. **Stakeholder-as-persona**: The map reflects what the team wishes users felt, not what research reveals. Mitigation: Ground every phase in at least one data point.
2. **Too many personas**: A map that tries to cover all users covers none. One persona, one scenario.
3. **Internal-facing phases**: Phases like "Backend processing" or "Team reviews application" are service blueprint territory, not journey map territory.
4. **Missing moments of truth**: Listing every touchpoint as a moment of truth dilutes the concept. Maximum 3 per map.
5. **Empty opportunities**: Opportunities should be specific design directions, not generic platitudes ("improve UX"). Bad: "Better communication." Good: "Real-time pain level slider that logs daily to a vet dashboard."
6. **Emotion level without context**: An emotion level of 2 means nothing without the frustration and action data to explain it. All layers must be filled.
7. **Recommended next map without justification**: The `recommended_next_map` field should only be set if the current map explicitly reveals a gap that a specific follow-up artifact would address.
8. **Confusing touchpoints and channels**: Touchpoints are specific (the "confirmation email"); channels are categories (the "email channel"). Both can co-exist in a phase.
