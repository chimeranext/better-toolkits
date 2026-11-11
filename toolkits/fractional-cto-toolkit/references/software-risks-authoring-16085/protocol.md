# Skill `software-risks-authoring-16085` — protocol SSOT

## Purpose

Produce the **ISO/IEC/IEEE 16085:2021** project risk deliverables that accompany a
16326 SPMP (and that constitute the risk half of PSA **Hito 1** Discovery when that
milestone is in force):

1. Risk management plan (§8.1.2) — template `iso-16085-risk-management-plan`
2. Risk treatment plan(s) (§8.2.2) — template `iso-16085-risk-treatment-plan`
   according to the Eisenhower rule below

This skill **consumes** those catalog templates. It is the writer for **software /
systems project** lifecycle risk docs. Org-wide ISO 31000 registers stay under
`/iso31000`. Operational framing (`risk/audit`, IR, DR, resilience) is a different
family.

## When to use

- User asks for a plan de gestión de riesgos / risk management plan for a
  software or systems **project** (16085, not 31000).
- User asks for a plan de tratamiento / risk treatment plan.
- SPMP authoring needs the default risk companion emitted or refreshed.
- Executing PSA Hito 1 (Discovery): fill definitive SPMP companions from bare
  preventa drafts.
- Remediating an SPMP audit finding that §8.3 is thin vs 16085 strategy/profile.

## When not to use

- Enterprise / CRO risk program → `/iso31000`
- Atomic vault note only → brain `_templates/riesgo.md` (`pmbok-risk-note`)
- Full SPMP body without focusing on risk → `/software-project-management-plan/authoring`
  (that skill **delegates** companion emission here)

## Method

1. **Load** `references/software-project-management-plan/catalog.md`. Confirm risk
   template ids (defaults above).
2. **Locate the SPMP** (path from user, or create stub link if authoring both).
   Cite ISO/IEC/IEEE 16085 in the SPMP §2 when the companion is adopted.
3. **Emit the RM plan** from
   `references/software-project-management-plan/templates/iso-16085-risk-management-plan.md`:
   purpose/policies, strategy (criteria, thresholds, measures, improvement),
   context, roles, process (ID → analysis → priority → treatment → monitor →
   profile → communication), resources schedule. Empty required sections: N/A +
   reason.
4. **Classify each profile risk (Eisenhower — urgent × important)** after analysis
   (ISO likelihood/consequence still live on the profile; Eisenhower gates *when*
   a §8.2 treatment is a Hito 1 / this-run deliverable):
   - **Critical (urgent ∧ important)** → emit §8.2 treatment plan (**required**;
     do not close Hito 1 without it).
   - **Only important or only urgent** → **offer** to generate a §8.2 treatment
     in this same run / Hito 1; do not skip silently.
   - **Neither** → document as **acceptable** in the profile (owner + rationale);
     no §8.2 plan.
5. **Emit** required/accepted treatment plans from
   `templates/iso-16085-risk-treatment-plan.md` (one plan may cover risks that
   share characteristics).
6. **Link both ways:** SPMP §8.3 → RM plan; RM plan → SPMP + treatment paths;
   treatment → RM plan.
7. **Language:** toolkit templates are English SSOT. Fill the client copy in the
   engagement working language. Do not copy copyrighted standard prose — clause
   citations only. Keep `templates/*.md` STE100-clean for **structural** SSOT
   (`ste-lint.py` in make-no-mistakes explain scripts). Filled RM / treatment
   plans use **customer-facing voice**
   (`shared/references/engineering-standards/customer-facing-management-docs.md`):
   descriptive prose, not STE procedure imperatives; risk “Treatment” /
   “Response” cells say “Mitigation: … / Ongoing monitoring … / Risk accepted
   …” rather than “Mitigate. / Monitor. / Accept.”

## Artifact

| Artifact | Typical path |
| --- | --- |
| Risk management plan | `plans/<YYYY-MM-DD>-gestion-riesgos-<slug>-16085.md` |
| Treatment plan(s) | `plans/<YYYY-MM-DD>-tratamiento-riesgos-<slug>-<topic>.md` |

## Contract

- Templates are read from the SPMP catalog SSOT (or an export with banner).
- **Customer-facing output:** do **not** put skill names, `generated_by`,
  “Generado por…”, dogfood, or toolkit `ssot:` paths in the emitted Markdown
  body or frontmatter the client reads. Keep `standard`, dates, links, status.
- **Customer-facing voice:** follow
  `shared/references/engineering-standards/customer-facing-management-docs.md` for
  filled 16085 bodies (same rules as the SPMP).
- Catalog choice is explicit before writing.
- Does not replace `/iso31000` and does not claim 31000 alone satisfies 16326.
