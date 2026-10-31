#!/usr/bin/env python3
"""Post-commit advisory: same drift check, but never blocks the commit.

Exit is always 0. If the catalog drifted, print the fix recipe so the author
can run the sync and amend before pushing.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHECK = ROOT / "scripts" / "ci" / "check-skills-catalog.py"


def main() -> int:
    r = subprocess.run([sys.executable, str(CHECK)], capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    sys.stderr.write(r.stderr)
    if r.returncode != 0:
        print(
            "tip: run scripts/ci/sync-skills-catalog.py, then "
            "'git add -A && git commit --amend --no-edit' before pushing.",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
