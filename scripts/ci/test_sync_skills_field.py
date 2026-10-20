"""package.json skills field matches SKILL.md directories."""

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


def _load():
    path = Path(__file__).resolve().parent / "sync_skills_field.py"
    spec = importlib.util.spec_from_file_location("sync_skills_field", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class SyncSkillsFieldTest(unittest.TestCase):
    def test_write_preserves_package_and_check_rejects_drift(self) -> None:
        mod = _load()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plugin = root / "toolkits" / "example"
            (plugin / ".claude-plugin").mkdir(parents=True)
            (plugin / "skills" / "alpha").mkdir(parents=True)
            (plugin / "skills" / "alpha" / "SKILL.md").write_text("---\nname: alpha\n---\n", encoding="utf-8")
            (plugin / ".claude-plugin" / "plugin.json").write_text(
                json.dumps({"name": "example", "version": "1.2.3", "license": "BSL-1.1"}) + "\n",
                encoding="utf-8",
            )
            (plugin / "package.json").write_text(
                json.dumps({"name": "@chimeranext/example", "version": "9.9.9", "private": True}) + "\n",
                encoding="utf-8",
            )
            (root / ".claude-plugin").mkdir()
            (root / ".claude-plugin" / "marketplace.json").write_text(
                json.dumps(
                    {"plugins": [{"name": "example", "version": "1.2.3", "source": "./toolkits/example"}]}
                )
                + "\n",
                encoding="utf-8",
            )
            (root / "shared" / "skills" / "requirements-authoring").mkdir(parents=True)
            (root / "shared" / "skills" / "requirements-authoring" / "SKILL.md").write_text("# r\n", encoding="utf-8")

            self.assertEqual(mod.cmd_write(root), 0)
            pkg = json.loads((plugin / "package.json").read_text(encoding="utf-8"))
            self.assertEqual(pkg["version"], "9.9.9")
            self.assertEqual(
                pkg["skills"],
                [{"source": "chimeranext/better-toolkits", "skills": ["alpha"]}],
            )
            self.assertEqual(mod.cmd_check(root), 0)
            pkg["skills"][0]["skills"] = []
            (plugin / "package.json").write_text(json.dumps(pkg) + "\n", encoding="utf-8")
            self.assertEqual(mod.cmd_check(root), 1)


if __name__ == "__main__":
    unittest.main()
