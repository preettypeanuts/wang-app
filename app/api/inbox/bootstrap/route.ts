import { NextResponse } from "next/server";

import { getApiUserId } from "@/lib/auth/api-session";
import { getInboxMessagesPage } from "@/lib/db/inbox-messages";
import { getTodaySummary } from "@/lib/db/transactions";

export async function GET() {
  const userId = await getApiUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [messagesPage, summary] = await Promise.all([
    getInboxMessagesPage(userId),
    getTodaySummary(userId),
  ]);

  return NextResponse.json({
    messages: messagesPage.messages,
    hasMoreMessages: messagesPage.hasMore,
    summary,
  });
}
