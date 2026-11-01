# StS — Stderr/Stream Standards (doctrina)

> Policy/doctrine SSOT para el manejo de streams (stdout/stderr) en agentes y scripts.
> Este archivo es la fuente doctrinal; `shared/hooks/stderr/README.md` y
> `docs/opencode-stderr.md` la referencian, no la reemplazan.

## Doctrina

1. **Ningún stream va a null.** Las redirecciones que descartan stderr o stdout
   a un dispositivo nulo están **prohibidas** — un stream descartado es una señal
   perdida.
2. **El stderr se preserva siempre.** Un comando que escribe a stderr y termina
   en 0 podría estar ocultando un error o un warning. Nunca se silencia.
3. **Redirigir stderr a un archivo separado está prohibido.** Un archivo de error
   separado se pierde en auditorías. El stderr se pliega al **mismo sink** que
   stdout:
   - `> out.log 2>&1` (combinado en un archivo)
   - `2>&1 | tee run.log` (combinado vía tee)
4. **Capturar en vez de descartar:** `out=$(cmd)` para capturar, cuando solo
   interesa el exit code.
5. **El guard es la fuente de verdad.** El detector (`detect.py`) bloquea las
   formas prohibidas; esta doctrina lo describe, no lo contradice.

## Racional (por qué)

- Una señal suprimida (stderr a null, error tragado, sleep arbitrario) convierte
  un fallo en un falso pass.
- Un archivo de error separado no se revisa en auditorías; al plegarlo al mismo
  log se garantiza que aparece junto al output.

## Aplicación

- **Agentes** (Claude/OpenCode/Cursor): los adapters del hook bloquean los
  patrones prohibidos en comandos shell.
- **Scripts** vendidos por los toolkits: deben usar solo las formas permitidas.
- **CI/auditorías**: `detect.py` es el enforcement; esta doctrina es la política.

## Referencias

- Implementación: `shared/hooks/stderr/detect.py` + adapters.
- README técnico del hook: `shared/hooks/stderr/README.md`.
- Integración OpenCode: `docs/opencode-stderr.md`.
- Disciplina relacionada (de agente, no parte de StS): **No-Workarounds** — del
  perfil Better; motiva StS pero vive aparte.
