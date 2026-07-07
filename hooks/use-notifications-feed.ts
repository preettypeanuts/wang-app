"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchNotificationsFeedMeta,
  fetchNotificationsFeedPage,
} from "@/lib/notifications/fetch-notifications-feed";
import {
  isFeedMetaCurrent,
  patchNotificationsFeedCache,
  readNotificationsFeedCache,
  writeNotificationsFeedCache,
} from "@/lib/notifications/notifications-feed-cache";
import type {
  AppNotificationCounts,
  AppNotificationRecord,
} from "@/types/notification";

interface UseNotificationsFeedResult {
  items: AppNotificationRecord[];
  counts: AppNotificationCounts;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  setItems: React.Dispatch<React.SetStateAction<AppNotificationRecord[]>>;
  setCounts: React.Dispatch<React.SetStateAction<AppNotificationCounts>>;
}

const EMPTY_COUNTS: AppNotificationCounts = { total: 0, unread: 0 };

function resolveInitialState() {
  const cached = readNotificationsFeedCache();

  if (cached) {
    return {
      items: cached.items,
      counts: cached.counts,
      nextCursor: cached.nextCursor,
      isLoading: false,
      hasWarmCache: true,
    };
  }

  return {
    items: [] as AppNotificationRecord[],
    counts: EMPTY_COUNTS,
    nextCursor: null as string | null,
    isLoading: true,
    hasWarmCache: false,
  };
}

function scheduleIdle(task: () => void) {
  if (typeof requestIdleCallback !== "undefined") {
    const id = requestIdleCallback(task, { timeout: 2_000 });
    return () => cancelIdleCallback(id);
  }

  const timeoutId = window.setTimeout(task, 150);
  return () => window.clearTimeout(timeoutId);
}

export function useNotificationsFeed(): UseNotificationsFeedResult {
  const initial = resolveInitialState();
  const [items, setItems] = useState<AppNotificationRecord[]>(initial.items);
  const [counts, setCounts] = useState<AppNotificationCounts>(initial.counts);
  const [nextCursor, setNextCursor] = useState<string | null>(initial.nextCursor);
  const [isLoading, setIsLoading] = useState(initial.isLoading);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);
  const hasWarmCacheRef = useRef(initial.hasWarmCache);

  const applyPage = useCallback(
    (
      page: {
        items: AppNotificationRecord[];
        nextCursor: string | null;
        counts?: AppNotificationCounts;
      },
      options?: { append?: boolean },
    ) => {
      setItems((current) => {
        const nextItems = options?.append
          ? [...current, ...page.items]
          : page.items;
        const nextCounts =
          page.counts ??
          readNotificationsFeedCache()?.counts ??
          EMPTY_COUNTS;

        writeNotificationsFeedCache({
          items: nextItems,
          nextCursor: page.nextCursor,
          counts: nextCounts,
          meta: {
            counts: nextCounts,
            latestId: nextItems[0]?.id ?? null,
            latestCreatedAt: nextItems[0]?.createdAt ?? null,
          },
        });

        return nextItems;
      });

      if (page.counts) {
        setCounts(page.counts);
      }

      setNextCursor(page.nextCursor);
      setError(null);
    },
    [],
  );

  const revalidate = useCallback(
    async (options?: { force?: boolean }) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      try {
        const cached = readNotificationsFeedCache();

        if (!options?.force && cached) {
          const meta = await fetchNotificationsFeedMeta();

          if (meta && isFeedMetaCurrent(cached, meta)) {
            setError(null);
            return;
          }
        }

        const page = await fetchNotificationsFeedPage();

        if (!page) {
          throw new Error("Gagal memuat notifikasi.");
        }

        applyPage(page);
      } catch (fetchError) {
        if (!readNotificationsFeedCache()) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Gagal memuat notifikasi.",
          );
        }
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [applyPage],
  );

  const refresh = useCallback(() => {
    setIsLoading(items.length === 0);
    void revalidate({ force: true });
  }, [items.length, revalidate]);

  useEffect(() => {
    if (hasWarmCacheRef.current) {
      return scheduleIdle(() => {
        void revalidate();
      });
    }

    void revalidate();
  }, [revalidate]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    void fetchNotificationsFeedPage(nextCursor)
      .then((page) => {
        if (!page) {
          throw new Error("Gagal memuat notifikasi.");
        }

        applyPage(page, { append: true });
      })
      .catch((fetchError) => {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Gagal memuat notifikasi.",
        );
      })
      .finally(() => setIsLoadingMore(false));
  }, [applyPage, isLoadingMore, nextCursor]);

  const setItemsWithCache: typeof setItems = useCallback((updater) => {
    setItems((current) => {
      const next =
        typeof updater === "function"
          ? (updater as (value: AppNotificationRecord[]) => AppNotificationRecord[])(current)
          : updater;

      patchNotificationsFeedCache({ items: next });
      return next;
    });
  }, []);

  const setCountsWithCache: typeof setCounts = useCallback((updater) => {
    setCounts((current) => {
      const next =
        typeof updater === "function"
          ? (updater as (value: AppNotificationCounts) => AppNotificationCounts)(current)
          : updater;

      patchNotificationsFeedCache({ counts: next });
      return next;
    });
  }, []);

  return {
    items,
    counts,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextCursor),
    error,
    loadMore,
    refresh,
    setItems: setItemsWithCache,
    setCounts: setCountsWithCache,
  };
}
