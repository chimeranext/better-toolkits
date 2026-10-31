# AFIF — Anti-Fragility via Fault Injection (doctrine)

> A check you have never seen fail proves nothing. A system that has never been
> stressed has never been hardened.

## Sigla

**AFIF** — Anti-Fragility via Fault Injection.

## Propósito

El objetivo no es "probar que una comprobación puede fallar" (eso es solo el
mecanismo). El objetivo es **anti-fragilidad**: sistemas que se **fortalecen**
al ser inyectados con fallos, en **todas las capas de abstracción**. Un sistema
anti-frágil no solo sobrevive a la perturbación — mejora con ella, porque cada
fallo inyectado revela y cierra una debilidad.

## Doctrina

### 1. Anti-fragilidad, no solo resiliencia

- **Resiliencia** = el sistema sobrevive al fallo (no se cae).
- **Anti-fragilidad** = el sistema se vuelve *mejor* tras el fallo (la
  perturbación expone una debilidad, la inyección la hace visible, y la
  corrección queda permanentemente — como un gate nuevo, una prueba nueva, un
  estándar nuevo).

La inyección de fallos es el *entrenamiento*; la anti-fragilidad es el
*resultado*: cada fallo inyectado debe dejar al sistema con una defensa que no
tenía antes.

### 2. La regla de oro (el mecanismo)

Una comprobación que nunca ha fallado no está probada — está sin probar. Por lo
tanto, cada gate, invariante, suite de pruebas o modelo formal debe incluir
**al menos un caso negativo deliberado** (una mutación, una violación, un fallo
inyectado) y demostrar que lo detecta.

### 3. Capas de inyección (todas las abstracciones)

El mismo principio se aplica en cada nivel:

| Capa | Inyección de fallo | Qué se fortalece |
|---|---|---|
| **Código** | mutation testing: mutar un guard, invertir una comparación, borrar un return | la suite de tests (detección) |
| **Modelos formales** | self-test del verificador: romper un invariante en TLA+ | el model checker (debe dar contraejemplo) |
| **Infraestructura** | chaos engineering: matar instancias, latencia, red partida | la resiliencia del sistema runtime |
| **Gates/procesos** | inyectar un input prohibido (patrón stderr, hash hardcodeado) | el gate (debe bloquear, exit ≠ 0) |
| **Orquestación** | lanzar tareas con overlap lógico deliberado | el orquestador (debe secuenciar / detectar) |

Cada capa usa el mismo patrón adversarial — *fault injection* — pero sobre la
abstracción que le corresponde. La anti-fragilidad del sistema completo es la
suma de la anti-fragilidad de cada capa.

### 4. "Nunca visto fallar" no es un pass

Un check que nunca ha fallado se tratará como **no verificado**, no como verde.
Al añadir un gate nuevo, el caso negativo viaja en el mismo change; hasta que se
demuestre, el gate es provisional.

### 5. Fortalecimiento obligatorio (el cierre anti-frágil)

Cada fallo inyectado que se detecta debe dejar una **defensa permanente**:
- la prueba negativa queda registrada (no se borra),
- el gate/estándar que la detecta queda documentado,
- el hallazgo se alimenta al análisis de causa raíz (`/ishikawa`) — no se
  descarta como "solo una prueba".

Si un fallo inyectado se detecta pero no produce ninguna mejora permanente, la
inyección no cumplió su propósito anti-frágil.

### 6. Relación con otros estándares

- **Jidoka** → detente ante la anomalía; AFIF prueba que la detención dispara.
- **StS** → el gate de stderr debe demostrar que bloquea un redirect prohibido.
- **No-Workarounds** → una señal suprimida es fallo; AFIF exige probar que la
  ruta de detección no está suprimida.
- **QT4L** → la trazabilidad incluye la demostración negativa por requisito.
- **AVV (anterior nombre)** → esta doctrina es la evolución de "Adversarial
  Verification": el mecanismo sigue siendo adversarial, pero el objetivo
  declarado es la anti-fragilidad, no la mera verificación.

## Consecuencia

- Los gates nuevos viajan con su caso negativo en el mismo change.
- Un modelo formal no está "verificado" hasta que su ruta de contraejemplo se ha
  visto al menos una vez.
- Los reviewers preguntan, ante cualquier check nuevo: "muéstrame fallando".
- Cada fallo inyectado detectado deja una defensa permanente (prueba, gate,
  estándar, o hallazgo de causa raíz) — ese es el cierre anti-frágil.
