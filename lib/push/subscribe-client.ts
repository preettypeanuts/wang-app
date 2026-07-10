"use client";

import {
  PUSH_ERROR_INVALID_SUBSCRIPTION,
  PUSH_ERROR_NOT_CONFIGURED,
  PUSH_ERROR_PERMISSION_DENIED,
  PUSH_ERROR_SAVE_SUBSCRIPTION,
  PUSH_ERROR_SERVICE_WORKER,
  PUSH_ERROR_UNSUPPORTED,
} from "@/config/settings-labels";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

export async function getPushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(): Promise<{
  ok: boolean;
  error?: string;
}> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return {
      ok: false,
      error: PUSH_ERROR_UNSUPPORTED,
    };
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return {
      ok: false,
      error: PUSH_ERROR_PERMISSION_DENIED,
    };
  }

  const keyResponse = await fetch("/api/push/vapid-public-key");

  if (!keyResponse.ok) {
    return {
      ok: false,
      error: PUSH_ERROR_NOT_CONFIGURED,
    };
  }

  const { publicKey } = (await keyResponse.json()) as { publicKey: string };
  const registration = await registerPushServiceWorker();

  if (!registration) {
    return {
      ok: false,
      error: PUSH_ERROR_SERVICE_WORKER,
    };
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });

  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return {
      ok: false,
      error: PUSH_ERROR_INVALID_SUBSCRIPTION,
    };
  }

  const saveResponse = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: {
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      },
    }),
  });

  if (!saveResponse.ok) {
    return {
      ok: false,
      error: PUSH_ERROR_SAVE_SUBSCRIPTION,
    };
  }

  return { ok: true };
}

export async function unsubscribeFromPushNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration("/");

  if (!registration) {
    return;
  }

  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  await fetch("/api/push/unsubscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });

  await subscription.unsubscribe();
}

export async function hasActivePushSubscription(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();

  return Boolean(subscription);
}
