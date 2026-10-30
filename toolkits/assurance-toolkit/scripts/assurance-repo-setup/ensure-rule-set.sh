#!/usr/bin/env bash
# Ensures the main branch ruleset requires the `context` check
# (required_status_checks). Idempotent. RULESET format (not classic branch
# protection): `required_status_checks` parameter as an array of {context}.
set -euo pipefail

REPO="${1:?repo (owner/name)}"
OWNER="${2:?owner}"
CONTEXT="${3:-megalinter}"

"${PYTHON:-python3}" - "$REPO" "$OWNER" "$CONTEXT" <<'PY'
import json, os, subprocess, sys

repo, owner, context = sys.argv[1], sys.argv[2], sys.argv[3]
SCRIPTS = os.environ.get("ASSURANCE_SCRIPTS_DIR") or os.getcwd()
TPL = os.path.join(SCRIPTS, "templates", "ruleset-main.json.tpl")

def gh(method, path, body=None):
    cmd = ["gh", "api", "--method", method, "-H", "Accept: application/vnd.github+json", path]
    tmp = None
    if body is not None:
        fd, tmp = tempfile.mkstemp(suffix=".json")
        with os.fdopen(fd, "w") as f:
            json.dump(body, f)
        cmd += ["--input", tmp]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if tmp is not None:
        os.unlink(tmp)
    if p.returncode != 0:
        raise SystemExit(p.stderr.strip() or p.stdout.strip())
    return json.loads(p.stdout) if p.stdout.strip() else None

import tempfile

rulesets = gh("GET", f"repos/{repo}/rulesets") or []
target = None
for rs in rulesets:
    if rs.get("target") != "branch":
        continue
    try:
        full = gh("GET", f"repos/{repo}/rulesets/{rs['id']}")
    except Exception:
        continue
    inc = ((full.get("conditions") or {}).get("ref_name") or {}).get("include") or []
    # The ruleset listing does NOT return `conditions`; the individual GET does.
    if "refs/heads/main" in inc:
        target = full
        break

if target is None:
    with open(TPL, encoding="utf-8") as fh:
        body = fh.read().replace("__OWNER__", owner).replace("__CHECK_CONTEXT__", context)
    payload = json.loads(body)
    created = gh("POST", f"repos/{repo}/rulesets", payload)
    print(f"assurance-setup: created ruleset {created['id']} with required_status_checks={context}")
    sys.exit(0)

rules = target.get("rules") or []
has = False
for r in rules:
    if r.get("type") == "required_status_checks":
        ctxs = (r.get("parameters") or {}).get("required_status_checks") or []
        if any(c.get("context") == context for c in ctxs):
            has = True

if has:
    print(f"assurance-setup: ruleset {target['id']} already requires {context}")
    sys.exit(0)

rules.append({
    "type": "required_status_checks",
    "parameters": {
        "required_status_checks": [{"context": context}],
        "strict_required_status_checks_policy": True,
    },
})
body = {
    "name": target["name"],
    "enforcement": target.get("enforcement"),
    "conditions": target.get("conditions"),
    "rules": rules,
}
if target.get("bypass_actors") is not None:
    body["bypass_actors"] = target["bypass_actors"]
gh("PUT", f"repos/{repo}/rulesets/{target['id']}", body)
print(f"assurance-setup: ruleset {target['id']} now requires {context}")
PY
