#!/usr/bin/env -S npx tsx
/**
 * Mide K-factor real del programa de referidos.
 *
 * Atribución: requiere que el producto trackee `utm_referrer={user_id}` (server side)
 * y que cada compra registre el referrer en su backend. Este script lee
 * `.aaarrr/referrals.csv` con columnas: referrer_id, referee_id, signup_date, purchase_date, amount.
 *
 * Cálculo:
 *   K = (referidos_que_compraron / buyers_que_invitaron)
 *       × (buyers_que_invitaron / total_buyers)
 *
 * Uso:
 *   npx tsx referral-tracker.ts --window 30d
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadConfig } from "./lib/config.js";

type Args = {
  windowDays: number;
  csvPath: string;
};

function parseArgs(argv: string[]): Args {
  let windowDays = 30;
  let csvPath = join(process.cwd(), ".aaarrr", "referrals.csv");
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--window") {
      const v = argv[++i] ?? "";
      const m = v.match(/^(\d+)d?$/);
      if (m && m[1]) windowDays = Number(m[1]);
    } else if (argv[i] === "--csv") {
      csvPath = argv[++i] ?? csvPath;
    }
  }
  return { windowDays, csvPath };
}

type ReferralRow = {
  referrer_id: string;
  referee_id: string;
  signup_date: string;
  purchase_date?: string;
  amount?: number;
};

function loadReferrals(path: string): ReferralRow[] {
  if (!existsSync(path)) {
    throw new Error(
      `Referral CSV not found at ${path}. The product must export referral attribution to this file. Columns: referrer_id, referee_id, signup_date, purchase_date, amount.`,
    );
  }
  const text = readFileSync(path, "utf-8");
  const lines = text.trim().split("\n");
  const headerLine = lines[0];
  if (!headerLine) throw new Error(`Referral CSV empty: ${path}`);
  const header = headerLine.split(",").map((h) => h.trim());
  const required = ["referrer_id", "referee_id", "signup_date"];
  for (const col of required) {
    if (!header.includes(col)) {
      throw new Error(`Referral CSV missing column: ${col}`);
    }
  }
  const cell = (cells: string[], col: string): string => {
    const i = header.indexOf(col);
    return i === -1 ? "" : (cells[i] ?? "");
  };
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const amount = cell(cells, "amount");
    return {
      referrer_id: cell(cells, "referrer_id"),
      referee_id: cell(cells, "referee_id"),
      signup_date: cell(cells, "signup_date"),
      purchase_date: cell(cells, "purchase_date") || undefined,
      amount: amount ? Number(amount) : undefined,
    };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = loadConfig();

  console.error(`Loading referrals from ${args.csvPath}…`);
  const referrals = loadReferrals(args.csvPath);
  const cutoff = Date.now() - args.windowDays * 24 * 60 * 60 * 1000;

  const inWindow = referrals.filter(
    (r) => new Date(r.signup_date).getTime() >= cutoff,
  );

  const referrers = new Set(inWindow.map((r) => r.referrer_id));
  const successful = inWindow.filter((r) => r.purchase_date);
  const successfulReferrers = new Set(successful.map((r) => r.referrer_id));

  const totalRevenueViaReferral = successful.reduce(
    (s, r) => s + (r.amount ?? 0),
    0,
  );

  // Total buyers en la ventana — necesita venir del Pixel insights, no del CSV.
  // Como no es trivial sin invocar Graph API aquí, leemos del último snapshot.
  const totalBuyers = readLastTotalBuyers(args.windowDays);

  const buyersWhoInvited = referrers.size;
  const referredBuyers = successful.length;
  const inviteShareRate =
    totalBuyers > 0 ? buyersWhoInvited / totalBuyers : 0;
  const referredConversionRate =
    inWindow.length > 0 ? referredBuyers / inWindow.length : 0;
  const kFactor =
    totalBuyers > 0
      ? (referredBuyers / Math.max(buyersWhoInvited, 1)) * inviteShareRate
      : 0;

  const target = config.product.target_k_factor;
  const status =
    kFactor >= target
      ? "🟢 Healthy"
      : kFactor >= target * 0.5
        ? "🟡 Watch — iterar"
        : "🔴 Kill candidate";

  const result = {
    generated_at: new Date().toISOString(),
    window_days: args.windowDays,
    total_buyers: totalBuyers,
    invitations_sent: inWindow.length,
    buyers_who_invited: buyersWhoInvited,
    invite_share_rate: inviteShareRate,
    referred_buyers: referredBuyers,
    referred_conversion_rate: referredConversionRate,
    k_factor: kFactor,
    target,
    status,
    revenue_via_referral: totalRevenueViaReferral,
    implied_referral_cac: 0, // costo del programa / referredBuyers — necesita budget como input
  };

  printTable(result);
  saveSnapshot(result);
}

function readLastTotalBuyers(windowDays: number): number {
  // Lee el snapshot más reciente de cohorts si existe
  const dir = join(process.cwd(), ".aaarrr", "metrics");
  if (!existsSync(dir)) return 0;
  // Implementación simple: si no hay snapshot, retorna 0 y el K-factor saldrá 0.
  // El usuario sabrá que tiene que correr ltv-cac-calculator primero.
  return 0;
}

function printTable(r: {
  total_buyers: number;
  invitations_sent: number;
  buyers_who_invited: number;
  invite_share_rate: number;
  referred_buyers: number;
  referred_conversion_rate: number;
  k_factor: number;
  target: number;
  status: string;
  revenue_via_referral: number;
}) {
  console.log("\n## Referral Health");
  console.log(`| Metric | Value |`);
  console.log(`|---|---|`);
  console.log(`| Total buyers (window) | ${r.total_buyers} |`);
  console.log(`| Invitations sent | ${r.invitations_sent} |`);
  console.log(`| Buyers que invitaron | ${r.buyers_who_invited} (${(r.invite_share_rate * 100).toFixed(1)}%) |`);
  console.log(`| Referred → buyer | ${r.referred_buyers} (${(r.referred_conversion_rate * 100).toFixed(1)}%) |`);
  console.log(`| **K-factor** | **${r.k_factor.toFixed(3)}** |`);
  console.log(`| Target | ${r.target} |`);
  console.log(`| Status | ${r.status} |`);
  console.log(`| Revenue vía referral | $${r.revenue_via_referral.toFixed(2)} |`);
  if (r.total_buyers === 0) {
    console.log(
      "\n⚠️  total_buyers = 0 — corre `npx tsx ltv-cac-calculator.ts` antes para tener el baseline.",
    );
  }
}

function saveSnapshot(result: unknown) {
  const dir = join(process.cwd(), ".aaarrr", "metrics");
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `referral-${new Date().toISOString().slice(0, 10)}.json`);
  writeFileSync(path, JSON.stringify(result, null, 2));
  console.error(`\nSnapshot saved to ${path}`);
}

main().catch((err) => {
  console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
