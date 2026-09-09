#!/usr/bin/env python3
"""Shared detector: enforce PRDS (Pull Request Description Standards) on push / PR writes.

Protocol SSOT:
  toolkits/fractional-cto-toolkit/references/engineering-standards/prds.md

Used by Claude / Cursor / OpenCode adapters under shared/hooks/prds/.

Exit codes when run as CLI:
  0 — allow
  2 — deny (print reason to stderr)

Policy (v1):
  - Ignore unrelated commands.
  - `gh pr create|edit` → body must include the four always-on PRDS sections
    (Summary, Tracker, Test plan, Scope boundaries) with non-empty content.
  - `git push` with an open PR for the current branch → same body check via
    `gh pr view`. Progressive push before any PR exists → allow (PRDS draft workflow).
  - Soft signals (title shape, ~400-line size) are warnings on stderr but do not deny.

Opt-out (checked by adapters):
  FCTO_DISABLE_PRDS_HOOK=1
  CLAUDE_DISABLE_PLUGIN_HOOKS=1
  .claude/config/prds-hooks.json → {"enforce_prds": false}

Bypass (explicit, logged as finding):
  # hook-bypass: prds-body-deferred
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

BYPASS = re.compile(r"#\s*hook-bypass:\s*prds-body-deferred\b", re.I)

# Triggers
GIT_PUSH = re.compile(r"(^|[\s;|&])git\s+push\b", re.I)
GH_PR_WRITE = re.compile(r"(^|[\s;|&])gh\s+pr\s+(create|edit)\b", re.I)
SKIP_PUSH = re.compile(
    r"(^|[\s;|&])git\s+push\b.*(--dry-run|-n\b|--tags\b|--mirror\b|--delete\b|-d\b)",
    re.I,
)

# PRDS always-on headings (flexible match)
SECTION_PATTERNS = {
    "Summary": re.compile(r"(?im)^\s*##\s+Summary\s*$"),
    "Tracker": re.compile(r"(?im)^\s*##\s+(Tracker|Linear)\s*$"),
    "Test plan": re.compile(r"(?im)^\s*##\s+Test\s+plan\s*$"),
    "Scope boundaries": re.compile(
        r"(?im)^\s*##\s+Scope\s+boundaries(?:\s*\(out of scope\))?\s*$"
    ),
}

TRACKER_KEYWORD = re.compile(
    r"(?im)\b(Fixes|Closes|Resolves)\s+[A-Za-z][\w.-]*\d+",
)


def section_body(markdown: str, heading_re: re.Pattern[str]) -> str | None:
    """Return text under a ## heading until the next ##, or None if heading missing."""
    m = heading_re.search(markdown)
    if not m:
        return None
    rest = markdown[m.end() :]
    next_h = re.search(r"(?m)^\s*##\s+", rest)
    if next_h:
        rest = rest[: next_h.start()]
    return rest.strip()


def missing_prds_sections(body: str) -> list[str]:
    missing: list[str] = []
    if not body or not body.strip():
        return list(SECTION_PATTERNS.keys())
    for name, pat in SECTION_PATTERNS.items():
        text = section_body(body, pat)
        if text is None or not text:
            missing.append(name)
    # Tracker keyword (Fixes/Closes/Resolves) somewhere in body
    if "Tracker" not in missing and not TRACKER_KEYWORD.search(body):
        # Allow N/A tracker only if section says N/A explicitly
        tracker_text = section_body(body, SECTION_PATTERNS["Tracker"]) or ""
        if not re.search(r"(?im)^\s*N/?A\b", tracker_text):
            missing.append("Tracker (Fixes|Closes|Resolves TICKET)")
    return missing


