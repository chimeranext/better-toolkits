# CHH - Checksum Hygiene (doctrine)

## Sigla

**CHH** - Checksum Hygiene.

## Purpose

A vendorized install must pin the VERSION and verify integrity against the
release's own checksum manifest - never by hand-copying a hash into the repo.
The `detect_hardcoded_checksum.py` linter makes that policy mechanical: it
blocks hardcoded sha256 constants in setup scripts so supply-chain verification
cannot be bypassed silently.

## Why hardcoded-sha256 detection exists

A hardcoded sha256 constant in a setup script is a **fragile pin** and a
**supply-chain bypass**:

- **It goes stale silently.** When a release is rebuilt, the artifact's hash
  changes but the constant does not. The script then either fails forever (the
  hash never matches) or, worse, keeps passing against an artifact that is no
  longer the one the constant describes - the maintenance burden of keeping two
  sources in sync is exactly the kind of drift that produces "works in my
  checkout" failures.
- **It is not bound to the real artifact.** A trusted pin must come from the
  publisher's own release manifest (e.g. `SHASUMS.txt`), fetched at install
  time. A constant living in the repo is copied by hand - it can be wrong,
  stale, or tampered with locally, and it gives no revocation/rotation story.
- **It bypasses the verification chain.** The correct flow is: fetch the release
  manifest, resolve the expected hash for the exact asset, download the asset,
  compare at install time, and fail hard on mismatch. A hardcoded constant skips
  the manifest step entirely, so nothing proves the artifact being downloaded is
  the one that was vetted.

This is why detection exists: **prevent bypassing supply-chain verification in
setup scripts.**

## The linter

`scripts/lint/detect_hardcoded_checksum.py` scans the bootstrap setup scripts
(`shared/bootstrap/scripts/setup-*.sh`) for bare 64-hex sha256 constants:

- It matches 64-hex-character constants in an assignment-like context (the
  surrounding text contains `=`) and NOT inside a `sha256sum` invocation or a
  manifest comparison - so computing or comparing hashes at runtime is never
  flagged.
- Exit codes: `0` = allow; `2` = deny, with the reason printed to stderr
  (naming the file + line and pointing to the `setup-open-ontologies.sh` pattern
  as the correct one).

### Wiring (pre-commit / pre-push gates)

- `.pre-commit-config.yaml` declares the local hook `no-hardcoded-checksum`,
  entry `python3 scripts/lint/detect_hardcoded_checksum.py`, scoped by `files`
  to `^shared/bootstrap/scripts/setup-.*\.sh$`.
- Because the hook declares no `stages` restriction, it runs at every enabled
  stage: **pre-commit** (`pre-commit install`) and **pre-push**
  (`pre-commit install --hook-type pre-push`). A blocked push prints the deny
  reason to stderr and exits non-zero, aborting the push.
- The git pre-push hook `scripts/git-hooks/pre-push-marketplace-versions.sh`
  additionally runs the stale-shims linter; checksum detection itself is carried
  by the pre-commit framework hook above.

### False-positive handling

The linter's heuristic deliberately skips legitimate runtime checksum
computations: a line containing `sha256sum` (computing a digest) or `manifest`
(comparing against the release manifest) is not flagged. Only a literal 64-hex
constant used as a default/expected value is blocked.

If a literal 64-hex constant would otherwise be needed, restructure rather than
silence:

1. Fetch the release's own `SHASUMS.txt` once (the source of truth).
2. Resolve the expected hash for the exact asset from that manifest.
3. Download the asset, compare at install time, and fail hard on mismatch.

This is the `setup-open-ontologies.sh` pattern. Do NOT add exclusions,
`# noqa`-style suppressions, or rename the file to dodge the `files` scope -
the correct fix is to source the hash from the manifest at runtime.

## Doctrine

### 1. Pin versions, verify hashes at install time
A setup script SHALL pin the VERSION (a release tag/version string) and SHALL
verify the downloaded artifact against the release's own checksum manifest at
install time. No sha256 constant SHALL be written into the repo.

### 2. The manifest is the source of truth
The expected hash SHALL be resolved from the release manifest at runtime, never
copied by hand. If the manifest is unavailable, the installation SHALL fail
rather than proceed on an unverifiable hash.

### 3. Fail hard on mismatch
A checksum mismatch SHALL abort the installation with a clear error (expected vs
actual), and SHALL never fall through to a partially-installed artifact.

### 4. Relationship to other standards
- **AFIF** - the gate negative lives here: the linter must be demonstrated to
  block a hardcoded hash (exit 2) before it counts as a gate.
- **StS** - the deny reason goes to stderr and is never discarded.
- **SSS / vendor pattern** - global install, absent from consumer repo contents;
  this doctrine governs HOW integrity is asserted.

## Consequence

- New setup scripts that download release assets SHALL follow the
  `setup-open-ontologies.sh` pattern (version pin + manifest-verified hash).
- A hardcoded sha256 constant in any `setup-*.sh` SHALL be blocked by the
  pre-commit/pre-push gate (exit 2, reason on stderr).
- A gate checked in without its negative case (the linter never seen failing) is
  provisional, per AFIF.
