# Jidoka — Stop-on-Anomaly (doctrina)

> Policy/doctrine SSOT para la disciplina **Jidoka** (detenerse ante una anomalía).
> Es una doctrina de agente/ingeniería, **separada** de StS (streams) y de
> No-Workarounds (suplemento). Vive aquí como estándar de ingeniería.

## Doctrina

1. **Detenerse ante cualquier anomalía.** Cuando una verificación falla o se
   detecta una señal inesperada, se **detiene** la ejecución — nunca se continúa
   "a ver si el resto funciona".
2. **Registrar la anomalía antes de continuar:** se registra la anomalía, su
   **boundary** (dónde ocurrió) y una **hipótesis de causa raíz**.
3. **No enmascarar.** Un fallo no se "arregla" silenciándolo; se corrige la
   fuente.
4. **El resultado de un gate es binario.** Si un gate Jidoka falla, el trabajo se
   detiene hasta resolver la causa; no se "salta" el gate.

## Racional (por qué)

- Continuar tras un fallo no diagnosticado acumula trabajo sobre una base rota y
  hace imposible auditarla.
- Registrar boundary + causa raíz es lo que hace recuperable la interrupción.

## Aplicación

- **Agentes** (Claude/OpenCode/Cursor): perfil Better — parar ante anomalía,
  registrar, no "ver si el resto funciona".
- **`/dogfood`**: los gates Jidoka detienen el run si hay anomalía/stderr/no
  output.
- **Verificación**: cada assertion/check corre bajo Jidoka.

## Referencias

- Gate en `shared/hooks/dogfood/dogfood-run.sh`.
- Disciplina relacionada (implementación): **No-Workarounds** — una señal suprimida
  es un fallo.
- Estándar hermano: **StS** (streams) — los streams suprimidos disparan Jidoka.
