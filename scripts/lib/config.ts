/**
 * Lee .aaarrr/config.json del proyecto del usuario y valida shape.
 * Falla rápido si falta algo crítico — fail fast es el mantra.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type AaarrrConfig = {
  meta: {
    ad_account_id: string;
    page_id: string;
    instagram_actor_id?: string;
    pixel_id: string;
    business_id?: string;
    access_token_env: string;
  };
  product: {
    name: string;
    url: string;
    activation_event: string;
    target_cpa: number;
    target_ltv: number;
    target_d30_repurchase: number;
    target_k_factor: number;
    gross_margin: number;
    referral_incentive?: string;
    currency: string;
  };
  revenue_source?: {
    type: "meta_pixel" | "stripe" | "csv" | "posthog";
    config?: Record<string, unknown>;
  };
};

export function loadConfig(cwd: string = process.cwd()): AaarrrConfig {
  const path = join(cwd, ".aaarrr", "config.json");
  if (!existsSync(path)) {
    throw new Error(
      `.aaarrr/config.json not found in ${cwd}. Run /aaarrr-launch first to set up.`,
    );
  }
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  validate(raw);
  return raw as AaarrrConfig;
}

export function getAccessToken(config: AaarrrConfig): string {
  const envVar = config.meta.access_token_env || "META_ACCESS_TOKEN";
  const token = process.env[envVar];
  if (!token) {
    throw new Error(
      `Env var ${envVar} not set. Export your Meta access token before running.`,
    );
  }
  return token;
}

function validate(raw: unknown): void {
  const cfg = raw as Partial<AaarrrConfig>;
  if (!cfg.meta?.ad_account_id) {
    throw new Error("config.meta.ad_account_id missing");
  }
  if (!cfg.meta.ad_account_id.startsWith("act_")) {
    throw new Error(
      `config.meta.ad_account_id must be 'act_XXXXX', got '${cfg.meta.ad_account_id}'`,
    );
  }
  if (!cfg.meta.pixel_id) throw new Error("config.meta.pixel_id missing");
  if (!cfg.meta.page_id) throw new Error("config.meta.page_id missing");
  if (!cfg.product?.name) throw new Error("config.product.name missing");
  if (!cfg.product?.url) throw new Error("config.product.url missing");
  if (typeof cfg.product?.target_cpa !== "number") {
    throw new Error("config.product.target_cpa must be a number");
  }
  if (typeof cfg.product?.gross_margin !== "number") {
    throw new Error(
      "config.product.gross_margin must be a number between 0 and 1 (e.g. 0.7 for 70%)",
    );
  }
  if (cfg.product.gross_margin <= 0 || cfg.product.gross_margin > 1) {
    throw new Error(
      `config.product.gross_margin must be between 0 and 1, got ${cfg.product.gross_margin}`,
    );
  }
}
