const BUILD_ID_ENDPOINT = "/api/build-id";
const BUILD_ID_META_PATTERN =
  /<meta[^>]+name=["']monmon-build-id["'][^>]+content=["']([^"']+)["']/i;

async function fetchBuildIdFromApi(): Promise<string | null> {
  const response = await fetch(BUILD_ID_ENDPOINT, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { buildId?: string };
  return payload.buildId ?? null;
}

async function fetchBuildIdFromDocument(): Promise<string | null> {
  const response = await fetch("/", {
    cache: "no-store",
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const match = html.match(BUILD_ID_META_PATTERN);
  return match?.[1] ?? null;
}

/** Reads the live server build id (API first, then HTML meta fallback). */
export async function fetchServerBuildId(): Promise<string | null> {
  try {
    const fromApi = await fetchBuildIdFromApi();
    if (fromApi) {
      return fromApi;
    }
  } catch {
    // Fall through to document meta.
  }

  try {
    return await fetchBuildIdFromDocument();
  } catch {
    return null;
  }
}
