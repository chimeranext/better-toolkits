"""Manifest sync writes a catalog that check accepts, and rejects drift."""

from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


def _load():
    path = Path(__file__).resolve().parent / "sync_toolkit_manifests.py"
    spec = importlib.util.spec_from_file_location("sync_toolkit_manifests", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


class SyncToolkitManifestsTest(unittest.TestCase):
    def test_write_then_check_roundtrip(self) -> None:
        mod = _load()
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plugin = root / "toolkits" / "example"
            (plugin / ".claude-plugin").mkdir(parents=True)
            (plugin / "skills" / "alpha").mkdir(parents=True)
            (plugin / "skills" / "alpha" / "SKILL.md").write_text("---\nname: alpha\n---\n", encoding="utf-8")
            (plugin / "commands").mkdir()
            (plugin / "commands" / "ship.md").write_text("# ship\n", encoding="utf-8")
            (plugin / "hooks" / "stderr").mkdir(parents=True)
            (plugin / ".claude-plugin" / "plugin.json").write_text(
                json.dumps({"name": "example", "version": "1.2.3"}) + "\n",
                encoding="utf-8",
            )
            (root / ".claude-plugin").mkdir()
            (root / ".claude-plugin" / "marketplace.json").write_text(
                json.dumps(
                    {
                        "plugins": [
                            {
                                "name": "example",
                                "version": "1.2.3",
                                "source": "./toolkits/example",
                            }
                        ]
                    }
                )
                + "\n",
                encoding="utf-8",
            )
            (root / "shared" / "skills" / "requirements-authoring").mkdir(parents=True)
            (root / "shared" / "skills" / "requirements-authoring" / "SKILL.md").write_text(
                "# req\n",
                encoding="utf-8",
            )

            self.assertEqual(mod.cmd_write(root), 0)
            self.assertEqual(mod.cmd_check(root), 0)
            doc = json.loads((plugin / "toolkit.json").read_text(encoding="utf-8"))
            self.assertEqual(doc["skills"], ["alpha"])
            self.assertEqual(doc["commands"], ["ship"])
            self.assertEqual(doc["hooks"], ["stderr"])
            self.assertEqual(doc["version"], "1.2.3")

            drifted = dict(doc)
            drifted["skills"] = []
            (plugin / "toolkit.json").write_text(json.dumps(drifted) + "\n", encoding="utf-8")
            self.assertEqual(mod.cmd_check(root), 1)


if __name__ == "__main__":
    unittest.main()
