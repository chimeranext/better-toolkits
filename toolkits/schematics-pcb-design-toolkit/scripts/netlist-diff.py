#!/usr/bin/env python3
"""netlist-diff — compare two KiCad .net files.

Reports added/removed components, added/removed nets, and connectivity changes.
Outputs a JSON diff report.

Usage: netlist-diff.py old.net new.net
"""
import json
import re
import sys
from pathlib import Path


def parse_netlist(path: Path) -> dict:
    """Very small KiCad netlist parser (node/net grouping)."""
    text = path.read_text(errors="replace")
    nodes = {}
    current_node = None
    for line in text.splitlines():
        m = re.search(r"\(node\s+\(ref\s+([^)]+)\)\s+\(pin\s+([^)]+)\)", line)
        if m:
            ref, pin = m.group(1).strip(), m.group(2).strip()
            nodes.setdefault(current_node, []).append(f"{ref}.{pin}")
            continue
        m = re.search(r"\(net\s+\(code\s+(\d+)\)\s+\(name\s+([^)]+)\)", line)
        if m:
            current_node = m.group(2).strip()
    return nodes


def diff(old: dict, new: dict) -> dict:
    old_nets, new_nets = set(old), set(new)
    return {
        "nets_added": sorted(new_nets - old_nets),
        "nets_removed": sorted(old_nets - new_nets),
        "components_removed": sorted(set(c for list_ in old.values() for c in list_) - set(c for list_ in new.values() for c in list_)),
        "components_added": sorted(set(c for list_ in new.values() for c in list_) - set(c for list_ in old.values() for c in list_)),
        "connectivity_changed": sorted(new_nets & old_nets),
    }


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: netlist-diff.py old.net new.net", file=sys.stderr)
        return 2
    old, new = map(Path, sys.argv[1:3])
    print(json.dumps(diff(parse_netlist(old), parse_netlist(new)), indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
