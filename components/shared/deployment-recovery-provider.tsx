"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DeploymentRecoveryContext } from "@/components/shared/deployment-recovery-context";
import { DeploymentUpdateOverlay } from "@/components/shared/deployment-update-overlay";
import {
  DEPLOYMENT_RECOVERY_COOLDOWN_MS,
  DEPLOYMENT_RECOVERY_EVENT,
  DEPLOYMENT_RECOVERY_MAX_ATTEMPTS,
} from "@/config/deployment-recovery";
import {
  clearRecoverySession,
  getLastRecoveryReloadAt,
  getRecoveryStartedAt,
  isRecoveryActive,
  markRecoveryStarted,
} from "@/lib/deployment/deployment-recovery-session";
import {
  DEPLOYMENT_RECOVERY_ESTIMATED_SEC,
  getRecoveryProgress,
  getRecoverySecondsRemaining,
  getRecoveryStageLabel,
  isRecoveryAnimationComplete,
} from "@/lib/deployment/deployment-recovery-progress";
import { hasDeploymentMismatch } from "@/lib/deployment/has-deployment-mismatch";
import { isStaleDeploymentError } from "@/lib/errors/is-stale-deployment-error";
import {
  clearDeploymentReloadAttempts,
  forceHardReload,
  getDeploymentReloadAttempts,
  reloadForDeployment,
} from "@/lib/errors/reload-for-deployment";

const BUILD_CHECK_INTERVAL_MS = 60 * 1000;
const PROGRESS_TICK_MS = 100;

interface DeploymentRecoveryProviderProps {
  children: React.ReactNode;
}

function stripRecoveryQueryParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("_refresh")) {
    return;
  }

  url.searchParams.delete("_refresh");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", next);
}

export function DeploymentRecoveryProvider({
  children,
}: DeploymentRecoveryProviderProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    DEPLOYMENT_RECOVERY_ESTIMATED_SEC,
  );
  const [stageLabel, setStageLabel] = useState("Membersihkan cache lama...");
  const [exhausted, setExhausted] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const recoveringRef = useRef(false);

  const syncProgress = useCallback((startedAt: number) => {
    const nextProgress = getRecoveryProgress(startedAt);
    setProgress(nextProgress);
    setSecondsRemaining(getRecoverySecondsRemaining(startedAt));
    setStageLabel(getRecoveryStageLabel(nextProgress));
  }, []);

  const showExhausted = useCallback(() => {
    recoveringRef.current = false;
    setVisible(true);
    setExhausted(true);
    setProgress(100);
    setSecondsRemaining(0);
    setStageLabel("Menyiapkan aplikasi...");
  }, []);

  const startRecovery = useCallback(() => {
    if (recoveringRef.current) {
      return;
    }

    if (getDeploymentReloadAttempts() >= DEPLOYMENT_RECOVERY_MAX_ATTEMPTS) {
      showExhausted();
      return;
    }

    const lastReloadAt = getLastRecoveryReloadAt();
    if (
      lastReloadAt &&
      Date.now() - lastReloadAt < DEPLOYMENT_RECOVERY_COOLDOWN_MS
    ) {
      const startedAt = getRecoveryStartedAt() ?? markRecoveryStarted();
      startedAtRef.current = startedAt;
      setVisible(true);
      setExhausted(false);
      syncProgress(startedAt);
      return;
    }

    recoveringRef.current = true;
    const startedAt = markRecoveryStarted();
    startedAtRef.current = startedAt;
    setVisible(true);
    setExhausted(false);
    syncProgress(startedAt);
  }, [showExhausted, syncProgress]);

  const handleManualReload = useCallback(() => {
    if (!reloadForDeployment()) {
      forceHardReload();
    }
  }, []);

  useEffect(() => {
    const startedAt = startedAtRef.current;
    if (!visible || exhausted || !startedAt) {
      return;
    }

    const tick = () => {
      const activeStartedAt = startedAtRef.current;
      if (!activeStartedAt) {
        return;
      }

      syncProgress(activeStartedAt);

      if (!isRecoveryAnimationComplete(activeStartedAt)) {
        return;
      }

      recoveringRef.current = false;
      if (!reloadForDeployment()) {
        showExhausted();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, PROGRESS_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, [exhausted, showExhausted, syncProgress, visible]);

  useEffect(() => {
    const boot = async () => {
      const mismatch = await hasDeploymentMismatch();

      if (!mismatch) {
        clearDeploymentReloadAttempts();
        clearRecoverySession();
        recoveringRef.current = false;
        startedAtRef.current = null;
        setVisible(false);
        setExhausted(false);
        stripRecoveryQueryParam();
        router.refresh();
        return;
      }

      const existingStartedAt = getRecoveryStartedAt();
      if (
        isRecoveryActive() &&
        existingStartedAt &&
        !isRecoveryAnimationComplete(existingStartedAt)
      ) {
        recoveringRef.current = true;
        startedAtRef.current = existingStartedAt;
        setVisible(true);
        setExhausted(false);
        syncProgress(existingStartedAt);
        return;
      }

      startRecovery();
    };

    void boot();

    const onRecoveryRequest = () => {
      startRecovery();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isStaleDeploymentError(event.reason)) {
        onRecoveryRequest();
      }
    };

    const onWindowError = (event: ErrorEvent) => {
      if (isStaleDeploymentError(event.error ?? event.message)) {
        onRecoveryRequest();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void hasDeploymentMismatch().then((mismatch) => {
        if (mismatch) {
          onRecoveryRequest();
        }
      });
    };

    window.addEventListener(DEPLOYMENT_RECOVERY_EVENT, onRecoveryRequest);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onWindowError);
    document.addEventListener("visibilitychange", onVisibilityChange);

    const intervalId = window.setInterval(() => {
      void hasDeploymentMismatch().then((mismatch) => {
        if (mismatch) {
          onRecoveryRequest();
        }
      });
    }, BUILD_CHECK_INTERVAL_MS);

    return () => {
      window.removeEventListener(DEPLOYMENT_RECOVERY_EVENT, onRecoveryRequest);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onWindowError);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, [router, startRecovery, syncProgress]);

  const contextValue = useMemo(
    () => ({
      visible,
      progress,
      secondsRemaining,
      stageLabel,
      exhausted,
      requestRecovery: startRecovery,
      manualReload: handleManualReload,
    }),
    [
      exhausted,
      handleManualReload,
      progress,
      secondsRemaining,
      stageLabel,
      startRecovery,
      visible,
    ],
  );

  return (
    <DeploymentRecoveryContext.Provider value={contextValue}>
      {children}
      {visible ? (
        <DeploymentUpdateOverlay
          progress={progress}
          secondsRemaining={secondsRemaining}
          stageLabel={stageLabel}
          exhausted={exhausted}
          onManualReload={handleManualReload}
        />
      ) : null}
    </DeploymentRecoveryContext.Provider>
  );
}
