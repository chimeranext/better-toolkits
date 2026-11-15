# Skill `maintenance-plan-ieee14764` — protocol SSOT

## Purpose

Write the maintenance plan for a takeover. The standard is ISO/IEC/IEEE 14764:2022. Do not copy clause text. Do not print a conformance stamp.

`/project-takeover` invokes this skill after its questionnaire, and after the four handover files are approved and written. This skill then is the first link of that chain. `/project-takeover` invokes `/transition-plan-ieee12207` after this file exists.

## When to use

Only from `/project-takeover`, once the interview is finished and the four-file pack has an explicit yes. Do not start this skill during the questions. Do not emit an SPMP or a 16085 risk plan from here.

## Method

1. **Use the slug from the takeover interview.** The same slug as `playbook-{slug}.md`.
2. **Cover problem and modification analysis.** State how a reported problem is reproduced, classed, and accepted or rejected, and how a modification is implemented and released.
3. **Cover migration and retirement as sections.** When this takeover does not migrate or does not retire the system, write N/A and the reason. Do not drop the section.
4. **Cite a code-security review only when the takeover includes one.** Name OWASP ASVS as the source of that review. Do not vendor ASVS in this toolkit.

## Artifact

```text
./fractional-cto/takeover/maintenance-plan-{slug}.md
```

## Contract

- One file, named with the takeover slug.
- Migration and retirement stay in this plan. They are not separate skills.
- This skill does not write `transition-plan-{slug}.md`. `/transition-plan-ieee12207` does, and `/project-takeover` is the command that invokes it.
