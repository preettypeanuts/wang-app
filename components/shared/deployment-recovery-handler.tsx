"use client";

import { useEffect } from "react";

import { hasDeploymentMismatch } from "@/lib/deployment/has-deployment-mismatch";
import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";
import {
  clearDeploymentReloadAttempts,
  reloadForDeployment,
} from "@/lib/errors/reload-for-deployment";

const BUILD_CHECK_INTERVAL_MS = 60 * 1000;

async function tryRecoverFromDeploymentMismatch(): Promise<void> {
  if (await hasDeploymentMismatch()) {
    reloadForDeployment();
  }
}

function tryRecoverFromStaleClient(error: unknown): void {
  if (!isStaleDeploymentError(error)) {
    return;
  }

  reloadForDeployment();
}

/** Recovers from post-deployment chunk/cache mismatches without user action. */
export function DeploymentRecoveryHandler() {
  useEffect(() => {
    clearDeploymentReloadAttempts();
    void tryRecoverFromDeploymentMismatch();

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      tryRecoverFromStaleClient(event.reason);
    };

    const onWindowError = (event: ErrorEvent) => {
      tryRecoverFromStaleClient(event.error ?? event.message);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void tryRecoverFromDeploymentMismatch();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(() => {
      void tryRecoverFromDeploymentMismatch();
    }, BUILD_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
