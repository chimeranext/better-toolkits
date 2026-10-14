/** Parsea lectura cruda a lux; null si saturó. */
export function parseLux(raw: number): number | null {
  if (raw === 0xffff) return null;
  return raw / 1.2;
}
