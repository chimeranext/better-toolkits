#!/usr/bin/env python3
"""Render BSL-1.1 LICENSE files from scripts/legal/bsl-license.template.md."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = Path(__file__).with_name("bsl-license.template.md").read_text(encoding="utf-8")

TOOLKITS = [
    "aaarrr-flywheel-toolkit",
    "app-gtm-release-toolkit",
    "atomic-design-toolkit",
    "business-model-toolkit",
    "fractional-cto-toolkit",
    "instructional-design-toolkit",
    "launchpad-toolkit",
    "make-no-mistakes-toolkit",
    "ux-research-toolkit",
    "venture-studio-toolkit",
]


def render(name: str) -> str:
    return TEMPLATE.replace("{{LICENSED_WORK}}", name)


def main() -> None:
    (ROOT / "LICENSE").write_text(render("better-toolkits"), encoding="utf-8")
    for name in TOOLKITS:
        path = ROOT / "toolkits" / name / "LICENSE"
        path.write_text(render(name), encoding="utf-8")
        print(f"wrote {path.relative_to(ROOT)}")
    print(f"wrote LICENSE (root better-toolkits)")


if __name__ == "__main__":
    main()
