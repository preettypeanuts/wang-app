"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { NOTIFICATIONS_FEED_PAGE_SIZE } from "@/config/notifications-page";
import type {
  AppNotificationCounts,
  AppNotificationFeedPage,
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

export function useNotificationsFeed(): UseNotificationsFeedResult {
  const [items, setItems] = useState<AppNotificationRecord[]>([]);
  const [counts, setCounts] = useState<AppNotificationCounts>(EMPTY_COUNTS);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (cursor?: string) => {
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    const params = new URLSearchParams({
      limit: String(NOTIFICATIONS_FEED_PAGE_SIZE),
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    try {
      const response = await fetch(`/api/notifications/feed?${params}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal memuat notifikasi.");
      }

      const data = (await response.json()) as AppNotificationFeedPage;

      setItems((current) =>
        cursor ? [...current, ...data.items] : data.items,
      );
      setCounts(data.counts);
      setNextCursor(data.nextCursor);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Gagal memuat notifikasi.",
      );
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    void fetchPage().finally(() => setIsLoading(false));
  }, [fetchPage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    void fetchPage(nextCursor).finally(() => setIsLoadingMore(false));
  }, [fetchPage, isLoadingMore, nextCursor]);

  return {
    items,
    counts,
    isLoading,
    isLoadingMore,
    hasMore: Boolean(nextCursor),
    error,
    loadMore,
    refresh,
    setItems,
    setCounts,
  };
}
