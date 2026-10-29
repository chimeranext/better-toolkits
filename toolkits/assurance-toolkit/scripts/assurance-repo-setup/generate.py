#!/usr/bin/env python3
"""GENERADOR de /assurance-setup.

Genera los archivos del gate en un repo destino desde templates, y (opcional)
asegura el ruleset y verifica el repo de evidencia.

Uso:
  python3 generate.py [repo] [--force] [--no-ruleset] [--audit-repo <org/repo>]
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

TPL_DIR = Path(__file__).resolve().parent / "templates"

# Stack -> items ENABLE (MegaLinter descriptors)
BASE_ENABLE = ["BASH", "MARKDOWN", "YAML", "JSON", "ACTION"]
PY_ENABLE = ["PYTHON"]
DISABLE_ERRORS = ["YAML_YAMLLINT", "PYTHON_RUFF"]


def detect_stack(repo: Path) -> dict:
    ts = (
        (repo / "tsconfig.json").exists()
        or (repo / "shared/hooks/tsconfig.json").exists()
    )
    py = any(repo.rglob("*.py"))
    return {"ts": ts, "python": py}


def render(path: str, **repl: str) -> str:
    text = (TPL_DIR / path).read_text(encoding="utf-8")
    for k, v in repl.items():
        text = text.replace(k, v)
    return text


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("repo", nargs="?", default=".")
    ap.add_argument("--force", action="store_true", help="sobreescribir archivos existentes")
    ap.add_argument("--no-ruleset", action="store_true")
    ap.add_argument("--audit-repo", default="chimeranext/internal-audits")
    ap.add_argument("--repo-slug", default=None, help="owner/name del repo (default: derive de remote)")
    args = ap.parse_args()

    repo = Path(args.repo).resolve()

    slug = args.repo_slug
    owner = ""
    if slug is None and repo.is_dir():
        r = subprocess.run(
            ["git", "-C", str(repo), "remote", "get-url", "origin"],
            capture_output=True, text=True,
        )
        if r.returncode == 0 and r.stdout.strip():
            url = r.stdout.strip().removesuffix(".git")
            slug = url.rstrip("/").split("/")[-2:]  # [owner, name]
            if len(slug) == 2:
                owner, name = slug
                slug = f"{owner}/{name}"
    if slug is None:
        slug = "?/?"
        owner = "?"
    elif not owner:
        owner = slug.split("/")[0]
    stack = detect_stack(repo)

    enable_items = list(BASE_ENABLE)
    dis_items = list(DISABLE_ERRORS)
    if stack["python"]:
        enable_items += PY_ENABLE
    enable_block = "\n".join(f"  - {x}" for x in enable_items) + "\n"
    dis_block = "\n".join(f"  - {x}" for x in dis_items) + "\n"

    targets = {
        ".mega-linter.yml": render(
            "mega-linter.yml.tpl",
            __ENABLE_ITEMS__=enable_block,
            __DISABLE_ERRORS_ITEMS__=dis_block,
        ),
        ".github/workflows/megalinter.yml": render("workflow-megalinter.yml.tpl"),
        ".github/workflows/bypass-audit.yml": render(
            "workflow-bypass-audit.yml.tpl",
            __AUDIT_REPO__=args.audit_repo,
        ),
    }
    if stack["ts"]:
        targets["shared/hooks/tsconfig.json"] = render("tsconfig.base.json.tpl")

    for rel, content in targets.items():
        dst = repo / rel
        if dst.exists() and not args.force:
            print(f"assurance-setup: exists (skip) {rel}")
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(content, encoding="utf-8")
        print(f"assurance-setup: wrote {rel}")

    # helpers
    here = Path(__file__).resolve().parent
    if not args.no_ruleset and _gh_available():
        env = dict(os.environ)
        env["ASSURANCE_SCRIPTS_DIR"] = str(here)
        subprocess.run(
            ["bash", str(here / "ensure-rule-set.sh"), slug, owner, "megalinter"],
            env=env,
        )
    subprocess.run(["bash", str(here / "ensure-audit-repo.sh"), args.audit_repo])

    print(f"assurance-setup: state repo={slug} stack_ts={stack['ts']} python={stack['python']} ruleset={'skip' if args.no_ruleset else 'ensure'}")
    return 0


def _gh_available() -> bool:
    try:
        subprocess.run(["gh", "--version"], capture_output=True)
        return True
    except Exception:
        return False


if __name__ == "__main__":
    raise SystemExit(main())
