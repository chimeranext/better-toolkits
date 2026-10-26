// Shared date helpers (kept here so platform modules import nothing from adapters).

export function isoDate(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function isoDaysAgo(n: number): string {
  return isoDate(new Date(Date.now() - n * 86_400_000));
}
