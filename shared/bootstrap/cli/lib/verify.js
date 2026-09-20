/** Verify phase: bytes match + offline detect.py gate + commands --check. */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  resolveRepoRoot,
  resolveAdapterPath,
  discoveryIndex,
  commandsScript,
  detectScript,
} from "./paths.js";

export function verify(opts = {}) {
  const repoRoot = resolveRepoRoot();
  const results = [];
  const add = (check, ok, detail) => results.push({ check, ok, detail });

  // 1. discovery copy bytes match
  let adapter = null;
  try {
    adapter = resolveAdapterPath(repoRoot);
  } catch (err) {
    add("discovery copy", false, err.message);
  }
  if (adapter) {
    let same = false;
    try {
      same =
        Buffer.compare(readFileSync(adapter), readFileSync(discoveryIndex())) === 0;
    } catch {
      same = false;
    }
    add("discovery copy", same, same ? "bytes match source" : "missing or stale");
  }

  // 2. offline gate: detect.py must exit 2 on a silenced-stderr probe.
  // Probe is written to a temp file with the editor (writeFileSync) and
  // passed via argv — never typed in a shell, so the live hook can't block it.
  try {
    const dir = mkdtempSync(join(tmpdir(), "bt-verify-"));
    const probeFile = join(dir, "probe.txt");
    writeFileSync(probeFile, "gh api user 2>err.log\n");
    // Build a silenced variant programmatically (no literal in shell):
    const silencedCmd = Buffer.concat([
      Buffer.from("gh api user 2"),
      Buffer.from(">"),
      Buffer.from("/dev/null"),
    ]).toString("utf8");
    const code = runDetect(repoRoot, silencedCmd);
    add("offline gate (detect.py)", code === 2, `exit ${code} (want 2)`);
    const cleanCode = runDetect(repoRoot, "gh api user 2>err.log");
    add("clean command allowed", cleanCode === 0, `exit ${cleanCode} (want 0)`);
  } catch (err) {
    add("offline gate (detect.py)", false, String(err?.message ?? err).split("\n")[0]);
  }

  // 3. commands wiring
  try {
    execFileSync("bash", [commandsScript(repoRoot), "--check"], {
      stdio: "pipe",
      timeout: 30000,
    });
    add("commands --check", true, "CHECK OK");
  } catch {
    add("commands --check", false, "expected links missing");
  }

  // 4. plugin loaded (best effort)
  try {
    const out = execFileSync("opencode", ["plugin", "list"], {
      encoding: "utf8",
      timeout: 15000,
    });
    const loaded = out.includes("mnm-no-stderr-redirect");
    add("plugin loaded", loaded, loaded ? "local.mnm-no-stderr-redirect" : "not in plugin list — restart service");
  } catch (err) {
    add("plugin loaded", false, `opencode plugin list failed: ${String(err?.message ?? err).split("\n")[0]}`);
  }

  return results;
}

function runDetect(repoRoot, command) {
  try {
    execFileSync("python3", [detectScript(repoRoot), "--command", command], {
      stdio: "pipe",
      timeout: 30000,
    });
    return 0;
  } catch (err) {
    return typeof err.status === "number" ? err.status : 1;
  }
}

export function printVerify(results) {
  let failed = 0;
  for (const r of results) {
    console.log(`  [${r.ok ? "OK" : "FAIL"}] ${r.check} — ${r.detail}`);
    if (!r.ok) failed++;
  }
  return failed;
}
