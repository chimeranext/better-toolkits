# Vite Audit Checklist

Bundle-health and modernization signals for Vite projects. Codified from the Seacrets.Online frontend modernization (April 2026), where a legacy multi-library setup was consolidated to Vite with a 55% asset-weight reduction and 93% fewer JS/CSS files.

Use this checklist during the **Bundle Health** phase of `/atomic-design-toolkit:audit` on any Vite codebase — React, Vue, Svelte, Solid, or vanilla (server-rendered templates + Vite for assets).

---

## The Ten Signals

Each signal has: detection command, severity tier, remediation, and the Seacrets evidence that motivated including it.

### 1. Duplicate Dependencies

**What it is:** The same library resolved at multiple versions inside `node_modules`, or loaded more than once on a page.

**Detect:**
```bash
# List every version of a suspect library resolved in the tree
npm ls jquery --all
npm ls bootstrap --all
npm ls lodash --all
npm ls react --all

# Sweep for any package resolved more than once
npm ls --all 2>/dev/null | awk '/deduped/ {next} /@/ {print $NF}' | sort | uniq -d
```

**Severity:** blocker if the library ships runtime code (jQuery, React, Vue) — causes silent conflicts; warning if it only affects build size.

**Remediation:** Add the library as a single top-level dependency; remove nested duplicates via `npm dedupe` or manual `resolutions` / `overrides` in `package.json`. Re-run the audit until every suspect lib resolves once.

**Seacrets evidence:** *"jQuery cargado 2 veces en algunas páginas — Conflictos silenciosos en funcionalidades."*

---

### 2. Legacy `public/` Assets Not Wired to Vite

**What it is:** JavaScript or CSS files sitting under Vite's `publicDir` (default `public/`) that are referenced by server-rendered HTML but never pass through the Vite pipeline — no hashing, no bundling, no tree-shaking.

**Detect:**
```bash
# List every JS/CSS under public/
find public -type f \( -name "*.js" -o -name "*.css" \) 2>/dev/null

# For each file, check if it is referenced by a Vite entry (rollupOptions.input)
# If not referenced and not intentional (fonts, favicons, worker binaries), it is legacy.
rg -t html -t blade -t twig -t ejs 'public/(js|css)/' -g '!node_modules' .
```

**Severity:** warning when the file still works; blocker when it duplicates logic already bundled by Vite.

**Remediation:** Move the module into `src/` (or `resources/js/`) as an ESM entry, import it from the Vite entrypoint, and delete the `public/` copy. If the file must stay at a stable path (e.g. `robots.txt`, `sw.js`), leave it but document the exception.

**Seacrets evidence:** *"Fase 3 — Eliminación de activos legados: borramos 554 archivos obsoletos de public/js y unificamos todo el CSS en Vite."*

---

### 3. Mixed Major Versions of UI Libraries

**What it is:** Two majors of the same UI framework coexisting — Bootstrap 4 + 5, Vue 2 + 3, Angular-material v14 + v16, MUI v4 + v5.

**Detect:**
```bash
# Bootstrap
npm ls bootstrap --all 2>/dev/null | grep -oE 'bootstrap@[0-9]+' | sort -u

# Vue
npm ls vue --all 2>/dev/null | grep -oE 'vue@[0-9]+' | sort -u

# Generic approach — any package with multiple majors
npm ls --all --json 2>/dev/null \
  | jq -r '.. | objects | select(.version) | .version as $v | .name as $n | "\($n)@\($v | split(".")[0])"' \
  | sort -u \
  | awk -F@ '{count[$1]++; vers[$1]=vers[$1]" "$2} END {for (k in count) if (count[k]>1) print k": "vers[k]}'
```

**Severity:** blocker — mixed majors usually means visual inconsistencies plus incompatible JS plugins.

**Remediation:** Pick the target major, migrate all usages, remove the old one. Version-check CSS tokens and JS plugins separately — they sometimes ship on different release cadences.

**Seacrets evidence:** *"Bootstrap v4 y v5 conviviendo — Conflictos visuales y comportamientos impredecibles."*

---

### 4. Vendorized Libraries Bypassing npm

**What it is:** Third-party code committed to the repo (often under `vendor/`, `public/lib/`, `public/vendor/`, or `resources/lib/`) that is already published on npm. It is invisible to `npm audit`, cannot be deduped, and tends to drift years behind the official release.

