import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { maintainInboxData } from "@/lib/db/inbox-messages";
import { getInboxDeferredData } from "@/lib/inbox/get-inbox-deferred-data";

export async function GET() {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getInboxDeferredData(userId);

  return NextResponse.json(data);
}

export async function POST() {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  void maintainInboxData(userId).catch(() => {});

  return NextResponse.json({ ok: true });
}
