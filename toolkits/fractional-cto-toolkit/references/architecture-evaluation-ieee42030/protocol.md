# Skill `architecture-evaluation-ieee42030` — protocol SSOT

## Purpose

Record an evaluation of the architecture. The standard is ISO/IEC/IEEE 42030:2019. This is not a second architecture description and not a decision record. Do not copy clause text. Do not print "conforms to 42010:2022" or "conforms to 42030:2019".

`/architecture-description-ieee42010` invokes this skill when M-02 evaluates the architecture. Do not run it when no evaluation was asked for.

## When to use

After `projects/<slug>/architecture/architecture-description.md` exists, and only for an evaluation of that description. That is the `business-brain-template` preference. The filled file is not written under a directory named `fractional-cto`. If the venture does not use that template, write beside the customer documents that already exist, or ask when no folder is obvious.

## Method

1. **Name the Entity of Interest** the same way the description names it.
2. **Use concerns as the criteria.** Take them from the description. Do not invent a concern that the description does not frame.
3. **Record the evidence examined**, the findings, and what must change in the description or in an `architecture-decision-{NNNN}-{title}.md`.
4. **Point back at the description.** Do not copy the views into this file.
5. **Write the filled client file in customer-facing voice.** See [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Descriptive executive prose in the engagement working language. No STE procedure imperatives. No skill names, `generated_by`, dogfood, or toolkit `ssot:` paths in the file the client reads.

## Artifact

```text
projects/<slug>/architecture/architecture-evaluation.md
```

## Contract

- One evaluation file per engagement.
- This skill does not write `architecture-description.md` and does not write a decision file.
- `/architecture-description-ieee42010` is the only command that invokes this one.
- **Customer-facing output:** no skill names, `generated_by`, dogfood, or toolkit `ssot:` paths in the emitted body or frontmatter the client reads.
- **Customer-facing voice:** the filled evaluation follows [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Descriptive executive prose in the engagement working language. No bare imperatives.
