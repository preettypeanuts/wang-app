import { spawnSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" })
    .stdout?.trim()
    .slice(0, 7) ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: false,
  additionalPrecacheEntries: [
    { url: "/icon-192.png", revision },
    { url: "/icon-512.png", revision },
    { url: "/apple-touch-icon.png", revision },
    { url: "/logo-w.png", revision },
    { url: "/W.png", revision },
  ],
});

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default withSerwist(nextConfig);
