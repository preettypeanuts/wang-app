import {
  readInboxBootstrapCache,
  writeInboxBootstrapCache,
  type InboxBootstrapPayload,
} from "@/lib/inbox/inbox-bootstrap-cache";

let inflight: Promise<InboxBootstrapPayload | null> | null = null;

export async function fetchInboxBootstrap(
  options?: { force?: boolean },
): Promise<InboxBootstrapPayload | null> {
  if (!options?.force && inflight) {
    return inflight;
  }

  inflight = fetch("/api/inbox/bootstrap", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as InboxBootstrapPayload;
      writeInboxBootstrapCache(data);
      return data;
    })
    .catch(() => null)
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function prefetchInboxBootstrap() {
  if (readInboxBootstrapCache()) {
    return;
  }

  void fetchInboxBootstrap();
}

export function triggerInboxMaintenance() {
  void fetch("/api/inbox/deferred", { method: "POST" }).catch(() => {});
}
