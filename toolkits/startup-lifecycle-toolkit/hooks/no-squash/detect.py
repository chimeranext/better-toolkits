#!/usr/bin/env python3
"""Shared detector: block squash merges.

The repo forbids squash merges: `--squash` collapses a PR's commit history and
review comments into one commit. Merges must keep history via `--merge` /
`--rebase`. This detector recognizes the explicit squash flags:

  - `gh pr merge <n> --squash`  (and `-s` shorthand)
  - `git merge --squash <branch>`  (and `--strategy squash`)

Used by Claude / Cursor / OpenCode adapters under hooks/no-squash/.

Exit codes when run as CLI:
  0 - allow
  2 - deny (print reason to stderr)

Opt-out (checked by adapters, not required here):
  MNM_DISABLE_NO_SQUASH_HOOK=1
  CLAUDE_DISABLE_PLUGIN_HOOKS=1
  .claude/config/no-squash-hooks.json -> {"enforce_no_squash": false}
"""
from __future__ import annotations

import argparse
import re
import sys

# Command families that merge.
GH_PR_MERGE = re.compile(r"\bgh\s+pr\s+merge\b")
GIT_MERGE = re.compile(r"\bgit\s+(?:-[^\s]+\s+)*merge\b")

# Explicit squash flags.
SQUASH_FLAG = re.compile(r"(?:\A|[\s|&;(])(?:-[^\s]*)?--squash(?:\s|$)")
GIT_SQUASH_STRATEGY = re.compile(r"(?:\A|[\s|&;(])--strategy(?:\s*=\s*|\s+)squash(?:\s|$)")
GH_SQUASH_SHORTHAND = re.compile(r"(?:\A|[\s|&;(])-s(?:\s|$)")

# Executors: when a command delegates to a shell (eval / xargs / sh -c), we do
# NOT strip quotes — the nested command is the real thing being run.
EXECUTOR = re.compile(
    r"(^|[^A-Za-z0-9_-])(eval|xargs|(ba|z|k)?sh\s+-c|\$\(|`)"
)

REASON = (
    "squash merges are forbidden: `--squash` collapses commit history and drops "
    "per-commit review comments. Use `--merge` or `--rebase` (or "
    "`gh pr merge` without `--squash`) so every commit and its discussion is preserved."
)


def strip_quoted_spans(s: str) -> str:
    """Remove single/double-quoted spans (mention != flag), honouring escapes."""
    out: list[str] = []
    q = ""
    i = 0
    n = len(s)
    while i < n:
        c = s[i]
        if not q:
            if c in "'\"":
                q = c
            elif c == "\\" and i + 1 < n:
                out.append(c)
                out.append(s[i + 1])
                i += 2
                continue
            else:
                out.append(c)
        else:
            if c == "\\" and q == '"' and i + 1 < n:
                i += 1
            elif c == q:
                q = ""
        i += 1
    return "".join(out)


def scan_text(command: str) -> str:
    if EXECUTOR.search(command):
        return command
    return strip_quoted_spans(command)


def deny_reason(command: str) -> str | None:
    if not command or not command.strip():
        return None
    scan = scan_text(command)

    is_gh_merge = bool(GH_PR_MERGE.search(scan))
    is_git_merge = bool(GIT_MERGE.search(scan))

    if is_gh_merge and (
        SQUASH_FLAG.search(scan) or GH_SQUASH_SHORTHAND.search(scan)
    ):
        return REASON

    if is_git_merge and (SQUASH_FLAG.search(scan) or GIT_SQUASH_STRATEGY.search(scan)):
        return REASON

    return None


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--command", "-c", help="Command string to check")
    p.add_argument(
        "--stdin-command",
        action="store_true",
        help="Read raw command text from stdin",
    )
    args = p.parse_args(argv)

    if args.command is not None:
        cmd = args.command
    elif args.stdin_command:
        cmd = sys.stdin.read()
    else:
        p.error("provide --command or --stdin-command")

    reason = deny_reason(cmd)
    if reason:
        print(f"BLOCKED: {reason}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
