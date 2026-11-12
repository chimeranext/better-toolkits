# Skill `architecture-description-ieee42010` — protocol SSOT

## Purpose

M-02 detailed design. The process is ISO/IEC/IEEE 42020:2019. That standard is not a document this skill emits.

This skill writes `architecture-description.md`. Its standard is ISO/IEC/IEEE 42010:2022. When M-02 evaluates the architecture, this skill invokes `/architecture-evaluation-ieee42030`. That skill writes `architecture-evaluation.md`.

Do not copy clause text from those standards. Do not print "conforms to 42010:2022". IEEE 1016-2009 is Inactive-Reserved and labels no output.

## When to use

After `/requirements-authoring-ieee29148` has written `software-requirements-specification.md`, and only once the client has accepted the software project management plan, the risk management plan, and any required risk treatment plan in writing. This skill does not start `/opsx-*`. When the description is written and M-02 evaluates the architecture, invoke `/architecture-evaluation-ieee42030`.

## Method

1. **Read the specification.** Concerns, stakeholders, and constraints start in `projects/<slug>/requirements/software-requirements-specification.md` when the vault follows `business-brain-template`. The management plan stays in `plans/`. Do not open a second requirements file and do not emit a PRD. Do not write the filled files under a directory named `fractional-cto`. If the venture does not use that template and does not keep a brain repo, write beside the customer documents that already exist. If neither place is obvious, ask before writing.
2. **Name the Entity of Interest.** Where a source says "system of interest", write Entity of Interest. `System` stays a TRAK node stereotype. It is not the subject of the document.
3. **Fill the shell in 2022 vocabulary.** Entity of Interest, Stakeholders, Stakeholder Perspectives, Concerns, Architecture Aspects, the framework id, an index of views, Correspondences, an index of `architecture-decision-{NNNN}-{title}.md`, and a pointer to the 42030 evaluation when that file exists. The rule "each concern is framed by at least one viewpoint" is 2011 heritage. Mark it as such.
4. **Choose the framework row. Do not invent viewpoints.** Default row is TRAK. Use 4+1, RWSSA, DoDAF, MODAF, TOGAF, NAF, or Zachman only when the engagement asks for that row. 42010:2022 does not publish a view template and does not name the TRAK menu. Cite the framework id and link its specification. One view per viewpoint actually used.
5. **Write a view only for a concern that exists.** The toolkit menu below is a catalog, not a delivery list. Copy the pair whose concern exists and drop the `-bare` suffix. Do not create the other files.
6. **Index decisions. Do not rewrite them.** `architecture-description-design-record.md` points at `projects/<slug>/architecture/decisions/`. It is not a second decision format. `/architecture-decision-ieee42010` writes those files. The description only links them. Cross-links in the client vault are Obsidian wikilinks. Inside a table cell, use `[[path]]` with no alias.
7. **Invoke the evaluation skill when M-02 evaluates.** Call `/architecture-evaluation-ieee42030`. Do not write `architecture-evaluation.md` from this skill. Skip the call when no evaluation is done.
8. **Write the filled client files in customer-facing voice.** See [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Descriptive executive prose in the engagement working language. No STE procedure imperatives. No skill names, `generated_by`, dogfood, or toolkit `ssot:` paths in the file the client reads.

## Views

TRAK is the view framework, not the ceiling. TRAK00001, TRAK00002, and TRAK00004 remain 2011 editions. TRAK's own page states that a conformance assessment against 42010:2022 has not been made. Where 2011 wording conflicts with 2022, rewrite our file. Do not wait for that assessment, and do not reprint TRAK00013, TRAK00014, or TRAK00015 as if they were a 2022 assessment.

A Stakeholder Perspective groups concerns. The five TRAK perspectives organize viewpoints. Do not rename them to Stakeholder Perspective. The shell says which Stakeholder Perspective groups which concerns, and which TRAK viewpoints frame them.

Architecture Aspect is required on the shell and on the header of each view that reflects one. TRAK has no such element. Add it. Do not pretend it is already in TRAK00002.

A Mermaid diagram is a View Component, not "the model". A view may have more than one.

Allowed view titles, one file each, lowercase with hyphens:

- Enterprise: `enterprise-goal`, `capability-hierarchy`, `capability-phasing`
- Concept: `concept-need`, `concept-item-exchange`, `concept-activity-to-enterprise-capability-mapping`, `concept-activity`, `concept-sequence`
- Procurement: `procurement-structure`, `procurement-timeline`, `procurement-responsibility`
- Solution: `solution-structure`, `solution-resource-interaction`, `solution-resource-interaction-to-function-mapping`, `solution-function`, `solution-function-to-concept-activity-mapping`, `solution-competence`, `solution-sequence`, `solution-event-causes`, `solution-risk`
- Management: `architecture-description-dictionary`, `architecture-description-design-record`, `requirements-and-standards`, `assurance`

`source-viewpoint` carries the viewpoint title copied from TRAK00001, for example Solution Structure. The short code does not appear in the path, the header, or the body. Do not invent the title.

Before the Mermaid block, each view states `entity-of-interest`, `stakeholder-perspective`, the concerns it frames, the `architecture-aspects` it reflects, and the list of view components.

`requirements-and-standards.md` links the requirements specification and the standards. `assurance.md` holds Claim, Argument, and Evidence triples. A two-triple tuple is two arrows. An n-ary triple draws the inner triple and then the outer relation. Do not collapse them into one label.

If a 2022 concern fits no TRAK viewpoint, write that component in the shell and name the viewpoint that does not cover it. Do not invent a viewpoint or a short code.

## Mermaid

The source is the `mermaid` block. Pele renders it. Do not store the SVG as the source.

A triple is node, connector, node. The TRAK stereotype is on the node. The TRAK00002 verb is on the arrow.

- `flowchart` when the triple is the assertion. Node label `"«Software»\nName"`, arrow `-->|satisfies|`.
- `classDiagram` when the view is read as structure. Stereotype `<<Software>>`, verb on the relation.

Pele does not check the metamodel. Before closing the view, confirm the node-connector-node triple exists in TRAK00002 and that the TRAK00001 viewpoint allows that content.

Colours come from TRAK00004, once, as `classDef` per perspective. Solution is green. Enterprise is blue. Concept, Procurement, and Management use the colour TRAK00004 assigns to that perspective. Every node carries the class of its perspective. Do not invent another palette.

## Artifact

```text
projects/<slug>/architecture/architecture-description.md
projects/<slug>/architecture/views/<viewpoint-title>.md
```

There is no `design/` folder and no `software-design-description.md`. `/architecture-evaluation-ieee42030` writes `architecture-evaluation.md`. The jam01 description shell and view shell are folded into these files. They are not a second output.

Guided and bare templates, when present, live under `references/architecture-description-ieee42010/templates/`. Until those files are in the toolkit, the slot list in this protocol is the shell.

## Contract

- The description expresses the architecture. Decisions and their rationale are separate files, linked from the description.
- A view is written only for a concern that exists in this engagement.
- No output cites IEEE 1016. No output claims conformance to 42010:2022.
- `/architecture-decision-ieee42010` is the process that writes each `architecture-decision-{NNNN}-{title}.md`. This skill does not write that file.
- **Customer-facing output:** no skill names, `generated_by`, dogfood, or toolkit `ssot:` paths in the emitted body or frontmatter the client reads.
- **Customer-facing voice:** the filled description and views follow [CFM — Customer-facing management docs](../../../../shared/references/engineering-standards/customer-facing-management-docs.md). Descriptive executive prose in the engagement working language. No bare imperatives. Table cells do not use `[[path|alias]]`.
