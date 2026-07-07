# Metodología de Entrevistas de Customer Development

Referencia detallada de técnicas para la skill `customer-interview-system`. Basado en
*Lean Customer Development* (Cindy Alvarez, O'Reilly 2014), capítulos 3-6, con adaptaciones
al contexto LATAM/español.

---

## 1. Las 5 preguntas core (estructura general)

Las 5 preguntas son el framework conversacional. No se leen como guion; se internalizan
y se adaptan al flow natural de cada entrevista.

1. **"Tell me about how you do ______ today..."**
   Abre con una historia amplia del estado actual. Permite que el entrevistado tome
   el control inicial y describa con su propio lenguaje.

2. **"Do you use any [tools/products/apps/tricks] to help you get ______ done?"**
   Revela el stack real: herramientas, trucos, workarounds, combinaciones. Aquí aparecen
   las alternativas reales que competís (incluyendo hojas de cálculo y WhatsApp).

3. **"If you could wave a magic wand..."**
   Elimina restricciones percibidas. Revela el pain point más profundo. El deseo
   mágico suele ser una puerta al "job-to-be-done" subyacente.

4. **"Last time you did ______, what were you doing right before/after?"**
   Captura el CONTEXTO, no la tarea aislada. Muchas veces el problema real está
   en el antes (preparación) o el después (consecuencia), no en la tarea misma.

5. **"Is there anything else about ______ that I should have asked?"**
   Esta pregunta suele generar el 20% más valioso de la entrevista. Los entrevistados
   usan el cierre para sacar lo que no se atrevieron a decir antes.

---

## 2. La regla de los 60 segundos de silencio

Después de la primera pregunta, el entrevistador **NO HABLA durante al menos 60 segundos**.

**Por qué funciona**:

- La respuesta inicial de cualquier persona suele ser corta y superficial ("Eh, bueno,
  lo hago normal, abro el sistema y...")
- Si el entrevistador llena el silencio con follow-up inmediato, corta la elaboración
- Al esperar 60 segundos, el entrevistado siente la necesidad social de continuar,
  lo que extrae una respuesta más rica y detallada
- También establece la **expectativa** de que las respuestas largas son lo que querés

**Cómo ejecutarlo sin parecer raro**:

- Mantener contacto visual suave
- Tomar notas visiblemente (indica "estoy procesando, esperá a que termine")
- Un ligero "mmhmm" o asentir está permitido; palabras completas NO
- Si después de 60s todavía no elaboran más, hacer una pregunta abierta pero suave:
  "¿Y cómo te sentís cuando eso pasa?" o "¿Podés contarme más de ese proceso?"

**En video call**:

- El delay de 60s se siente MÁS largo por el medio. Resistir la tentación de hablar.
- Si hay lag de audio, ser aún más paciente.

---

## 3. La pregunta de la varita mágica

**Formato**: "Si pudieras tener una varita mágica y cambiar cualquier cosa sobre
[área del problema], sin importar si es posible o no hoy, ¿qué sería?"

**Por qué funciona**:

- Elimina restricciones técnicas ("no se puede", "es muy caro", "no existe la tecnología")
- Elimina restricciones sociales ("mi jefe no lo permitiría", "los clientes no lo aceptarían")
- Revela el **resultado deseado puro** (JTBD), no la solución que imaginan

**Ejemplos reales**:

- En lugar de preguntar sobre grocery delivery: "¿qué cambiarías de cómo alimentás a tu familia?"
- En lugar de preguntar sobre file sharing: "¿qué cambiarías de cómo colaborás con tu equipo?"
- En lugar de preguntar sobre facturación electrónica: "¿qué cambiarías de cómo cobrás a tus clientes?"

**Anti-patrón**: NO sugerir opciones ("¿sería tipo automatización?", "¿algo con IA?").
Dejar que el entrevistado imagine.

---

## 4. La técnica "Other People"

Cuando después de 3-5 entrevistas ya ves un patrón, **desafialo activamente** introduciendo
una afirmación hipotética contraria:

**Formato**: "Otras personas me han dicho que [afirmación opuesta/alternativa]. ¿Vos cómo
lo ves?"

**Por qué funciona**:

- Provoca una reacción: el entrevistado tiene que confirmar el patrón que ya detectaste
  O corregirte con más detalle
- Permite ver si el patrón es UNIVERSAL o específico del segmento
- Puede revelar un segmento alternativo que no habías considerado

**Ejemplo concreto**:

Si ya 5 entrevistas te dijeron "preferimos proveedores locales", preguntar al #6:
> "Otras personas me han dicho que preferirían proveedores internacionales porque dan
> mejores precios, aunque el soporte sea más tardado. ¿Cómo lo ves vos?"

Las respuestas posibles:
- "No, justo eso no — para nosotros local es crítico porque..." → CONFIRMACIÓN + razón más profunda
- "Mmm, depende — si fuera un producto crítico iría con internacional, pero para X local" → SEGMENTACIÓN POR PRODUCTO
- "La verdad, yo sí prefiero internacional porque..." → OUTLIER O NUEVO SEGMENTO

**Importante**: **Nunca inventes una afirmación falsa para manipular**. La "otra gente" puede
ser hipotética pero la afirmación debe ser algo que SÍ podría ser verdad en alguna porción
del mercado.

---

## 5. Abstract Up One Level

Si el entrevistado se enfoca en el nivel de detalle equivocado (muy micro), abstraer hacia
arriba para encontrar el problema real.

**Formato**: "Un nivel más arriba de [tarea X], ¿qué estás intentando lograr realmente?"

**Ejemplo**:

- Entrevistado: "Uso Excel para anotar los gastos mensuales de la empresa..."
- Mal follow-up: "¿Qué columnas tiene tu Excel?"
- Buen follow-up: "Un nivel más arriba — ¿para qué necesitás tener esos gastos anotados?"
- Entrevistado: "Para saber cuánto puedo invertir en expansión" → AHORA estás en el problema real (decisiones de inversión), no en la tarea (Excel)

**Por qué funciona**: La tarea concreta suele ser la solución actual (con una herramienta
particular), no el problema en sí. Abstraer revela el problema subyacente.

---

## 6. Presente vs. Futuro — Tabla de reemplazo

NUNCA preguntes aspirational ("¿Usarías...?", "¿Te gustaría...?"). Siempre reescribilo en
presente/pasado concreto.

| Aspirational (MALO) | Actual (BUENO) |
|---|---|
| ¿Qué tan probable es que uses _______? | Contame de la última vez que usaste algo como _______. |
| ¿Con qué frecuencia sucede _______? | En el último mes, ¿cuántas veces pasó _______? |
| ¿Cuánto costaría a tu empresa si _______? | La última vez que pasó _______, ¿cuánto costó? |
| ¿Cómo reaccionaría tu familia si _______? | La última vez que tomaste una decisión grande, ¿cómo reaccionó tu familia? |
| ¿Te gustaría tener _______? | Si pudieras tener una varita mágica (pregunta 3), ¿qué cambiarías? |

**Por qué**: las respuestas a "¿usarías?" son RUIDO. Todos dicen "sí" por cortesía o
por imaginar un escenario ideal. Las respuestas a "la última vez que..." son SEÑAL —
describen comportamiento real.

---

## 7. Features → Problems Redirect

Los entrevistados constantemente intentan ayudarte sugiriendo features. Resistir esa ayuda
y redirigir al problema subyacente.

**Patrón de redirección**:

1. **Confirmar el feature request** (hace sentir escuchado): "OK, te gustaría [feature X]."
2. **Pedir contexto de uso**: "Contame cuándo y cómo lo usarías."
3. **Extraer el problema subyacente**: "Entonces, leyendo entre líneas, parece que tenés
   el problema de [Y] — ¿es correcto eso? Contame más de ese problema."

**Ejemplo**:

- Entrevistado: "Deberían tener una función de exportar a PDF con un botón"
- Mal: "Claro, te anotamos eso." (acumulás features sin contexto)
- Bien:
  1. "OK, exportar a PDF con un botón."
  2. "Contame cuándo necesitarías hacer eso."
  3. Entrevistado: "Es que cuando mando al cliente el reporte mensual..."
  4. "Entonces el problema real es mandar reportes mensuales a clientes. ¿Cómo lo hacés hoy?"
  5. → ahora estás investigando el problema real, no el feature pedido

---

## 8. Speech Pattern Analysis (Real vs. Aspirational)

Basado en Tabla 6-1 del libro. Categorizar respuestas clave durante o después de la entrevista.

### 🟢 Patrones de CUSTOMER real (alta señal):

| Lo que dicen | Por qué es señal fuerte |
|---|---|
| "Ya probé..." / "Así lo hago..." | Acción en pasado concreto |
| "Necesito [X] más rápido/mejor porque..." | Describen el problema con razón causal |
| "Esto me ayudaría a lograr [meta concreta]..." | Conexión explícita problema→solución |
| "Ahora mismo..." / "En este momento..." | Presente activo |
| "Últimamente..." / "El mes pasado..." | Temporal específico, reciente |

### 🟡 Patrones de NON-CUSTOMER (aspiracional):

| Lo que dicen | Por qué es señal débil |
|---|---|
| "Planeo hacer..." / "Aún no lo probé..." | Futuro hipotético sin acción |
| "[Tarea] es imposible..." / "No sé cómo alguien hace [tarea]..." | Describen el problema como ajeno |
| "Estaría bueno tener..." / "Sería interesante..." | Deseo vago sin compromiso |
| "Pronto..." / "Cuando [evento futuro]..." | Aplazamiento indefinido |
| "¡No lo hago! Debería..." | Reconocimiento de carencia pero sin acción |

### Regla de oro

**Una entrevista con mayoría 🟡 NO valida la hipótesis**. El entrevistado puede ser un
futuro customer potencial, pero hoy no describe comportamiento real — describe aspiración.

No se cuenta para el milestone de "5 entrevistas con patrones consistentes" si la mayoría
fueron aspirationales.

---

## 9. 5 Whys adaptado (con diplomacia)

Técnica para llegar a la causa raíz desde el síntoma. Peligro: si usás "por qué" cinco veces
seguidas sonás como interrogador.

**Versión suave en español** (rotar entre estas formas):

- "¿Y por qué creés que eso pasa?"
- "¿Qué hace que [X] sea así?"
- "¿Cuál es la consecuencia de que eso suceda?"
- "¿Y antes de eso, qué hacía que [síntoma anterior] ocurra?"
- "¿Me podrías contar un poco más sobre por qué eso es importante?"

**Después de 3-4 niveles** de "por qué", generalmente estás en la causa raíz. Más profundidad
tiende a caer en filosofía abstracta.

---

## 10. Foot-in-the-Door (para futuras interacciones)

Al final de CADA entrevista, pedir permiso para seguir contactando.

**Formato**:

> "¿Te puedo mantener en el loop mientras voy aprendiendo? Si tengo más preguntas específicas
> o cuando tenga un prototipo para mostrarte, ¿te puedo escribir?"

**Por qué funciona**:

- Principio de consistencia: quien ya te dio 25 minutos, tiende a dar 5 más en el futuro
- Establece una relación vs. transacción
- Crea un pool de earlyvangelists para Solution Interviews y beta testing

**Extensión — pedir referidos**:

> "Como última pregunta: ¿conocés a 1-2 personas más que vivan un problema similar y con
> quienes valdría la pena que hable? Si me pasás nombres yo me encargo de escribirles."

Referidos calificados tienen ~4x response rate que cold outreach.

---

## 11. Anti-patrones comunes

### 11.1 Leading questions

| Leading (MAL) | Neutral (BIEN) |
|---|---|
| "¿No pensás que [X] es un problema?" | "¿Qué pensás de [área]?" |
| "¿Te gustaría tener [feature]?" | "¿Cómo resolvés [problema] hoy?" |
| "¿No sería genial si hubiera [solución]?" | "Contame más de [problema]." |
| "¿Usás [competidor]? Es el mejor ¿no?" | "¿Qué herramientas usás? ¿Cómo te va con cada una?" |

### 11.2 Yes/No questions

Evitar preguntas binarias. Siempre preguntas abiertas.

| Yes/No (MAL) | Abierta (BIEN) |
|---|---|
| "¿Usás Excel?" | "¿Qué herramientas usás?" |
| "¿Te frustra [X]?" | "¿Cómo te sentís cuando [X]?" |
| "¿Pagarías por esto?" | "Si tuvieras solución a [X], ¿qué cambiaría en tu vida/negocio?" |

### 11.3 Multiple questions en una

| Compuesta (MAL) | Una por vez (BIEN) |
|---|---|
| "¿Cómo lo hacés, con qué herramientas, y cuánto te cuesta?" | (1) "¿Cómo lo hacés?" → esperar respuesta → (2) "¿Con qué herramientas?" → esperar → (3) "¿Cuánto te cuesta?" |

### 11.4 Explicar demasiado el contexto

El opening debe ser breve (1 minuto). Si explicás todo tu proyecto al inicio, sesgás al
entrevistado hacia tus supuestos.

| Mal opening | Buen opening |
|---|---|
| "Estoy haciendo un SaaS de [X] que funciona con [Y] y queremos resolver [Z], así que queríamos preguntarte..." | "Estoy investigando [área general]. Te voy a hacer preguntas sobre cómo [tarea amplia] — no hay respuestas correctas, mientras más específica tu respuesta, más útil para mí." |

---

## 12. Milestones y puertas

### Después de 2 entrevistas: ajuste de preguntas y tono
- ¿Alguna pregunta no funcionó? Ajustar el template.
- ¿El tono fue muy formal/informal? Ajustar.
- ¿Duración fue correcta? Si sistemáticamente se pasa de 30 min, cortar preguntas.

### Después de 5 entrevistas: puerta de emoción
- **Criterio**: Al menos 1 de 5 entrevistados mostró emoción genuina hablando del problema.
- **Si NO**: la hipótesis probablemente está mal. Volver a `02a-lluvia-supuestos.md` y reformular.
- **Si SÍ**: continuar al siguiente milestone.

### Después de 10 entrevistas: patrones emergen
- Listar 3-5 patrones claros en `00-patrones.md`.
- Aplicar técnica "Other People" en siguientes entrevistas para desafiarlos.
- Si hay dos clusters distintos de respuestas → hay dos segmentos; decidir cuál priorizar.

### Después de 15-20 entrevistas: validación o invalidación
- Los 4 criterios de Alvarez se cumplen en ≥70% de entrevistados → **validada** → avanzar a Fase 3.
- Los 4 criterios se cumplen en <70% → **invalidar o pivot** → volver a hipótesis.
- Ya no hay sorpresas nuevas (diminishing returns) → tiempo de pasar a siguiente fase.

---

## 13. Regla general de oro

> "Si el entrevistado dice 'tal vez', anotá 'no'."

La politenés es enemiga de la validación. Las respuestas genuinamente positivas son:
emocionales, específicas, presente, con acción demostrable. Todo lo demás es ruido.

---

## Referencias bibliográficas

- Cindy Alvarez — *Lean Customer Development: Building Products Your Customers Will Buy*
  (O'Reilly, 2014)
  - Capítulo 3: "Who Should I Be Talking To?"
  - Capítulo 4: "What Should I Be Learning?"
  - Capítulo 5: "Get Out of the Building"
  - Capítulo 6: "What Does a Validated Hypothesis Look Like?"
- Eric Ries — *The Lean Startup* (Crown Business, 2011) — Build-Measure-Learn, innovation accounting
- Steve Blank — *The Four Steps to the Epiphany* (K&S Ranch, 2005) — earlyvangelist concept
- Clayton Christensen — *Competing Against Luck* (HarperBusiness, 2016) — Jobs-to-be-Done framework
