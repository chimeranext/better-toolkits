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
    re.compile(r"(^|[^A-Za-z0-9])2\s*>>?\s*/dev/null\b"),
    re.compile(r"&>\s*>?\s*/dev/null\b"),
    re.compile(r">&\s*/dev/null\b"),
]

# stdout to null then stderr follows it into null
ORDERED_BOTH_NULL = re.compile(
    r"(^|[^0-9&>])1?>>?\s*/dev/null\b\s+2>&1"
)

BARE_STDOUT_NULL = re.compile(r"(^|[^0-9&>])1?>>?\s*/dev/null\b")

BARE_FOLD = re.compile(r"2\s*>&\s*1")
HAS_FILE_SINK = re.compile(
    r"""(?:^|[\s;|&])(?:>>?|>\|)\s*(?!['"]?/dev/null)['"]?(?:\./|\.\./|/|\$|[A-Za-z0-9_./-])\S*"""
)
HAS_TEE_FILE = re.compile(
    r"\|\s*tee(?:\s+-a)?\s+(?!/dev/null)(\./|\.\./|/|[A-Za-z0-9_./-])\S*"
)
HAS_STDERR_FILE = re.compile(
    r"2\s*>>?\s*(?!&|/dev/null)(\./|\.\./|/|[A-Za-z0-9_./-])\S*"
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


SCRIPT_INVOKE = re.compile(
    r"(?:^|[\s;&|])(?:ba|z|k)?sh\s+(?:-[^\s]+\s+)?([^\s;|&]+\.sh)\b"
)


def scan_script_file(command: str) -> str:
    """If the command runs a local script (`bash foo.sh`), read its content so
    the detector also scans what executes *inside* the file. Closes the gap
    where `>/dev/null` hides inside a script rather than in the shell command.
    Mirrors the OpenCode plugin's scanScriptFile()."""
    m = SCRIPT_INVOKE.search(command)
    if not m:
        return ""
    try:
        with open(m.group(1), "r", encoding="utf-8") as fh:
            return fh.read()
    except OSError:
        return ""


def deny_reason(command: str) -> str | None:
    if not command or not command.strip():
        return None
    scan = scan_text(command) + "\n" + scan_script_file(command)

    for pat in SILENCE:
        if pat.search(scan):
            return (
                "stderr redirect to /dev/null is forbidden "
                "(2>/dev/null, 2>>/dev/null, &>/dev/null, >&/dev/null). "
                "Instead of /dev/null, use `> out.log 2>&1` or "
                "`2>&1 | tee run.log` to preserve errors."
            )

    if ORDERED_BOTH_NULL.search(scan):
        return (
            ">/dev/null 2>&1 discards stderr after stdout — forbidden. "
            "Instead of /dev/null, use `> out.log 2>&1` or "
            "`2>&1 | tee run.log` to preserve errors."
        )

    if BARE_STDOUT_NULL.search(scan):
        return (
            "stdout redirect to /dev/null is forbidden (bare or reversed "
            "as cmd 2>&1 >/dev/null) — it throws away the answer. "
            "Instead of /dev/null, use `> out.log 2>&1` or "
            "`2>&1 | tee run.log` to preserve errors."
        )

    # NOTE: there is intentionally NO allowance for `2>&1 >/dev/null`.
    # Reversed order still sends stdout to null. Fold checks below run
    # on the raw scan.
    # stderr to a SEPARATE file is forbidden: separate error files are the
    # ones that get missed in an audit. Fold stderr into the same log instead.
    if HAS_STDERR_FILE.search(scan):
        return (
            "stderr redirect to a separate file (2> file) is forbidden — "
            "separate error files get missed in audits. Fold stderr into the "
            "same log with `> out.log 2>&1` or `2>&1 | tee run.log`. "
            "Also do not redirect stderr to /dev/null "
            "(2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null)."
        )

    if BARE_FOLD.search(scan):
        if not (
            HAS_FILE_SINK.search(scan)
            or HAS_TEE_FILE.search(scan)
        ):
            return (
                "bare 2>&1 folds errors into stdout without a log sink. "
                "Use files (`> out.log 2>&1`) or `cmd 2>&1 | tee run.log`. "
                "Also do not redirect stderr to /dev/null "
                "(2>/dev/null, 2> /dev/null, 2>>/dev/null, &>/dev/null)."
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
