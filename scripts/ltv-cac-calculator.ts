#!/usr/bin/env -S npx tsx
/**
 * Calcula LTV, CAC, payback, LTV:CAC por plataforma (FB / IG / blended)
 * para una ventana de tiempo. Usa Meta pixel como fuente default; switchea
 * a CSV si .aaarrr/config.json lo declara.
 *
 * Uso:
 *   npx tsx ltv-cac-calculator.ts --window last_30d --breakdown platform
 *   npx tsx ltv-cac-calculator.ts --window 2026-01-01:2026-04-25 --breakdown placement
 *
 * Output: imprime tabla a stdout y guarda JSON en .aaarrr/metrics/cohorts-{date}.json
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { GraphApiClient } from "./lib/graph-api.js";
import { loadConfig, getAccessToken } from "./lib/config.js";
import {
  buildRevenueSource,
  type PlatformAggregate,
} from "./lib/revenue-source.js";

type Args = {
  window: { since: string; until: string };
  windowLabel: string;
  breakdown: "platform" | "placement";
  output?: string;
};

function nextArg(argv: string[], i: number, flag: string): string {
  const v = argv[i];
  if (v === undefined) throw new Error(`Missing value for ${flag}`);
  return v;
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> & { breakdown?: string } = { breakdown: "platform" };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--window") {
      const val = nextArg(argv, ++i, "--window");
      if (val.includes(":")) {
        const parts = val.split(":");
        const since = parts[0] ?? "";
        const until = parts[1] ?? "";
        args.window = { since, until };
        args.windowLabel = `${since} → ${until}`;
      } else {
        const days = parseDuration(val);
        const until = new Date();
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        args.window = {
          since: since.toISOString().slice(0, 10),
          until: until.toISOString().slice(0, 10),
        };
        args.windowLabel = val;
      }
    } else if (flag === "--breakdown") {
      args.breakdown = nextArg(argv, ++i, "--breakdown") as Args["breakdown"];
    } else if (flag === "--output") {
      args.output = nextArg(argv, ++i, "--output");
    }
  }
  if (!args.window) {
    const until = new Date();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    args.window = {
      since: since.toISOString().slice(0, 10),
      until: until.toISOString().slice(0, 10),
    };
    args.windowLabel = "last_30d";
  }
  return args as Args;
}

function parseDuration(token: string): number {
  const match = token.match(/^last_?(\d+)d$/);
  if (!match) throw new Error(`Bad --window: ${token}. Use last_30d or YYYY-MM-DD:YYYY-MM-DD`);
  return Number(match[1]);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();
  const token = getAccessToken(config);
  const client = new GraphApiClient(token, config.meta.ad_account_id);

  const sourceType = config.revenue_source?.type ?? "meta_pixel";
  const source = buildRevenueSource(
    client,
    sourceType as "meta_pixel" | "csv",
    config.revenue_source?.config as { csv_path?: string },
  );

  console.error(`Pulling insights for ${args.windowLabel} (${args.window.since} → ${args.window.until})…`);
  const aggregates = await source.fetchAggregatedByPlatform(args.window);

  const rows = computeRatios(aggregates, config.product.gross_margin, args.window);
  const blended = blend(rows);
  const all = [...rows, blended];

  printTable(all, config.product);
  saveSnapshot(all, args, sourceType, config.product.name);
}

type Row = {
  platform: string;
  spend: number;
  customers: number;
  revenue: number;
  cac: number;
  aov: number;
  revenue_per_customer: number;
  estimated_ltv_12mo: number;
  ltv_cac: number;
  payback_days: number;
};

function computeRatios(
  aggregates: PlatformAggregate[],
  grossMargin: number,
  window: { since: string; until: string },
): Row[] {
  const days = daysBetween(window.since, window.until);
  return aggregates.map((a) => {
    const cac = a.customers > 0 ? a.spend / a.customers : 0;
    const aov = a.customers > 0 ? a.revenue / a.customers : 0;
    const grossRevenue = a.revenue * grossMargin;
    const revenuePerCustomer = a.customers > 0 ? grossRevenue / a.customers : 0;
    const dailyContribution = days > 0 ? revenuePerCustomer / days : 0;
    const estimatedLtv = revenuePerCustomer * (365 / Math.max(days, 1));
    const ltvCac = cac > 0 ? estimatedLtv / cac : 0;
    const paybackDays =
      dailyContribution > 0 ? cac / dailyContribution : Number.POSITIVE_INFINITY;
    return {
      platform: a.platform,
      spend: a.spend,
      customers: a.customers,
      revenue: a.revenue,
      cac,
      aov,
      revenue_per_customer: revenuePerCustomer,
      estimated_ltv_12mo: estimatedLtv,
      ltv_cac: ltvCac,
      payback_days: paybackDays,
    };
  });
}

function blend(rows: Row[]): Row {
  const totalSpend = rows.reduce((s, r) => s + r.spend, 0);
  const totalCustomers = rows.reduce((s, r) => s + r.customers, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const cac = totalCustomers > 0 ? totalSpend / totalCustomers : 0;
  const aov = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const weightedLtv =
    totalCustomers > 0
      ? rows.reduce((s, r) => s + r.estimated_ltv_12mo * r.customers, 0) /
        totalCustomers
      : 0;
  const ltvCac = cac > 0 ? weightedLtv / cac : 0;
  const weightedPayback =
    totalCustomers > 0
      ? rows.reduce(
          (s, r) =>
            s +
            (Number.isFinite(r.payback_days) ? r.payback_days : 0) *
              r.customers,
          0,
        ) / totalCustomers
      : 0;
  return {
    platform: "blended",
    spend: totalSpend,
    customers: totalCustomers,
    revenue: totalRevenue,
    cac,
    aov,
    revenue_per_customer:
      totalCustomers > 0 ? totalRevenue / totalCustomers : 0,
    estimated_ltv_12mo: weightedLtv,
    ltv_cac: ltvCac,
    payback_days: weightedPayback,
  };
}

function daysBetween(since: string, until: string): number {
  return Math.max(
    1,
    Math.round(
      (new Date(until).getTime() - new Date(since).getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );
}

function printTable(rows: Row[], product: { target_cpa: number; target_ltv: number }) {
  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "∞");
  console.log("\n| Platform | Spend | Customers | Revenue | CAC | AOV | Est LTV | LTV:CAC | Payback (d) |");
  console.log("|---|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const cacStatus =
      r.cac > product.target_cpa ? "🔴" : r.cac > product.target_cpa * 0.8 ? "🟡" : "🟢";
    const ltvStatus =
      r.estimated_ltv_12mo < product.target_ltv ? "🔴" : "🟢";
    const ratioStatus = r.ltv_cac < 2 ? "🔴" : r.ltv_cac < 3 ? "🟡" : "🟢";
    console.log(
      `| ${r.platform} | $${fmt(r.spend)} | ${r.customers} | $${fmt(r.revenue)} | $${fmt(r.cac)} ${cacStatus} | $${fmt(r.aov)} | $${fmt(r.estimated_ltv_12mo)} ${ltvStatus} | ${fmt(r.ltv_cac)} ${ratioStatus} | ${fmt(r.payback_days)} |`,
    );
  }
}

function saveSnapshot(
  rows: Row[],
  args: Args,
  sourceType: string,
  productName: string,
) {
  const dir = join(process.cwd(), ".aaarrr", "metrics");
  mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const path = args.output ?? join(dir, `cohorts-${date}.json`);
  writeFileSync(
    path,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        product: productName,
        window: args.window,
        window_label: args.windowLabel,
        revenue_source: sourceType,
        rows,
      },
      null,
      2,
    ),
  );
  console.error(`\nSnapshot saved to ${path}`);
}

main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
