#!/usr/bin/env python3
"""Synthetic tests for the TAS rule in detect_code_smells.py.

Run: python3 scripts/lint/tests/test_detect_code_smells.py
Exit 0 = pass; exit 1 = any failure (no pytest dependency).
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import detect_code_smells as dcs  # noqa: E402

# (suffix, filename, content, expect_flag)
POSITIVE = [
    (".ts", "sample.test.ts", "expect(x).toHaveLength(4);", True),
    (".js", "sample.test.js", "assert.equal(arr.length, 4);", True),
    (".py", "sample_test.py", "assert len(x) == 4", True),
    (".sh", "sample.test.sh", "[ ${#arr[@]} -eq 4 ]", True),
    (".php", "sample_test.php", "assertCount(4, $arr);", True),
    (".ps1", "sample.test.ps1", "$arr.Count -eq 4", True),
    (".dart", "sample_test.dart", "expect(arr.length, 4);", True),
    (".ex", "sample_test.exs", "assert length(x) == 4", True),
    (".rs", "sample_test.rs", "assert_eq!(x.len(), 4);", True),
    (".go", "sample_test.go", "require.Len(t, x, 4)", True),
]

NEGATIVE = [
    (".ts", "sample.test.ts", "expect(x).toHaveLength(NPM_PACKAGES.length);", False),
    (".py", "sample_test.py", "assert len(x) == len(y)", False),
    (".ts", "sample.test.ts", "expect(new Set(Object.keys(X))).toEqual(new Set([1,2]));", False),
    (".ts", "sample.test.ts", "expect(x).toHaveLength(JWT_SEGMENTS); // tas: fixture", False),
    (".sh", "sample.test.sh", "[ ${#arr[@]} -eq ${N} ]", False),
]


def count_flags(path: Path) -> int:
    return sum(1 for lvl, _ in dcs.scan_test_assertions(path) if lvl == "WARN")


def main() -> int:
    failures: list[str] = []
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp)
        for suffix, name, content, expect in POSITIVE + NEGATIVE:
            p = base / name
            p.write_text(content, encoding="utf-8")
            got = count_flags(p)
            if expect and got == 0:
                failures.append(f"POSITIVE no flag: {name} ({content!r})")
            if not expect and got > 0:
                failures.append(f"NEGATIVE flagged: {name} ({content!r}) -> {got}")
    if failures:
        print("FAIL")
        for f in failures:
            print(" -", f)
        return 1
    print(f"OK ({len(POSITIVE) + len(NEGATIVE)} cases)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
