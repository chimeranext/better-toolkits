#!/usr/bin/env python3
"""Validate a generated interactive workbook HTML against its invariants (DOJ-4839).

This is an AUTHOR tool, not a plugin-repo CI gate — generated workbooks live in
the *consumer* repo, so run it on demand against a produced file:

    python3 scripts/validate_workbook.py path/to/workbook-<slug>.html [more.html ...]

It enforces the contracts the `workbook-generate` command promises:

  ERRORS (exit 1 — the artifact is broken or violates a hard rule):
    - Standalone: no external `<script src=...>`, no CDN runtime refs.
    - In-memory only (V1): no localStorage / sessionStorage / indexedDB / postMessage.
    - Globally-unique element ids (invalid HTML + breaks anchors / aria / label `for`;
      the per-module fan-out depends on `m{N}-` namespacing to avoid this).

  WARNINGS (reported, do not fail):
    - Accessibility landmarks present (>=1 role="region", a role="progressbar").
    - A `system-ui` fallback alongside any Google Fonts <link>.

Pure stdlib (re only) — same posture as scripts/ci/*.
"""
from __future__ import annotations

import re
import sys

# CDN only counts as a *runtime dependency* when it's a resource tag's href/src
# (link/script/img/iframe) — not a plain <a> link to an educational resource.
CDN_RE = re.compile(
    r"""<(?:link|script|img|iframe)\b[^>]*?\b(?:href|src)\s*=\s*["'](https?://[^"']*(?:cdn\.|unpkg\.com|jsdelivr\.net|cdnjs\.)[^"']*)""",
    re.I,
)
SCRIPT_SRC_RE = re.compile(r"<script\b[^>]*\bsrc\s*=", re.I)
SCRIPT_BLOCK_RE = re.compile(r"<script\b[^>]*>(.*?)</script>", re.I | re.S)
CODE_BLOCK_RE = re.compile(r"<(pre|code)\b[^>]*>.*?</\1>", re.I | re.S)
STATE_RE = re.compile(r"\b(localStorage|sessionStorage|indexedDB|postMessage)\b")
ID_RE = re.compile(r'\sid\s*=\s*"([^"]+)"', re.I)
ROLE_REGION_RE = re.compile(r'role\s*=\s*["\']?region["\']?', re.I)
ROLE_PROGRESS_RE = re.compile(r'role\s*=\s*["\']?progressbar["\']?', re.I)
GFONTS_RE = re.compile(r"fonts\.googleapis\.com", re.I)


def validate(path: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        with open(path, encoding="utf-8") as f:
            html = f.read()
    except OSError as e:
        return ([f"{path}: cannot read - {e}"], [])

    # --- Standalone ---
    if SCRIPT_SRC_RE.search(html):
        errors.append(f"{path}: external <script src=...> found (must be self-contained)")
    cdn = {m.group(1) for m in CDN_RE.finditer(html)}
    if cdn:
        errors.append(f"{path}: CDN runtime reference(s): {', '.join(sorted(cdn))}")

    # --- In-memory only (V1) — scan SCRIPT CONTENTS only, so prose/code that merely
    #     *mentions* localStorage (e.g. a lesson about it) doesn't false-fail. ---
    script_src = "\n".join(m.group(1) for m in SCRIPT_BLOCK_RE.finditer(html))
    state_hits = sorted({m.group(1) for m in STATE_RE.finditer(script_src)})
    if state_hits:
        errors.append(
            f"{path}: persistence/parent-comm API(s) used in script (V1 is in-memory only): "
            + ", ".join(state_hits)
        )

    # --- Globally-unique ids — exclude <pre>/<code> so sample-code placeholder ids
    #     inside lessons don't count as real document ids. ---
    html_no_code = CODE_BLOCK_RE.sub("", html)
    seen: dict[str, int] = {}
    for m in ID_RE.finditer(html_no_code):
        seen[m.group(1)] = seen.get(m.group(1), 0) + 1
    dupes = {k: v for k, v in seen.items() if v > 1}
    if dupes:
        listed = ", ".join(f"{k} (×{v})" for k, v in sorted(dupes.items())[:10])
        more = "" if len(dupes) <= 10 else f" (+{len(dupes) - 10} more)"
        errors.append(f"{path}: duplicate element id(s): {listed}{more}")

    # --- Warnings: a11y landmarks ---
    if not ROLE_REGION_RE.search(html):
        warnings.append(f'{path}: no role="region" landmarks found (steps should be regions)')
    if not ROLE_PROGRESS_RE.search(html):
        warnings.append(f'{path}: no role="progressbar" found (progress indicator expected)')

    # --- Warnings: font fallback ---
    if GFONTS_RE.search(html) and "system-ui" not in html:
        warnings.append(f"{path}: Google Fonts <link> present but no system-ui fallback in the stack")

    return (errors, warnings)


def main(argv: list[str]) -> int:
    paths = argv[1:]
    if not paths:
        print("usage: validate_workbook.py <workbook.html> [more.html ...]", file=sys.stderr)
        return 2

    total_err = 0
    total_warn = 0
    for path in paths:
        errors, warnings = validate(path)
        total_err += len(errors)
        total_warn += len(warnings)
        for e in errors:
            print(f"ERROR  {e}")
        for w in warnings:
            print(f"WARN   {w}")
        if not errors and not warnings:
            print(f"OK     {path}: standalone, in-memory-only, unique ids, a11y landmarks present")
        elif not errors:
            print(f"OK     {path}: no errors ({len(warnings)} warning(s))")

    print(
        f"\nValidated {len(paths)} file(s): {total_err} error(s), {total_warn} warning(s)."
    )
    return 1 if total_err else 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
