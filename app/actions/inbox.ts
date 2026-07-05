"use server";

import { revalidatePath } from "next/cache";

import {
  buildTransactionReply,
  parseTransaction,
} from "@/lib/ai/parse-transaction";
import {
  createInboxMessage,
  updateInboxMessage,
} from "@/lib/db/inbox-messages";
import { listPlannedItems, markInstallmentPaid } from "@/lib/db/planned-items";
import { prisma } from "@/lib/db/prisma";
import { createTransaction } from "@/lib/db/transactions";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatInboxProcessingError } from "@/lib/chat/inbox-error";
import {
  canMarkPlannedItemPaid,
  getPlannedItemPaymentIndex,
} from "@/lib/planner/item-payment";
import type { ChatMessage } from "@/types/chat";
import type { ParsedTransaction } from "@/types/transaction";

interface SubmitInboxMessageSuccess {
  ok: true;
  content: string;
  transaction: ParsedTransaction;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface SubmitInboxMessageFailure {
  ok: false;
  content: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type SubmitInboxMessageResult =
  | SubmitInboxMessageSuccess
  | SubmitInboxMessageFailure;

export async function submitInboxMessage(
  text: string,
): Promise<SubmitInboxMessageResult> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("Pesan tidak boleh kosong.");
  }

  const userMessage = await createInboxMessage({
    role: "user",
    content: trimmed,
  });

  try {
    const transaction = await parseTransaction(trimmed);

    const savedTransaction = await createTransaction({
      rawInput: trimmed,
      transaction,
    });

    const content = buildTransactionReply(transaction);

    const assistantMessage = await createInboxMessage({
      role: "assistant",
      content,
      transactionId: savedTransaction.id,
    });

    revalidatePath("/");
    revalidatePath("/journal");

    return {
      ok: true,
      content,
      transaction,
      userMessage,
      assistantMessage,
    };
  } catch (error) {
    const content = formatInboxProcessingError(error);

    const assistantMessage = await createInboxMessage({
      role: "assistant",
      content,
    });

    return {
      ok: false,
      content,
      userMessage,
      assistantMessage,
    };
  }
}

export async function retryInboxMessageAction(
  assistantMessageId: string,
): Promise<SubmitInboxMessageResult> {
  const assistantRecord = await prisma.inboxMessage.findUnique({
    where: { id: assistantMessageId },
    select: {
      id: true,
      role: true,
      createdAt: true,
    },
  });

  if (!assistantRecord || assistantRecord.role !== "assistant") {
    throw new Error("Pesan error tidak ditemukan.");
  }

  const userRecord = await prisma.inboxMessage.findFirst({
    where: {
      role: "user",
      kind: "chat",
      createdAt: {
        lt: assistantRecord.createdAt,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!userRecord) {
    throw new Error("Pesan user tidak ditemukan.");
  }

  const trimmed = userRecord.content.trim();
  const userMessage: ChatMessage = {
    id: userRecord.id,
    role: "user",
    content: userRecord.content,
    createdAt: userRecord.createdAt.toISOString(),
  };

  try {
    const transaction = await parseTransaction(trimmed);

    const savedTransaction = await createTransaction({
      rawInput: trimmed,
      transaction,
    });

    const content = buildTransactionReply(transaction);

    const assistantMessage = await updateInboxMessage(assistantMessageId, {
      content,
      transactionId: savedTransaction.id,
    });

    revalidatePath("/");
    revalidatePath("/journal");

    return {
      ok: true,
      content,
      transaction,
      userMessage,
      assistantMessage,
    };
  } catch (error) {
    const content = formatInboxProcessingError(error);

    const assistantMessage = await updateInboxMessage(assistantMessageId, {
      content,
      transactionId: null,
    });

    return {
      ok: false,
      content,
      userMessage,
      assistantMessage,
    };
  }
}

interface PayPayPlanFromInboxSuccess {
  ok: true;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

interface PayPayPlanFromInboxFailure {
  ok: false;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export type PayPayPlanFromInboxResult =
  | PayPayPlanFromInboxSuccess
  | PayPayPlanFromInboxFailure;

export async function payPayPlanFromInboxAction(
  plannedItemId: string,
  installmentIndex?: number,
): Promise<PayPayPlanFromInboxResult> {
  const trimmedId = plannedItemId.trim();
  const items = await listPlannedItems();
  const item = items.find((entry) => entry.id === trimmedId);

  if (!item) {
    throw new Error("PayPlan tidak ditemukan.");
  }

  const userContent = `Bayar ${item.name}`;
  const userMessage = await createInboxMessage({
    role: "user",
    content: userContent,
  });

  if (!canMarkPlannedItemPaid(item)) {
    const assistantMessage = await createInboxMessage({
      role: "assistant",
      content: `${item.name} sudah dibayar atau tidak bisa ditandai dari chat.`,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }

  const paymentIndex =
    installmentIndex ?? getPlannedItemPaymentIndex(item);

  try {
    await markInstallmentPaid(trimmedId, paymentIndex);

    const assistantMessage = await createInboxMessage({
      role: "assistant",
      content: `${item.name} (${formatIdr(item.amount)}) ditandai sudah dibayar.`,
    });

    revalidatePath("/");
    revalidatePath("/payplan");

    return {
      ok: true,
      userMessage,
      assistantMessage,
    };
  } catch {
    const assistantMessage = await createInboxMessage({
      role: "assistant",
      content: `Gagal menandai ${item.name} sudah dibayar. Coba lagi.`,
    });

    return {
      ok: false,
      userMessage,
      assistantMessage,
    };
  }
}
