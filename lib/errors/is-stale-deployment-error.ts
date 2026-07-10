const STALE_DEPLOYMENT_PATTERNS = [
  "loading chunk",
  "chunkloaderror",
  "failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "importing a module script failed",
  "failed to load module script",
  "dynamically imported module",
  "unable to preload css",
  "outdated optimize dep",
] as const;

function readErrorText(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`;
  }

  if (typeof error === "string") {
    return error;
  }

  return "";
}

function includesAny(text: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

/** True when the client likely references assets from a previous deployment. */
export function isStaleDeploymentError(error: unknown): boolean {
  const text = readErrorText(error).toLowerCase();

  if (!text) {
    return false;
  }

  return includesAny(text, STALE_DEPLOYMENT_PATTERNS);
}
