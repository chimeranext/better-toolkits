#!/usr/bin/env -S npx tsx
/**
 * Detecta churn por bucket (30d, 60d, 90d) y reporta tendencias mes-a-mes.
 *
 * Lee customer-level data de la fuente declarada en config:
 *  - meta_pixel: limitado, no permite ver lifetime per-customer reliable
 *  - csv: lee .aaarrr/customers.csv con columnas: customer_id, last_purchase_date
 *
 * Si el config es meta_pixel-only, este script avisa que necesita CSV o adapter.
 *
 * Uso:
 *   npx tsx churn-detector.ts --window 30,60,90
 *   npx tsx churn-detector.ts --csv /path/to/customers.csv
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "./lib/config.js";

type Args = {
  windows: number[];
  csvPath: string;
};

function parseArgs(argv: string[]): Args {
  let windows = [30, 60, 90];
  let csvPath = join(process.cwd(), ".aaarrr", "customers.csv");
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--window") {
      const v = argv[++i] ?? "";
      windows = v.split(",").map((s) => Number(s.trim()));
    } else if (argv[i] === "--csv") {
      csvPath = argv[++i] ?? csvPath;
    }
  }
  return { windows, csvPath };
}

type Customer = {
  customer_id: string;
  last_purchase_date: string;
  total_purchases?: number;
  total_revenue?: number;
};

function loadCustomers(path: string): Customer[] {
  if (!existsSync(path)) {
    throw new Error(
      `Customers CSV not found at ${path}. Required columns: customer_id, last_purchase_date. Optional: total_purchases, total_revenue.\n\nIf you're using meta_pixel-only, you need to export this manually from your backend (Stripe/Postgres/etc) periodically. Meta does not expose customer-level lifetime data via Graph API.`,
    );
  }
  const text = readFileSync(path, "utf-8");
  const lines = text.trim().split("\n");
  const headerLine = lines[0];
  if (!headerLine) throw new Error(`Customers CSV empty: ${path}`);
  const header = headerLine.split(",").map((h) => h.trim());
  const required = ["customer_id", "last_purchase_date"];
  for (const col of required) {
    if (!header.includes(col)) {
      throw new Error(`Customers CSV missing column: ${col}`);
    }
  }
  const cell = (cells: string[], col: string): string => {
    const i = header.indexOf(col);
    return i === -1 ? "" : (cells[i] ?? "");
  };
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const purchases = cell(cells, "total_purchases");
    const revenue = cell(cells, "total_revenue");
    return {
      customer_id: cell(cells, "customer_id"),
      last_purchase_date: cell(cells, "last_purchase_date"),
      total_purchases: purchases ? Number(purchases) : undefined,
      total_revenue: revenue ? Number(revenue) : undefined,
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadConfig(); // valida config existe

  console.error(`Loading customers from ${args.csvPath}…`);
  const customers = loadCustomers(args.csvPath);
  const now = Date.now();

  const buckets = args.windows
    .sort((a, b) => a - b)
    .map((days) => {
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      const churned = customers.filter(
        (c) => new Date(c.last_purchase_date).getTime() < cutoff,
      );
      const churnedRevenue = churned.reduce(
        (s, c) => s + (c.total_revenue ?? 0),
        0,
      );
      return {
        days,
        total_customers: customers.length,
        churned_count: churned.length,
        churned_rate: customers.length > 0 ? churned.length / customers.length : 0,
        churned_revenue: churnedRevenue,
      };
    });

  // Cohort by month — clientes que tuvieron last_purchase en cada mes
  const byMonth = new Map<string, number>();
  for (const c of customers) {
    const month = c.last_purchase_date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1);
  }
  const sortedMonths = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  printReport(buckets, sortedMonths);
  saveSnapshot(buckets, sortedMonths);
}

function printReport(
  buckets: Array<{
    days: number;
    total_customers: number;
    churned_count: number;
    churned_rate: number;
    churned_revenue: number;
  }>,
  monthly: Array<[string, number]>,
) {
  console.log("\n## Churn by bucket");
  console.log("| Window | Total | Churned | Rate | Churned Revenue |");
  console.log("|---|---|---|---|---|");
  for (const b of buckets) {
    const status = b.churned_rate > 0.5 ? "🔴" : b.churned_rate > 0.3 ? "🟡" : "🟢";
    console.log(
      `| ${b.days}d | ${b.total_customers} | ${b.churned_count} ${status} | ${(b.churned_rate * 100).toFixed(1)}% | $${b.churned_revenue.toFixed(2)} |`,
    );
  }

  console.log("\n## Last purchase by month (last 6 months)");
  console.log("| Month | Active customers (last purchase that month) |");
  console.log("|---|---|");
  for (const [month, count] of monthly) {
    console.log(`| ${month} | ${count} |`);
  }
}

function saveSnapshot(buckets: unknown, monthly: unknown) {
  const dir = join(process.cwd(), ".aaarrr", "metrics");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `churn-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(
    path,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        buckets,
        monthly_active: monthly,
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
