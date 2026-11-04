# Evaluations

Three scenarios that test the judgment calls this skill exists to make, plus two
mechanical checks that should run on every change.

Each scenario is a JSON file with a prompt and the assertions a correct response
satisfies. These are qualitative: run the prompt with the skill loaded and read
the output against the assertions. There is no automated grader here.

## Scenarios

- `01-insight-not-observation.json`. The user hands over a restatement and calls
  it an insight. The skill must diagnose the double P rather than polishing it.
- `02-transposition-invisible.json`. The user wants a cold email. The skill must
  transpose, not label, and must not produce a five-section document.
- `03-audit-not-rewrite.json`. The user asks what is wrong with a deck. The skill
  must deliver a scored memo, not a rival deck.

## Mechanical checks

Run both on every change to the skill.

```bash
# 1. No em dashes anywhere in the skill itself.
python3 -c "import pathlib,sys; h=[(str(p),i) for p in pathlib.Path('.').rglob('*') if p.is_file() for i,l in enumerate(p.read_text(errors='ignore').split(chr(10)),1) if chr(8212) in l]; print(h or 'clean'); sys.exit(1 if h else 0)"

# 2. The gate opens on the skeleton and closes on a known-bad board.
python3 scripts/piber_gate.py assets/case-board-skeleton.md
```

The skeleton passing matters: it is the artifact the skill tells Claude to fill
in, so a skeleton that fails its own gate teaches the wrong shape.
