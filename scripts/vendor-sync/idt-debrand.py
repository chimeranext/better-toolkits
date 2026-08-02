#!/usr/bin/env python3
"""Rebrand the vendored instructional-design-toolkit copy from Dojo to Chimera.

`better-toolkits` vendors this toolkit from its canonical upstream,
`DojoCodingLabs/instructional-design-toolkit`. The upstream names itself and
its example consumer plugin throughout its documentation; this repo must not.
The invariant is that **zero files under the vendored toolkit match /dojo/i**.

This script is both halves of that: run it bare to APPLY the mapping after a
sync, run it with `--check` to ASSERT the invariant in CI. The two cannot
drift apart, because a file the transform would still rewrite is exactly a
file that still carries the upstream brand.

It is a checked-in program rather than a one-off sed for one reason: the next
upstream sync has to apply the SAME mapping. A mapping that lives in a shell
history drifts on the second sync, and the drift is invisible -- both runs
produce a tree with no `dojo` in it, just different words in its place.

This file lives OUTSIDE `toolkits/instructional-design-toolkit/` on purpose.
It has to name both brands to document the mapping, and anything naming the
old one inside the vendored path would itself violate the invariant it exists
to enforce.

The specific overrides are not invented. They were read off the vendored copy
this repo already had, before the sync:

    git grep -o -i -E 'chimera[a-z-]*' origin/main \\
        -- toolkits/instructional-design-toolkit/ | sed 's/.*://' | sort | uniq -c
    #  21 chimeranext   9 chimera-coding   8 chimera-academy   1 chimerapathways

so a reader diffing against the old vendored copy sees continuity rather than
a fresh invention.

Usage:
    python3 scripts/vendor-sync/idt-debrand.py [--check] [root]

    root      defaults to toolkits/instructional-design-toolkit/
    --check   report what WOULD change and exit 1 if anything would; do not write.
"""

import sys
from pathlib import Path

# Ordered. Specific organisation names first, because the generic case-preserving
# rule below would otherwise turn `DojoCodingLabs` into `ChimeraCodingLabs`,
# which is not an organisation that exists.
SPECIFIC = [
    ("DojoCodingLabs", "chimeranext"),
    ("dojocodinglabs", "chimeranext"),
    ("DojoCoding", "chimeranext"),
    ("dojocoding", "chimeranext"),
    ("dojopathways", "chimerapathways"),
]

# Case-preserving fallback. Covers dojo-academy, dojo-coding, DojoOS, dojo-os,
# dojo-mindset, Logo-Dojo-01, dojoCodeReviewer, and anything a future upstream
# adds without this script needing an entry per token.
GENERIC = [
    ("DOJO", "CHIMERA"),
    ("Dojo", "Chimera"),
    ("dojo", "chimera"),
]

SKIP_DIRS = {".git", "node_modules", "__pycache__"}


def transform(text: str) -> str:
    for old, new in SPECIFIC:
        text = text.replace(old, new)
    for old, new in GENERIC:
        text = text.replace(old, new)
    return text


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--check"]
    check_only = "--check" in sys.argv
    default_root = (
        Path(__file__).resolve().parents[2] / "toolkits" / "instructional-design-toolkit"
    )
    root = Path(args[0]) if args else default_root
    if not root.is_dir():
        print(f"debrand: no such directory: {root}", file=sys.stderr)
        return 2

    changed = []
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            print(f"SKIP (not utf-8): {path.relative_to(root)}", file=sys.stderr)
            continue
        updated = transform(original)
        if updated != original:
            changed.append(path.relative_to(root))
            if not check_only:
                path.write_text(updated, encoding="utf-8")

    verb = "would change" if check_only else "rewrote"
    print(f"debrand: {verb} {len(changed)} file(s)")
    for rel in changed:
        print(f"  {rel}")
    if check_only and changed:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
