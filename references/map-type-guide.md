# UX Map Type Selection Guide
## Decision tree and comparison table for AI agent use

---

## 1. DECISION TREE: WHICH MAP TO CREATE?

```
START: What does the user want to map?
│
├─► Does the end user have an existing product or service they interact with?
│   │
│   ├─► NO
│   │   └─► Use: EXPERIENCE MAP (Day in the Life)
│   │       Reason: No product to track. Goal is understanding the user's
│   │       world, context, and unmet needs before any product exists.
│   │
│   └─► YES
│       │
│       ├─► Do you want to understand how the user experiences
│       │   the product end-to-end (from discovery to retention)?
│       │   │
│       │   └─► YES → Use: CUSTOMER JOURNEY MAP
│       │             Reason: Product exists. Goal is diagnosing friction,
│       │             drop-off, and improvement opportunities across the
│       │             full customer lifecycle.
│       │
│       ├─► Do you want to visualize a specific user goal or story
│       │   broken into tasks and subtasks for development planning?
│       │   │
│       │   └─► YES → Use: USER STORY MAP [v2 — coming soon]
│       │             Reason: Bridges UX and agile development. Focuses
│       │             on features and user stories, not emotional journey.
│       │
│       ├─► Do you need to show what the organization does internally
│       │   to support the customer's visible experience?
│       │   │
│       │   └─► YES → Use: SERVICE BLUEPRINT [v2 — coming soon]
│       │             Reason: Adds backstage (internal processes, systems,
│       │             and people) to a journey map. Requires internal
│       │             process visibility and cross-functional stakeholders.
│       │
│       └─► Do you want to tell a specific user story through
│           illustrated scenes or narrative sequence?
│           │
│           └─► YES → Use: STORYBOARD [v2 — coming soon]
│                     Reason: Narrative, visual format. Best for early
│                     concept validation or communicating to non-technical
│                     stakeholders.
```

**v1 available now**: Experience Map, Customer Journey Map
**v2 coming soon**: Storyboard, User Story Map, Service Blueprint

---

## 2. MAP TYPE COMPARISON TABLE

| Attribute             | Storyboard            | Experience Map         | Customer Journey Map   | User Story Map         | Service Blueprint      |
|-----------------------|-----------------------|------------------------|------------------------|------------------------|------------------------|
| **Version**           | v2 (coming soon)      | v1                     | v1                     | v2 (coming soon)       | v2 (coming soon)       |
| **When to use**       | Early concept validation; communicating ideas to stakeholders | Before a product exists; understanding life context and unmet needs | Product exists; diagnosing friction and improving the customer lifecycle | Bridging UX to agile development; feature planning | Mapping internal processes that support the customer-facing experience |
| **Perspective**       | Narrative / storytelling | Generic user segment (no product relationship required) | Specific customer of a known product or service | User goal decomposed into tasks and releases | Dual: customer-facing (front stage) + internal (back stage) |
| **Complexity**        | Low                   | Medium                 | Medium–High            | Medium                 | High                   |
| **Key components**    | Illustrated scenes, captions, emotional beats | Persona, temporal phases, emotion curve, actions, thoughts, frustrations, opportunities | Persona, lifecycle stages, emotion curve, touchpoints, channels, pain points, moments of truth | User goals, epics, stories, tasks, release slices | Journey map layer + line of visibility + front-stage actions + back-stage actions + support processes + evidence |
| **Data inputs needed** | User research insights, scenario script | Persona research, observational data, domain knowledge | User interviews, analytics, support logs, usability testing | User stories, product backlog, persona research | Journey map data + internal process documentation + system architecture |
| **Primary output**    | Shareable narrative artifact | Empathy, opportunity space, innovation directions | Prioritized UX improvements, onboarding/retention fixes | Development-ready feature backlog by release | Cross-functional service redesign roadmap |
| **Persona type**      | Generic or specific   | Generic (segment-level) | Specific (product-user) | Specific (product-user) | Specific (product-user) |
| **Timeline axis**     | Sequential scenes     | Temporal (time of day / life stage) | Stage-based (lifecycle phases) | Goal-based (tasks and subtasks) | Stage-based (mirrors journey map) |
| **Emotion layer**     | Optional (beats)      | Required               | Required               | Optional               | Optional               |
| **Touchpoints layer** | Not applicable        | Optional               | Required               | Not applicable         | Required (both stages) |

---

## 3. QUICK SELECTION RULES FOR AGENTS

- If no product exists → **Experience Map**.
- If a product exists and the user wants to improve it → **Customer Journey Map**.
- If the user mentions "internal processes", "back office", "operations", or "support teams" → **Service Blueprint** (v2).
- If the user mentions "user stories", "sprints", "backlog", or "features" → **User Story Map** (v2).
- If the user wants a visual narrative or "story" for stakeholders → **Storyboard** (v2).
- When in doubt, start with **Experience Map** to build context, then escalate to **Customer Journey Map**.
- Never create a Service Blueprint without first having a Customer Journey Map for the same persona.