**Detect:**
```bash
# Common vendor locations — explicit paths only; never scan src/ or node_modules/
# (src/lib is application code in Vite projects and will false-positive on a naive grep)
find public/vendor public/lib public/libs resources/lib resources/vendor vendor/frontend 2>/dev/null \
  -type f \( -name "*.js" -o -name "*.css" -o -name "*.min.js" \)

# Signature: a library file with a version string in the header (same exclusions)
rg -U '^\s*\*?\s*(jQuery|Bootstrap|Plyr|SweetAlert|Select2|moment|lodash)\s+v?\d' \
  public resources vendor 2>/dev/null \
  -g '!src/**' -g '!node_modules/**' -g '!**/*.map'
```

**Do not** flag `src/lib/` — that is application code, not vendored libraries. The vendored-lib signal applies only to `public/`, `resources/`, or a top-level `vendor/` folder.

**Severity:** blocker for libraries with known CVEs; warning otherwise.

**Remediation:** Replace each vendorized copy with its npm equivalent, imported from a Vite entry. Delete the vendored file. Run `npm audit` immediately after to confirm no regressions surfaced.

**Seacrets evidence:** *"Librerías vendorizadas manualmente — Versiones desactualizadas sin parches de seguridad."* Fase 2A moved jQuery, SweetAlert, and Plyr to npm-managed dependencies.

---

### 5. Hashless Assets in Production HTML

**What it is:** `<script>` or `<link>` tags pointing to unhashed paths like `/js/app.js` or `/css/main.css`. The browser caches the path, so a deploy cannot reliably invalidate it — users end up on mixed old/new JS until they hard-refresh.

**Detect:**
```bash
# Render (or read) the production HTML and look for unhashed assets
# After a production build, Vite emits hashed filenames like app.abc123.js
# Any <script src> or <link href> without a hex suffix near the extension is suspect.
rg -t html -t blade -t twig '<(script|link)[^>]*(src|href)="[^"]*\.(js|css)"' dist/ public/index.html resources/views/ 2>/dev/null \
  | grep -vE '\.[a-f0-9]{6,}\.(js|css)"'
```

**Severity:** blocker in production — caching races cause real user-visible bugs.

