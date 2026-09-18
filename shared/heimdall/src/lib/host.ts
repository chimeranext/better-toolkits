/**
 * HostLogger / HostApi — interfaz local mínima que reemplaza el
 * `openclaw/plugin-sdk` del plugin original.
 *
 * En el plugin OpenClaw, varios módulos del reviewer importaban
 * `OpenClawPluginApi` SOLO como `import type` (cero runtime): lo usaban para
 * tipar `api.logger`. El veredicto del panel adversarial fue reemplazar esa
 * dependencia de tipos por una interfaz local mínima — trivial, porque nunca
 * fue una dependencia de runtime.
 *
 * Heimdall no necesita el SDK del plugin: corre como bot/CLI standalone,
 * no como extensión dentro del host OpenClaw.
 */

/**
 * Logger estructurado mínimo. Compatible en forma con el `api.logger` del SDK
 * (debug/info/warn/error). El loop del reviewer solo usa debug + warn.
 */
export interface HostLogger {
  debug(msg: string): void
  info(msg: string): void
  warn(msg: string): void
  error(msg: string): void
}

/**
 * Reemplazo local de `OpenClawPluginApi`. Por ahora solo expone `logger`, que
 * es lo único que el subsistema reviewer consumía del SDK. Aditivo: si un
 * adaptador futuro necesita más superficie del host, se agrega aquí sin tocar
 * el SDK externo.
 */
export interface HostApi {
  logger: HostLogger
}

/**
 * Logger por defecto que escribe a `console`. Útil para el dry-run y los tests.
 */
export const consoleLogger: HostLogger = {
  debug: (msg) => console.debug(`[debug] ${msg}`),
  info: (msg) => console.info(`[info] ${msg}`),
  warn: (msg) => console.warn(`[warn] ${msg}`),
  error: (msg) => console.error(`[error] ${msg}`),
}
