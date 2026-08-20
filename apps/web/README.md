# apps/web — better-toolkits landing

Public site for **https://toolkits.chimeranext.dev** (GitHub Pages + custom domain).

## Local

```bash
cd apps/web
npm ci
npm run dev
```

## Deploy

Workflow: [`.github/workflows/deploy-pages.yml`](../../.github/workflows/deploy-pages.yml).

- Build uses **empty** `PAGES_BASE_PATH` (site root) so the custom domain works.
- `public/CNAME` → `toolkits.chimeranext.dev`.
- In GitHub → **Settings → Pages**: set custom domain to `toolkits.chimeranext.dev` and enable HTTPS.
- DNS: CNAME `toolkits` → `chimeranext.github.io` (**DNS-only**) via
  [`chimeranext/infra` `scripts/dns-toolkits-cname.sh`](https://github.com/chimeranext/infra/blob/main/scripts/dns-toolkits-cname.sh)
  (`CLOUDFLARE_API_TOKEN` with Zone:DNS Edit).

Temporary project URL without DNS: set repository variable `PAGES_BASE_PATH=/better-toolkits` and remove/ignore CNAME.

## Doctrine

[`/doctrine`](https://toolkits.chimeranext.dev/doctrine/) surfaces **Multi-harness SSOT** (see [`docs/multi-harness-ssot.md`](../../docs/multi-harness-ssot.md)).
