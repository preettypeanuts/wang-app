import { NextResponse } from "next/server";

import { getVapidPublicKey } from "@/lib/notifications/send-web-push";

export async function GET() {
  const publicKey = getVapidPublicKey();

  if (!publicKey) {
    return NextResponse.json(
      { error: "Push notifications belum dikonfigurasi." },
      { status: 503 },
    );
  }

  return NextResponse.json({ publicKey });
}
