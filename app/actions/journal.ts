"use server";

import { revalidatePath } from "next/cache";

import { buildWarmTransactionReply } from "@/lib/ai/build-inbox-transaction-reply";
import { requireUserId } from "@/lib/auth/session";
import {
  revalidateAfterTransactionMutation,
  revalidateUserInbox,
} from "@/lib/cache/revalidate-user-data";
import { updateInboxMessage } from "@/lib/db/inbox-messages";
import {
  createJournalTransaction,
  deleteJournalTransaction,
  updateJournalTransaction,
  updateTransactionCategoryQuick,
  updateTransactionWalletQuick,
} from "@/lib/db/journal";
import { prisma } from "@/lib/db/prisma";
import { scopedId } from "@/lib/db/user-scope";
import { getBudgetStatusForExpense } from "@/lib/finance/build-budget-reply";
import { resolveUserCategoryCatalog } from "@/lib/finance/resolve-user-categories";
import { saveUserCategoryOverride } from "@/lib/finance/user-category-override";
import { parseJournalEntryFormData } from "@/lib/validations/journal-entry";
import type { JournalEntry } from "@/types/journal";
import type { FlowTransactionType, ParsedTransaction } from "@/types/transaction";

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

  const catalog = await resolveUserCategoryCatalog(userId);
  const parsed = parseJournalEntryFormData(formData, catalog);

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
  const catalog = await resolveUserCategoryCatalog(userId);
  const parsed = parseJournalEntryFormData(formData, catalog);

  if (!parsed.ok) {
    return parsed;
  }

  const entry = await createJournalTransaction(userId, parsed.data);
  revalidateJournal(userId);

  return { ok: true, entry };
}

interface UpdateTransactionCategorySuccess {
  ok: true;
  transaction: ParsedTransaction;
  assistantContent: string;
}

interface UpdateTransactionCategoryFailure {
  ok: false;
  error: string;
}

export type UpdateTransactionCategoryResult =
  | UpdateTransactionCategorySuccess
  | UpdateTransactionCategoryFailure;

export async function updateTransactionCategoryAction(input: {
  transactionId: string;
  category: string;
  type?: FlowTransactionType;
  assistantMessageId?: string;
}): Promise<UpdateTransactionCategoryResult> {
  const userId = await requireUserId();
  const transactionId = input.transactionId.trim();

  if (!transactionId) {
    return { ok: false, error: "Transaksi tidak ditemukan." };
  }

  try {
    const transaction = await updateTransactionCategoryQuick(
      userId,
      transactionId,
      input.category,
      input.type,
    );

    try {
      await saveUserCategoryOverride(
        userId,
        transaction.description,
        transaction.type,
        input.category,
      );
    } catch {
      // Category update succeeded; override memory is best-effort.
    }

    let budgetStatus = null;
    if (transaction.type === "expense") {
      try {
        budgetStatus = await getBudgetStatusForExpense(
          userId,
          transaction.category,
          transaction.occurredAt,
          transaction.amount,
        );
      } catch {
        // Reply should still succeed without budget context.
      }
    }

    const assistantContent = buildWarmTransactionReply(transaction, budgetStatus);

    const assistantMessageId = input.assistantMessageId?.trim();
    if (assistantMessageId) {
      await updateInboxMessage(userId, assistantMessageId, {
        content: assistantContent,
      });
    }

    revalidateJournal(userId);
    revalidateUserInbox(userId);

    return {
      ok: true,
      transaction,
      assistantContent,
    };
  } catch {
    return { ok: false, error: "Gagal memperbarui kategori." };
  }
}

export async function updateTransactionWalletAction(input: {
  transactionId: string;
  walletId: string;
}): Promise<JournalActionResult> {
  const userId = await requireUserId();
  const transactionId = input.transactionId.trim();
  const walletId = input.walletId.trim();

  if (!transactionId || !walletId) {
    return { ok: false, error: "Wallet tidak ditemukan." };
  }

  try {
    const entry = await updateTransactionWalletQuick(
      userId,
      transactionId,
      walletId,
    );
    revalidateJournal(userId);
    revalidatePath("/overview/wallets");
    return { ok: true, entry };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memperbarui wallet transaksi.",
    };
  }
}

export async function deleteJournalEntryAction(
  id: string,
): Promise<
  | {
      ok: true;
      /** Null when a transfer pair was deleted — nothing to patch in inbox. */
      deleted: {
        inboxMessageId: string | null;
        transaction: ParsedTransaction;
      } | null;
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
    return {
      ok: true,
      deleted: deleted.transaction
        ? { inboxMessageId: deleted.inboxMessageId, transaction: deleted.transaction }
        : null,
    };
  } catch {
    return { ok: false, error: "Gagal menghapus transaksi." };
  }
}
