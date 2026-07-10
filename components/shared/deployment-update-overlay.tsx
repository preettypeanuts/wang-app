"use client";

import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { DEPLOYMENT_RECOVERY_ESTIMATED_SEC } from "@/config/deployment-recovery";
import { forceHardReload } from "@/lib/errors/reload-for-deployment";

interface DeploymentUpdateOverlayProps {
  progress: number;
  secondsRemaining: number;
  stageLabel: string;
  exhausted: boolean;
  onManualReload: () => void;
}

export function DeploymentUpdateOverlay({
  progress,
  secondsRemaining,
  stageLabel,
  exhausted,
  onManualReload,
}: DeploymentUpdateOverlayProps) {
  const roundedProgress = Math.round(progress);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="deployment-update-title"
      aria-describedby="deployment-update-description"
    >
      <div className="w-full max-w-sm space-y-5 text-center">
        <div className="space-y-2">
          <h1
            id="deployment-update-title"
            className="text-lg font-semibold tracking-tight"
          >
            Memperbarui aplikasi
          </h1>
          <p
            id="deployment-update-description"
            className="text-sm text-muted-foreground"
          >
            {exhausted
              ? "Pembaruan otomatis gagal. Muat ulang halaman secara manual."
              : "Versi baru terdeteksi. Mohon tunggu sebentar."}
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4 text-left">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-foreground">{stageLabel}</span>
            <span className="tabular-nums text-muted-foreground">
              {exhausted ? "100%" : `${roundedProgress}%`}
            </span>
          </div>

          <Progress value={exhausted ? 100 : roundedProgress}>
            <ProgressTrack className="h-2.5">
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>

          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              Estimasi: ~{DEPLOYMENT_RECOVERY_ESTIMATED_SEC} detik per percobaan
            </span>
            <span className="tabular-nums">
              {exhausted
                ? "Selesai"
                : secondsRemaining > 0
                  ? `${secondsRemaining} detik lagi`
                  : "Memuat ulang..."}
            </span>
          </div>
        </div>

        {exhausted ? (
          <div className="flex flex-col gap-2">
            <Button type="button" onClick={onManualReload}>
              Muat ulang sekarang
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => forceHardReload()}
            >
              Muat ulang paksa
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Jangan tutup aplikasi selama proses berlangsung.
          </p>
        )}
      </div>
    </div>
  );
}
