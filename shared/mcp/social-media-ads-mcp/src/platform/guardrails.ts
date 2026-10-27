// Spend caps: configuration, not code (media-buyer-operations spec).
// Evaluated BEFORE the network request in the router; a rejected plan costs nothing.
//
// Config file: $(config)/media-buyer-toolkit/guardrails.json, or env
// MEDIA_BUYER_GUARDRAILS_JSON ("{"meta":{"daily_cap":{"amount":"50.00","currency":"USD"}, ...}}").
// Per network: { daily_cap?: {amount, currency}, campaign_daily_cap?: {amount, currency} }.

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseDec, cmp, currencyExponent, fromMinorUnits } from "./money.js";
import type { Network } from "../types.js";

interface Cap {
  amount: string;
  currency: string;
}

interface NetworkCaps {
  daily_cap?: Cap;
  campaign_daily_cap?: Cap;
}

function cfgDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  return xdg && xdg.trim() !== "" ? xdg : path.join(os.homedir(), ".config");
}

function loadCaps(network: Network): NetworkCaps {
  const envRaw = process.env.MEDIA_BUYER_GUARDRAILS_JSON;
  if (envRaw) {
    const all = JSON.parse(envRaw) as Record<string, NetworkCaps>;
    return all[network] ?? {};
  }
  const p = path.join(cfgDir(), "media-buyer-toolkit", "guardrails.json");
  if (fs.existsSync(p)) {
    const all = JSON.parse(fs.readFileSync(p, "utf8")) as Record<string, NetworkCaps>;
    return all[network] ?? {};
  }
  return {};
}

/** Converts a native minor-unit integer plus currency to a scaled decimal for comparison. */
export function scaledFromMinor(minor: string | number, currency: string): bigint {
  return fromMinorUnits(minor, currencyExponent(currency));
}

export interface CapCheck {
  ok: boolean;
  violated?: { cap: string; cap_amount: string; currency: string; requested: string };
}

/**
 * Throws nothing: returns the finding; the router converts to a guardrail error.
 * `requested` is a decimal string in `currency`.
 */
export function checkDailyCap(network: Network, requestedDec: string, currency: string): CapCheck {
  const caps = loadCaps(network);
  const cap = caps.daily_cap ?? caps.campaign_daily_cap;
  if (!cap) return { ok: true };

  if (cap.currency.toUpperCase() !== currency.toUpperCase()) {
    // never convert across currencies (network-adapters spec) — reject loudly instead
    return {
      ok: false,
      violated: {
        cap: "daily_cap_currency_mismatch",
        cap_amount: cap.amount,
        currency,
        requested: requestedDec,
      },
    };
  }
  if (cmp(parseDec(requestedDec), parseDec(cap.amount)) > 0) {
    return {
      ok: false,
      violated: { cap: "daily_cap", cap_amount: cap.amount, currency, requested: requestedDec },
    };
  }
  return { ok: true };
}

export function capsDescription(network: Network): Record<string, unknown> {
  const caps = loadCaps(network);
  return Object.keys(caps).length > 0 ? { caps } : {};
}
