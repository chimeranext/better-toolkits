# Spec — /publish-better-toolkits-update

## ADDED Requirements

### Requirement: Genera tarballs de los 5 MCP servers

El comando `/publish-better-toolkits-update` SHALL generar un tarball por cada MCP
server local (`notion-chimeranext`, `posthog-chimeranext`, `google-workspace-apps`,
`social-media-ads-mcp`, `stitch-chimeranext`) desde su fuente en `shared/mcp/` y
`shared/mcp/google-workspace-apps/`, y colocarlo en `apps/web/public/mcp/<name>.tar.gz`.

#### Scenario: Los 5 assets se generan

- **WHEN** se ejecuta `/publish-better-toolkits-update`
- **THEN** los 5 archivos `apps/web/public/mcp/<name>.tar.gz` existen y contienen el
  `package.json` + código del server correspondiente.

#### Scenario: El asset es reproducible

- **WHEN** se ejecuta el comando dos veces sobre el mismo commit
- **THEN** el contenido de cada tarball es determinístico para ese commit.

### Requirement: Actualiza el marketplace cuando hay cambios release-relevantes

El comando SHALL aplicar el mismo gate de bump que el pre-push
(`scripts/ci/marketplace_versioning.py write --range origin/main..HEAD`) cuando
existan cambios release-relevantes en el rango, e informar qué plugins se bumpearon.

#### Scenario: Hay cambios release-relevantes

- **WHEN** el rango `origin/main..HEAD` contiene cambios en `commands/`, `references/`,
  `skills/`, o `hooks/` de un plugin
- **THEN** el comando bumpea la versión de ese plugin en `.claude-plugin/marketplace.json`.

#### Scenario: No hay cambios release-relevantes

- **WHEN** el rango no contiene cambios release-relevantes
- **THEN** el comando no bumpea ninguna versión y lo informa.

### Requirement: Deploya el sitio

El comando SHALL deployar `apps/web` para que los assets y el `install-opencode.sh`
queden publicados en `toolkits.chimeranext.dev`.

#### Scenario: El deploy se dispara

- **WHEN** se ejecuta `/publish-better-toolkits-update --deploy`
- **THEN** se ejecuta el pipeline de deploy de `apps/web` (build + publish a GitHub Pages).

#### Scenario: Modo dry-run

- **WHEN** se ejecuta `/publish-better-toolkits-update --dry-run`
- **THEN** el comando imprime el plan (assets a generar, plugins a bumpear, deploy)
  sin escribir nada en disco.
