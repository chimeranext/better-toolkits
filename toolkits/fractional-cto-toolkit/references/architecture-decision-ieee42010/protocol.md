# Skill `architecture-decision-ieee42010` — protocol SSOT

## Purpose

Record one architecture decision and its rationale so the choice stays auditable. The record follows MADR 4.0.0. The decision and the rationale are what ISO/IEC/IEEE 42010:2022 requires beside the architecture description. This skill leaves the Nygard ADR shape.

Upstream names the files `adr-template.md`, `adr-template-bare.md`, `adr-template-minimal.md`, and `adr-template-bare-minimal.md`, tag `4.0.0`, license MIT OR CC0. Vend them later as `architecture-decision-template.md` and the matching bare, minimal, and bare-minimal names. Do not copy `0000-use-markdown-architectural-decision-records.md`.

Do not copy clause text from ISO/IEC/IEEE 42010:2022. Do not print "conforms to 42010:2022".

## When to use

Any significant architecture choice: a new system, platform, integration, data model, security posture, or a change to an existing decision. Also when a past decision is revisited or superseded.

A decision that is not an architecture decision uses the minimal shape and omits the 2022 fields below. An architecture decision uses the full shape or its bare outline.

## Method

1. **Frame the problem** in Context and Problem Statement. State who is affected and what must stay true.
2. **List decision drivers.** These are the forces the outcome has to meet. Concerns from the architecture description belong here when they drive the choice.
3. **List the options actually considered.** If only one option exists, say so. Do not add strawmen.
4. **Record the outcome** as Decision Outcome: the chosen option and the `because` clause. Unchosen options stay in Considered Options and in Pros and Cons of the Options.
5. **Record consequences** under Decision Outcome, as Good and Bad. More Information holds the rest of the rationale: evidence, when to revisit, and links.
6. **Trace the decision to the description** in YAML front matter, and repeat that trace in More Information. The description indexes this file. This file does not replace the description.
7. **Check the shape.** If `jbang` is on the path, run madrlint against an English structural copy. If it is not, check the heading order and the 2022 YAML by hand. Do not add a JDK to CI for this check. Do not put English headings into the file the client reads when the engagement working language is not English.
8. **Write the filled client file in customer-facing voice.** See [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Descriptive executive prose. No STE procedure imperatives. No skill names, `generated_by`, dogfood, or toolkit `ssot:` paths in the file the client reads.

## Headings

Level-2 headings stay in the MADR 4.0.0 order so madrlint can check them:

- Context and Problem Statement
- Decision Drivers
- Considered Options
- Decision Outcome
- Pros and Cons of the Options
- More Information

Decision Outcome contains the level-3 sections Consequences and Confirmation. Each option under Pros and Cons of the Options is its own level-3 heading. The title is the level-1 heading: a short name of the problem and the chosen solution.

That list is the MADR order. The filled client file writes the title and those headings in the engagement working language, in that order. madrlint checks the English structural order. It does not force English titles into the file the client reads.

Correspondence, without a second decision template:

- The decision is Decision Outcome.
- Options not chosen are Considered Options and Pros and Cons of the Options.
- The rationale is the `because` clause, Consequences, and More Information.
- Concerns the decision touches or opens are `concerns` and `new-concerns`.
- Description elements it affects are `architecture-description-elements` and `view-components`.

## Front matter

An architecture decision carries this YAML, then repeats it in More Information:

- `entity-of-interest`
- `concerns`
- `architecture-aspects`
- `stakeholder-perspectives`
- `architecture-description-elements`
- `view-components`
- `new-concerns`

MADR's own status, date, decision-makers, consulted, and informed may sit beside those fields. The minimal shape does not carry the 2022 list.

## Artifact

```text
projects/<slug>/architecture/decisions/architecture-decision-{NNNN}-{title}.md
```

`NNNN` is the next free four-digit number in that folder. `title` is lowercase and hyphenated. The description links this path. It does not contain a second copy of the decision.

Guided and bare templates, when present, live under `references/architecture-decision-ieee42010/templates/`. Until those files are in the toolkit, the heading list and the YAML list in this protocol are the shell.

## Contract

- A significant architecture decision is not made until this file exists.
- Options are real alternatives, compared on the same drivers.
- Status moves from `proposed` to `accepted`, or to `superseded by` another record in this folder.
- This skill does not write `architecture-description.md`. `/architecture-description-ieee42010` does, and it only indexes this file.
- **Customer-facing output:** no skill names, `generated_by`, dogfood, or toolkit `ssot:` paths in the emitted body or frontmatter the client reads.
- **Customer-facing voice:** the filled decision follows [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Descriptive executive prose in the engagement working language. No bare imperatives.
