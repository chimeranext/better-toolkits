# Spec Delta — shared/heimdall-lanes

## Purpose

Protocolo para evaluar y dar de alta lanes del reviewer Heimdall: ningún modelo entra sin matriz acotada, techo de costo y decisión registrada. Primera aplicación: `typesafe/jev-router`.

## ADDED Requirements

### Requirement: Matriz de evaluación acotada

El sistema SHALL evaluar un lane candidato en 3 tamaños (chico <50 líneas, mediano PR típico, grande token-hungry) contra el default, midiendo tool-calling (llamadas válidas/total), costo USD, latencia wall-clock y rate-limits golpeados.

#### Scenario: Candidato peor en tool-calling se rechaza

- **WHEN** el candidato rompe llamadas que el default resuelve
- **THEN** la decisión es REJECT aunque sea más barato

#### Scenario: Techo de costo frena la eval

- **WHEN** el gasto acumulado alcanza el techo fijado
- **THEN** la eval se detiene y decide con lo medido

### Requirement: Decisión registrada con receipt

El sistema SHALL registrar APPROVE-lane o REJECT con causa + métricas en un receipt de eval (modelo, fecha, upstream observado, commit del harness).

#### Scenario: Decisión trazable meses después

- **WHEN** se pregunta por qué un lane existe o no
- **THEN** el receipt responde sin re-correr nada

### Requirement: Alta solo-registry sin secreto nuevo

El sistema SHALL dar de alta un lane APPROVE solo como entrada REGISTRY (reusando bearer existente), documentando caveats de fase 2 si aplican; el default NO cambia en la misma change.

#### Scenario: Alta mínima

- **WHEN** el veredicto es APPROVE-lane
- **THEN** el diff es entrada + docs, cero secretos y cero cambio de default
