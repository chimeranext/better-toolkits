<div align="center">

# 🌈 Heimdall

**Reviewer de Pull Requests con IA — multi-proveedor, standalone, MIT.**

> Consolidado en este monorepo (`shared/heimdall/`) desde el repo
> standalone `chimeranext/heimdall` (archivable). El comando de uso
> diario es el skill **`/local-pr-review`** (`shared/skills/local-pr-review/`),
> cuyo protocolo SSOT es **Heimdall** (`shared/references/heimdall/protocol.md`).

**Reviewer de Pull Requests con IA — multi-proveedor, standalone, MIT.**

Lee el diff de un PR (o de tu rama local), razona sobre los cambios con un loop
agéntico y emite un review con veredicto. Por defecto habla con **NVIDIA NIM**
sirviendo **Kimi K2.6** (`moonshotai/kimi-k2.6`), con cadena de fallback a otros
lanes.

[Documentación completa](https://chimeranext.github.io/heimdall) ·
[Arquitectura](https://chimeranext.github.io/heimdall/architecture/) ·
[Topología](https://chimeranext.github.io/heimdall/topology/) ·
[Decisiones](https://chimeranext.github.io/heimdall/decisions/)

</div>

---

Heimdall bypassa cualquier gateway y hace **POST directo** al proveedor LLM
(endpoint OpenAI-compatible). Postea reviews como **`github-actions[bot]`** en el
MVP de GitHub Actions, y como la GitHub App **`heimdall[bot]`** en el modo
webhook server (roadmap). Org: **chimeranext**.

- **Licencia:** MIT (ver [`LICENSE`](LICENSE)).
- **Runtime:** Bun 1.2.x (Node 22). Bun ejecuta el TypeScript directo, sin build.
- **Self-contained:** no consume `agentic-core` — el loop de review es propio y
  auditable.
- Derivado y rebrandeado como herramienta independiente bajo la org chimeranext.

## Quick start

El modo estrella es el **review local on-demand**: revisás el diff de tu rama
desde tu máquina, **offline salvo la llamada a NVIDIA NIM**.

```bash
git clone https://github.com/chimeranext/heimdall
cd heimdall && bun install
bun link                       # registra `heimdall-review` en el PATH

heimdall-review diff            # revisa el git diff de tu rama e imprime el review
```

`bun link` deja `heimdall-review` apuntando (por symlink) a tu clon: corre tu
código local sin bajar nada por invocación, y se actualiza con `git pull`. El
pipeline (git diff → prompt → render) es 100% local; la **única** red es la
inferencia a NIM.

### Otros modos de invocación

```bash
# Revisar un PR (owner/repo autodetectados del remote origin):
heimdall-review pr 42                  # imprime (dry-run)
heimdall-review pr 42 --post           # postea de verdad (requiere GITHUB_TOKEN)

# Sin instalar nada (online — baja el CLI por invocación):
bunx github:chimeranext/heimdall diff

# Slash de Claude Code / command de OpenCode (tras `heimdall-review install`):
/local-pr-review

# Makefile target / git alias (tras `heimdall-review install`):
make heimdall-review
git heimdall-review
```

| Comando | Qué hace | Postea | Necesita |
| --- | --- | --- | --- |
| `heimdall-review diff [--base <ref>]` | Revisa el `git diff` local de la rama | no (imprime) | `NVIDIA_API_KEY` |
| `heimdall-review pr <n> [--post]` | Revisa el PR `#n` | imprime; `--post` postea | `NVIDIA_API_KEY` (+ `GITHUB_TOKEN` si `--post`) |
| `heimdall-review install [--with-hook]` | Scaffolds slash + Makefile + git alias; agrega `*.nvidia.env` al `.gitignore` | — | — |
| `heimdall-review key:pull [--env]` | Cachea la NIM key desde Infisical a `.{env}.nvidia.env` | — | Infisical CLI |

> Más detalle de cada modo (pre-push hook opt-in, `bunx`, ciclo de vida del
> symlink) en la **[guía de uso](https://chimeranext.github.io/heimdall/usage/)**.

## GitHub Actions ($0)

Para automatizar el review en cada PR de un repo sin montar infraestructura, pegá
esto como `.github/workflows/bifrost.yml`. Reemplazá `<owner>` y el `@<ref>`
(tag/SHA de heimdall):

```yaml
name: bifrost
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  contents: read
  pull-requests: write
jobs:
  review:
    uses: <owner>/heimdall/.github/workflows/heimdall-review.yml@<ref>
    secrets: inherit          # reenvía NVIDIA_API_KEY (org-level o de repo)
    # with: { provider: nim-kimi }   # opcional; nim-kimi es el default
```

Es un **reusable workflow** (`workflow_call`): corre dentro del CI del repo
consumidor, hereda el `GITHUB_TOKEN` ambiente (`pull-requests: write`) y postea el
review como `github-actions[bot]`. Sin server, sin GitHub App. Único secreto:
`NVIDIA_API_KEY`. Sobre repos públicos en runners `ubuntu-latest`, **$0**.

> El wiring del secreto (GitHub Secret org-level vs pull desde Infisical) y el
> upgrade a `heimdall[bot]` están en la
> **[topología](https://chimeranext.github.io/heimdall/topology/)**.

## Resolución de la NIM key

El reviewer necesita `NVIDIA_API_KEY` (bearer de NVIDIA NIM para el lane Kimi). La
CLI lo resuelve con esta **precedencia**:

1. **Variable de entorno `NVIDIA_API_KEY`.** Cubre tres caminos a la vez:
   ```bash
   NVIDIA_API_KEY=nvapi-... heimdall-review diff   # env var explícita
   infisical run -- heimdall-review diff           # hygiene centralizada (no toca disco)
   # o un .env gitignoreado en el cwd — Bun lo auto-carga:
   infisical export --format=dotenv > .env && heimdall-review diff
   ```
2. **Archivo `.{env}.nvidia.env`** — gitignoreado, buscado subiendo del cwd a la
   raíz del repo. `env` sale de `--env staging|prod`, o `BIFROST_NVIDIA_ENV`, con
   **default `staging`**. Acepta `NVIDIA_API_KEY` o los alias
   `NVIDIA_API_KEY_INTERNAL_STAGING` / `NVIDIA_API_KEY_PUBLIC_PROD`. Generalo sin
   exponer el valor:
   ```bash
   heimdall-review key:pull --env staging   # infisical export → filtra vars NVIDIA → archivo 0600
   ```
3. **Error claro** si no se encontró nada.

> **Guardrail:** antes de leer un `.{env}.nvidia.env`, la CLI verifica con
> `git check-ignore` que esté gitignoreado. Si existe pero **no** lo está,
> **rehúsa** y aborta — para que un secreto no termine commiteado. La key nunca se
> imprime. `heimdall-review install` agrega `*.nvidia.env` al `.gitignore`.

## Verificación

```bash
bun x tsc --noEmit   # typecheck → 0 errores
bun test             # tests de wiring + adapters + CLI + key-chain, con provider MOCK (sin red)
```

Los tests no tocan NIM ni GitHub: stubean `fetch` con un provider mock y verifican
el tool-calling del loop, la intercepción del post por `MockPostAdapter`, el
parseo del `git diff` local, el parser de args y la cadena de resolución de la NIM
key (env gana / archivo / no-ignorado rehúsa / ninguno error).

## Documentación

La **[documentación completa](https://chimeranext.github.io/heimdall)**
(Material for MkDocs → GitHub Pages) cubre el detalle que este README sólo
resume:

- **[Arquitectura](https://chimeranext.github.io/heimdall/architecture/)** —
  el motor `runReviewLoop`, el provider registry, `GitHubPort` + adaptadores, las
  tools del reviewer y el render del veredicto, con diagrama de data-flow.
- **[Topología](https://chimeranext.github.io/heimdall/topology/)** — los
  tres modos de despliegue (CLI local, GitHub Actions, webhook server).
- **[Uso](https://chimeranext.github.io/heimdall/usage/)** — todos los
  métodos de invocación y la resolución de la NIM key en detalle.
- **[Decisiones](https://chimeranext.github.io/heimdall/decisions/)** — el
  porqué de no consumir `agentic-core`, el lane Kimi-NIM, la extracción standalone
  y la licencia MIT.

El sitio se construye desde [`docs/site/`](docs/site/) y se publica con
[`.github/workflows/docs.yml`](.github/workflows/docs.yml). Para previsualizar
local: `cd docs/site && mkdocs serve`.
