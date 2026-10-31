#!/usr/bin/env python3
"""sync-better-profile-generate.py — generate per-harness runtime profile copies.

Reads the canonical profile `shared/bootstrap/agents/better.md` (OpenCode schema)
and emits the schema-converted runtime file for the requested harness.

Usage:
  sync-better-profile-generate.py --harness opencode --src <canonical> --out <dst>
  sync-better-profile-generate.py --harness claude   --src <canonical> --out <dst>
  sync-better-profile-generate.py --harness cursor    --src <canonical> --out <dst>
  sync-better-profile-generate.py --harness all --src <canonical> --out-dir <dir>

Exit codes: 0 ok, 1 error (missing src, unknown harness, malformed frontmatter).
"""

import argparse
import re
import sys

# Frontmatter block between the first two `---` fences.
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)

HARNESS_OPENING = {
    "opencode": "OpenCode",
    "claude": "Claude",
    "cursor": "Cursor",
}


def parse_frontmatter(text):
    m = FRONTMATTER_RE.match(text)
    if not m:
        raise ValueError("canonical profile has no YAML frontmatter")
    return m.group(1), text[m.end():]


def extract_description(fm):
    # description is the first `description:` line, possibly quoted.
    m = re.search(r"^description:\s*\"?(.*?)\"?\s*$", fm, re.MULTILINE)
    if not m:
        raise ValueError("frontmatter has no `description` field")
    return m.group(1).replace('"', '\\"')


def convert_opencode(body):
    return body


def convert_claude(desc, body):
    opening = body.split("\n", 1)[0].replace("OpenCode", "Claude")
    rest = body.split("\n", 1)[1] if "\n" in body else ""
    fm = (
        "---\n"
        f"name: better\n"
        f"description: {desc}\n"
        "tools: Read, Grep, Glob, Bash, Edit, Write\n"
        "permissionMode: default\n"
        "---\n"
    )
    return fm + opening + "\n" + rest


def convert_cursor(desc, body):
    opening = body.split("\n", 1)[0].replace("OpenCode", "Cursor")
    rest = body.split("\n", 1)[1] if "\n" in body else ""
    fm = (
        "---\n"
        f"name: better\n"
        f"description: {desc}\n"
        "model: inherit\n"
        "readonly: false\n"
        "---\n"
    )
    return fm + opening + "\n" + rest


def identity(text):
    return text


def generate(harness, src_path, out_path):
    with open(src_path, encoding="utf-8") as fh:
        text = fh.read()
    fm, body = parse_frontmatter(text)
    desc = extract_description(fm)
    converters = {
        "opencode": lambda: identity(text),
        "claude": lambda: convert_claude(desc, body),
        "cursor": lambda: convert_cursor(desc, body),
    }
    if harness not in converters:
        raise ValueError(f"unknown harness: {harness}")
    out = converters[harness]()
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(out)
    return out_path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--harness", required=True, choices=["opencode", "claude", "cursor", "all"])
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", default=None, help="destination file (single harness)")
    ap.add_argument("--out-dir", default=None, help="destination directory (harness=all)")
    args = ap.parse_args()

    if args.harness == "all":
        if not args.out_dir:
            ap.error("--out-dir required when --harness all")
        for h in ("opencode", "claude", "cursor"):
            out = f"{args.out_dir.rstrip('/')}/better-{h}.md"
            generate(h, args.src, out)
            print(out)
        return 0
    if not args.out:
        ap.error("--out required for a single harness")
    try:
        print(generate(args.harness, args.src, args.out))
        return 0
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
