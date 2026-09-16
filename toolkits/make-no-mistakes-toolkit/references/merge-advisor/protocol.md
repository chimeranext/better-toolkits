# /merge-advisor — protocol SSOT

Harness-agnostic body. Thin entry: `commands/merge-advisor.md`.

---

# /merge-advisor — el orden, luego HITL

Hay una pila de PRs abiertos contra una misma base. Cada uno se midió verde
**contra una base que ya no existe para cuando le llega el turno**. Este comando
calcula el orden que los mantiene verdes y **siempre** ofrece ejecutarlo con
aprobación humana — no existe un flag `--execute` que nadie va a descubrir.

## La pregunta que ningún otro comando contesta

| comando | pregunta | unidad |
|---------|----------|--------|
| `review-open-prs` | ¿cuáles PRs necesitan atención? | un PR a la vez |
| `sync-advisor` | este checkout derivó, ¿qué corro? | una rama contra su base |
| **`merge-advisor`** | **¿en qué ORDEN, para que cada uno siga válido en su turno?** | **el conjunto** |

La distinción no es contable. **«Mergeable» no es una propiedad de un PR: es una
propiedad del par (PR, base sobre la que va a aterrizar).** Un reporte por PR lee
cada fila contra la base de *hoy*, y en el instante en que el primer merge
aterriza, todas las demás filas describen una base que ya no está. Diez PRs
verdes no son diez merges.

## Modo de invocación

```bash
# Base detectada automáticamente, todos los PRs abiertos
/make-no-mistakes:merge-advisor

# Base explícita
/make-no-mistakes:merge-advisor develop

# Otro repo
/make-no-mistakes:merge-advisor --repo chimeranext/<repo>

# Solo un subconjunto
/make-no-mistakes:merge-advisor --only 4299,4309,4242
```

## Argumentos

| Flag | Default | Comportamiento |
|------|---------|----------------|
| `<base-branch>` | detectada | Nombre pelado (`develop`), nunca `origin/develop`. Si trae el remoto, se normaliza antes de interpolar. |
| `--repo <owner/name>` | el cwd | Repo objetivo. Sin esto, se resuelve desde el remoto `origin` del directorio actual. |
| `--only <numbers>` | todos | Subconjunto separado por comas. El resto queda fuera del plan y se nombra como excluido, nunca se omite en silencio. |
| `--out <path>` | stdout | Escribe el plan a un archivo además de imprimirlo. |

## Doctrina HITL (obligatoria — no es opt-in)

Repo-wide parent: [`docs/hitl.md`](../../../../docs/hitl.md). This section is the
`/merge-advisor` application of that doctrine.

Dos mitades, en este orden. Ninguna se salta.

### Mitad A — medir (autónoma)

Los siete predicados corren solos. `git fetch origin` es la única mutación
permitida sin preguntar: escribe refs de seguimiento remoto y nada más. Sin eso,
cada medición sale contra una base vieja y produce un orden que era correcto ayer.

Al terminar, **imprimí el plan completo** (tiers, URLs, no-en-el-orden,
capacidad). El plan solo no es el final del comando.

### Mitad B — ejecutar con HITL (siempre)

Inmediatamente después del plan, el orquestador **debe** pedir aprobación
explícita. No imprimir «corrés vos `gh pr merge`» y terminar. No inventar
`--execute`. La pregunta es el producto.

**Superficie por harness (misma doctrina que `/implement`):**

| Harness | Cómo pedir |
|---------|------------|
| Claude Code | `AskUserQuestion` |
| Cursor | **`AskQuestion`** (fixed-choice); si no está disponible: opciones numeradas en la conversación principal + esperar respuesta explícita (no asumir «sí» por silencio) |
| Sub-agente en background | **no** preguntar; emitir `pause` JSON (`gate: "merge-advisor-queue"`) y halt — el orquestador pregunta y retransmite |

Pregunta mínima tras el plan (español; opciones fijas):

> **¿Ejecutamos el plan de merge?**
>
> 1. **Sí — tier por tier** (recomendado): mergear el siguiente tier, re-medir, y volver a preguntar.
> 2. **Sí — un PR** (nombrar cuál del Tier 1).
> 3. **Solo el plan** — no mergear en esta sesión.
> 4. **Parar** — no mergear.

Si eligen 1 o 2, **antes de cada `gh pr merge`** hay otro hard STOP con la URL
del PR, el método (`--merge` / `--squash` / `--rebase` según default del repo o
pregunta si no hay default), y el estado `mergeable` / checks **recién leídos**.
Tras cada merge exitoso: `force_mergeable` otra vez sobre el resto, re-derivar
tiers si cambió la forma, y volver a la pregunta HITL. Un plan impreso una vez
y seguido una hora es un plan cuyas capas posteriores midieron la base equivocada.

**Nunca ofrece el bypass como opción.** `--admin`, `--force`, mergear pasando
por encima de un check en rojo o que todavía no contestó, apagar un check
requerido para destrabar la cola: nada de eso es una fila de un menú. Si el orden
está bloqueado, el bloqueo es el hallazgo — y la pregunta HITL refleja el
bloqueo, no lo rodea.

Regeneración de artefactos anclados: se **imprime** el comando exacto; ejecutarlo
también requiere HITL (misma superficie). `git rebase` / `git push --force-with-lease`
para desbloquear un PR fuera del orden: HITL, siempre.

## Los siete predicados

Delega a la skill `merge-advisor`, que corre todos y reporta cada uno con el
comando que lo produjo.

