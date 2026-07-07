"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import {
  deleteJournalTransaction,
  updateJournalTransaction,
} from "@/lib/db/journal";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import { parseJournalEntryFormData } from "@/lib/validations/journal-entry";
import type { JournalEntry } from "@/types/journal";

interface JournalActionSuccess {
  ok: true;
  entry: JournalEntry;
}

interface JournalActionFailure {
  ok: false;
  error: string;
}

export type JournalActionResult = JournalActionSuccess | JournalActionFailure;

function revalidateJournal() {
  revalidatePath("/journal");
  revalidatePath("/overview");
  revalidatePath("/");
}

export async function saveJournalEntryAction(
  formData: FormData,
): Promise<JournalActionResult> {
  const userId = await requireUserId();
  const idValue = formData.get("id");
  const id = typeof idValue === "string" ? idValue.trim() : "";

  if (!id) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  const existing = await prisma.transaction.findFirst({
    where: scopedId(userId, id),
    select: { occurredAt: true },
  });

  if (!existing) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  const parsed = parseJournalEntryFormData(formData, existing.occurredAt);

  if (!parsed.ok) {
    return parsed;
  }

  const entry = await updateJournalTransaction(userId, id, parsed.data);
  revalidateJournal();

  return { ok: true, entry };
}

export async function deleteJournalEntryAction(
  id: string,
): Promise<{ ok: true } | JournalActionFailure> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  try {
    await deleteJournalTransaction(userId, trimmed);
    revalidateJournal();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus transaksi." };
  }
}
