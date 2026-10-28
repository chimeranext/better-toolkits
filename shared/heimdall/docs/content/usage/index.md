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
La CLI busca **un solo nombre de archivo**, `.heimdall.env`, en dos scopes, con
esta **precedencia**:

1. **`~/.agents/.heimdall.env`** (user scope), solo-dueño: `0600` en POSIX o bajo
   el perfil del usuario en Windows. Es el archivo que crea `key:init`.
2. **`.heimdall.env` en la raíz del repo** (project scope). La CLI sube desde el
   cwd hasta el ancestro más cercano con `.git/` y lee `<repo>/.heimdall.env`.
   Debe estar gitignoreado. Si el cwd no está dentro de un repo, este paso no
   existe (no se busca más arriba de la raíz del repo).
3. **Variable de entorno `NVIDIA_API_KEY`.** Si está, se usa tal cual. Sirve
   tanto al modo máximo-offline (`NVIDIA_API_KEY=... heimdall-review …`) como a la
   hygiene centralizada (`infisical run -- heimdall-review …`, sin secreto en
   disco).
4. **Error claro** si no se encontró nada, con la precedencia completa.

El entorno (`--env staging|prod`, o `HEIMDALL_NVIDIA_ENV`, default `staging`)
**no cambia el nombre del archivo**: elige **qué variable se lee de adentro** —
`NVIDIA_API_KEY_INTERNAL_STAGING` para staging, `NVIDIA_API_KEY_PUBLIC_PROD` para
prod, con `NVIDIA_API_KEY` como fallback universal. Un mismo `.heimdall.env`
sirve los dos entornos.

!!! danger "Guardrail: nunca filtramos la key"
    Antes de leer el `.heimdall.env` de project scope, la CLI verifica con
    `git check-ignore` que el archivo esté **efectivamente gitignoreado**. Si
    existe pero **no** está ignorado, **rehúsa** leerlo y aborta — para que un
    secreto no termine commiteado por accidente. Para el archivo de user scope el
    guardrail equivalente es que sea solo-dueño. El valor de la key **nunca se
    imprime**.

### `heimdall-review install`

Agrega `.heimdall.env` al `.gitignore` del repo (además de instalar los wrappers),
dejando seguro el archivo de project scope que generes después.

### `heimdall-review key:pull`

Materializa el archivo de project scope desde Infisical, sin imprimir el valor:

```bash
heimdall-review key:pull --env staging   # default si se omite --env
heimdall-review key:pull --env prod
```

Corre `infisical export --projectId=<id> --env=<env> --format dotenv`, **filtra
sólo la(s) variable(s) NVIDIA** y escribe `.heimdall.env` en el cwd con permisos
`0600`. Si tras escribir detecta que el archivo **no** quedó gitignoreado, lo
**borra** y aborta (mismo guardrail que la lectura).

### `key:init` y `key:migrate`

- `heimdall-review key:init [--env staging|prod]` crea o actualiza
  `~/.agents/.heimdall.env` pidiendo las keys por diálogo GUI (merge por entorno:
  STAGING y PROD conviven en el mismo archivo con nombres decorados).
- `heimdall-review key:migrate [--env staging|prod]` copia la key del
  `.heimdall.env` del repo al user scope (merge, nunca borra el original) y
  sugiere el `rm` exacto para cuando verifiques que todo resuelve.