def extract_body_from_gh_command(command: str) -> str | None:
    """Best-effort extract --body / --body-file from a gh pr create|edit command."""
    try:
        tokens = shlex.split(command, posix=True)
    except ValueError:
        tokens = command.split()

    body: str | None = None
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if t in ("--body", "-b") and i + 1 < len(tokens):
            body = tokens[i + 1]
            i += 2
            continue
        if t.startswith("--body="):
            body = t.split("=", 1)[1]
            i += 1
            continue
        if t == "--body-file" and i + 1 < len(tokens):
            path = tokens[i + 1]
            try:
                body = Path(path).expanduser().read_text(encoding="utf-8")
            except OSError as e:
                return f"__READ_ERROR__:{path}:{e}"
            i += 2
            continue
        if t.startswith("--body-file="):
            path = t.split("=", 1)[1]
            try:
                body = Path(path).expanduser().read_text(encoding="utf-8")
            except OSError as e:
                return f"__READ_ERROR__:{path}:{e}"
            i += 1
            continue
        i += 1
    return body


def run_gh_pr_view(cwd: str | None) -> dict | None:
    env = os.environ.copy()
    try:
        proc = subprocess.run(
            [
                "gh",
                "pr",
                "view",
                "--json",
                "title,body,isDraft,additions,deletions,url",
            ],
            cwd=cwd or None,
            capture_output=True,
            text=True,
            timeout=4,
            env=env,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    if proc.returncode != 0:
        # No PR for branch / auth failure → treat as no PR
        return None
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None


def deny_message(missing: list[str], context: str) -> str:
    secs = ", ".join(missing)
    return (
        f"PRDS: {context} — missing or empty required sections: {secs}. "
        "Fill ## Summary, ## Tracker (or ## Linear), ## Test plan, "
        "## Scope boundaries (out of scope). See fractional-cto "
        "references/engineering-standards/prds.md. "
        "Bypass once with `# hook-bypass: prds-body-deferred` "
        "or disable via FCTO_DISABLE_PRDS_HOOK=1."
    )


def evaluate(command: str, cwd: str | None = None) -> str | None:
    """Return deny reason or None to allow."""
    if BYPASS.search(command):
        return None
    if not command.strip():
        return None

    if GH_PR_WRITE.search(command):
        body = extract_body_from_gh_command(command)
        if body is None:
            return (
                "PRDS: `gh pr create|edit` without --body / --body-file. "
                "Pass a PRDS-complete body (Summary, Tracker, Test plan, "
                "Scope boundaries). See references/engineering-standards/prds.md."
            )
        if body.startswith("__READ_ERROR__:"):
            return f"PRDS: cannot read --body-file ({body})."
        missing = missing_prds_sections(body)
        if missing:
            return deny_message(missing, "gh pr create|edit body")
        return None

    if GIT_PUSH.search(command):
        if SKIP_PUSH.search(command):
            return None
        pr = run_gh_pr_view(cwd)
        if pr is None:
            # Progressive push before draft PR — allowed by PRDS workflow
            return None
        body = pr.get("body") or ""
        missing = missing_prds_sections(body)
        if missing:
            url = pr.get("url") or "current PR"
            return deny_message(missing, f"git push while PR exists ({url})")
        # Soft size warn
        try:
            size = int(pr.get("additions") or 0) + int(pr.get("deletions") or 0)
            if size > 400:
                print(
                    f"PRDS WARN: PR diff ~{size} lines (>~400 soft cap) — consider splitting.",
                    file=sys.stderr,
                )
        except (TypeError, ValueError):
            pass
        title = pr.get("title") or ""
        if title and not re.search(r"^[a-z]+(\([^)]+\))?: .+", title):
            print(
                f"PRDS WARN: title may not match conventional format: {title!r}",
                file=sys.stderr,
            )
        return None

    return None


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--command", required=True, help="Shell command to evaluate")
    parser.add_argument(
        "--cwd",
        default=os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd(),
        help="Repo cwd for gh pr view (default: CLAUDE_PROJECT_DIR or pwd)",
    )
    args = parser.parse_args(argv)
    reason = evaluate(args.command, cwd=args.cwd)
    if reason:
        print(reason, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
