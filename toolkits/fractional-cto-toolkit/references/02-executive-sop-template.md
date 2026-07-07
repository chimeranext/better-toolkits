# Guia de Transicion Tecnologica — {NOMBRE_PROYECTO}

> Este documento explica, en lenguaje no-tecnico, el proceso que vamos a seguir
> para tomar control de tu proyecto de software. Leelo antes de contactar al
> desarrollador anterior.

---

## ¿Por que necesitamos un proceso formal?

Cuando un proyecto de software cambia de manos sin un proceso ordenado, pueden pasar
cosas costosas:

- **Perdida de acceso:** Si el desarrollador anterior es el unico que sabe las contraseñas
  de los servicios, perder su cooperacion significa perder acceso a tu propio producto.
- **Riesgo legal:** Sin un documento firmado que diga "el codigo es tuyo", el desarrollador
  podria argumentar que el es el dueño — aunque tu le hayas pagado por hacerlo.
- **Tiempo muerto:** Si no sabemos donde esta cada cosa, podriamos tardar semanas en
  reconstruir lo que deberia tomar dias.

Este proceso existe para proteger tu inversion y minimizar riesgos.

---

## Nivel de Riesgo de tu Proyecto

{BLOQUE_RIESGO}

<!-- El skill reemplaza esto con el nivel calculado y una explicacion en contexto -->

---

## ¿Que vamos a hacer? (Resumen del proceso)

### Fase 1 — Proteger lo que ya tienes

**¿Que es?** Asegurarnos de que el codigo, los datos, y las cuentas esten bajo TU control.

**¿Por que importa?** Hasta que todo este a tu nombre, dependes de la buena voluntad
del desarrollador anterior. Si la relacion se deteriora, podrias perder acceso.

**Lo que necesitas hacer:**
- Consultar con un abogado si no tienes un contrato que establezca que el codigo es tuyo
- Obtener la lista de cuentas y servicios que el desarrollador creo para tu proyecto

**Lo que yo (tu CTO) hago:**
- Hacer una copia de seguridad del codigo antes de cualquier cambio
- Verificar que todo lo que dice que entrego, efectivamente funciona

---

### Fase 2 — Inventario completo

**¿Que es?** Hacer una lista de TODAS las piezas que componen tu producto — el codigo,
los servidores, las bases de datos, los servicios externos, los diseños.

**¿Por que importa?** Imagina que compras un restaurante pero no te dicen que hay un
contrato con el proveedor de gas que vence en 2 semanas. Lo mismo pasa con software:
hay servicios que se pagan mensualmente, cuentas que expiran, y dependencias invisibles.

**Lo que necesitas hacer:**
- Compartir cualquier factura, recibo, o email relacionado con servicios tecnologicos
- Dar acceso a tu email corporativo si ahi llegan notificaciones de servicios

**Lo que yo (tu CTO) hago:**
- Mapear cada servicio, quien lo paga, y que pasa si se cae
- Identificar costos recurrentes que quizas no conocias

---

### Fase 3 — Seguridad

**¿Que es?** Cambiar todas las "llaves" del proyecto para que solo nosotros tengamos acceso.

**¿Por que importa?** El desarrollador anterior conoce todas las contraseñas y accesos de
tu producto. Aun si la relacion es amigable, es buena practica cambiar todo — igual que
cambias la cerradura cuando compras una casa.

**Lo que necesitas hacer:**
- Nada — yo me encargo. Solo necesito que ya se haya completado la Fase 1.

**Lo que yo (tu CTO) hago:**
- Cambiar todas las contraseñas y llaves de acceso
- Remover al desarrollador anterior de todos los sistemas
- Activar seguridad adicional (verificacion en dos pasos) en las cuentas criticas

---

### Fase 4 — Verificacion

**¿Que es?** Confirmar que todo funciona correctamente despues de la transicion.

**¿Por que importa?** No basta con tener las llaves — hay que abrir cada puerta y
verificar que adentro todo esta en orden.

**Lo que necesitas hacer:**
- Probar el producto como lo haria un usuario normal
- Reportar cualquier cosa que funcione diferente a como la recordabas

**Lo que yo (tu CTO) hago:**
- Verificar que puedo construir y publicar el producto desde cero
- Verificar que los respaldos de datos funcionan
- Documentar como esta todo para que nunca mas dependas de una sola persona

---

## Cronograma Estimado

{BLOQUE_CRONOGRAMA}

<!-- El skill reemplaza esto segun el nivel de riesgo:
ALTO:  Fase 1 (dia 1-2), Fase 2 (dia 3-4), Fase 3 (dia 2), Fase 4 (dia 5-7)
MEDIO: Fase 1 (semana 1), Fase 2 (semana 1-2), Fase 3 (semana 2), Fase 4 (semana 2-3)
BAJO:  Fase 1-4 en 2-3 semanas a ritmo normal
-->

---

## Que necesito de ti AHORA

Antes de que yo pueda empezar, necesito que:

1. **Decidas sobre el tema legal** — ¿tienes un contrato con el desarrollador que diga
   que el codigo es tuyo? Si no, necesitas un abogado antes de avanzar.
2. **Me des acceso** a los sistemas que ya controlas (email, cuentas cloud que conozcas).
3. **Revises el documento de solicitud de entrega** que prepare — es la lista de lo que
   le pediremos al desarrollador anterior.

---

## Preguntas Frecuentes

**¿Y si el desarrollador se niega a entregar?**
Depende del contrato. Con un contrato de cesion de IP, tienes respaldo legal.
Sin contrato, la situacion es mas compleja — un abogado de propiedad intelectual
puede asesorarte. Mientras tanto, yo puedo evaluar que tanto del proyecto es
recuperable sin su cooperacion.

**¿Puedo seguir usando el producto mientras hacemos la transicion?**
Si. La transicion no afecta el servicio actual. Los cambios de seguridad (Fase 3)
se hacen de forma que el producto siga funcionando sin interrupcion.

**¿Cuanto cuesta esto?**
El proceso de transicion es parte de mi servicio como CTO. Los unicos costos
adicionales serian: abogado (si se necesita) y posibles servicios cloud que esten
bajo la cuenta del desarrollador y necesiten migrarse a la tuya.

**¿Que pasa si descubrimos que el codigo es de mala calidad?**
Es posible. Una vez completado el inventario, te dare un reporte honesto del
estado del proyecto: que funciona bien, que necesita mejoras, y que opciones
tenemos. Ese analisis es parte de la Fase 4.

---

> **Siguiente paso:** Revisa el documento adjunto "{NOMBRE_PROYECTO} — Solicitud de Entrega"
> y confirmame si estas de acuerdo con enviarselo al desarrollador.
