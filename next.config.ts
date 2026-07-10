import { spawnSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const buildId =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" })
    .stdout?.trim()
    .slice(0, 7) ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: false,
  additionalPrecacheEntries: [
    { url: "/icon-192.png", revision: buildId },
    { url: "/icon-512.png", revision: buildId },
    { url: "/apple-touch-icon.png", revision: buildId },
    { url: "/logo-w.png", revision: buildId },
    { url: "/W.png", revision: buildId },
  ],
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: buildId,
  },
  cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withSerwist(nextConfig);
