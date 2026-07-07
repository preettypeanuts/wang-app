"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  fetchInboxBootstrap,
  triggerInboxMaintenance,
} from "@/lib/inbox/fetch-inbox-bootstrap";

/** Warm inbox cache + maintenance while user is on other tabs. */
export function InboxBootstrapPrefetch() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      return;
    }

    void fetchInboxBootstrap();
    triggerInboxMaintenance();
  }, [pathname]);

  return null;
}
