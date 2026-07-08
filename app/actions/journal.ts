"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth/session";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import {
  createJournalTransaction,
  deleteJournalTransaction,
  updateJournalTransaction,
} from "@/lib/db/journal";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import { parseJournalEntryFormData } from "@/lib/validations/journal-entry";
import type { JournalEntry } from "@/types/journal";
import type { ParsedTransaction } from "@/types/transaction";

interface JournalActionSuccess {
  ok: true;
  entry: JournalEntry;
}

interface JournalActionFailure {
  ok: false;
  error: string;
}

export type JournalActionResult = JournalActionSuccess | JournalActionFailure;

function revalidateJournal(userId: string) {
  revalidateAfterTransactionMutation(userId);
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
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  const parsed = parseJournalEntryFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const entry = await updateJournalTransaction(userId, id, parsed.data);
  revalidateJournal(userId);

  return { ok: true, entry };
}

export async function createJournalEntryAction(
  formData: FormData,
): Promise<JournalActionResult> {
  const userId = await requireUserId();
  const parsed = parseJournalEntryFormData(formData);

  if (!parsed.ok) {
    return parsed;
  }

  const entry = await createJournalTransaction(userId, parsed.data);
  revalidateJournal(userId);

  return { ok: true, entry };
}

export async function deleteJournalEntryAction(
  id: string,
): Promise<
  | {
      ok: true;
      deleted: {
        inboxMessageId: string | null;
        transaction: ParsedTransaction;
      };
    }
  | JournalActionFailure
> {
  const userId = await requireUserId();
  const trimmed = id.trim();

  if (!trimmed) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  try {
    const deleted = await deleteJournalTransaction(userId, trimmed);
    revalidateJournal(userId);
    revalidatePath("/");
    return { ok: true, deleted };
  } catch {
    return { ok: false, error: "Gagal menghapus transaksi." };
  }
}
