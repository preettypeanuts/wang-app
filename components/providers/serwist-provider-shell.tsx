"use client";

import { SerwistProvider, useSerwist } from "@serwist/next/react";
import { useEffect } from "react";

import { requestDeploymentRecovery } from "@/lib/deployment/request-deployment-recovery";

interface SerwistProviderShellProps {
  children: React.ReactNode;
}

function SerwistUpdateReloader() {
  const { serwist } = useSerwist();

  useEffect(() => {
    if (!serwist) {
      return;
    }

    const handleControlling = (event: { isUpdate?: boolean }) => {
      if (event.isUpdate) {
        requestDeploymentRecovery();
      }
    };

    serwist.addEventListener("controlling", handleControlling);

    return () => {
      serwist.removeEventListener("controlling", handleControlling);
    };
  }, [serwist]);

  return null;
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
      <SerwistUpdateReloader />
      {children}
    </SerwistProvider>
  );
}
