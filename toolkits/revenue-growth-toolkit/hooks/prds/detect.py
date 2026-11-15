#!/usr/bin/env python3
"""Shared detector: enforce PRDS (Pull Request Description Standards) on push / PR writes.

Protocol SSOT:
  shared/references/engineering-standards/prds.md

Used by Claude / Cursor / OpenCode adapters under shared/hooks/prds/.

Exit codes when run as CLI:
  0 — allow
  2 — deny (print reason to stderr)

Policy (v1):
  - Ignore unrelated commands.
  - `gh pr create|edit` → body must include the four always-on PRDS sections
    (Summary, Tracker, Test plan, Scope boundaries) with non-empty content.
  - Tracker: `Fixes|Closes|Resolves TICKET` (default). PRs targeting integration
    branches (`devel`, `stage`, …) may use `Ref TICKET` in ## Tracker instead.
  - After sections pass: ASD-STE100 hard prose gate on the body
    (`shared/references/asd-ste100/scripts/prose_gate.py`).
  - `git push` with an open PR for the current branch → same body check via
    `gh pr view`. Progressive push before any PR exists → allow (PRDS draft workflow).
  - Soft signals (title shape, ~400-line size) are warnings on stderr but do not deny.

Opt-out (checked by adapters):
  FCTO_DISABLE_PRDS_HOOK=1
  CLAUDE_DISABLE_PLUGIN_HOOKS=1
  .claude/config/prds-hooks.json → {"enforce_prds": false}
  FCTO_DISABLE_STE_PROSE_HOOK=1
  .claude/config/prds-hooks.json → {"enforce_ste_prose": false}

Bypass (explicit, logged as finding):
  # hook-bypass: prds-body-deferred
  # hook-bypass: ste-prose-deferred
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path

BYPASS = re.compile(r"#\s*hook-bypass:\s*prds-body-deferred\b", re.I)
STE_BYPASS = re.compile(r"#\s*hook-bypass:\s*ste-prose-deferred\b", re.I)

_PROSE_GATE = None


def _find_prose_gate_path() -> Path | None:
    """Locate prose_gate.py from shared/hooks or a vendored toolkit hooks tree."""
    here = Path(__file__).resolve()
    # shared/hooks/prds → shared/references/asd-ste100/...
    direct = (
        here.parents[2] / "references" / "asd-ste100" / "scripts" / "prose_gate.py"
    )
    if direct.is_file():
        return direct
    for parent in here.parents:
        cand = (
            parent / "shared" / "references" / "asd-ste100" / "scripts" / "prose_gate.py"
        )
        if cand.is_file():
            return cand
    return None


def _prose_gate():
    """Lazy-load shared ASD-STE100 prose_gate (CvC/PRDS)."""
    global _PROSE_GATE
    if _PROSE_GATE is not None:
        return _PROSE_GATE
    gate_path = _find_prose_gate_path()
    if gate_path is None:
        _PROSE_GATE = False
        return _PROSE_GATE
    spec = importlib.util.spec_from_file_location("asd_ste100_prose_gate", gate_path)
    if spec is None or spec.loader is None:
        _PROSE_GATE = False
        return _PROSE_GATE
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    _PROSE_GATE = mod
    return _PROSE_GATE


def ste_prose_enabled() -> bool:
    if os.environ.get("FCTO_DISABLE_STE_PROSE_HOOK", "").strip() in {
        "1", "true", "yes",
    }:
        return False
    cfg = Path.cwd() / ".claude" / "config" / "prds-hooks.json"
    if cfg.is_file():
        try:
            data = json.loads(cfg.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            data = {}
        if data.get("enforce_ste_prose", True) is False:
            return False
    return True


def ste_prose_deny(body: str) -> str | None:
    """Return ASD-STE100 deny reason for PR body, or None."""
    if not ste_prose_enabled():
        return None
    if STE_BYPASS.search(body or ""):
        return None
    gate = _prose_gate()
    if not gate:
        return None
    return gate.check_markdown(body, context="PRDS body")


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
TRACKER_REF = re.compile(r"(?im)\bRef\s+[A-Za-z][\w.-]*\d+")

# Long-lived integration branches (acme-startup devel/stage; generic develop/staging).
INTEGRATION_BASE_BRANCHES = frozenset({"devel", "stage", "develop", "staging"})


def section_body(markdown: str, heading_re: re.Pattern[str]) -> str | None:
    """Return text under a ## heading until the next ##, or None if heading missing."""
    m = heading_re.search(markdown)
    if not m:
        return None
    rest = markdown[m.end():]
    next_h = re.search(r"(?m)^\s*##\s+", rest)
    if next_h:
        rest = rest[: next_h.start()]
    return rest.strip()


