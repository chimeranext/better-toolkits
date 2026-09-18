# Uso

Heimdall se invoca de varias formas según el contexto. Todas corren el mismo
motor; cambia el envoltorio.

## Métodos de invocación

### `bun link` en el PATH (offline salvo NIM)

Instalá el binario una vez y queda disponible como `heimdall-review`:

```bash
bun link            # desde el repo de heimdall
heimdall-review diff # revisa el git diff de tu rama, imprime
```

Corre **offline excepto la llamada a NVIDIA NIM**: leer el diff, armar el prompt
y renderizar el review son pasos locales.

### `bunx` (sin instalar)

```bash
bunx github:chimeranext/heimdall diff
bunx github:chimeranext/heimdall pr 42
```

### Slash de Claude Code / command de OpenCode

`heimdall-review install` materializa el comando como slash de Claude Code en
`.claude/commands/local-pr-review.md` y como project command de OpenCode en
`.opencode/commands/local-pr-review.md` (se auto-carga como
`/local-pr-review`). Dentro de una sesión:

```text
/local-pr-review
```

### Makefile / git-alias

`heimdall-review install` también agrega un target idempotente al `Makefile` y
documenta un git alias:

```bash
make heimdall-review
# tras configurar el alias:
git heimdall-review
```

El pre-push hook es **opt-in** (`heimdall-review install --with-hook`): corre el
review antes de cada push y pregunta si continuar.

### GitHub Actions

Cada repo invoca el reusable workflow desde su propio workflow de `pull_request`.
Postea como `github-actions[bot]` usando el `GITHUB_TOKEN`; el único secreto es
`NVIDIA_API_KEY`. Ver **[Topología → GitHub Actions](../topology/index.md#2-github-actions-mvp-0)**.

## Resolución de la NIM key

El reviewer necesita `NVIDIA_API_KEY` (el bearer de NVIDIA NIM para el lane Kimi).
La CLI lo resuelve con esta **precedencia**:

1. **Variable de entorno `NVIDIA_API_KEY`.** Si está, se usa tal cual. Sirve
   tanto al modo máximo-offline (`NVIDIA_API_KEY=... heimdall-review …`) como a la
   hygiene centralizada (`infisical run -- heimdall-review …`, sin secreto en
   disco).
2. **Archivo `.{env}.nvidia.env`** — gitignoreado, buscado subiendo del cwd a la
   raíz del repo. El entorno (`env`) sale de `--env staging|prod`, o de
   `BIFROST_NVIDIA_ENV`, con **default `staging`**. Acepta la variable
   `NVIDIA_API_KEY` o los alias `NVIDIA_API_KEY_INTERNAL_STAGING` /
   `NVIDIA_API_KEY_PUBLIC_PROD`.
3. **Error claro** si no se encontró nada.

!!! danger "Guardrail: nunca filtramos la key"
    Antes de leer un `.{env}.nvidia.env`, la CLI verifica con `git check-ignore`
    que el archivo esté **efectivamente gitignoreado**. Si existe pero **no** está
    ignorado, **rehúsa** leerlo y aborta — para que un secreto no termine
    commiteado por accidente. El valor de la key **nunca se imprime**.

### `heimdall-review install`

Agrega `*.nvidia.env` al `.gitignore` del repo (además de instalar los wrappers),
dejando seguro cualquier archivo de key-chain que generes después.

### `heimdall-review key:pull`

Materializa el archivo desde Infisical, sin imprimir el valor:

```bash
heimdall-review key:pull --env staging   # default si se omite --env
heimdall-review key:pull --env prod
```

Corre `infisical export --projectId=<id> --env=<env> --format dotenv`, **filtra
sólo la(s) variable(s) NVIDIA** y escribe `.{env}.nvidia.env` con permisos `0600`.
Si tras escribir detecta que el archivo **no** quedó gitignoreado, lo **borra** y
aborta (mismo guardrail que la lectura).
