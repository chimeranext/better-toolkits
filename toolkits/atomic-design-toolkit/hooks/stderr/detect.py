#!/usr/bin/env python3
"""Shared detector: block commands that discard stderr (or fold it without a sink).

Used by Claude / Cursor / OpenCode / CLI adapters under hooks/stderr/.

Exit codes when run as CLI:
  0 — allow
  2 — deny (print reason to stderr)

Opt-out (checked by adapters, not required here):
  MNM_DISABLE_STDERR_HOOK=1
  CLAUDE_DISABLE_PLUGIN_HOOKS=1
  .claude/config/stderr-hooks.json → {"preserve_stderr": false}
"""
from __future__ import annotations

import argparse
import re
import sys


SILENCE = [
    re.compile(r"2\s*>>?\s*/dev/null"),
    re.compile(r"&>\s*>?\s*/dev/null"),
    re.compile(r">&\s*/dev/null"),
]

# stdout to null then stderr follows it into null
ORDERED_BOTH_NULL = re.compile(
    r"(^|[^0-9&>])1?>>?\s*/dev/null\s+2>&1"
)

BARE_STDOUT_NULL = re.compile(r"(^|[^0-9&>])1?>>?\s*/dev/null")
ALLOWED_REVERSE = re.compile(r"2>&1\s*1?>>?\s*/dev/null")

BARE_FOLD = re.compile(r"2\s*>&\s*1")
HAS_FILE_SINK = re.compile(
    r"(?:^|[\s;|&])(?:>>?|>\|)\s*(?!/dev/null)(\./|\.\./|/|[A-Za-z0-9_./-])\S*"
)
HAS_TEE_FILE = re.compile(
    r"\|\s*tee(?:\s+-a)?\s+(?!/dev/null)(\./|\.\./|/|[A-Za-z0-9_./-])\S*"
)
HAS_STDERR_FILE = re.compile(
    r"2\s*>\s*(?!&|/dev/null)(\./|\.\./|/|[A-Za-z0-9_./-])\S*"
)

EXECUTOR = re.compile(
    r"(^|[^A-Za-z0-9_-])(eval|xargs|(ba|z|k)?sh\s+-c|\$\(|`)"
)


def strip_quoted_spans(s: str) -> str:
    """Remove single/double-quoted spans (mention ≠ redirect), honouring escapes."""
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

    for pat in SILENCE:
        if pat.search(scan):
            return (
                "stderr redirect to /dev/null is forbidden "
                "(2>/dev/null, 2>>/dev/null, &>/dev/null, >&/dev/null). "
                "Write logs to files (e.g. >out.log 2>err.log) or use tee."
            )

    if ORDERED_BOTH_NULL.search(scan):
        return (
            ">/dev/null 2>&1 discards stderr after stdout — forbidden. "
            "Use cmd 2>&1 >/dev/null (reverse order) or log files / tee."
        )

    remainder = ALLOWED_REVERSE.sub("", scan)
    if BARE_STDOUT_NULL.search(remainder):
        return (
            "bare >/dev/null throws away the answer; use out=$(cmd) or "
            "cmd 2>&1 >/dev/null when you only need the exit code with stderr kept."
        )

    # Allowed idiom `2>&1 >/dev/null` keeps stderr on the original stdout —
    # strip those spans before judging bare folds / remaining null redirects.
    fold_scan = ALLOWED_REVERSE.sub("", scan)
    if BARE_FOLD.search(fold_scan):
        if not (
            HAS_FILE_SINK.search(fold_scan)
            or HAS_TEE_FILE.search(fold_scan)
            or HAS_STDERR_FILE.search(fold_scan)
        ):
            return (
                "bare 2>&1 folds errors into stdout without a log sink. "
                "Use files (cmd >out.log 2>err.log or >all.log 2>&1) or "
                "cmd 2>&1 | tee run.log."
            )

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
