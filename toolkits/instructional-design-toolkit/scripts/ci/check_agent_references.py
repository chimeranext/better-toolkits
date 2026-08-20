#!/usr/bin/env python3
"""Validate IDT-internal agent references resolve.

Step 3 of the IDT lint workflow (.github/workflows/lint.yml). Every
`${CLAUDE_PLUGIN_ROOT}/agents/<name>.md` reference inside skills/commands
must point to a file shipping in this repo. Catches typo'd agent names
(the bug class flagged by Greptile P1.1 in DOJ-3771).

Calibration note: this check deliberately scopes to `${CLAUDE_PLUGIN_ROOT}`
references and ignores bare `agents/<name>.md` mentions. The latter are
consumer-relative references — for example `commands/_translation-pipeline.md`
documents `agents/translator.md`, `agents/proofreader.md`, and
`agents/translation-reviewer.md` as agents shipped by the *consumer*
(e.g. chimera-academy/agents/), not by IDT itself. Flagging those would
produce false positives on legitimate cross-plugin patterns.
"""
from __future__ import annotations

import glob
import re
import sys


def main() -> int:
    # Index every agent that ships in this repo.
    agents: set[str] = set()
    for path in glob.glob('agents/*.md'):
        name = path.removeprefix('agents/').removesuffix('.md')
        agents.add(name)

    errors: list[str] = []
    # Allow hyphen and underscore in agent names — both are valid identifiers
    # and conflating them produces false negatives if a future agent uses
    # underscores (e.g. agents/translation_reviewer.md).
    ref_pattern = re.compile(
        r'\$\{CLAUDE_PLUGIN_ROOT\}/agents/([a-z][a-z0-9_-]+)\.md'
    )

    for pattern in ['skills/*/SKILL.md', 'commands/*.md']:
        for path in sorted(glob.glob(pattern)):
            with open(path) as f:
                content = f.read()
            for match in ref_pattern.finditer(content):
                agent_ref = match.group(1)
                if agent_ref not in agents:
                    line_num = content[: match.start()].count('\n') + 1
                    errors.append(
                        f'{path}:{line_num}: references '
                        f'${{CLAUDE_PLUGIN_ROOT}}/agents/{agent_ref}.md '
                        f'but no such agent file exists in agents/'
                    )

    if errors:
        print('Agent reference errors:')
        for e in errors:
            print(f'  {e}')
        return 1

    print(
        f'Agent references: {len(agents)} agent(s) indexed, '
        f'all IDT-internal references resolve'
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
