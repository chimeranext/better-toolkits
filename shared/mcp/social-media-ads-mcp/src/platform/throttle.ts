// Per-account token-bucket throttling (design D10). Each network declares its own rate;
// enforced per account so one busy account cannot starve another.

interface Bucket {
  tokens: number;
  last: number;
}

const buckets = new Map<string, Bucket>();

export function throttleKey(network: string, account: string): string {
  return `${network}:${account}`;
}

export function rateFor(network: string): { requestsPerSecond: number; burst: number } {
  switch (network) {
    case "meta":
      return { requestsPerSecond: 8, burst: 16 };
    case "tiktok":
      return { requestsPerSecond: 10, burst: 20 };
    case "linkedin":
      return { requestsPerSecond: 2, burst: 4 };
    case "google":
    case "youtube":
      return { requestsPerSecond: 4, burst: 8 };
    case "spotify":
      return { requestsPerSecond: 4, burst: 8 };
    default:
      return { requestsPerSecond: 2, burst: 4 };
  }
}

/** Wait until the bucket has ≥1 token. Overtime-safe with a hard ceiling. */
export async function acquire(network: string, account: string): Promise<void> {
  const key = throttleKey(network, account);
  const rate = rateFor(network);
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: rate.burst, last: now };
    buckets.set(key, b);
  }
  const elapsed = (now - b.last) / 1000;
  b.tokens = Math.min(rate.burst, b.tokens + elapsed * rate.requestsPerSecond);
  b.last = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return;
  }
  const needMs = ((1 - b.tokens) / rate.requestsPerSecond) * 1000;
  await sleep(Math.min(needMs, 2000));
  await acquire(network, account);
}

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}
