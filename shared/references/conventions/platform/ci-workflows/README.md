# convention: ci-workflows
id: ci-workflows · version: 0.1.0 · status: draft · level: platform
extracted_at: 2026-11-01 · ttl_expires: 2027-05-01
parent: none

## GOAL

A `.github/workflows/*` file (and its backing composite actions) that is "well
written" under this record uses the correct vocabulary of the tools it invokes,
not the intuitive name — so CI gates stay green and do not fail on
configuration.

## SOURCES

| # | kind | ref (ID + versión/fecha) | weight | purpose |
|---|------|--------------------------|--------|----------|
| S1 | repo | incident: CodeQL rejected `typescript` ("Did not recognize the following languages: typescript") across 6 repos; job died at `init` | load-bearing | RULE R1 |
| S2 | repo | `github/codeql-action/init@v3` — language vocabulary (go, javascript, python, java, cpp, csharp, ruby, swift) | load-bearing | RULE R1 |
| S3 | repo | nonexistent `upload-results@v3` action; `analyze@v3` already uploads SARIF | load-bearing | RULE R2 |
| S4 | repo | a defect in a vendored template propagated to every client | load-bearing | RULE R3 |

## RULES

- R1 [pipe-discipline] CI tool inputs MUST use the tool's vocabulary, not the
  popular name. `typescript` is NOT a CodeQL language; use `javascript` (covers
  TS/JS) → S1, S2
- R2 [pipe-discipline] Do not invoke steps that do not exist in the action's
  version (e.g. `codeql-action/upload-results@v3`). `analyze@v3` already
  uploads SARIF → S3
- R3 [pipe-discipline] A vendored template/composite is the source of truth; a
  defect there is fixed once and re-derived to every repo, not fixed by hand in
  each one → S4

## COUNTEREXAMPLES

```yaml
# ❌ wrong: CodeQL rejects "typescript" and the job dies at init
with:
  languages: |
    typescript
    javascript

# ✅ right: valid CodeQL vocabulary
with:
  languages: |
    javascript
```

## GATES

- local: `python3 -c "import yaml; yaml.safe_load(open('workflow.yml'))"` +
  manual review of the `languages`/inputs vocabulary
- CI: the security gate itself (`Security Scan`) — if CodeQL initializes, the
  vocabulary is valid

## LESSONS

- L1: An intuitive name can be invalid (typescript). Validate against the tool's
  docs, not intuition. → RULE R1
- L2: A defect in a vendored template amplifies to every repo; the fix goes in
  the source, not in each client. → RULE R3

## RECEIPT

<!-- candidate_sha + risk tier + lenses + verdict — emitted in the dogfood of
     template workflow-security.yml.tpl -->
