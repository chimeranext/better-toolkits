# Skill `transition-plan-ieee12207` — protocol SSOT

## Purpose

Write the transition plan for a takeover. The standard is ISO/IEC/IEEE 12207:2026. Transition here is the move of the system into the operational environment of the new team. It is not the project management plan. Do not copy clause text. Do not print a conformance stamp.

`/project-takeover` invokes this skill after `/maintenance-plan-ieee14764` has written its file.

## When to use

Only from that takeover chain, after the questionnaire and after the maintenance plan. Do not emit an SPMP or a 16085 risk plan from here.

## Method

1. **Use the slug from the takeover interview.**
2. **State the move.** Who hands the system over, who receives it, and which environment becomes the operational one.
3. **Add an acquisition section.** ISO/IEC/IEEE 41062:2024 is the citation for the acquirer receiving software from the prior supplier. A GitHub repository handoff and a vendor-change checklist belong in that section as practice. Do not sell a separate 41062 template.
4. **Use ISO/IEC/IEEE 15289:2019 as the content rule** for what a lifecycle information item contains. Cite it. Do not paste it.
5. **Cite ISO/IEC/IEEE 24748-3:2020 as application guidance** for 12207, and note that the guide is the 2020 edition while the process standard in use is 12207:2026.

## Artifact

```text
./fractional-cto/takeover/transition-plan-{slug}.md
```

## Contract

- One file, named with the takeover slug.
- This skill does not write the four handover files and does not write the maintenance plan.
- The next engagement command after the takeover pack remains `/contract-psa`. This skill does not invoke it.
