"use client";

import {
  PWA_SERVICE_WORKER_ENABLED,
  PWA_SERVICE_WORKER_URL,
} from "@/config/pwa";
import { SerwistProvider } from "@serwist/next/react";

interface SerwistProviderShellProps {
  children: React.ReactNode;
}

/** Registers /sw.js on load so iOS PWA resumes from precached assets. */
export function SerwistProviderShell({ children }: SerwistProviderShellProps) {
  return (
    <SerwistProvider
      swUrl={PWA_SERVICE_WORKER_URL}
      disable={!PWA_SERVICE_WORKER_ENABLED}
      cacheOnNavigation={false}
      reloadOnOnline
    >
      {children}
    </SerwistProvider>
  );
}
