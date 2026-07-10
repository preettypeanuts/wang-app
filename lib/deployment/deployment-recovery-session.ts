const ACTIVE_KEY = "monmon:deployment-recovery-active";
const STARTED_AT_KEY = "monmon:deployment-recovery-started-at";
const LAST_RELOAD_AT_KEY = "monmon:deployment-recovery-last-reload-at";

export function markRecoveryStarted(): number {
  const now = Date.now();
  sessionStorage.setItem(ACTIVE_KEY, "1");
  sessionStorage.setItem(STARTED_AT_KEY, String(now));
  return now;
}

export function getRecoveryStartedAt(): number | null {
  const raw = sessionStorage.getItem(STARTED_AT_KEY);
  if (!raw) {
    return null;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function isRecoveryActive(): boolean {
  return sessionStorage.getItem(ACTIVE_KEY) === "1";
}

export function markRecoveryReloaded(): void {
  sessionStorage.setItem(LAST_RELOAD_AT_KEY, String(Date.now()));
}

export function getLastRecoveryReloadAt(): number | null {
  const raw = sessionStorage.getItem(LAST_RELOAD_AT_KEY);
  if (!raw) {
    return null;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function clearRecoverySession(): void {
  sessionStorage.removeItem(ACTIVE_KEY);
  sessionStorage.removeItem(STARTED_AT_KEY);
}
