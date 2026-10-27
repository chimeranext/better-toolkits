// Period parsing for insights windows. Declared, never implied (unified-insights-schema spec).

export interface Period {
  from: string; // yyyy-mm-dd
  to: string; // yyyy-mm-dd
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/u;

export function parsePeriod(from?: string, to?: string): Period {
  if (!from || !DATE_RE.test(from)) {
    throw new Error(`date_from must be yyyy-mm-dd, got: ${String(from)}`);
  }
  const end = to ?? from;
  if (!DATE_RE.test(end)) {
    throw new Error(`date_to must be yyyy-mm-dd, got: ${String(to)}`);
  }
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    throw new Error("unparseable date range");
  }
  if (b < a) {
    throw new Error(`date_to (${end}) precedes date_from (${from})`);
  }
  const maxDays = 366;
  const days = (b - a) / 86_400_000;
  if (days > maxDays) {
    throw new Error(`date range exceeds ${maxDays} days`);
  }
  return { from, to: end };
}

export function daysBetween(p: Period): number {
  return (Date.parse(`${p.to}T00:00:00Z`) - Date.parse(`${p.from}T00:00:00Z`)) / 86_400_000 + 1;
}

export function shiftDays(iso: string, n: number): string {
  const d = new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000);
  return d.toISOString().slice(0, 10);
}
