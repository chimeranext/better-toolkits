#!/usr/bin/env python3
"""CI gate: scan every toolkit/shared skill, fail on score > 50 (HIGH+).

Usage: python3 scripts/skillspector-gate.py [--no-llm]

- Respects each skill's committed `.skillspector-baseline.yaml` (accepted,
  human-reviewed findings don't count).
- Always writes SARIF to skillspector-report.sarif for upload.
- Prints a compact score table; exits 1 listing every offending skill.
"""

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPORT = ROOT / "skillspector-report.sarif"
THRESHOLD = 50

ARGS = [a for a in sys.argv[1:] if a != "--python"]


def skill_dirs() -> list[Path]:
    out = []
    for base in (ROOT / "toolkits", ROOT / "shared"):
        skills = base / "skills" if base.name == "shared" else None
        if skills and skills.is_dir():
            out += sorted(p for p in skills.iterdir() if p.is_dir())
        elif base.is_dir():
            for tk in sorted(base.iterdir()):
                s = tk / "skills"
                if s.is_dir():
                    out += sorted(p for p in s.iterdir() if p.is_dir())
    return out


def scan(d: Path, extra: list[str]) -> dict:
    baseline = d / ".skillspector-baseline.yaml"
    cmd = ["skillspector", "scan", str(d), "--format", "json"]
    if baseline.exists():
        cmd += ["--baseline", str(baseline)]
    cmd += extra
    r = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(r.stdout or "{}")
    except json.JSONDecodeError:
        return {"_error": (r.stderr or r.stdout or "unparseable output")[:300]}


def main() -> int:
    extra = ARGS
    bad: list[tuple[int, str]] = []
    rows: list[tuple[int, str, str]] = []
    sarif_runs: list[dict] = []
    for d in skill_dirs():
        try:
            rel = d.relative_to(ROOT).as_posix()
        except ValueError:
            rel = d.as_posix()
        rep = scan(d, extra)
        if "_error" in rep:
            print(f"ERROR {rel}: {rep['_error']}")
            bad.append((999, rel + " (scan error)"))
            continue
        ra = rep.get("risk_assessment", {})
        score, sev = ra.get("score", 0), ra.get("severity", "?")
        rows.append((score, sev, rel))
        if score > THRESHOLD:
            bad.append((score, rel))
        for i in rep.get("issues", []):
            loc = i.get("location", {}) or {}
            sarif_runs.append(
                {
                    "ruleId": i.get("id", "?"),
                    "level": "error"
                    if i.get("severity") in ("HIGH", "CRITICAL")
                    else "warning",
                    "message": {"text": f"{rel}: {i.get('category','')} — {str(i.get('finding', i.get('message','')))[:200]}"},
                    "locations": [
                        {
                            "physicalLocation": {
                                "artifactLocation": {"uri": f"{rel}/{loc.get('file','')}"},
                                "region": {"startLine": loc.get("start_line", 1)},
                            }
                        }
                    ],
                }
            )
    print(f"{'score':>5}  sev      skill")
    for score, sev, rel in sorted(rows):
        print(f"{score:>5}  {sev:<8} {rel}")
    with open(REPORT, "w") as f:
        json.dump(
            {
                "version": "2.1.0",
                "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
                "runs": [
                    {
                        "tool": {"driver": {"name": "SkillSpector"}},
                        "results": sarif_runs,
                    }
                ],
            },
            f,
        )
    if bad:
        print("\nBLOCKED (score > 50):")
        for score, rel in sorted(bad, reverse=True):
            print(f"  {score} {rel}")
        return 1
    print(f"\nOK: {len(rows)} skills, none above {THRESHOLD}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
