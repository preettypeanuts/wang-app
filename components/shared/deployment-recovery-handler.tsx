"use client";

import { useEffect } from "react";

import { CLIENT_BUILD_ID } from "@/lib/deployment/build-id";
import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";
import {
  clearDeploymentReloadAttempts,
  reloadForDeployment,
} from "@/lib/errors/reload-for-deployment";

const BUILD_ID_ENDPOINT = "/api/build-id";
const BUILD_CHECK_INTERVAL_MS = 5 * 60 * 1000;

async function fetchServerBuildId(): Promise<string | null> {
  try {
    const response = await fetch(BUILD_ID_ENDPOINT, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { buildId?: string };
    return payload.buildId ?? null;
  } catch {
    return null;
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

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      tryRecoverFromStaleClient(event.reason);
    };

    const onWindowError = (event: ErrorEvent) => {
      tryRecoverFromStaleClient(event.error ?? event.message);
    };

    const checkBuildId = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      const serverBuildId = await fetchServerBuildId();

      if (!serverBuildId || serverBuildId === CLIENT_BUILD_ID) {
        return;
      }

      reloadForDeployment();
    };

    const onVisibilityChange = () => {
      void checkBuildId();
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(() => {
      void checkBuildId();
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
