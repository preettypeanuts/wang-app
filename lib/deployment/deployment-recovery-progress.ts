import {
  DEPLOYMENT_RECOVERY_ESTIMATED_MS,
  DEPLOYMENT_RECOVERY_ESTIMATED_SEC,
  DEPLOYMENT_RECOVERY_STAGES,
} from "@/config/deployment-recovery";

export function getRecoveryProgress(
  startedAt: number,
  now = Date.now(),
): number {
  const elapsed = now - startedAt;
  return Math.min(100, (elapsed / DEPLOYMENT_RECOVERY_ESTIMATED_MS) * 100);
}

export function getRecoverySecondsRemaining(
  startedAt: number,
  now = Date.now(),
): number {
  const elapsed = now - startedAt;
  const remainingMs = DEPLOYMENT_RECOVERY_ESTIMATED_MS - elapsed;
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function getRecoveryStageLabel(progress: number): string {
  for (const stage of DEPLOYMENT_RECOVERY_STAGES) {
    if (progress < stage.until) {
      return stage.label;
    }
  }

  return DEPLOYMENT_RECOVERY_STAGES[DEPLOYMENT_RECOVERY_STAGES.length - 1]
    .label;
}

export function isRecoveryAnimationComplete(
  startedAt: number,
  now = Date.now(),
): boolean {
  return now - startedAt >= DEPLOYMENT_RECOVERY_ESTIMATED_MS;
}

export { DEPLOYMENT_RECOVERY_ESTIMATED_SEC };
