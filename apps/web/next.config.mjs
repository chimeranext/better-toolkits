/** @type {import('next').NextConfig} */
// Custom domain (toolkits.chimeranext.dev) serves at site root — leave PAGES_BASE_PATH empty.
// Only set PAGES_BASE_PATH=/better-toolkits for temporary project-URL deploys without custom DNS.
const basePath = process.env.PAGES_BASE_PATH || "";

export default {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};
