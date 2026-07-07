"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  fetchInboxBootstrap,
  prefetchInboxBootstrap,
  triggerInboxMaintenance,
} from "@/lib/inbox/fetch-inbox-bootstrap";

/** Warm inbox bootstrap + maintenance while user is on other tabs. */
export function InboxBootstrapPrefetch() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      return;
    }

    prefetchInboxBootstrap();
    triggerInboxMaintenance();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    void fetchInboxBootstrap({ force: true });
  }, [pathname]);

  return null;
}
