#!/usr/bin/env python3
"""ASD-STE100 prose gate for commit messages and Markdown bodies (CvC / PRDS).

Wraps `asd-ste100-lint.py`. English controlled prose only — not ESP-TS.

Usage:
  prose_gate.py commit-msg PATH_TO_GIT_COMMIT_EDITMSG
  prose_gate.py markdown PATH_OR_-   # "-" = stdin
  prose_gate.py --selftest

Exit 0 allow; exit 2 deny (hard STE findings). Exit 1 usage error.
Opt-out: SKIP_STE_COMMIT_PROSE=1 (commit-msg), FCTO_DISABLE_STE_PROSE_HOOK=1,
or `# hook-bypass: ste-prose-deferred` in the text.
"""
from __future__ import annotations

import argparse
import importlib.util
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
LINT_PATH = HERE / "asd-ste100-lint.py"
BYPASS = re.compile(r"#\s*hook-bypass:\s*ste-prose-deferred\b", re.I)
CONV_PREFIX = re.compile(r"^[a-z]+(?:\([^)]+\))?!?:\s*", re.I)


def _load_ste():
    if not LINT_PATH.is_file():
        raise FileNotFoundError(f"asd-ste100-lint.py missing at {LINT_PATH}")
    spec = importlib.util.spec_from_file_location("asd_ste100_lint_gate", LINT_PATH)
    if spec is None or spec.loader is None:
        raise ImportError(f"cannot load {LINT_PATH}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ste = _load_ste()


def commit_message_prose(raw: str) -> str:
    """Strip Conventional Commits prefix; keep subject + body as Markdown prose."""
    lines = raw.splitlines()
    # Drop comment lines git leaves in COMMIT_EDITMSG
    lines = [ln for ln in lines if not ln.startswith("#")]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ""
    subject = CONV_PREFIX.sub("", lines[0].strip()).strip()
    body_lines: list[str] = []
    past_blank = False
    for ln in lines[1:]:
        if not past_blank:
            if not ln.strip():
                past_blank = True
            continue
        body_lines.append(ln)
    parts: list[str] = []
    if subject:
        parts.append(subject)
    if body_lines:
        parts.append("\n".join(body_lines).strip())
    return "\n\n".join(parts)


def hard_findings(text: str, *, filename: str = "<prose>") -> list[dict]:
    findings, _words = ste.lint(text, filename=filename)
    return [f for f in findings if f.get("level") == "advisory-free"]


def format_deny(findings: list[dict], context: str) -> str:
    lines = [
        f"ASD-STE100 prose gate ({context}): {len(findings)} hard finding(s). "
        "Rewrite in controlled English. See shared/references/asd-ste100/README.md. "
        "Bypass once with `# hook-bypass: ste-prose-deferred`."
    ]
    for f in findings[:12]:
        lines.append(
            f"  {f.get('file', '<prose>')}:{f.get('line')}:{f.get('col')} "
            f"{f.get('rule')}: {f.get('message')} [{f.get('match')}]"
        )
    if len(findings) > 12:
        lines.append(f"  … and {len(findings) - 12} more")
    return "\n".join(lines)


def check_text(text: str, *, context: str, filename: str = "<prose>") -> str | None:
    """Return deny reason or None."""
    if not text or not text.strip():
        return None
    if BYPASS.search(text):
        return None
    findings = hard_findings(text, filename=filename)
    if not findings:
        return None
    return format_deny(findings, context)


def check_commit_message(raw: str) -> str | None:
    if os.environ.get("SKIP_STE_COMMIT_PROSE", "").strip() in {"1", "true", "yes"}:
        return None
    if BYPASS.search(raw):
        return None
    prose = commit_message_prose(raw)
    if not prose.strip():
        return None
    return check_text(prose, context="commit-msg", filename="<commit-msg>")


def check_markdown(raw: str, *, context: str = "markdown") -> str | None:
    if os.environ.get("FCTO_DISABLE_STE_PROSE_HOOK", "").strip() in {"1", "true", "yes"}:
        return None
    return check_text(raw, context=context, filename="<markdown>")


def selftest() -> None:
    assert commit_message_prose("feat(auth): add login endpoint") == "add login endpoint"
    assert "body line" in commit_message_prose(
        "fix(ui): resolve padding\n\nbody line\n# comment\n"
    )
    assert check_commit_message("feat(auth): add login endpoint") is None
    bad = check_commit_message("feat(auth): spin up the robust service; then verify")
    assert bad and "phrasal-verb" in bad, bad
    good_md = (
        "## Summary\n- Add login endpoint for the auth service\n\n"
        "## Tracker\nFixes ABC-1\n"
    )
    assert check_markdown(good_md) is None
    bad_md = check_markdown("## Summary\n- Spin up the seamless job\n")
    assert bad_md and "phrasal-verb" in bad_md, bad_md
    assert check_markdown("# hook-bypass: ste-prose-deferred\n- Spin up x\n") is None
    print("selftest OK")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--selftest", action="store_true", help="run built-in tests",
    )
    parser.add_argument(
        "mode",
        nargs="?",
        choices=("commit-msg", "markdown"),
        help="gate mode",
    )
    parser.add_argument(
        "path",
        nargs="?",
        help="commit message file, markdown file, or '-' for stdin",
    )
    args = parser.parse_args(argv)
    if args.selftest:
        selftest()
        return 0
    if not args.mode or not args.path:
        parser.error("mode and path required (or --selftest)")
    if args.path == "-":
        raw = sys.stdin.read()
        label = "<stdin>"
    else:
        try:
            raw = Path(args.path).read_text(encoding="utf-8")
        except OSError as e:
            print(f"cannot read {args.path}: {e}", file=sys.stderr)
            return 1
        label = args.path

    if args.mode == "commit-msg":
        reason = check_commit_message(raw)
    else:
        reason = check_markdown(raw, context=f"markdown:{label}")
    if reason:
        print(reason, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