**Remediation:** Use `@vite` / `vite-plugin-pwa` / framework helpers (e.g. Laravel's `@vite` directive, Django-vite) that emit the manifest-driven hashed URLs. Never hardcode an asset path.

**Seacrets evidence:** *"Sin sistema de caché confiable — Usuarios recibían versiones mezcladas en despliegues."* After the migration: *"Hash único por versión."*

---

### 6. Abandoned Dependencies

**What it is:** Packages last published years ago, majors behind the ecosystem, or explicitly archived by their maintainer.

**Detect:**
```bash
# Packages behind their latest major
npm outdated --long

# Packages that have not published in a long time
npm ls --all --json 2>/dev/null \
  | jq -r '.. | objects | select(.name) | .name' \
  | sort -u \
  | while read -r pkg; do
      last=$(npm view "$pkg" time.modified 2>/dev/null)
      echo "$pkg  $last"
    done \
  | awk '$2 < "'"$(date -d '3 years ago' +%Y-%m-%d)"'" {print}'
```

**Severity:** blocker for security-critical libraries (auth, crypto, validation, rich-text); warning for others.

**Remediation:** Migrate to a maintained replacement. When a direct replacement is not obvious, check the `awesome-*` lists for the ecosystem, or the package's GitHub README — abandoned packages usually link to their successor.

**Seacrets evidence:** *"SweetAlert v1 (versión 2012) — Librería sin soporte, con vulnerabilidades conocidas."* Replaced by maintained SweetAlert2.

---

### 7. No Dependency Audit in CI

**What it is:** The build pipeline never runs `npm audit`, `pnpm audit`, `yarn audit`, or an equivalent SCA step. Vulnerabilities are only caught when someone runs the command locally, if ever.

**Detect:**
```bash
# GitHub Actions
rg -l 'npm audit\|pnpm audit\|yarn audit\|osv-scanner\|trivy\|snyk' .github/workflows/ 2>/dev/null

# GitLab / CircleCI / Codemagic
rg -l 'npm audit\|pnpm audit\|yarn audit' .gitlab-ci.yml .circleci/config.yml codemagic.yaml 2>/dev/null
```

If none of those commands appear anywhere, the check fails.

**Severity:** warning on its own; blocker when combined with signals #4 or #6.

**Remediation:** Add a step that runs `npm audit --audit-level=high` (or `pnpm audit`, `yarn audit`) on every PR. Fail the build on high/critical findings; track moderate ones in an issue.

**Seacrets evidence:** Before — *"Auditoría de seguridad: Manual, sin registro."* After — *"npm audit automático en CI/CD."*

---

### 8. No HMR in Dev

**What it is:** The dev loop does a full-page reload on every change because HMR is disabled, broken, or the project serves pre-built assets during development. Productivity drops from seconds per iteration to minutes.

**Detect:**
```bash
# Explicit HMR disable
rg 'hmr\s*:\s*false\|server\.hmr\s*=\s*false' vite.config.*

# Framework-specific blockers: e.g. React without the react-refresh plugin
grep -q '@vitejs/plugin-react' package.json || echo "React project missing plugin-react (no Fast Refresh)"

# Vanilla projects: confirm the HTML loads /@vite/client during dev (not just the built bundle)
# If the dev server serves production bundles, HMR will not work even if it is enabled.
```

**Severity:** warning. Not a user-facing bug, but a developer productivity tax that silently slows the team.

**Remediation:** Enable `server.hmr`, add the framework Fast Refresh plugin, ensure the dev server (not the build output) is serving during development. For SSR frameworks, use the official Vite integration (Laravel Vite, Django-vite, etc.).

**Seacrets evidence:** Before — *"Cambio código → navegador: Minutos (reload completo)."* After — *"Instantáneo (HMR)."*

---

### 9. No Visual Regression Testing

**What it is:** The project has no automated way to catch unintended UI changes. Regressions rely on manual QA or user bug reports.

**Detect:**
```bash
# Playwright with screenshot assertions
rg -l 'toHaveScreenshot\|toMatchScreenshot' tests/ e2e/ 2>/dev/null

# Chromatic / Percy / Loki configs
ls chromatic.config.json .percy.yml .loki.json 2>/dev/null

# Storybook test runner
rg -l '@storybook/test-runner' package.json
```

**Severity:** warning when the project is a single-team internal tool; blocker when it serves end users and ships frequently.

**Remediation:** Add Playwright with `toHaveScreenshot()` assertions for critical pages, or wire Chromatic / Percy to Storybook. Gate the pipeline on visual diffs requiring review.

**Seacrets evidence:** *"Pipeline de pruebas Playwright integrado con Vite permite detectar regresiones visuales automáticamente antes de cada despliegue."*

---

### 10. Dual / Competing Lockfiles

**What it is:** Two package-manager lockfiles coexist in the repo (e.g. `bun.lock` + `package-lock.json`, or `pnpm-lock.yaml` + `yarn.lock`). The project declares one package manager but another lockfile survives from an earlier migration. Lockfiles drift silently; CI may install from the wrong tool; devs resolve different trees locally.

**Detect:**
```bash
# List every lockfile at repo root
ls bun.lock bun.lockb package-lock.json pnpm-lock.yaml yarn.lock 2>/dev/null

# Cross-check against the declared package manager
grep -E '"packageManager"\s*:\s*"(bun|npm|pnpm|yarn)' package.json
```

If the count of lockfiles is greater than one, or the surviving lockfile does not match `packageManager`, fail the check.

**Severity:** warning — rarely a live incident, but a latent drift risk that compounds with signal #1 (duplicate dependencies).

**Remediation:** Keep only the lockfile matching `packageManager`. Delete the others, add them to `.gitignore`, and document the single package manager in README / CLAUDE.md. Run a clean install from the chosen tool immediately after to regenerate a fresh authoritative lockfile.

**Added:** discovered during the example-platform audit (April 2026) — `bun.lock` + `package-lock.json` coexisted under `"packageManager": "bun@1.3.10"`.

---

## Atomic-Design Enforcement Signals (V7)

Bundle health (signals 1-10) measures *what is broken today*. The seven enforcement signals below measure *whether the project will drift again tomorrow*. Codified from the legacy-ticket component-layer Conway's Law premortem (example-platform, 2026-05-14) and the four-cure defense-in-depth pattern documented in `references/atomic-design-hooks-setup.md`.

Each enforcement signal is reported in the audit with a stable ID `E{n}` (distinct from `B`/`W`/`I` so the migrate command can route them to a different remediation phase).

### Severity matrix

Enforcement severity depends on what bundle-health + component-inventory passes already found:

| State | Severity per missing cure |
|-------|---------------------------|
| All four cures present | `info` (recorded in Passing checks) |
| 1-3 cures missing, no V1-V5 drift | `warning` |
| 1-3 cures missing, V1-V5 drift detected | `blocker` |
| 0 cures present, no V1-V5 drift | `warning` |
| 0 cures present, V1-V5 drift detected | **top E-finding escalated to `blocker`** per premortem §5.2 ($324K forward extrapolation) |

### 11. Repo-level PreToolUse hook for component placement (E1)

**What it is:** A `.claude/hooks/pre-write-component-location.sh` (or equivalent name following the consumer convention) that intercepts `Write` / `Edit` tool calls, reads `.atomic-design-rules.json`, and blocks writes to non-canonical paths under the components root.

**Detect:**
```bash
ls .claude/hooks/ 2>/dev/null | grep -E 'pre-write.*component|pre-tool-use.*component'
jq -e '.hooks.PreToolUse' .claude/settings.json
```

**Remediation:** Install from `make-no-mistakes-toolkit@>=1.14` or copy the canonical template from `references/atomic-design-hooks-setup.md`. Wire into `.claude/settings.json` `hooks.PreToolUse`.

**Why it matters:** This is the only check that operates at write-time. CI is too late; agent rules are advisory; ownership docs are passive.

### 12. Repo-level PostToolUse hook for drift signals (E2)

**What it is:** A `.claude/hooks/post-write-component-callsites.sh` that warns when a freshly written component has no importers (catches dead-code-at-birth, the kind of file that becomes a "two dead `DashboardHeader.tsx`" finding six months later).

**Detect:**
```bash
ls .claude/hooks/ 2>/dev/null | grep -E 'post-write.*component|post-tool-use'
jq -e '.hooks.PostToolUse' .claude/settings.json
```

**Remediation:** Install from `make-no-mistakes-toolkit@>=1.14`. The hook is non-blocking (warns rather than rejects) — it surfaces drift in real time so the contributor can self-correct before opening a PR.

### 13. Toolkit-level hooks installed (E3)

**What it is:** The repo depends on a shared toolkit (e.g. `make-no-mistakes-toolkit@>=1.14`) that ships generic hooks. This is the cross-repo defense: if the toolkit is updated, every consumer inherits the new enforcement automatically.

**Detect:**
```bash
grep -q 'make-no-mistakes-toolkit' package.json 2>/dev/null && \
  find node_modules/make-no-mistakes-toolkit/.claude/hooks -type f 2>/dev/null | head -1
```

**Remediation:** Add the toolkit as a dependency at the minimum version that ships hooks (v1.14+). For projects that maintain their own toolkit, mirror the hook pattern at the toolkit root so every downstream repo inherits it.

### 14. `.atomic-design-rules.json` at repo root (E4)

**What it is:** The contract the hooks enforce. Declares the pillar list, atomic taxonomy, monolith line limit, exception marker, and any active anti-patterns.

**Detect:**
```bash
test -f .atomic-design-rules.json && jq -e '.pillars | length > 0' .atomic-design-rules.json
```

**Remediation:** Create the file at repo root using the schema in `references/atomic-design-hooks-setup.md` §"Declare the consumer's atomic-design rules". Without this file, the hooks have nothing to enforce.

**Severity note:** E4 is usually the keystone — its absence implies E1/E2 cannot be effective even if they exist. When E4 is missing, list E1/E2/E3 as `Blocked by: E4` in the report.

### 15. CLAUDE.md / AGENTS.md atomic-design rule (E5)

**What it is:** A section in CLAUDE.md or AGENTS.md that names the pillar list, the atomic taxonomy, and the exception marker convention. This is the agent-context cure — it teaches agents the rule before a hook has to block them.

**Detect:**
```bash
rg -i 'atomic.?design|pillar.{0,20}taxonomy|atoms/molecules/organisms' CLAUDE.md AGENTS.md 2>/dev/null | head -3
```

**Remediation:** Add a short section (10-20 lines) that references `.atomic-design-rules.json` as the source of truth and names the canonical pillars. See `references/atomic-design-hooks-setup.md` §"Mirror the rule in CLAUDE.md / AGENTS.md".

### 16. CI workflow with atomic-design lint (E6)

**What it is:** A CI workflow that runs a structural / atomic-design / components guard script on every PR, providing a second line of defense after the local hooks.

**Detect:**
```bash
rg -l 'components-guard|atomic-design-guard|structural-guard|atomic-design-rules' \
  .github/workflows/ .gitlab-ci.yml 2>/dev/null
# Bonus: an `atomic:lint` or `lint:components` target in package.json scripts
jq -r '.scripts | keys[]' package.json 2>/dev/null | grep -iE 'atomic|components.*lint|lint.*components'
```

**Remediation:** Add a CI step that runs the structural guard script (analog of example-platform's `primitives-guard.ts` for legacy-ticket). Fail the build on violations; require an approved exception comment to override.

### 17. Pre-commit hook with atomic-design guard (E7)

**What it is:** A pre-commit hook (via lefthook, husky, or pre-commit framework) that runs the structural guard before the commit is created — catching drift even earlier than CI.

**Detect:**
```bash
cat lefthook.yml .lefthook.yml 2>/dev/null | rg 'atomic|component-guard'
ls .husky/ 2>/dev/null && rg -l 'atomic|component-guard' .husky/ 2>/dev/null
rg 'atomic|component-guard' .pre-commit-config.yaml 2>/dev/null
```

**Remediation:** Wire the structural guard script into the project's existing pre-commit framework (or add lefthook / husky if none exists). Pre-commit hooks are bypassable by `--no-verify`, so they complement but do not replace the PreToolUse hook (E1) and the CI lint (E6).

---

## Report Snippet

Fold the findings into the main audit report under the **Bundle Health Findings** section:

```markdown
### Bundle Health Findings
| # | Signal | Severity | Evidence | Remediation |
|---|--------|----------|----------|-------------|
| 1 | Duplicate dependencies (jquery@1.12, jquery@3.6) | blocker | `npm ls jquery --all` | Dedupe to jquery@3.6; remove nested |
| 2 | 14 legacy files in public/js | warning | `find public/js -name '*.js'` | Import via Vite entry; delete public copies |
| 3 | bootstrap@4 + bootstrap@5 coexisting | blocker | `npm ls bootstrap` | Migrate all usages to v5; drop v4 |
| 4 | Vendored SweetAlert v1 in public/vendor | blocker | `public/vendor/sweetalert/sweetalert.min.js` | Replace with sweetalert2 from npm |
| 5 | Hashless `<script src="/js/app.js">` in layouts/main.blade.php | blocker | `resources/views/layouts/main.blade.php:12` | Switch to `@vite('resources/js/app.js')` |
| 6 | SweetAlert v1 not updated since 2012 | blocker | `npm view sweetalert time.modified` | Migrate to sweetalert2 |
| 7 | No `npm audit` step in .github/workflows/*.yml | warning | (none found) | Add `npm audit --audit-level=high` |
| 8 | HMR disabled (server.hmr: false) | warning | `vite.config.ts:14` | Enable HMR; add `@vitejs/plugin-react` |
| 9 | No Playwright screenshots or Chromatic | warning | (no config found) | Add Playwright `toHaveScreenshot()` on critical flows |
```

And under a separate sub-section for the enforcement signals:

```markdown
### Atomic-Design Enforcement Findings
| ID | Cure Layer | Severity | Evidence | Remediation |
|----|-----------|----------|----------|-------------|
| E1 | Repo PreToolUse hook (component placement) | warning | (no matching script in .claude/hooks/) | Install from make-no-mistakes-toolkit v1.14+ |
| E2 | Repo PostToolUse hook (drift signals) | warning | (no matching script in .claude/hooks/) | Install from make-no-mistakes-toolkit v1.14+ |
| E3 | Toolkit hooks installed | warning | make-no-mistakes-toolkit not in package.json | Add toolkit dependency >=1.14 |
| E4 | .atomic-design-rules.json | **blocker** | (file not at repo root) | Create per atomic-design-hooks-setup.md schema |
| E5 | CLAUDE.md / AGENTS.md atomic-design rule | warning | No 'atomic design' match in CLAUDE.md | Add section per atomic-design-hooks-setup.md |
| E6 | CI workflow lint | warning | No matching script in .github/workflows/ | Add structural-guard step to CI |
| E7 | Pre-commit hook | info | No lefthook / husky config detected | Wire structural-guard into lefthook |
```

## Methodology Notes

- **Run checks in order** — signal #1 (duplicates) often hides signals #3 (mixed majors) and #4 (vendorized). Fixing duplicates surfaces cleaner evidence for the rest.
- **Evidence beats opinion** — every finding must cite a command output or file path. If a check cannot produce evidence, downgrade it to a manual TODO rather than flagging it as a blocker.
- **Re-audit after remediation** — signal counts should drop monotonically between passes. If they don't, the remediation did not land.
