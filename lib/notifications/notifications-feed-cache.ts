import type {
  AppNotificationCounts,
  AppNotificationFeedMeta,
  AppNotificationFeedPage,
  AppNotificationRecord,
} from "@/types/notification";

const CACHE_KEY = "wang.notifications.feed.v1";

export interface NotificationsFeedCachePayload {
  items: AppNotificationRecord[];
  nextCursor: string | null;
  counts: AppNotificationCounts;
  meta: AppNotificationFeedMeta;
}

export function feedMetaFromPage(
  page: AppNotificationFeedPage,
): AppNotificationFeedMeta {
  const head = page.items[0];
  const counts = page.counts ?? { total: 0, unread: 0 };

  return {
    counts,
    latestId: head?.id ?? null,
    latestCreatedAt: head?.createdAt ?? null,
  };
}

export function isFeedMetaCurrent(
  cached: NotificationsFeedCachePayload,
  meta: AppNotificationFeedMeta,
): boolean {
  return (
    cached.meta.latestId === meta.latestId &&
    cached.meta.latestCreatedAt === meta.latestCreatedAt &&
    cached.meta.counts.total === meta.counts.total &&
    cached.meta.counts.unread === meta.counts.unread
  );
}

export function readNotificationsFeedCache(): NotificationsFeedCachePayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as NotificationsFeedCachePayload;
  } catch {
    return null;
  }
}

export function writeNotificationsFeedCache(
  payload: NotificationsFeedCachePayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors.
  }
}

export function writeNotificationsFeedPage(page: AppNotificationFeedPage) {
  if (!page.counts) {
    return;
  }

  writeNotificationsFeedCache({
    items: page.items,
    nextCursor: page.nextCursor,
    counts: page.counts,
    meta: feedMetaFromPage(page),
  });
}

export function patchNotificationsFeedCache(
  patch: Partial<
    Pick<NotificationsFeedCachePayload, "items" | "nextCursor" | "counts">
  >,
) {
  const cached = readNotificationsFeedCache();

  if (!cached) {
    return;
  }

  const nextItems = patch.items ?? cached.items;
  const nextCounts = patch.counts ?? cached.counts;

  writeNotificationsFeedCache({
    items: nextItems,
    nextCursor: patch.nextCursor ?? cached.nextCursor,
    counts: nextCounts,
    meta: {
      counts: nextCounts,
      latestId: nextItems[0]?.id ?? null,
      latestCreatedAt: nextItems[0]?.createdAt ?? null,
    },
  });
}
