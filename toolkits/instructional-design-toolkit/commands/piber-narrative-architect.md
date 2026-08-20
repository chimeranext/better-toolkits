---
description: "Construye, comprime, transpone o audita una narrativa PIBER (Problem, Insight, Big Idea, Execution, Results)"
argument-hint: "[modo: board|compressed|transposed|audit|reverse] [tema o ruta al artefacto]"
---

# /piber-narrative-architect

Invocar skill `instructional-design-toolkit:piber-narrative-architect` con
`$ARGUMENTS` = `[modo] [tema o ruta]`.

Si el modo no viene en `$ARGUMENTS`, la skill lo infiere del artefacto pedido y lo
nombra antes de escribir. No hace falta decir "PIBER" para invocarla: si el
entregable es un argumento que tiene que mover a una audiencia concreta a actuar,
esta es la skill.

## Los cinco modos

| Modo | Cuándo |
|------|--------|
| `board` | Case board o narrativa de deck completa. Pitch, deck, submission, memo de inversión. |
| `compressed` | El argumento entra en un párrafo, un email, una bio, un hilo o una línea. |
| `transposed` | El artefacto tiene formato propio (ensayo, keynote, landing, all-hands, release note) y PIBER corre por debajo, invisible. El más común y el más fácil de hacer mal. |
| `audit` | Puntúa un pitch, deck o ensayo existente contra los cinco nodos y entrega un memo con score, no una reescritura. |
| `reverse` | Infiere el PIBER de una empresa, competidor o campaña desde evidencia pública. Marca la inferencia como inferencia. |

## Output

Depende del modo. `board` produce el case board completo siguiendo
`assets/case-board-skeleton.md`; `audit` produce un memo con score por nodo;
`transposed` produce el artefacto en su formato nativo, con PIBER como estructura
portante y sin etiquetas de nodo visibles.

### Dónde queda

Los entregables NUNCA van a un directorio temporal ni a un scratchpad de sesión.
Cada corrida que produce archivos crea o reusa una carpeta fechada en el
escritorio:

```
~/Escritorio/piber-<slug>-<YYYY-MM-DD>/
├── board/        el PIBER fuente, markdown
├── slides/       el deck renderizado, si lo hay
└── evidencia/    el material crudo del que salió el board
```

**Cada salida se reporta con su ruta absoluta.** Un entregable sin ruta no se
puede auditar, así que no cuenta como entregado.

### HTML: primero artifact, después todo lo demás

Si el entregable es HTML, el archivo local es un paso intermedio. Se publica como
Claude artifact, se entrega la URL, y la corrida SE DETIENE hasta que el autor lo
abra y lo apruebe. Nada río abajo avanza antes de eso.

Eso impone dos condiciones duras sobre el HTML: va **self-contained** (CSS y JS
inline, imágenes como data URI, cero recursos externos, porque el CSP del
artifact bloquea todo host externo) y **adaptado a light y dark**, porque el tema
lo elige quien lo mira. Una librería que asume CDN o bundler no sirve acá, y eso
se verifica antes de adoptar la dependencia.

## Gate

`${CLAUDE_PLUGIN_ROOT}/skills/piber-narrative-architect/scripts/piber_gate.py`
verifica lo que es mecánicamente verificable: presencia de
los cinco nodos, el orden, y las reglas léxicas de la casa. El juicio queda con
quien escribe.

```
GATE="${CLAUDE_PLUGIN_ROOT}/skills/piber-narrative-architect/scripts/piber_gate.py"

python3 "$GATE" board.md
python3 "$GATE" board.md --lang es --brand "Chimera Coding"
python3 "$GATE" board.md --rendered   # artefacto externo: las etiquetas de nodo deben haber desaparecido
```

Sale 0 cuando el gate abre y 1 cuando hay una falla dura. Distingue uso de
mención: los spans entrecomillados, el código inline y los bloques cercados se
enmascaran antes de las verificaciones léxicas, así que un documento puede
discutir una frase rechazada citándola. Los em dashes se verifican en crudo y no
tienen esa exención, porque ahí la regla es de estilo y no de contenido.

## Origen

PIBER es la forma de un case board de Cannes Lions, y el acrónimo es de Juan
Carlos, desarrollado en una charla de product-led growth para fundadores donde el
case board de agencia se fusionó con pensamiento contrarian estilo Thiel. El nodo
Insight es explícitamente el "secreto" de Thiel.
