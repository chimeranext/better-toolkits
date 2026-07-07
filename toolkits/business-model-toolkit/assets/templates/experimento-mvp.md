# Diseño de Experimento MVP

> Ciclo de validación: Hipótesis → Prototipo → Prueba → Aprendizaje Validado
> Basado en Running Lean (Ash Maurya) y The Lean Product Playbook (Dan Olsen)

**Fecha:** **\_\_\_**
**Nombre Iniciativa:** **\_\_\_**
**Iteración #:** **\_\_\_**

---

## 1. Hipótesis a Validar

> "La vida es muy corta para construir algo que nadie quiere." — Ash Maurya

### Hipótesis Técnica

| Campo | Valor |
|-------|-------|
| **Supuesto** | `[Enunciado técnico que se someterá a verificación]` |
| **Criterio de comprobación** | `[Métrica específica y umbral de éxito]` |
| **Método de medición** | `[Cómo se medirá — prueba A/B, benchmark, laboratorio, etc.]` |
| **Plazo de verificación** | `[Tiempo estimado para obtener resultados]` |

**Ejemplo:**
> Supuesto: "La intervención de [tecnología X] logra [resultado Y] con [eficiencia Z]"
> Criterio: "El prototipo demuestra un 30% de mejora respecto al baseline"

### Hipótesis Comercial

| Campo | Valor |
|-------|-------|
| **Supuesto** | `[Enunciado sobre aceptación de mercado]` |
| **Criterio de comprobación** | `[Tamaño de muestra + % mínimo de aceptación]` |
| **Método de medición** | `[Encuestas, landing page, pre-ventas, LOIs, etc.]` |
| **Plazo de verificación** | `[Tiempo estimado]` |

**Ejemplo:**
> Supuesto: "El producto [X] es aceptable para [segmento Y]"
> Criterio: "De 30 personas del perfil, al menos 70% lo considera viable para uso recurrente"

### Hipótesis del Modelo de Negocio (opcional)

| Campo | Valor |
|-------|-------|
| **Supuesto** | `[Enunciado sobre viabilidad del modelo]` |
| **Criterio de comprobación** | `[Métrica financiera — CAC, LTV, conversión, etc.]` |
| **Método de medición** | `[Cómo se medirá]` |

---

## 2. Diseño del Prototipo

> El prototipo NO es el producto final — es una herramienta de aprendizaje.

### Tipo de Prototipo

- [ ] **Prototipo de concepto** — Mockups, wireframes, storyboards
- [ ] **Prototipo funcional** — Demo con funcionalidad limitada
- [ ] **Landing page** — Página de aterrizaje para medir interés
- [ ] **Wizard of Oz** — Proceso manual que simula automatización
- [ ] **Concierge** — Servicio manual personalizado
- [ ] **Video explicativo** — Demuestra la solución sin construirla
- [ ] **Prototipo técnico** — Prueba de concepto técnico (PoC)
- [ ] **MVP funcional** — Producto mínimo con features esenciales

### Descripción del Prototipo

```
[Qué se va a construir, con qué herramientas, y qué nivel de fidelidad tendrá]
```

### Features incluidas en el MVP

| # | Feature | Hipótesis que valida | Esfuerzo (S/M/L) |
|---|---------|---------------------|-------------------|
| 1 | `[Feature]` | `[Qué hipótesis prueba]` | `[S/M/L]` |
| 2 | `[Feature]` | `[Qué hipótesis prueba]` | `[S/M/L]` |
| 3 | `[Feature]` | `[Qué hipótesis prueba]` | `[S/M/L]` |

### Features explícitamente EXCLUIDAS del MVP

| # | Feature | Razón de exclusión |
|---|---------|-------------------|
| 1 | `[Feature]` | `[No es necesaria para validar la hipótesis]` |
| 2 | `[Feature]` | `[Puede agregarse después de validar]` |

### Recursos necesarios

| Recurso | Detalle | Costo estimado |
|---------|---------|---------------|
| Tiempo | `[X semanas]` | — |
| Personas | `[Roles necesarios]` | `[$X]` |
| Herramientas | `[Software, hardware, materiales]` | `[$X]` |
| **Total** | | **$[X]** |

---

## 3. Plan de Prueba

### Diseño del Experimento

