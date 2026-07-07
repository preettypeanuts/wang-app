import { NextResponse } from "next/server";

import { requireApiUserId } from "@/lib/auth/api-session";
import { upsertPushSubscription } from "@/lib/db/push-subscriptions";
import type { PushSubscriptionPayload } from "@/types/notification";

export async function POST(request: Request) {
  try {
    const userId = await requireApiUserId();
    const body = (await request.json()) as PushSubscriptionPayload;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json(
        { error: "Subscription tidak valid." },
        { status: 400 },
      );
    }

    await upsertPushSubscription(userId, body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : "Gagal menyimpan subscription.";

    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
