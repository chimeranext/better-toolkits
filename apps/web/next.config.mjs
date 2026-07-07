/** @type {import('next').NextConfig} */
// PAGES_BASE_PATH is set by the GitHub Pages workflow (/better-toolkits).
// Local dev and future custom-domain deploys leave it empty.
const basePath = process.env.PAGES_BASE_PATH || "";

export default {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath || undefined,
};
