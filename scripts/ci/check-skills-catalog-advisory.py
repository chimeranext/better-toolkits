#!/usr/bin/env python3
"""Post-commit advisory: same drift check, but never blocks the commit.

Exit is always 0. If the catalog drifted, print the fix recipe so the author
can run the sync and amend before pushing.
"""

from __future__ import annotations

import subprocess  # nosec B404  # stdlib; used to run the sibling check (fixed path)
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHECK = ROOT / "scripts" / "ci" / "check-skills-catalog.py"


def main() -> int:
    # nosec B603  # subprocess runs a fixed repo path (not user input); no shell
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
