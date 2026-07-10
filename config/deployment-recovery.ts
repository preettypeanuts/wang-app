/** Estimated duration shown to users while caches clear and the app reloads. */
export const DEPLOYMENT_RECOVERY_ESTIMATED_SEC = 5;

export const DEPLOYMENT_RECOVERY_ESTIMATED_MS =
  DEPLOYMENT_RECOVERY_ESTIMATED_SEC * 1000;

/** Minimum gap between automatic reload attempts to avoid skeleton flicker. */
export const DEPLOYMENT_RECOVERY_COOLDOWN_MS = 8_000;

export const DEPLOYMENT_RECOVERY_MAX_ATTEMPTS = 3;

export const DEPLOYMENT_RECOVERY_EVENT = "monmon:deployment-recovery-request";

export const DEPLOYMENT_RECOVERY_STAGES = [
  { until: 40, label: "Membersihkan cache lama..." },
  { until: 80, label: "Mengunduh versi terbaru..." },
  { until: 100, label: "Menyiapkan aplikasi..." },
] as const;
