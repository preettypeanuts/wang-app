import webpush from "web-push";

import { NOTIFICATION_PUSH_ICON } from "@/config/notifications";

function getVapidSubject(): string {
  return (
    process.env.VAPID_SUBJECT?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "mailto:hello@wang.web.id"
  );
}

export function isWebPushConfigured(): boolean {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim(),
  );
}

export function getVapidPublicKey(): string | null {
  const key = process.env.VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys belum dikonfigurasi.");
  }

  webpush.setVapidDetails(getVapidSubject(), publicKey, privateKey);
}

export interface WebPushMessage {
  title: string;
  body: string;
  href: string;
  tag: string;
}

export async function sendWebPush(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  message: WebPushMessage,
): Promise<void> {
  configureWebPush();

  await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    },
    JSON.stringify({
      title: message.title,
      body: message.body,
      href: message.href,
      tag: message.tag,
      icon: NOTIFICATION_PUSH_ICON,
    }),
  );
}
