#!/usr/bin/env python3
"""Validate YAML frontmatter on commands / skills / agents.

Step 2 of the IDT lint workflow (.github/workflows/lint.yml). Every
`commands/*.md`, `skills/*/SKILL.md`, `agents/*.md` either has no
frontmatter (skipped — e.g. translation pipeline support docs) or has a
parseable mapping with a non-empty `description` field. Catches the bug
class Greptile flagged in the DOJ-3708 migration chain — missing or
malformed frontmatter fields after copy-paste from chimera-academy.
"""
from __future__ import annotations

import glob
import re
import sys

import yaml


def main() -> int:
    errors: list[str] = []
    patterns = ['commands/*.md', 'skills/*/SKILL.md', 'agents/*.md']
    checked = 0
    skipped = 0

    for pattern in patterns:
        for path in sorted(glob.glob(pattern)):
            with open(path) as f:
                content = f.read()

            match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
            if not match:
                # Files without frontmatter are allowed (e.g. supporting
                # docs like commands/_translation-pipeline.md). Skip.
                skipped += 1
                continue

            try:
                fm = yaml.safe_load(match.group(1))
            except yaml.YAMLError as e:
                errors.append(f'{path}: YAML parse error - {e}')
                continue

            if not isinstance(fm, dict):
                errors.append(f'{path}: frontmatter is not a mapping')
                continue

            if 'description' not in fm:
                errors.append(
                    f'{path}: missing required frontmatter field "description"'
                )
                continue

            desc = fm.get('description')
            if not isinstance(desc, str) or not desc.strip():
                errors.append(
                    f'{path}: frontmatter "description" is empty or not a string'
                )
                continue
            checked += 1

    if errors:
        print('Frontmatter linting errors:')
        for e in errors:
            print(f'  {e}')
        return 1

    print(
        f'Frontmatter: {checked} file(s) valid, {skipped} skipped (no frontmatter)'
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
