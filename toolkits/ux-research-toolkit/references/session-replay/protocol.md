# Skill `session-replay` — protocol SSOT

---

# Session Replay (Grabaciones de Sesión)

Método **cualitativo**: mirar fricción real (rage clicks, drop-offs, dead ends)
en grabaciones de sesiones de producción, en vez de inferirla de métricas.
Complementa — no sustituye — testing E2E scripteado (ej. Maestro) ni analytics.

## Regla de idioma

Contenido en **español**. Términos UX en formato "español (English)" la
primera vez que aparecen.

## Directorio de salida

Esta skill **NO produce archivos** por default — es consultiva. Si el usuario pide
registro, puede generar:

```
./docs/ux-research/session-replay/YYYY-MM-DD-[flujo].md
```

---

## Consentimiento y PII (obligatorio, no opcional)

- Sin consentimiento explícito del usuario, no se graba. Punto.
- Enmascarado (masking) de datos sensibles (PII): inputs, emails, tarjetas —
  automático donde el backend lo soporte + revisión manual por muestreo.
- Retención acotada + política de borrado documentada antes del primer replay.

**Mal uso común**: activar replay "para ver qué pasa" sin consentimiento ni
retención. Eso no es research, es vigilancia.

---

## Backend neutro: PostHog

- **Default**: PostHog Cloud (gratis hasta 1M eventos / 5k recordings por mes).
- **Self-hosted válido** (mismo producto, Docker Compose MIT, con replay y
  soporte Flutter), con caveats obligatorios: oficialmente *unsupported*, escala
  hobby, features de plan pago solo-cloud, sin soporte pago.
- Verificación 2026-10-14: guías de instalación para Flutter + resto de
  plataformas en posthog.com/docs; comparativa vs FullStory/Hotjar/LogRocket
  a favor en crash reports y AI summaries (fuente: el vendor — leer con escepticismo).

## SaaS listadas SOLO como opciones a pedido

No descartadas, no recomendadas. Mencionar únicamente si el usuario las pide:

- UXCam (+ `flutter_uxcam` para Flutter), Amplitude, Mouseflow, Userpilot,
  Strabber, PlaybookUX (+ AI), Vulpasoft.
- Criterio de comparación: SDK Flutter real, costo por sesión móvil,
  enmascarado PII, retención, export.

## Flutter: bloques de construcción

- `flutter_uxcam` → vía SaaS UXCam (opción, no default).
- `visibility_detector` → impression tracking propio (qué se vio realmente).
- `stack_trace` → diagnósticos de errores que enriquecen spans OTel.
- `flutter_web_plugins` → solo si el replay cubre Flutter web.

---

## Cuándo mirar replays (y cuándo NO)

**SÍ**:
- ✅ Rage clicks / drop-off en un flujo que en tests pasa.
- ✅ Onboarding bleed: dónde abandonan la primera sesión.
- ✅ Validar post-deploy: cómo usan lo recién shipeado (con `fidelity-guide` Nivel 6).
- ✅ Soporte: ver lo que el usuario vio antes del ticket.

**NO**:
- ❌ Descubrir si el concepto funciona (eso es Nivel 1-2, no producción).
- ❌ Medir conversión (eso es funnel analytics, no mirar videos).
- ❌ Sustituir E2E scripteado (Maestro prueba lo que definís; replay muestra lo que pasa).

---

## Preguntas consultivas (flow de la skill)

- **SR-1**: "¿Qué flujo querés observar? (una oración + URL/pantalla)"
- **SR-2**: "¿Tenés consentimiento + retención definidos? (si no, los definimos primero)"
- **SR-3**: "¿Backend: PostHog Cloud, self-hosted, u otro a pedido?"
- **SR-4** (opcional): "¿Documento hallazgos en `docs/ux-research/session-replay/`?"

---

## Integración con otras skills

- **`fidelity-guide`**: replay es evidencia de Nivel 6 (coded con data real).
  No usar para preguntas de Nivel 1-4.
- **`research-cadence`**: llevar 1-2 replays curiosos al jueves como disparador.
- **`assurance-toolkit:sre-observability-stack`**: el replay muestra el síntoma;
  traces/metrics OTel dan la causa. Cruzar ambos, no mezclarlos.
- **`business-model-toolkit:customer-interview-system`**: un replay con rage
  clicks es mejor opener de entrevista que cualquier pregunta genérica.

## Recursos adicionales

- PostHog docs: session replay, instalación Flutter, self-host (verificados 2026-10-14).
- Conventions: `shared/references/conventions/platform/observability/README.md`
  (OTel; replay vive acá en UX, telemetría allá en assurance).
