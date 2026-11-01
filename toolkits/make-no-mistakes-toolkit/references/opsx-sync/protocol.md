# /opsx:sync — protocol SSOT

Harness-agnostic body. Thin entry: `commands/opsx-sync.md`.

Adheres to the official OpenSpec OPSX workflow (`docs/opsx.md` in `Fission-AI/OpenSpec`): the optional delta-spec merge.

---

# /opsx:sync $ARGUMENTS

**Merge delta specs into main specs (optional).** Merges the current change's delta specs into `openspec/specs/` **without archiving** — the change stays active. Applies the whole delta: a `## REMOVED` requirement is deleted from the main spec, a renamed one is retitled in place, and content the delta doesn't mention is left untouched.

**Exit means:** main specs reflect the change's delta. The change remains active (not archived).

---

## §1 When to sync

- Reach for sync when you want main specs updated before archiving, when a parallel change needs to build on specs this one just added, or when you want to review the merged main spec before archiving.
- Syncing is optional — `/opsx:archive` prompts you to sync first if you haven't.

## §2 Apply the delta

- Merge the delta into `openspec/specs/` per the rules above (add/remove/retitle, leave unrelated content untouched).
- Do not archive; the change stays active.

---

## §3 Version policy (SemVer)

When the change touches any versioned artifact, follow the **SemVer** policy
(`shared/references/engineering-standards/semver.md`). This is generic — it
applies to any repo/project:

- The version lives in **one canonical manifest** (e.g. `package.json`, `plugin.json`).
  Derived catalogs/indexes are generated, never hand-edited.
- The version must be **strictly greater** than the version on the default branch
  (`main`) at the moment the change lands — evaluated on the **combined head of the
  merge queue** (O(1) per attempt).
- If two changes claim the same version, the second one rebases onto the new
  `main` and re-bumps (patch+1). Never "pick a side".
- Enforcement uses the project's own version check (not a better-toolkits-specific
  script) over `origin/main..HEAD` at merge time.

## Guardrails (mandatory HITL)

- **Never merges.** Exit = human review handoff; `READY FOR HUMAN REVIEW — NOT MERGE AUTHORIZED`.
- Protocol files in English; anti-boilerplate; no hidden redirects (stderr/stdout to the null device are forbidden per harness `stderr/README.md`).
- No `TICKET-*` IDs — use this repo's native GitHub issues (`Fixes #N`).

## Source

- OpenSpec OPSX workflow: https://github.com/Fission-AI/OpenSpec/blob/main/docs/opsx.md