| # | predicado | contesta |
|---|-----------|----------|
| 1 | Elegibilidad | ¿cuáles son candidatos siquiera? |
| 2 | Frescura del check | ¿ese verde es sobre la base actual? |
| 3 | Conflictos con la base HOY | cuáles necesitan trabajo antes que nada |
| 4 | **Colisión de archivos por pares** | **qué PRs tocan los mismos archivos** |
| 5 | **Conflictos latentes** | **qué pares chocan ENTRE SÍ, no con la base** |
| 6 | Artefactos anclados a la base | qué debe regenerar todo el resto tras un merge |
| 7 | Capacidad de la cola | cuántos pueden estar en vuelo sin ahogar CI |

Los predicados 4 y 5 son los que ninguna vista por PR puede producir, y el 5 es
el que importa: **el conflicto peligroso no es el que hoy bloquea un PR, sino el
que aparece recién cuando otro aterriza**, en un PR que ahora mismo está verde.
Es invisible para `gh pr list`, para cualquier reporte de estado, y para el
autor del PR.

El predicado 6 es la versión generalizada del *typecheck baseline drift*: un
archivo derivado de la base que guarda el SHA del que se derivó. Cuando la base
se mueve —y sobre todo cuando un **squash merge** la reescribe— ese ancla apunta
a un commit que ya no existe, y el artefacto se rompe en **todos los PRs
abiertos a la vez**. Un merge, N fallas, ninguna causada por el PR donde
aparecen.

La skill no hardcodea el artefacto de ningún proyecto: lo **descubre** buscando
archivos que carguen un SHA de base o un marcador de generado, y después
pregunta las dos cosas que deciden si restringe el orden — si más de un PR lo
toca, y si se regenera en vez de escribirse a mano.

## La regla de orden que sorprende

Los empates se rompen por **fragilidad, de mayor a menor — no por importancia**.

Fragilidad es *qué tan probable es que este PR deje de aplicar mientras espera*,
y se aproxima con el ancho del cambio por la distancia contra la base. El PR
grande y viejo va primero: no porque importe más, sino porque su ventana es la
más corta y cada merge que le pasa adelante se la angosta más. Mergear primero
los chiquitos y limpios *se siente* como avance, y gasta exactamente el recurso
que al grande se le está acabando.

## Salida

Un plan ordenado, en tiers. Dentro de un tier ningún par comparte archivos ni
tiene una arista latente, así que ese tier mergea en cualquier orden y —si la
capacidad da— en paralelo. Entre tiers van los checkpoints de regeneración.

Cada fila lleva la **URL completa del PR**: un `#4309` pelado no es clickeable
desde una terminal ni resoluble desde un reporte pegado.

Tres secciones más, y la tercera es la que no se puede omitir:

- los PRs que necesitan regenerar un artefacto anclado, con el comando exacto;
- la capacidad medida de la flota y el tamaño de lote que sale de ahí;
- los PRs que **no entran al orden**, con la razón. Un PR ausente del plan se lee
  como «ya resuelto».

## Modos degradados, dichos en vez de escondidos

- **Sin autenticación de `gh`** — reporta distancia y colisiones solo con git, y
  dice que los checks quedaron sin medir. No infiere verde desde un merge limpio.
- **Un head de PR que no se puede traer** (fork borrado, permisos) — ese PR es
  `unverifiable`, listado con la razón. No es «limpio».
- **Ningún artefacto anclado encontrado** — dice que la búsqueda corrió y no
  encontró nada, con el comando. El silencio se lee como «no se revisó».

## Regla de evidencia

Cada medición lleva su línea `### ref: origin/<base> @ <sha>` y el comando que
la produjo. Un orden calculado contra una base sin nombrar es una opinión.

Si el repo ya tiene un programa que contesta una de estas preguntas, la skill lo
**corre** en vez de re-derivarlo con `grep`: una segunda implementación de una
medición deriva igual que una segunda implementación de código.

Y los tres estados no se colapsan nunca. `mergeable: UNKNOWN` de GitHub significa
*«todavía no calculado»*, no *«limpio»*; leer el PR fuerza el cálculo, así que se
relee en vez de anotar la primera respuesta.

Ver `${CLAUDE_PLUGIN_ROOT}/skills/merge-advisor/SKILL.md` para el detalle de cada
predicado.

## Regla de idioma

El plan sale en **español**. Los nombres de comandos, flags, refs, rutas y
salidas de git quedan en original.

## Posición en la cadena

```
review-open-prs  ->  merge-advisor (+ HITL merge)  ->  sync-advisor  ->  implement
 (qué necesita      (orden + merge con OK humano)    (checkout        (siguiente
  atención)                                           derivó)          issue)
```

Un uso típico: `review-open-prs` dice que hay once abiertos y cuatro en rojo;
`merge-advisor` imprime que dos de los verdes chocan entre sí, pregunta HITL, y
mergea el tier que el humano autorizó — re-midiendo entre merges.

## Requisitos

- `gh` autenticado con lectura **y**, si el humano autoriza merge, escritura /
  permiso de merge sobre el repo objetivo. Sin auth de lectura corre en modo
  degradado y lo declara; sin permiso de merge la mitad B se detiene en HITL
  con el error, no inventa bypass.
- `git` con acceso al remoto: los heads de los PRs se traen como refs locales,
  porque los predicados 4 y 5 necesitan los commits, no los SHAs.
- Nada más. No requiere `linear-setup.json` ni ninguna config del toolkit.
