import { headers } from "next/headers";

import { auth } from "@/lib/auth/auth";

export async function getApiUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

export async function requireApiUserId(): Promise<string> {
  const userId = await getApiUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}
