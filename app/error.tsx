"use client";

import { useEffect, useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { Button } from "@/components/ui/button";
import { hasDeploymentMismatch } from "@/lib/deployment/has-deployment-mismatch";
import { requestDeploymentRecovery } from "@/lib/deployment/request-deployment-recovery";
import { formatAppError } from "@/lib/errors/format-app-error";
import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";
import { reloadForDeployment } from "@/lib/errors/reload-for-deployment";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [deploymentMismatch, setDeploymentMismatch] = useState(false);
  const isStaleDeployment = isStaleDeploymentError(error);
  const shouldRecoverDeployment = isStaleDeployment || deploymentMismatch;

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    let cancelled = false;

    void hasDeploymentMismatch().then((mismatch) => {
      if (!cancelled) {
        setDeploymentMismatch(mismatch);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!shouldRecoverDeployment) {
      return;
    }

    requestDeploymentRecovery();
  }, [shouldRecoverDeployment]);

  if (shouldRecoverDeployment) {
    return null;
  }

  const handleRetry = () => {
    if (!reloadForDeployment()) {
      reset();
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            Gagal memuat halaman
          </h1>
          <AuthErrorAlert message={formatAppError(error)} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={handleRetry}>
            Muat ulang halaman
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.assign("/login")}
          >
            Ke halaman login
          </Button>
        </div>
      </div>
    </div>
  );
}
