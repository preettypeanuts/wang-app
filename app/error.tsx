"use client";

import { useEffect } from "react";

import { AuthErrorAlert } from "@/components/auth/auth-error-alert";
import { Button } from "@/components/ui/button";
import { formatAppError } from "@/lib/errors/format-app-error";
import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";
import {
  getDeploymentReloadAttempts,
  reloadForDeployment,
} from "@/lib/errors/reload-for-deployment";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const isStaleDeployment = isStaleDeploymentError(error);
  const reloadExhausted = getDeploymentReloadAttempts() >= 2;

  useEffect(() => {
    console.error(error);
  }, [error]);

  useEffect(() => {
    if (!isStaleDeployment || reloadExhausted) {
      return;
    }

    reloadForDeployment();
  }, [isStaleDeployment, reloadExhausted]);

  const message = formatAppError(error);

  const handleRetry = () => {
    if (isStaleDeployment) {
      if (!reloadForDeployment()) {
        window.location.assign(window.location.pathname);
      }
      return;
    }

    reset();
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">
            {isStaleDeployment
              ? "Memperbarui aplikasi"
              : "Gagal memuat halaman"}
          </h1>
          <AuthErrorAlert message={message} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={handleRetry}>
            {isStaleDeployment ? "Muat ulang sekarang" : "Coba lagi"}
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
