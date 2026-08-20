Stop unless the Linear issue body is a substantive Bilingual Format brief.

Full fill-in template: [`templates/bilingual-issue-brief.md`](../../templates/bilingual-issue-brief.md). Markers/stubs: [`docs/bilingual-format-standard.md`](../../docs/bilingual-format-standard.md).

# Redaction-quality sanity guard

Before continuing past Input Resolution, inspect each fetched issue's `description` for Bilingual Format markers (`## 👤 HUMAN LAYER`, `## 🤖 AGENT LAYER`, `### Acceptance Criteria`, `### Context Files`; or at minimum both literal strings `HUMAN LAYER` and `AGENT LAYER`). If the description is missing those markers — or is empty, a 1-liner, or pure stubs ("TBD", "N/A everywhere") — STOP and tell the user:

> Issue `{ID}` isn't in Bilingual Format. Implementation agents produce shallow work against un-redacted briefs. Run `/make-no-mistakes:spike-recommend {ID}` first to normalize the description in Linear, then re-run `/make-no-mistakes:implement {ID}`.
>
> If you've already redacted it manually and want to proceed anyway, say so explicitly and I'll continue.

Do not silently proceed. This is a one-paragraph sanity guard, not a redesign — the rest of the protocol below is unchanged.
