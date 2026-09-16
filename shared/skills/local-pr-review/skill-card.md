# Skill Card — local-pr-review

## Description

`local-pr-review` runs an AI code review over the current branch diff, fully
local except for one LLM inference call. For developers who want a review
verdict without touching GitHub or CI.

This skill is ready for non-commercial use (repo LICENSE).

## Owner

Luis Andres Pena Castillo / ChimeraNext.

## License/Terms of Use

Repo LICENSE. Engine (`shared/heimdall/`, ex-BifrostKeeper) is MIT —
see `shared/heimdall/LICENSE`.

## Use Case

Developers reviewing a working branch before opening a PR (`/local-pr-review`,
optionally `--base <ref>`).

## Deployment Geography for Use

Global.

### Requirements / Dependencies

Requires API Key or External Credential: Yes (one)
Credential Type(s): NVIDIA NIM bearer (`NVIDIA_API_KEY`) via env,
`/secret-input`, or Infisical. Optional: `GITHUB_TOKEN` only for `--post`.

Do not include secrets in prompts/logs/output; least privilege; rotate keys.

## Known Risks and Mitigations

Risk: The reviewer's verdict (APPROVE/REQUEST_CHANGES) may be wrong; blind
trust could merge bad code.

Mitigation: Verdict is advisory and printed, never applied. Default mode never
posts, pushes, or triggers CI (`--post` needs explicit user OK + token).

Risk: Diff content leaves the machine toward the NIM endpoint.

Mitigation: Single documented egress (inference only); no repo content is sent
anywhere else. Don't run on diffs with secrets — scrub first.

## References

- SkillSpector CI: `.github/workflows/skillspector.yml`
- Engine: `shared/heimdall/` + protocol `shared/references/heimdall/protocol.md`

## Skill Output

Output type(s): Analysis (terminal text).

Output format: Findings grouped P1/P2/P3/P4 + verdict APPROVE/REQUEST_CHANGES.

## Skill Version

Unversioned (monorepo living skill, feat branch `feat/skillspector-trust-pipeline`).

## Ethical Considerations

Human must review findings before acting; never auto-merge on APPROVE.
