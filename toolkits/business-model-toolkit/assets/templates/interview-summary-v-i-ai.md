# Resumen de Entrevista (V/I/AI) — [Nombre del Entrevistado]

**Proyecto**: [Nombre]
**Fecha de entrevista**: `YYYY-MM-DD`
**Archivo de notas crudas**: `./notes.md`
**Número de entrevista en el proyecto**: `NN de NN`

---

## Resumen ejecutivo (3 líneas)

> *(Si solo pudieras contarle a tu equipo 3 oraciones de esta entrevista, ¿cuáles serían?)*

1. `[La observación más importante]`
2. `[La segunda más importante]`
3. `[La tercera — puede ser la más sorprendente]`

---

## ✅ V — Validates (qué se confirmó)

> Hallazgos que CONFIRMAN alguna hipótesis del proyecto. Citar evidencia (frase del
> entrevistado si es posible) + a qué hipótesis corresponde.

### V1. `[Hipótesis que se validó]`

**Evidencia**:

> *"[Cita textual o paráfrasis fiel del entrevistado]"*

**Hipótesis original (de `02a-lluvia-supuestos.md`)**: `[Referencia al supuesto H1/H2/H3]`

**Fuerza de la validación**:
- [ ] 🟢 Fuerte — el entrevistado habló del problema en **tiempo presente** ("lo hago así hoy...")
- [ ] 🟡 Media — el entrevistado reconoció el problema pero en abstracto o futuro
- [ ] 🔴 Débil — respuesta cortés pero sin emoción ni detalle

### V2. `[...]`

**Evidencia**: `[...]`

**Fuerza**: [ ] 🟢 [ ] 🟡 [ ] 🔴

### V3. `[...]`

---

## ❌ I — Invalidates (qué se contradijo)

> Hallazgos que CONTRADICEN alguna hipótesis del proyecto. Estos son valiosísimos:
> invalidación temprana > producto construido mal.

### I1. `[Hipótesis que se invalidó]`

**Evidencia**:

> *"[Cita textual del entrevistado]"*

**Hipótesis original**: `[H1/H2/H3]`

**Implicación**:

- [ ] Pivot — esta hipótesis era central y claramente está mal. Reformular.
- [ ] Refinamiento — la hipótesis era parcialmente cierta pero necesita ajuste de segmento/scope.
- [ ] Contrapunto aislado — esta persona puede ser outlier. Testear con más entrevistas antes
      de declarar invalidado.

### I2. `[...]`

---

## 💡 AI — Also Interesting (sorpresas y tangentes)

> Hallazgos que no validan ni invalidan directamente pero son interesantes — sorpresas,
> tangentes valiosas, insights inesperados, o problemas adyacentes mencionados.

### AI1. `[Observación inesperada]`

**Contexto**:

```
[Qué pasó / qué dijo]
```

**¿Por qué me llamó la atención?**:

```
[Razón — no existía en mi hipótesis, contradice el sentido común, abre una puerta nueva, etc.]
```

**¿Qué hacer con esto?**:

- [ ] Agregar pregunta al template de entrevistas para validar en próximas
- [ ] Backlog de research — investigar más adelante
- [ ] Posible pivot de segmento/problema
- [ ] Solo anotarlo por ahora

### AI2. `[...]`

### AI3. `[...]`

---

## 🗣️ Speech Pattern Analysis

> Clasificar cada respuesta clave del entrevistado según *Lean Customer Development* Table 6-1.
> **🟢 = real** (descripciones en tiempo presente, específicas, con detalles)
> **🟡 = aspirational** (futuro hipotético, deseos vagos, "debería", "me gustaría")
>
> Una entrevista con mayoría 🟡 tiene valor limitado — el entrevistado describe lo que
> DESEARÍA, no lo que HACE.

| Respuesta | 🟢 Real | 🟡 Aspirational | Evidencia |
|---|---|---|---|
| Pregunta 1 — Cómo lo hace hoy | [ ] | [ ] | "[frase]" |
| Pregunta 2 — Herramientas | [ ] | [ ] | |
| Pregunta 3 — Magic wand | — | (por naturaleza aspirational) | — |
| Pregunta 4 — Before/After | [ ] | [ ] | |
| Pregunta 5 — ¿Algo más? | [ ] | [ ] | |

**Conteo final**: `__ 🟢 / __ 🟡`

**Conclusión**:
- [ ] Mayoría 🟢 → entrevista de alta señal, candidato a earlyvangelist
- [ ] Balance → entrevista útil pero con caveats
- [ ] Mayoría 🟡 → entrevistado NO es cliente objetivo (todavía). No contar para validación.

---

## 🧪 Check contra los 4 criterios de hipótesis validada (Alvarez)

> Una hipótesis NO está validada hasta cumplir los 4 criterios. Marcar evidencia por
> entrevista; agregar al `00-patrones.md` cross-entrevistas.

- [ ] 1. **El cliente confirma que SÍ hay un problema real**
  - Evidencia de esta entrevista: `[cita o paráfrasis]`
- [ ] 2. **El cliente cree que el problema PUEDE y DEBE resolverse**
  - Evidencia: `[...]`
- [ ] 3. **El cliente ya INVIRTIÓ (tiempo/dinero/esfuerzo/aprendizaje) intentando resolverlo**
  - Evidencia: `[...]`
- [ ] 4. **El cliente NO tiene circunstancias fuera de su control que se lo impidan**
  - Evidencia: `[...]`

---

## 🎯 Señal earlyvangelist

> ¿Esta persona encaja en el perfil de earlyvangelist (Steve Blank)? Pirámide:

- [ ] Tiene el problema
- [ ] Es consciente del problema
- [ ] Ha estado buscando solución activamente
- [ ] Ha juntado una solución a medida con piezas disponibles
- [ ] Tiene o puede conseguir presupuesto

**Altura en la pirámide**: __ / 5

**Conclusión**:
- 4-5: **Earlyvangelist confirmado** — contactar para Solution Interview / MVP testing
- 2-3: Interesante pero no urgente, mantener en loop
- 0-1: No es cliente objetivo (al menos todavía)

---

## 🔁 Ajustes al script de próximas entrevistas

- [ ] Preguntas que NO funcionaron (cortas, confusas, aspirational): `[Cuáles]`
- [ ] Follow-ups nuevos valiosos que improvisé y voy a agregar al template: `[Cuáles]`
- [ ] Tono a ajustar: `[Más casual / más directo / menos técnico / etc.]`

---

## 🔗 Próximos pasos con esta persona

- [ ] Enviar email de thank-you + foot-in-the-door (Template 5 de `outreach-templates.md`)
- [ ] Pedir N referidos específicos: `[Nombres si dio]`
- [ ] Agendar follow-up: `[Fecha / contexto]`
- [ ] Agregar a lista de `Solution Interview` cuando esté listo el prototipo
- [ ] Nada más por ahora
