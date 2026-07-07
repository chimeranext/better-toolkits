/**
 * Cliente delgado de Meta Graph API. No abstrae nada de la API — solo agrega
 * retry/backoff y typing. Si Meta cambia algo, lo arreglas aquí, no en cada script.
 */

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

export type GraphApiError = {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
};

export class GraphApiClient {
  constructor(
    private readonly accessToken: string,
    private readonly adAccountId: string,
  ) {
    if (!accessToken) throw new Error("META_ACCESS_TOKEN missing");
    if (!adAccountId.startsWith("act_")) {
      throw new Error(`ad_account_id must be 'act_XXXXX', got '${adAccountId}'`);
    }
  }

  async get<T = unknown>(
    path: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    const url = new URL(`${GRAPH_API_BASE}${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("access_token", this.accessToken);

    const res = await this.withRetry(() => fetch(url.toString()));
    return this.parse<T>(res, "GET", path);
  }

  async post<T = unknown>(
    path: string,
    body: Record<string, string>,
  ): Promise<T> {
    const params = new URLSearchParams(body);
    params.set("access_token", this.accessToken);
    const res = await this.withRetry(() =>
      fetch(`${GRAPH_API_BASE}${path}`, {
        method: "POST",
        body: params,
      }),
    );
    return this.parse<T>(res, "POST", path);
  }

  async insights(
    level: "campaign" | "adset" | "ad",
    fields: string[],
    options: {
      datePreset?: string;
      timeRange?: { since: string; until: string };
      breakdowns?: string[];
      filtering?: Array<{ field: string; operator: string; value: string }>;
    } = {},
  ): Promise<InsightRow[]> {
    const params: Record<string, string> = {
      level,
      fields: fields.join(","),
    };
    if (options.datePreset) params.date_preset = options.datePreset;
    if (options.timeRange) {
      params.time_range = JSON.stringify(options.timeRange);
    }
    if (options.breakdowns?.length) {
      params.breakdowns = options.breakdowns.join(",");
    }
    if (options.filtering?.length) {
      params.filtering = JSON.stringify(options.filtering);
    }

    const all: InsightRow[] = [];
    let path: string | null = `/${this.adAccountId}/insights`;
    let nextParams = params;

    while (path) {
      const data: { data: InsightRow[]; paging?: { next?: string } } =
        await this.get(path, nextParams);
      all.push(...data.data);
      if (data.paging?.next) {
        path = data.paging.next.replace(GRAPH_API_BASE, "");
        nextParams = {};
      } else {
        path = null;
      }
    }
    return all;
  }

  private async withRetry(fn: () => Promise<Response>): Promise<Response> {
    let attempt = 0;
    let lastError: unknown;
    while (attempt < 3) {
      try {
        const res = await fn();
        if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
          const wait = 2 ** attempt * 1000;
          await new Promise((r) => setTimeout(r, wait));
          attempt++;
          continue;
        }
        return res;
      } catch (err) {
        lastError = err;
        const wait = 2 ** attempt * 1000;
        await new Promise((r) => setTimeout(r, wait));
        attempt++;
      }
    }
    throw lastError ?? new Error("Graph API retry exhausted");
  }

  private async parse<T>(
    res: Response,
    method: string,
    path: string,
  ): Promise<T> {
    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(
        `Graph API non-JSON response (${method} ${path}): ${text.slice(0, 200)}`,
      );
    }
    if (!res.ok) {
      const err = (body as { error?: GraphApiError }).error;
      throw new Error(
        `Graph API ${res.status} (${method} ${path}): ${err?.message ?? text}`,
      );
    }
    return body as T;
  }
}

export type InsightRow = {
  spend?: string;
  impressions?: string;
  clicks?: string;
  cpm?: string;
  cpp?: string;
  ctr?: string;
  frequency?: string;
  reach?: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  publisher_platform?: string;
  platform_position?: string;
  date_start?: string;
  date_stop?: string;
};

export function num(value: string | undefined, fallback = 0): number {
  if (!value) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function actionValue(
  row: InsightRow,
  actionType: string,
  field: "actions" | "action_values" = "actions",
): number {
  const list = row[field];
  if (!list) return 0;
  const found = list.find((a) => a.action_type === actionType);
  return num(found?.value);
}
