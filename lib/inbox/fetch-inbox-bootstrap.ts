import {
  readInboxBootstrapCache,
  writeInboxBootstrapCache,
  type InboxBootstrapPayload,
} from "@/lib/inbox/inbox-bootstrap-cache";

let inflight: Promise<InboxBootstrapPayload | null> | null = null;
let lastMaintenanceAt = 0;

const MAINTENANCE_COOLDOWN_MS = 5 * 60 * 1000;

export async function fetchInboxBootstrap(): Promise<InboxBootstrapPayload | null> {
  if (inflight) {
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
  const now = Date.now();

  if (now - lastMaintenanceAt < MAINTENANCE_COOLDOWN_MS) {
    return;
  }

  lastMaintenanceAt = now;
  void fetch("/api/inbox/deferred", { method: "POST" }).catch(() => {});
}
