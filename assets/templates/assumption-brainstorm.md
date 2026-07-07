# Lluvia de Supuestos (Assumption Brainstorm) — [Proyecto]

> **Antes de hablar con clientes**, externalizar los supuestos que estamos haciendo sobre el producto, los clientes y el mercado. Cada supuesto se vuelve una **hipótesis testeable**. Todo lo que "creemos saber" es en realidad una apuesta hasta que se valida o invalida.

**Fuente metodológica**: *Lean Customer Development* (Cindy Alvarez, O'Reilly 2014), Capítulo 2 — "Where Should I Start?"

**Duración**: 10 minutos de brainstorm cronometrado. Escribir rápido, sin filtrar. Ningún supuesto es "tonto" — los peligrosos son los que ni sabemos que tenemos.

**Modo individual vs. equipo**:
- **Individual**: completar cada prompt con 2-5 supuestos.
- **Equipo**: cada persona completa por separado (sin ver al resto). Luego clusterizar y detectar contradicciones.

---

## 1. Los 12 Prompts

Completá cada frase con tantos supuestos como puedas. Un supuesto = una línea. Algunos estarán obvios, otros te van a sorprender a vos mismo/a.

### 1.1 Problema del cliente

> *"Creemos que nuestros clientes experimentan ______ como problema."*

- Supuesto:
- Supuesto:
- Supuesto:

### 1.2 Disposición a invertir

> *"Creemos que los clientes están dispuestos a invertir ______ (tiempo/dinero/esfuerzo/aprendizaje) para resolver este problema."*

- Supuesto:
- Supuesto:

### 1.3 Stakeholders

> *"Las personas involucradas en USAR el producto son ______, y las que involucradas en COMPRAR son ______."* (pueden ser distintas)

- Supuesto (usuarios):
- Supuesto (compradores):
- Supuesto (influenciadores/gatekeepers):

### 1.4 Alternativa actual (competencia real)

> *"Si los clientes NO compraran ni usaran nuestro producto, comprarían/usarían ______."*

- Supuesto (alternativa directa):
- Supuesto (alternativa indirecta — ej. hoja de cálculo, WhatsApp, no-hacer-nada):

### 1.5 Beneficio principal post-uso

> *"Una vez que los clientes usen nuestro producto, ganarán ______ (resultado concreto, no "felicidad")."*

- Supuesto:
- Supuesto:

### 1.6 Impacto del problema en la vida del cliente

> *"Este problema afecta a nuestros clientes ______ (frecuencia, intensidad, consecuencia)."*

- Supuesto (frecuencia — diaria/semanal/ocasional):
- Supuesto (consecuencia si NO se resuelve):

### 1.7 Herramientas y hábitos actuales

> *"Los clientes ya están usando herramientas/procesos como ______."*

- Supuesto:
- Supuesto:

### 1.8 Influencias de compra

> *"Las decisiones de compra de nuestros clientes están influenciadas por ______."*

- Supuesto (económico — presupuesto, aprobación):
- Supuesto (social — reviews, recomendaciones, pares):
- Supuesto (organizacional — jefe, proceso de compra B2B):

### 1.9 Comodidad con tecnología

> *"El nivel de comodidad de nuestros clientes con la tecnología es ______."*

- Supuesto:

### 1.10 Comodidad con el cambio

> *"El nivel de comodidad de nuestros clientes con adoptar algo nuevo es ______."*

- Supuesto:

### 1.11 Construcción del producto

> *"Nos tomará ______ (tiempo/recursos/complejidad técnica) construir este producto."*

- Supuesto:
- Supuesto:

### 1.12 Adquisición de clientes

> *"Nos tomará ______ conseguir [N clientes / X% de adopción / primer ingreso]."*

- Supuesto:
- Supuesto:

---

## 2. Clusterización por tema

Agrupar los supuestos similares. Buscar patrones: ¿hay un tema que aparece repetido? ¿Hay un cliente que describimos de manera inconsistente?

| Cluster | Supuestos que lo componen | Observación |
|---|---|---|
| Ejemplo: "Sobre el precio" | 1.2 + 1.8 económico | Asumimos que pagarán mensual pero no validamos |
| | | |
| | | |

---

## 3. Matriz Riesgo / Incertidumbre

Clasificar cada supuesto en los 4 cuadrantes para priorizar cuáles testear primero.

```
                       CONOCIDO                    DESCONOCIDO
                 ┌────────────────────────┬────────────────────────┐
   ALTO RIESGO   │  A. Confirmado         │  B. PRIORIDAD 1        │
   (si está mal, │  (datos existen —      │  (no sabemos si es     │
   falla el      │  validar que sigan     │  cierto — testear YA   │
   proyecto)     │  vigentes)             │  antes de construir)   │
                 ├────────────────────────┼────────────────────────┤
   BAJO RIESGO   │  C. Asumir sin         │  D. Backlog            │
   (si está mal, │  testear               │  (no crítico ahora —   │
   ajustamos)    │  (foco en otra cosa)   │  testear después)      │
                 └────────────────────────┴────────────────────────┘
```

### Cuadrante B — PRIORIDAD 1 (alto riesgo + desconocido)

Los supuestos aquí son los **candidatos para las primeras entrevistas de validación**.

- [ ] Supuesto crítico:
- [ ] Supuesto crítico:
- [ ] Supuesto crítico:

### Cuadrante A — Confirmado (alto riesgo + conocido)

- Supuesto:
- Supuesto:

### Cuadrante D — Backlog (bajo riesgo + desconocido)

- Supuesto:
- Supuesto:

### Cuadrante C — Asumir sin testear (bajo riesgo + conocido)

- Supuesto:

---

## 4. Contradicciones detectadas

> *(Solo aplica si el ejercicio se hizo en equipo.)*

Cuando distintos miembros del equipo dan respuestas contradictorias al mismo prompt, eso revela falta de alineación interna ANTES de salir al mercado. Mejor resolverlo ahora.

| Prompt | Versión de persona 1 | Versión de persona 2 | Resolución |
|---|---|---|---|
| Ejemplo: 1.3 Stakeholders | "Compra el usuario final" | "Compra el gerente de área" | Testear con entrevistas: ¿quién firma el cheque? |
| | | | |

---

## 5. Próximos pasos

1. **Top 3 supuestos a testear primero** (del Cuadrante B):
   1.
   2.
   3.

2. **Método de test** para cada uno:
   - ☐ Entrevista de problema (`02-entrevista-problema.md`)
   - ☐ Landing page / smoke test
   - ☐ Research de competencia / mercado
   - ☐ Prototipo + observación
   - ☐ Otro:

3. **Hipótesis refinada** (pasar al formato estructurado de Fase 2b):

> *"Creemos que [tipo de persona] experimenta [tipo de problema] cuando [situación/tarea] debido a [limitación/contexto]."*

---

## Notas

- **Revisar trimestralmente**: los supuestos cambian a medida que aprendemos del mercado. Anotar cuáles se validaron, cuáles se invalidaron, y cuáles aún quedan como hipótesis.
- **Sesgo de confirmación**: el enemigo número uno. Escribir supuestos es el primer paso; **intentar activamente refutarlos** en las entrevistas es el segundo.
- **Conexión con Lean Canvas**: los supuestos aquí deberían aparecer en los módulos del Business Model Canvas cuando lleguemos al Espacio 2. Si hay supuestos que no encajan en ningún módulo del BMC, revisar si son relevantes o si el BMC necesita un módulo extra.