| Aspecto | Detalle |
|---------|---------|
| **Población objetivo** | `[Descripción del segmento a testear]` |
| **Tamaño de muestra** | `[N personas/empresas]` |
| **Método de reclutamiento** | `[Cómo encontrarás participantes]` |
| **Duración del experimento** | `[X días/semanas]` |
| **Métricas principales** | `[Qué se mide y cómo]` |
| **Métricas secundarias** | `[Señales adicionales a observar]` |

### Métricas de Éxito (Go/No-Go)

| Métrica | Umbral mínimo (No-Go) | Target (Go) | Excepcional |
|---------|----------------------|-------------|-------------|
| `[Métrica 1]` | `[< X = pivotar]` | `[≥ X = persistir]` | `[> Y = escalar]` |
| `[Métrica 2]` | `[< X]` | `[≥ X]` | `[> Y]` |

### Cronograma del Experimento

| Semana | Actividad | Entregable |
|--------|-----------|-----------|
| 1 | `[Actividad]` | `[Entregable]` |
| 2 | `[Actividad]` | `[Entregable]` |
| 3 | `[Actividad]` | `[Entregable]` |
| 4 | `[Actividad]` | `[Entregable]` |

---

## 4. Resultados

> Completar DESPUÉS de ejecutar el experimento.

### Datos Recolectados

| Métrica | Resultado | vs Target | Señal |
|---------|----------|-----------|-------|
| `[Métrica 1]` | `[Resultado]` | `[Arriba/Debajo]` | 🟢 / 🟡 / 🔴 |
| `[Métrica 2]` | `[Resultado]` | `[Arriba/Debajo]` | 🟢 / 🟡 / 🔴 |

### Evidencia Cualitativa

```
[Citas textuales, observaciones, patrones detectados en las pruebas]
```

---

## 5. Aprendizaje Validado

### ¿Qué aprendimos?

1. `[Aprendizaje principal — ¿la hipótesis se confirmó, refutó o fue inconclusa?]`
2. `[Aprendizaje secundario — ¿qué no esperábamos encontrar?]`
3. `[Aprendizaje sobre el mercado — ¿cómo reaccionó el segmento?]`

### Decisión: Pivotar, Persistir o Abortar

- [ ] **PERSISTIR** — La hipótesis se confirmó. Seguir iterando con mejoras incrementales.
- [ ] **PIVOTAR** — La hipótesis se refutó parcialmente. Cambiar [aspecto específico] manteniendo [lo que funcionó].
- [ ] **ABORTAR** — La hipótesis se refutó completamente. El problema no es suficientemente importante o la solución no es viable.

### Si PIVOTAR: Tipo de Pivote

- [ ] **Zoom-in**: Una feature se convierte en el producto completo
- [ ] **Zoom-out**: El producto se convierte en una feature de algo más grande
- [ ] **Segmento de cliente**: Mismo producto, diferente segmento
- [ ] **Necesidad del cliente**: Mismo segmento, diferente problema
- [ ] **Plataforma**: Cambio de app a plataforma (o viceversa)
- [ ] **Arquitectura de negocio**: B2B ↔ B2C, margen alto ↔ volumen
- [ ] **Canal**: Cambio en el canal de distribución
- [ ] **Tecnología**: Misma solución, diferente tecnología
- [ ] **Motor de crecimiento**: Cambio en estrategia de adquisición

### Siguiente Iteración

```
[Describir qué se hará en la siguiente vuelta del ciclo Hipótesis → Prototipo → Prueba → Aprendizaje]
```

---

## 6. Uso de Fondos (si aplica)

| Categoría | Monto asignado | Monto ejecutado | % Ejecución |
|-----------|---------------|----------------|-------------|
| Desarrollo/Prototipado | $`[X]` | $`[X]` | `[X]`% |
| Materiales/Insumos | $`[X]` | $`[X]` | `[X]`% |
| Pruebas/Validación | $`[X]` | $`[X]` | `[X]`% |
| Otros | $`[X]` | $`[X]` | `[X]`% |
| **Total** | **$[X]** | **$[X]** | **[X]%** |

---

> 💡 **Referencia**: Ciclo de Experimentación — *Running Lean* (Ash Maurya) + *The Lean Product Playbook* (Dan Olsen). Los tipos de pivote son del *Lean Startup* (Eric Ries).
