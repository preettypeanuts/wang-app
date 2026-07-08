"use client";

import { SerwistProvider } from "@serwist/next/react";

interface SerwistProviderShellProps {
  children: React.ReactNode;
}

/** Registers /sw.js on load so iOS PWA resumes from precached assets. */
export function SerwistProviderShell({ children }: SerwistProviderShellProps) {
  return (
    <SerwistProvider
      swUrl="/sw.js"
      disable={process.env.NODE_ENV === "development"}
      cacheOnNavigation={false}
      reloadOnOnline
    >
      {children}
    </SerwistProvider>
  );
}
