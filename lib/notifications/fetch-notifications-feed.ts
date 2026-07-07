import { NOTIFICATIONS_FEED_PAGE_SIZE } from "@/config/notifications-page";
import {
  readNotificationsFeedCache,
  writeNotificationsFeedPage,
} from "@/lib/notifications/notifications-feed-cache";
import type {
  AppNotificationFeedMeta,
  AppNotificationFeedPage,
} from "@/types/notification";

let inflightMeta: Promise<AppNotificationFeedMeta | null> | null = null;
let inflightPage: Promise<AppNotificationFeedPage | null> | null = null;

export async function fetchNotificationsFeedMeta(): Promise<AppNotificationFeedMeta | null> {
  if (inflightMeta) {
    return inflightMeta;
  }

  inflightMeta = fetch("/api/notifications/feed?meta=1", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      return (await response.json()) as AppNotificationFeedMeta;
    })
    .catch(() => null)
    .finally(() => {
      inflightMeta = null;
    });

  return inflightMeta;
}

export async function fetchNotificationsFeedPage(
  cursor?: string,
): Promise<AppNotificationFeedPage | null> {
  if (!cursor && inflightPage) {
    return inflightPage;
  }

  const params = new URLSearchParams({
    limit: String(NOTIFICATIONS_FEED_PAGE_SIZE),
  });

  if (cursor) {
    params.set("cursor", cursor);
  }

  const request = fetch(`/api/notifications/feed?${params}`, {
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as AppNotificationFeedPage;

      if (!cursor) {
        writeNotificationsFeedPage(data);
      }

      return data;
    })
    .catch(() => null);

  if (!cursor) {
    inflightPage = request.finally(() => {
      inflightPage = null;
    });
    return inflightPage;
  }

  return request;
}

/** Warm feed cache before navigating to /notifications. */
export function prefetchNotificationsFeed() {
  if (readNotificationsFeedCache()) {
    void fetchNotificationsFeedMeta();
    return;
  }

  void fetchNotificationsFeedPage();
}
