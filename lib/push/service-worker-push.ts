import { PWA_NOTIFICATION_ICON } from "@/config/pwa";

interface PushPayload {
  title: string;
  body: string;
  href: string;
  tag: string;
  icon: string;
}

const DEFAULT_PUSH_PAYLOAD: PushPayload = {
  title: "Wang",
  body: "Ada pembaruan keuangan untuk kamu.",
  href: "/overview",
  tag: "wang-notification",
  icon: PWA_NOTIFICATION_ICON,
};

function parsePushPayload(event: PushEvent): PushPayload {
  try {
    if (event.data) {
      return { ...DEFAULT_PUSH_PAYLOAD, ...event.data.json() };
    }
  } catch {
    // Keep fallback payload.
  }

  return DEFAULT_PUSH_PAYLOAD;
}

/** Push + notification click handlers — merged into Serwist service worker. */
export function registerPushNotificationHandlers(
  scope: ServiceWorkerGlobalScope,
): void {
  scope.addEventListener("push", (event) => {
    const pushEvent = event as PushEvent;
    const payload = parsePushPayload(pushEvent);

    pushEvent.waitUntil(
      scope.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        tag: payload.tag,
        data: { href: payload.href },
        badge: PWA_NOTIFICATION_ICON,
      }),
    );
  });

  scope.addEventListener("notificationclick", (event) => {
    const notificationEvent = event as NotificationEvent;
    notificationEvent.notification.close();

    const href =
      (notificationEvent.notification.data?.href as string | undefined) ||
      "/overview";
    const targetUrl = new URL(href, scope.location.origin).href;

    notificationEvent.waitUntil(
      scope.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((clients) => {
          for (const client of clients) {
            if ("focus" in client) {
              (client as WindowClient).navigate(targetUrl);
              return client.focus();
            }
          }

          if (scope.clients.openWindow) {
            return scope.clients.openWindow(targetUrl);
          }

          return undefined;
        }),
    );
  });
}
