"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { usePersistentTabActive } from "@/components/shared/persistent-tab-active-context";

/**
 * Mobile persistent tabs keep server panels mounted while hidden.
 * Refresh the current route when the tab becomes visible again.
 */
export function useRefreshOnTabActive() {
  const router = useRouter();
  const isActiveTab = usePersistentTabActive();
  const prevActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isActiveTab) {
      prevActiveRef.current = false;
      return;
    }

    const prev = prevActiveRef.current;
    prevActiveRef.current = true;

    if (prev === false) {
      router.refresh();
    }
  }, [isActiveTab, router]);
}
