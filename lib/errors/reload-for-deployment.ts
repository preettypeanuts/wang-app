const RELOAD_ATTEMPTS_KEY = "monmon:deployment-reload-attempts";
const MAX_RELOAD_ATTEMPTS = 3;

function canReload(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const attempts = Number(sessionStorage.getItem(RELOAD_ATTEMPTS_KEY) ?? 0);
  return attempts < MAX_RELOAD_ATTEMPTS;
}

function recordReloadAttempt(): void {
  const attempts = Number(sessionStorage.getItem(RELOAD_ATTEMPTS_KEY) ?? 0);
  sessionStorage.setItem(RELOAD_ATTEMPTS_KEY, String(attempts + 1));
}

async function clearRuntimeCaches(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  }

  if (!("caches" in window)) {
    return;
  }

  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
}

/** Full reload with cache bust — returns false when the retry budget is exhausted. */
export function reloadForDeployment(): boolean {
  if (!canReload()) {
    return false;
  }

  recordReloadAttempt();

  void clearRuntimeCaches();

  const url = new URL(window.location.href);
  url.searchParams.set("_refresh", Date.now().toString());
  window.location.replace(url.toString());

  return true;
}

/** Hard navigation fallback when the retry budget is exhausted. */
export function forceHardReload(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("_refresh", Date.now().toString());
  window.location.assign(url.toString());
}

/** Call after a successful boot so later deploy recoveries can retry again. */
export function clearDeploymentReloadAttempts(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(RELOAD_ATTEMPTS_KEY);
}

export function getDeploymentReloadAttempts(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  return Number(sessionStorage.getItem(RELOAD_ATTEMPTS_KEY) ?? 0);
}
