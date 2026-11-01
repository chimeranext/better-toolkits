#!/usr/bin/env python3
"""Detector: block hardcoded sha256/checksum constants in setup scripts.

Why: a vendorized install must pin the VERSION and verify integrity against the
release's own checksum manifest — never by hand-copying a hash into the repo.
A hardcoded hash is a fragile pin: it goes stale silently when a release is
rebuilt, and the maintenance burden of keeping two sources in sync is exactly the
kind of drift that produces "works in my checkout" failures. This detector makes
the policy mechanical.

Target: `shared/bootstrap/scripts/setup-*.sh` (and any script that downloads a
release asset).

Exit codes when run as CLI:
  0 — allow
  2 — deny (print reason to stderr)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# A bare sha256 constant: 64 hex chars. Matches assignments like
#   OO_SHA256="${OO_SHA256:-ead03c...}"
#   EXPECTED="ead03c..."
HASH64 = re.compile(r"(?<![0-9a-fA-F])[0-9a-fA-F]{64}(?![0-9a-fA-F])")

# Look only where release assets are downloaded — setup scripts in the bootstrap dir.
DEFAULT_TARGETS = tuple(
    REPO_ROOT.glob("shared/bootstrap/scripts/setup-*.sh")
)


def deny_reason(path: Path) -> str | None:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return None
    for m in HASH64.finditer(text):
        # Skip legitimate references (e.g. a comment that mentions "sha256" or
        # a command that computes one) — our rule targets **constants** used as
        # defaults/expected values.
        line = text.count("\n", 0, m.start())
        lineno = line + 1
        # Heuristic: a hardcoded constant sits in a variable assignment
        # (contains "="), not inside a $( ) computation. Don't flag `sha256sum`
        # invocations or manifest comparisons.
        seg = text[max(0, m.start() - 80):m.end() + 80]
        if "=" in seg and "sha256sum" not in seg and "manifest" not in seg:
            return (
                f"hardcoded sha256 checksum at {path.name}:{lineno} — pin the "
                f"VERSION and verify integrity against the release's "
                f"SHASUMS.txt instead. See setup-open-ontologies.sh for the "
                f"correct pattern (curl SHASUMS.txt, resolve expected hash from "
                f"the manifest, compare at install time)."
            )
    return None


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("paths", nargs="*", help="Files to scan (default: setup-*.sh)")
    args = p.parse_args(argv)

    targets = [Path(x) for x in args.paths] if args.paths else list(DEFAULT_TARGETS)
    denied = 0
    for t in targets:
        r = deny_reason(t)
        if r:
            print(f"BLOCKED: {r}", file=sys.stderr)
            denied += 1
    return 2 if denied else 0


if __name__ == "__main__":
    raise SystemExit(main())
