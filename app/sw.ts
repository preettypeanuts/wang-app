import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, NetworkOnly, Serwist } from "serwist";
import { registerPushNotificationHandlers } from "@/lib/push/service-worker-push";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, sameOrigin, url: { pathname } }) =>
        sameOrigin &&
        !pathname.startsWith("/api/") &&
        request.headers.get("RSC") === "1",
      handler: new NetworkOnly(),
    },
    {
      matcher: /\/_next\/static\/.+\.(?:js|css|mjs)$/i,
      handler: new NetworkFirst({
        cacheName: "next-build-assets",
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60,
            maxAgeFrom: "last-used",
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
registerPushNotificationHandlers(self);
