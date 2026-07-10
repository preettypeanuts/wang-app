"use client";

import { useEffect, useState } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { Button } from "@/components/ui/button";
import { hasDeploymentMismatch } from "@/lib/deployment/has-deployment-mismatch";
import { formatAppError } from "@/lib/errors/format-app-error";
import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";
import {
  forceHardReload,
  getDeploymentReloadAttempts,
  reloadForDeployment,
} from "@/lib/errors/reload-for-deployment";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [deploymentMismatch, setDeploymentMismatch] = useState(false);
  const isStaleDeployment = isStaleDeploymentError(error);
  const shouldRecoverDeployment = isStaleDeployment || deploymentMismatch;
  const reloadExhausted = getDeploymentReloadAttempts() >= 3;

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
    if (!shouldRecoverDeployment || reloadExhausted) {
      return;
    }

    reloadForDeployment();
  }, [shouldRecoverDeployment, reloadExhausted]);

  const message = shouldRecoverDeployment
    ? "Aplikasi baru saja diperbarui. Memuat versi terbaru…"
    : formatAppError(error);

  const handleRetry = () => {
    if (shouldRecoverDeployment) {
      if (!reloadForDeployment()) {
        forceHardReload();
      }
      return;
    }

    if (!reloadForDeployment()) {
      reset();
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            {shouldRecoverDeployment
              ? "Memperbarui aplikasi"
              : "Gagal memuat halaman"}
          </h1>
          <AuthErrorAlert message={message} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={handleRetry}>
            {shouldRecoverDeployment
              ? "Muat ulang sekarang"
              : "Muat ulang halaman"}
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
