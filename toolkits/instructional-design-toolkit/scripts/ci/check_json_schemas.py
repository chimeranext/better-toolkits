#!/usr/bin/env python3
"""Validate every JSON schema file parses as JSON.

Step 1 of the IDT lint workflow (.github/workflows/lint.yml). Catches the
bug class Greptile flagged in the DOJ-3708 migration chain — malformed
schema syntax slipping in via copy-paste or merge.
"""
from __future__ import annotations

import glob
import json
import sys


def main() -> int:
    errors: list[str] = []
    schemas = sorted(glob.glob('assets/schemas/**/*.schema.json', recursive=True))
    for path in schemas:
        try:
            with open(path) as f:
                json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f'{path}: {e}')

    if errors:
        print('JSON schema syntax errors:')
        for e in errors:
            print(f'  {e}')
        return 1

    print(f'JSON schemas: {len(schemas)} file(s) valid')
    return 0


if __name__ == '__main__':
    sys.exit(main())
