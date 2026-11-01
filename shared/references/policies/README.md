# Policies — machine-readable org policy (SSOT)

Este directorio es la **fuente única** de la política de ingeniería de la org (estilo
Group Policies). `policies.yml` es machine-readable; `policies.schema.json` lo valida.
La prosa (p.ej. `docs/git-merge-policy.md`, playbooks) solo referencia este YAML, no
lo reemplaza.

## Contenido

| Archivo | Rol |
|---|---|
| `policies.yml` | SSOT de la política (merge method, historia lineal, etc.) |
| `policies.schema.json` | JSON Schema (draft-07) que valida `policies.yml` |
| `propagate-policies.sh` | Distribuye `policies.yml` a repos consumer vía `repository_dispatch` |
| `apply-policies.sh` | Materializa la política en un repo consumer (`linear-setup.json`, rulesets, hooks) |
| `audit-policies.sh` | Reporte de drift entre política y estado real (OK/GAP/no-enforced) |
| `README.md` | Este archivo |

## Capas de enforcement

| Capa | Dónde | Qué enforcea |
|---|---|---|
| GitHub ruleset | server (repo/org) | merge method = `merge`; no squash/rebase |
| Hook `no-squash` | local (harness) | bloquea `gh pr merge --squash` |
| Audit CI | CI / `/audit-policies` | compara `policies.yml` vs estado real |

## Propagación por el GitHub App (GitHub Actions)

- **Repo de políticas** (better-toolkits): `.github/workflows/propagate-policies.yml`
  corre `propagate-policies.sh` al cambiar `policies.yml` y emite
  `repository_dispatch` (`policies-updated`) a cada consumer.
- **Consumer repo**: `.github/workflows/apply-policies.yml` corre
  `apply-policies.sh` en ese evento.

Permisos requeridos del GitHub App (manuales, en github.com):
- `contents: write`, `pull-requests: write` (para apply/PRs).
- `repository_administration: read` (para leer/verificar rulesets de repo).

## Uso

```bash
# validar la política
python3 -c 'import yaml,json; from jsonschema import validate; validate(yaml.safe_load(open("shared/references/policies/policies.yml")), json.load(open("shared/references/policies/policies.schema.json")))'

# propagar (dry-run)
bash shared/references/policies/propagate-policies.sh --dry-run --repo chimeranext/foo

# auditar el repo actual
bash shared/references/policies/audit-policies.sh
```
