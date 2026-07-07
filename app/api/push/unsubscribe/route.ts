import { NextResponse } from "next/server";

import { requireApiUserId } from "@/lib/auth/api-session";
import { deletePushSubscription } from "@/lib/db/push-subscriptions";

export async function DELETE(request: Request) {
  try {
    const userId = await requireApiUserId();
    const body = (await request.json()) as { endpoint?: string };

    if (!body.endpoint) {
      return NextResponse.json(
        { error: "Endpoint wajib diisi." },
        { status: 400 },
      );
    }

    await deletePushSubscription(userId, body.endpoint);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Unauthorized"
        ? "Unauthorized"
        : "Gagal menghapus subscription.";

    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
