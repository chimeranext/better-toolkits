// HTTP transport: fetch abstraction with retry (transport failures, 429, 5xx only),
// exponential backoff + jitter, per-request timeout. Injectable for offline fixture tests.

export interface TransportRequest {
  method: "GET" | "POST" | "PATCH";
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

export interface TransportResponse {
  status: number;
  body: string;
}

type FetchFn = (url: string, init: { method: string; headers?: Record<string, string>; body?: string; signal: AbortSignal }) => Promise<Response>;

let currentFetch: FetchFn = defaultFetch;

function defaultFetch(): Promise<Response> {
  // Node global fetch — resolved lazily so test injection is always possible.
  return globalThis.fetch.apply(null, arguments as unknown as unknown[]);
}

export function setFetchFn(fn: FetchFn | null): void {
  currentFetch = fn ?? defaultFetch;
  if (fn === null) {
    // resolve default lazily at call time instead; therefore set marker
    currentFetch = ((url: string, init: RequestInit) => fetch(url, init)) as unknown as FetchFn;
  }
}

export function getFetchFn(): FetchFn {
  return currentFetch;
}

const RETRYABLE_HEADERS = ["retry-after"];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseRetryAfter(h: Headers): number | undefined {
  const raw = h.get(RETRYABLE_HEADERS[0]);
  if (!raw) return undefined;
  const s = Number(raw);
  if (Number.isFinite(s) && s >= 0) return s * 1000;
  const d = Date.parse(raw);
  if (!Number.isNaN(d)) return Math.max(0, d - Date.now());
  return undefined;
}

/**
 * Retries ONLY: TypeError (transport), HTTP 429, HTTP 5xx. Any other 4xx is never retried.
 * 3 attempts max; backoff 0.5s * 2^i + jitter(0–250ms), honoring Retry-After when present.
 */
export async function httpRequest(req: TransportRequest): Promise<TransportResponse> {
  const maxAttempts = 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? 30_000);
    try {
      const res = await currentFetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: req.body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      const body = await res.text();
      const retryable = res.status === 429 || res.status >= 500;
      if (retryable && attempt < maxAttempts - 1) {
        const ra = parseRetryAfter(res.headers);
        await sleep(ra ?? (500 << attempt) + Math.floor(Math.random() * 250));
        continue;
      }
      return { status: res.status, body };
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      if (attempt < maxAttempts - 1) {
        await sleep((500 << attempt) + Math.floor(Math.random() * 250));
        continue;
      }
      throw new Error(`transport failure after ${maxAttempts} attempts: ${(e as Error).message}`);
    }
  }
  throw new Error(`transport failure after ${maxAttempts} attempts: ${(lastErr as Error)?.message ?? "unknown"}`);
}

/** Throw a transport-layer error for non-2xx responses (never retries for non-429 4xx). */
export async function requestJson<T>(req: TransportRequest): Promise<T> {
  const res = await httpRequest(req);
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`HTTP ${res.status}: ${res.body.slice(0, 500)}`);
  }
  return JSON.parse(res.body) as T;
}
