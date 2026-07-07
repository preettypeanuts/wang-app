import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { getInboxMessages } from "@/lib/db/inbox-messages";
import { getTodaySummary } from "@/lib/db/transactions";

export async function GET() {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [messages, summary] = await Promise.all([
    getInboxMessages(userId),
    getTodaySummary(userId),
  ]);

  return NextResponse.json({ messages, summary });
}
