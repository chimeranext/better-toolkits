# References — eval-jev-router-lane

| URL | Para | Estado |
|---|---|---|
| https://openrouter.ai/typesafe/jev-router | ficha del candidato: API chat/tools verificada, llms.txt canónico | verified |
| `shared/heimdall/src/lib/reviewer-providers.ts` | lanes existentes + caveats openrouter (repo local) | verified |

## Ficha 1.1 (GET /models 2026-10-13, 461 modelos)

- id: `typesafe/jev-router` · context 1M · pricing prompt/completion `-1`
  (variable: el router elige modelo+effort por request — costo impredecible,
  ver techo 1.2) · tools + reasoning params soportados.
- Modelo-detrás: Jev (TypeSafe System One), "adapta por request".
- Implicancia: upstream observado PUEDE variar entre celdas → el veredicto
  lo descuenta (riesgo ya previsto en design).
