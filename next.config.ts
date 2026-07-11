import { spawnSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { PWA_PRECACHED_ASSETS } from "./config/pwa-assets";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" })
    .stdout?.trim()
    .slice(0, 7) ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: false,
  additionalPrecacheEntries: PWA_PRECACHED_ASSETS.map((url) => ({
    url,
    revision,
  })),
});

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Serwist injects webpack config for production builds; dev uses Turbopack.
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withSerwist(nextConfig);