def integration_base_branch(base: str | None) -> bool:
    if not base:
        return False
    return base.lower() in INTEGRATION_BASE_BRANCHES


def tracker_ticket_linked(body: str, integration_base: bool) -> bool:
    if TRACKER_KEYWORD.search(body):
        return True
    tracker_text = section_body(body, SECTION_PATTERNS["Tracker"]) or ""
    if re.search(r"(?im)^\s*N/?A\b", tracker_text):
        return True
    if integration_base and TRACKER_REF.search(tracker_text):
        return True
    return False


def missing_prds_sections(body: str, *, integration_base: bool = False) -> list[str]:
    missing: list[str] = []
    if not body or not body.strip():
        return list(SECTION_PATTERNS.keys())
    for name, pat in SECTION_PATTERNS.items():
        text = section_body(body, pat)
        if text is None or not text:
            missing.append(name)
    if "Tracker" not in missing and not tracker_ticket_linked(body, integration_base):
        if integration_base:
            missing.append("Tracker (Ref or Fixes|Closes|Resolves TICKET)")
        else:
            missing.append("Tracker (Fixes|Closes|Resolves TICKET)")
    return missing


def extract_base_from_gh_command(command: str) -> str | None:
    """Parse --base / -B from gh pr create|edit (best effort)."""
    try:
        tokens = shlex.split(command, posix=True)
    except ValueError:
        tokens = command.split()
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if t in ("--base", "-B") and i + 1 < len(tokens):
            return tokens[i + 1]
        if t.startswith("--base="):
            return t.split("=", 1)[1]
        i += 1
    return None


def integration_base_for_gh_command(command: str, cwd: str | None) -> bool:
    base = extract_base_from_gh_command(command)
    if base is not None:
        return integration_base_branch(base)
    if re.search(r"(?im)gh\s+pr\s+edit\b", command):
        pr = run_gh_pr_view(cwd)
        if pr:
            return integration_base_branch(pr.get("baseRefName"))
    return False


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
                "title,body,isDraft,additions,deletions,url,baseRefName",
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
        "shared/references/engineering-standards/prds.md. "
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
                "Scope boundaries). See shared/references/engineering-standards/prds.md."
            )
        if body.startswith("__READ_ERROR__:"):
            return f"PRDS: cannot read --body-file ({body})."
        if BYPASS.search(body):
            return None
        integration = integration_base_for_gh_command(command, cwd)
        missing = missing_prds_sections(body, integration_base=integration)
        if missing:
            return deny_message(missing, "gh pr create|edit body")
        ste_reason = ste_prose_deny(body)
        if ste_reason:
            return ste_reason
        return None

    if GIT_PUSH.search(command):
        if SKIP_PUSH.search(command):
            return None
        pr = run_gh_pr_view(cwd)
        if pr is None:
            # Progressive push before draft PR — allowed by PRDS workflow
            return None
        body = pr.get("body") or ""
        if BYPASS.search(body):
            return None
        integration = integration_base_branch(pr.get("baseRefName"))
        missing = missing_prds_sections(body, integration_base=integration)
        if missing:
            url = pr.get("url") or "current PR"
            return deny_message(missing, f"git push while PR exists ({url})")
        ste_reason = ste_prose_deny(body)
        if ste_reason:
            return ste_reason
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
