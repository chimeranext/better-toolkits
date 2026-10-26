// Money is normalized once, at the adapter boundary (design D6).
// Amounts are decimal strings paired with ISO-4217 currency; arithmetic is exact via BigInt scaled to 12 decimals.

const SCALE = 10n ** 12n; // scaled value = units * 1e12

export function parseDec(s: string): bigint {
  const t = s.trim();
  if (!/^[+-]?\d+(\.\d+)?$/u.test(t)) {
    throw new Error(`invalid decimal: ${t}`);
  }
  const neg = t.startsWith("-");
  const body = neg || t.startsWith("+") ? t.slice(1) : t;
  const [intPart, fracRaw = ""] = body.split(".");
  const frac = (fracRaw + "0".repeat(12)).slice(0, 12);
  const v = BigInt(intPart) * SCALE + BigInt(frac.padEnd(12, "0"));
  return neg ? -v : v;
}

export function toDec(v: bigint): string {
  const neg = v < 0n;
  const abs = neg ? -v : v;
  const units = abs / SCALE;
  const frac = (abs % SCALE).toString().padStart(12, "0").replace(/0+$/, "");
  const body = frac ? `${units}.${frac}` : `${units}`;
  return neg ? `-${body}` : body;
}

export const add = (a: bigint, b: bigint): bigint => a + b;
export const sub = (a: bigint, b: bigint): bigint => a - b;
export const cmp = (a: bigint, b: bigint): number => (a < b ? -1 : a > b ? 1 : 0);

/** micros → scaled: value * 1e6 = micros, so scaled = micros * 1e6. */
export function fromMicros(micros: number | string | bigint): bigint {
  const m = typeof micros === "string" ? BigInt(micros) : BigInt(Math.trunc(Number(micros)));
  return m * 10n ** 6n;
}

/** minor units (e.g. cents for USD) → scaled: minor * 10^(12 - exponent). */
export function fromMinorUnits(minor: number | string | bigint, exponent: number): bigint {
  const m = typeof minor === "string" ? BigInt(minor) : BigInt(Math.trunc(Number(minor)));
  const pow = BigInt(12 - exponent);
  if (pow < 0n) return m / 10n ** -pow;
  return m * 10n ** pow;
}

/** decimal string → native micros integer (for adapters writing micros back). */
export function toMicros(dec: string): bigint {
  return (parseDec(dec) * 10n ** 6n) / SCALE;
}

/** decimal string → native minor units integer given currency exponent. */
export function toMinorUnits(dec: string, exponent: number): bigint {
  const v = (parseDec(dec) * 10n ** BigInt(exponent)) / SCALE;
  return v; // exact only when decimal has <= exponent fraction digits; callers guard
}

export interface CurrencyInfo {
  code: string;
  exponent: number;
}

/** Common ISO-4217 exponents; unknown codes default to 2 (documented in references/). */
export function currencyExponent(code: string): number {
  const zero = new Set(["JPY", "KRW", "VND", "CLP", "ISK"]);
  if (zero.has(code.toUpperCase())) return 0;
  return 2;
}
