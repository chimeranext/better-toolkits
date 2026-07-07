# Selector de Tipo de MVP — [Proyecto]

> Basado en *Lean Customer Development* (Alvarez, O'Reilly 2014), cap. 7 —
> "What Kind of Minimum Viable Product Should I Build?".
>
> No todos los MVPs son iguales. El tipo correcto depende de **qué riesgo querés validar**
> y **qué recursos tenés disponibles**. Elegir mal puede generar falsas señales — una landing
> page hermosa que captura emails puede no predecir nada sobre la disposición a pagar real.

---

## Paso 1: ¿Qué supuesto principal querés validar?

> Marcar UNO (el más crítico para la supervivencia del producto).

- [ ] **A. Disposición a pagar** — ¿los clientes realmente pondrán dinero?
- [ ] **B. Interés y engagement** — ¿se registra audiencia en torno a esto?
- [ ] **C. Logística / operación** — ¿podemos entregar el servicio físicamente / operacionalmente?
- [ ] **D. Comportamiento real en uso** — ¿cómo se comportan cuando tienen el producto en manos?
- [ ] **E. Priorización de features / dirección** — ¿qué feature es la más crítica del set?
- [ ] **F. Demanda de mercado usando canales existentes** — ¿alguien paga por algo similar hoy?

---

## Paso 2: Preguntas de contexto

> Responder las 4 preguntas. Las combinaciones de respuestas sugieren tipos específicos de MVP.

### Q2.1: ¿Cuál es tu restricción principal?

- [ ] Tiempo (necesito validar rápido)
- [ ] Dinero (capital muy limitado)
- [ ] Habilidad técnica (no puedo construir software complejo solo/a)
- [ ] Acceso al mercado (difícil llegar a clientes)

### Q2.2: ¿Tu producto requiere construir algo significativo (software, hardware, operaciones físicas) antes de poder mostrarlo?

- [ ] Sí, construcción significativa (meses de dev)
- [ ] No, puedo "fingir" la experiencia manualmente o con mockups

### Q2.3: ¿Tenés audiencia previa (email list, seguidores, comunidad)?

- [ ] Sí, tengo N+ personas que ya siguen lo que hago
- [ ] No, parto de cero

### Q2.4: ¿Qué tan crítica es la confianza del cliente antes de comprar? (ej. salud, legal, finanzas = alta)

- [ ] Muy crítica (clientes necesitan confianza alta antes de pagar)
- [ ] Media
- [ ] Baja (clientes pagan por impulso / bajo compromiso)

---

## Paso 3: Catálogo de los 6 tipos de MVP

### 1. Pre-Order MVP (Pre-venta)

**Qué valida**: Disposición a pagar (criterio A)

**Cómo**: Ofrecés comprar el producto ANTES de construirlo. El cliente paga (o se compromete
financieramente) con la promesa de entrega futura.

**Ejemplos**:
- Kickstarter campaigns
- Landing page con botón "Comprar ahora" que redirige a cuestionario de pre-orden
- Hola Kombucha, Pebble Watch

**Cuándo usarlo**:
- Necesitás validar que la gente SACA la tarjeta
- El producto tiene costo alto de construcción (hardware, software grande)
- Tenés forma de llegar a audiencia target

**Cuándo NO usarlo**:
- El cliente necesita probar primero (regulación, alto riesgo)
- No podés cumplir la entrega si se vende mucho o muy poco

**Nivel de inversión**: Medio (landing page + marketing + logística de cobro)

**Riesgo principal**: Si falla, perdés credibilidad con los que pre-pagaron

---

### 2. Audience Building MVP (Construcción de Audiencia)

**Qué valida**: Interés y engagement (criterio B)

**Cómo**: Construís audiencia (newsletter, comunidad, blog, Discord) antes de tener producto.
Mides si crece orgánicamente y si engagement es alto.

**Ejemplos**:
- Newsletter de Packy McCormick (Not Boring) antes de lanzar fund
- Comunidad de Indie Hackers antes de monetizar
- Canal de YouTube con N suscriptores

**Cuándo usarlo**:
- Producto es info-product, SaaS, consultoría
- Tenés habilidad de crear contenido
- Tiempo es el recurso más abundante; dinero el más escaso

**Cuándo NO usarlo**:
- Producto requiere validación inmediata (competencia rápida)
- No te gusta o no podés crear contenido consistente

**Nivel de inversión**: Bajo (solo tiempo de contenido)

**Riesgo principal**: Audiencia puede no convertir en clientes pagos

---

### 3. Concierge MVP (Servicio Concierge)

**Qué valida**: Demanda + supuestos de logística (criterios C + A)

**Cómo**: Entregás el servicio **manualmente**, persona a persona, sin automatizar. Un cliente
a la vez, alta atención personalizada. Probás si la gente paga por el RESULTADO.

**Ejemplos**:
- Food On The Table: los fundadores iban casa por casa entregando listas de compras personalizadas antes de construir el software
- CityPockets: manualmente mandaban emails a usuarios con ofertas agregadas antes de construir plataforma

**Cuándo usarlo**:
- La logística es el riesgo principal (no la tecnología)
- Querés entender el cliente profundamente antes de automatizar
- Audiencia offline, física, o con necesidades heterogéneas

**Cuándo NO usarlo**:
- Necesitás escalar rápido para competir
- Operación manual no es factible por restricciones tuyas (tiempo, ubicación)

**Nivel de inversión**: Alto en tiempo por cliente, bajo en construcción

**Riesgo principal**: Parece que escala, pero el bottleneck es tu tiempo personal

---

### 4. Wizard of Oz MVP

**Qué valida**: Comportamiento real en uso (criterio D)

**Cómo**: Construís la INTERFAZ que simula el producto, pero las funciones complejas (algoritmos,
matching, recomendaciones) se ejecutan **manualmente por humanos detrás del escenario**.
El usuario cree que interactúa con software completo.

**Ejemplos**:
- Zappos (fundador tomaba fotos de zapatos en tiendas, los subía; cuando alguien compraba,
  corría a comprarlos y los enviaba)
- IBM Shoebox: aparentaba ser voice recognition automático, era operada por personas
- Primeros sistemas de Aardvark (Q&A): parecían automatizados, eran moderados por humanos

**Cuándo usarlo**:
- Algoritmo o IA eventualmente necesario es sofisticado (caro de construir)
- Querés validar que la experiencia genera valor antes de invertir en automatización
- Marketplace de dos lados (se necesita matching)
- Problema sensible (querés garantizar que nada se rompe hasta validar)

**Cuándo NO usarlo**:
- Escala esperada es masiva desde día 1
- No podés dedicar personas al backend manual

**Nivel de inversión**: Medio (interfaz real + costo operativo del "wizard")

**Riesgo principal**: Usuarios descubren que es manual y pierden confianza

---

### 5. Single Use Case MVP (Un Solo Caso de Uso)

**Qué valida**: Dirección / feature focus (criterio E)

**Cómo**: En lugar de lanzar el producto completo con todas las features, lanzás UNA sola
funcionalidad / caso de uso. Medís si resuelve el problema específico suficientemente bien.

**Ejemplos**:
- Dropbox al inicio: solo sync de archivos, nada más
- Instagram original: solo filtros fotográficos + compartir
- Buffer original: solo scheduling de tweets

**Cuándo usarlo**:
- Mercado dominado por competidor grande (no podés competir en features)
- Tenés producto existente pero querés validar nuevo segmento/caso
- Querés entender qué subconjunto de features realmente importa

**Cuándo NO usarlo**:
- La propuesta de valor DEPENDE de la combinación de features (integración)
- Mercado espera completeness (SaaS B2B enterprise)

**Nivel de inversión**: Medio-bajo (solo una feature pero bien hecha)

**Riesgo principal**: Subestimar cuánto la integración de features es parte del valor

---

### 6. Other People's Product MVP (Producto de Otros)

**Qué valida**: Demanda de mercado usando infraestructura existente (criterio F)

**Cómo**: No construís nada propio. Usás un producto/plataforma EXISTENTE para probar
la demanda en tu audiencia. Si compran/engagen con el producto de otros, validás que el
mercado existe.

**Ejemplos**:
- Revender un producto afiliado a tu audiencia antes de construir el tuyo
- Dropshipping: vendés productos de otros sin mantener inventario
- Service stack: armás un servicio combinando Zapier + Airtable + otros antes de construir software propio

**Cuándo usarlo**:
- Querés entrar a un espacio establecido sin reinventar la rueda
- Recursos de ingeniería limitados
- Logística es impredecible (dropshipping resuelve esto)

**Cuándo NO usarlo**:
- Tu diferenciador REQUIERE tecnología propia
- El producto "de otros" es mediocre y dañará tu marca

**Nivel de inversión**: Bajísimo (solo marketing + partnerships)

**Riesgo principal**: No aprendés a construir tu propia capacidad

---

## Paso 4: Decisión

Basándote en Paso 1 (supuesto principal) + Paso 2 (contexto), revisar el catálogo y elegir:

**Tipo de MVP seleccionado**: `[nombre]`

**Razón principal**:

```
[¿Por qué este tipo encaja mejor? Atar al supuesto principal + restricciones]
```

**Lo que NO aprenderás con este MVP** (y por qué está bien no aprenderlo ahora):

```
[Ser honesto — cada tipo tiene blind spots. Documentarlos para no sorprenderte]
```

**Ejemplo de combinación posible**: Algunos proyectos usan 2 tipos en secuencia
(ej. Audience Building primero para construir audiencia → Pre-Order MVP cuando
la audiencia es suficiente). Si elegís combinar, documentar la secuencia y los gates.

---

## Paso 5: Criterios de éxito del MVP

Antes de lanzarlo, definir qué números significan "validó" vs. "no validó":

| Métrica | Umbral que VALIDA | Umbral que INVALIDA | Cómo la medís |
|---|---|---|---|
| Ej. Pre-orden: conversión landing → compra | ≥ 5% | < 1% | Google Analytics + Stripe |
| Ej. Audience Building: growth mensual | ≥ 20% MoM | < 5% MoM | Mailchimp analytics |
| Ej. Concierge: NPS de clientes servidos | ≥ 8/10 | ≤ 5/10 | Survey post-servicio |

> **Regla crítica**: definir los umbrales ANTES de lanzar. De lo contrario, ex-post vas a
> racionalizar cualquier número como "prometedor". El umbral escrito de antemano es defensa
> contra confirmation bias.

---

## Paso 6: Timeline y resources

- **Duración del MVP**: `[N semanas]`
- **Budget estimado**: `[$X]`
- **Equipo**: `[quién hace qué]`
- **Go/no-go decision date**: `[YYYY-MM-DD]`

> En la fecha de decisión, revisar los criterios del Paso 5. Decidir sin postergar.
> Pivot, persevere, o kill — las tres son respuestas válidas. La única respuesta **inválida**
> es "dejemos el MVP corriendo un tiempo más a ver qué pasa".
