"use client";

import { useEffect } from "react";

import { registerPushServiceWorker } from "@/lib/push/subscribe-client";

export function PushNotificationManager() {
  useEffect(() => {
    void registerPushServiceWorker();
  }, []);

  return null;
}
