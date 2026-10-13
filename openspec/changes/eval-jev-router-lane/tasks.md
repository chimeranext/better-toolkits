# Tasks — eval-jev-router-lane

## 1. Ficha del candidato

- [x] 1.1 Consultar OpenRouter (`GET /models`, pricing de `typesafe/jev-router`, identificar modelo-detrás si es público) y verificar respuesta con upstream y costo/1M tokens registrados
- [x] 1.2 Fijar techo de costo de la eval en este archivo antes de correr nada y verificar que el harness lo enforcea — **TECHO: USD 5** (3 celdas × 2 lanes; pricing del router variable `-1`, ver ficha en `references.md`)

## 2. Matriz de evaluación

- [ ] 2.1 Correr celda chica (<50 líneas) en ambos lanes y verificar métricas tool-calling/costo/latencia registradas con upstream observado
- [ ] 2.2 Correr celda mediana (PR típico) en ambos lanes con revisión ciega y verificar veredicto comparativo documentado
- [ ] 2.3 Correr celda grande (token-hungry) y verificar comportamiento de rate-limit registrado (pass o INCONCLUSIVE fundado)

## 3. Decisión y cierre

- [ ] 3.1 Emitir receipt de eval con decisión APPROVE-lane o REJECT con causa y verificar que cita métricas, no opiniones
- [ ] 3.2 Solo si APPROVE: agregar entrada REGISTRY + docs con caveats y verificar que el default sigue intacto y ningún secreto nuevo aparece en el diff
- [ ] 3.3 Correr `openspec validate --change eval-jev-router-lane` y verificar que pasa sin errores
