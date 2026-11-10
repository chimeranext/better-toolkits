# Guía de transición tecnológica — {{NOMBRE_PROYECTO}}

> **Tipo de documento:** guía cliente (pack de `/project-takeover`).
> Un solo archivo para el lead. Internamente sigue **Diátaxis** en cuatro
> secciones etiquetadas (Explanation → Tutorial → How-to → Reference).
> En un sitio de docs cada sección sería una página; aquí viajan juntas
> porque el lead recibe un documento, no un handbook.
>
> Léelo antes de contactar al desarrollador anterior. Lenguaje no técnico.

| Sección Diátaxis | Necesidad del lead | Qué encontrarás |
|---|---|---|
| **Explanation** | Entender *por qué* | Riesgo, costos de un handover informal |
| **Tutorial** | Orientarse la primera vez | Recorrido de las fases (qué verás) |
| **How-to** | Resolver tareas concretas | Qué hacer vos / qué hace el CTO |
| **Reference** | Consultar datos | Cronograma, FAQ, documentos del pack |

---

## 1. Explanation — ¿Por qué un proceso formal?

Cuando un proyecto de software cambia de manos sin orden, pueden pasar cosas costosas:

- **Pérdida de acceso:** si el desarrollador anterior es el único que conoce las
  contraseñas, perder su cooperación puede significar perder acceso a tu propio producto.
- **Riesgo legal:** sin un documento firmado que diga que el código es tuyo, el
  desarrollador podría argumentar que él es el dueño — aunque le hayas pagado por hacerlo.
- **Tiempo muerto:** si no sabemos dónde está cada pieza, reconstruir lo que debería
  tomar días puede tomar semanas.

Este proceso existe para proteger tu inversión y reducir esos riesgos. No sustituye el
contrato comercial ni los planes de gobernanza (SPMP / riesgos) que arrancan después
con el PSA.

### Nivel de riesgo de tu proyecto

{{BLOQUE_RIESGO}}

<!-- El skill reemplaza esto con el nivel (ALTO / MEDIO / BAJO) y una explicación
     en lenguaje de negocio: qué implica para plazos, abogado y urgencia. -->

---

## 2. Tutorial — Recorrido de la transición (primera lectura)

Leé esta sección de punta a punta la primera vez. No es una lista de tareas
(eso está en How-to). Es el mapa de lo que va a pasar.

### Fase 1 — Proteger lo que ya tienes

Nos aseguramos de que el código, los datos y las cuentas queden bajo **tu** control.
Hasta entonces dependés de la buena voluntad del desarrollador anterior.

### Fase 2 — Inventario completo

Listamos todas las piezas del producto: código, servidores, bases de datos,
servicios externos, diseños. Como comprar un restaurante sin saber que el contrato
del gas vence en dos semanas: el software también tiene costos y cuentas invisibles.

### Fase 3 — Seguridad

Cambiamos las “llaves” del proyecto. Aunque la relación sea amigable, es buena
práctica — igual que cambiar la cerradura al comprar una casa.

### Fase 4 — Verificación

Confirmamos que todo funciona después del cambio de manos. Tener las llaves no basta:
hay que abrir cada puerta.

Al final del recorrido deberías poder explicar a otra persona, en dos minutos,
por qué hay reunión de entrega firmada y por qué el CTO hace copia de seguridad
*antes* de hablar con el desarrollador anterior.

---

## 3. How-to — Qué hacer (tareas)

Objetivo: completar lo que el lead debe decidir o entregar. Pasos concretos.
Si aún no leíste Explanation + Tutorial, volvé atrás.

### Qué necesito de vos AHORA

1. **Decidir el tema legal** — ¿tenés un contrato que diga que el código es tuyo?
   Si no, necesitás abogado antes de avanzar (sobre todo en riesgo ALTO / MEDIO).
2. **Dar acceso** a los sistemas que ya controlás (email, cuentas cloud que conozcas).
3. **Revisar la solicitud de entrega** — es la lista de lo que pediremos al
   desarrollador anterior en la reunión.

### Por fase — vos vs el CTO

| Fase | Vos (lead / cliente) | CTO (takeover lead) |
|---|---|---|
| 1 Proteger | Abogado si falta cesión de IP. Lista de cuentas que conozcas. | Copia de seguridad / fork **antes** de la reunión. Verificar entregables. |
| 2 Inventario | Facturas, recibos, emails de servicios. Acceso al email corporativo. | Mapa de servicios, quién paga, qué pasa si cae. Costos recurrentes. |
| 3 Seguridad | Nada operativo (salvo aprobar ventanas si el producto está en vivo). | Rotar accesos, remover al desarrollador anterior, 2FA en cuentas críticas. |
| 4 Verificación | Probar el producto como usuario. Reportar rarezas. | Build/deploy desde cero, backups, documentación para no depender de una sola persona. |

### Reunión de entrega

1. Confirmar fecha con el desarrollador anterior.
2. Presentar `{{NOMBRE_PROYECTO}} — Solicitud de entrega`.
3. Firmar de aceptado (ambas partes).
4. Si incumple plazos firmados → llevar el firmado + plantilla de ultimátum al abogado.
   El ultimátum **no** lo envía el CTO sin abogado.

---

## 4. Reference — Cronograma, FAQ, documentos

### Cronograma estimado

{{BLOQUE_CRONOGRAMA}}

<!-- Sustituir según riesgo:
ALTO:  Fase 1 (día 1-2), Fase 2 (día 3-4), Fase 3 (día 2), Fase 4 (día 5-7)
MEDIO: Fase 1 (semana 1), Fase 2 (semana 1-2), Fase 3 (semana 2), Fase 4 (semana 2-3)
BAJO:  Fases 1-4 en 2-3 semanas a ritmo normal
-->

### Documentos del pack (consulta rápida)

| Archivo | Quién lo usa | Cuándo |
|---|---|---|
| Esta guía | Lead / cliente | Antes y durante la transición |
| `playbook-{{SLUG}}.md` | CTO | Elegir rama alto / medio / bajo (interno) |
| `legal-template-delivery-request-{{SLUG}}.md` | Lead + desarrollador | Reunión — se firma |
| `legal-template-breach-notice-{{SLUG}}.md` | Abogado del lead | Solo si hay incumplimiento |

### Preguntas frecuentes

**¿Y si el desarrollador se niega a entregar?**
Depende del contrato. Con cesión de IP tenés respaldo. Sin contrato, un abogado de
propiedad intelectual asesora. Mientras tanto el CTO evalúa qué es recuperable sin
cooperación.

**¿Puedo seguir usando el producto durante la transición?**
Sí. La transición no apaga el servicio. Los cambios de seguridad (Fase 3) se hacen
para que el producto siga funcionando.

**¿Cuánto cuesta esto?**
La transición forma parte del servicio de CTO. Costos adicionales típicos: abogado
(si hace falta) y servicios cloud que haya que migrar a tu cuenta.

**¿Qué pasa si el código es de mala calidad?**
Es posible. Tras el inventario, el CTO entrega un reporte honesto: qué funciona,
qué mejorar, opciones. Ese análisis cierra la Fase 4.

**¿Esto reemplaza SPMP / planes de riesgo?**
No. Tras el pack, el siguiente paso comercial/gobernanza es `/contract-psa`
(Hito 1 Discovery).

---

> **Siguiente paso:** revisá "{{NOMBRE_PROYECTO}} — Solicitud de entrega" y confirmá
> si estás de acuerdo con enviársela al desarrollador.
