/**
 * Seams de cost-tracking y PII — interfaces locales con implementación NO-OP.
 *
 * El panel adversarial decidió que Heimdall NO consume `agentic-core` (un
 * core en Python): no hay un wire utilizable desde TS. Pero el reviewer
 * eventualmente querrá (a) atribuir costo por review y (b) redactar PII antes de
 * mandar diffs a un proveedor LLM externo.
 *
 * En vez de implementar eso ahora (YAGNI), se definen los SEAMS: interfaces
 * mínimas con implementaciones no-op. Un adaptador futuro a `agentic-core`
 * (o a cualquier backend de telemetría / DLP) sería puramente ADITIVO —
 * implementa estas interfaces e se inyecta donde hoy va el no-op. Ningún
 * call-site del reviewer cambia.
 *
 * @see TODO(agentic-core): adaptador real cuando exista un wire TS estable.
 */

/**
 * Sumidero de eventos de costo. Un adaptador real acumularía tokens/USD por
 * review y los emitiría a un backend de telemetría (PostHog, Langfuse, BigQuery).
 */
export interface CostSink {
  /**
   * Registra el uso de tokens de un review.
   * @param event identificador del evento (p.ej. el id del lane).
   * @param usage tokens consumidos en el review.
   */
  record(
    event: string,
    usage: { promptTokens: number; candidatesTokens: number; totalTokens: number },
  ): void
}

/**
 * Redactor de PII. Un adaptador real escanearía el texto en busca de secretos /
 * datos personales antes de enviarlo a un proveedor LLM externo.
 */
export interface PiiRedactor {
  /** Devuelve el texto con la PII redactada. El no-op lo devuelve intacto. */
  redact(text: string): string
}

/** Implementación no-op de {@link CostSink}: descarta todo. */
export const noopCostSink: CostSink = {
  record: () => {
    /* no-op — ver docblock del módulo */
  },
}

/** Implementación no-op de {@link PiiRedactor}: passthrough. */
export const noopPiiRedactor: PiiRedactor = {
  redact: (text) => text,
}
