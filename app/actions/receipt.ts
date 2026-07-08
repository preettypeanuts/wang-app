"use server";

import { revalidatePath } from "next/cache";
import type { SubmitInboxMessageResult } from "@/app/actions/inbox";
import { buildInboxTransactionReplyForParsed } from "@/lib/ai/build-inbox-transaction-reply";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { parseReceiptWithGemini } from "@/lib/ai/parse-receipt-gemini";
import { requireUserId } from "@/lib/auth/session";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import { formatInboxProcessingError } from "@/lib/chat/inbox-error";
import { updateInboxMessage } from "@/lib/db/inbox-messages";
import {
  submitInboxChatFailure,
  submitInboxChatTransaction,
} from "@/lib/db/inbox-submit";
import { updateJournalTransaction } from "@/lib/db/journal";
import { isReceiptMimeType } from "@/lib/receipt/image-file";
import {
  buildReceiptUserMessageContent,
  parseConfirmedReceiptTransaction,
} from "@/lib/validations/receipt-transaction";
import { normalizeCategory } from "@/config/categories";
import type { ParseReceiptResult } from "@/types/receipt";
import type { ParsedTransaction } from "@/types/transaction";

export async function parseReceiptFromImageAction(
  base64: string,
  mimeType: string,
): Promise<ParseReceiptResult> {
  if (!isGeminiConfigured()) {
    return {
      ok: false,
      error:
        "Fitur baca struk butuh Gemini API. Tambahkan GEMINI_API_KEY di .env.local.",
    };
  }

  if (!base64.trim()) {
    return { ok: false, error: "Gambar struk kosong." };
  }

  if (!isReceiptMimeType(mimeType)) {
    return { ok: false, error: "Format struk harus JPG, PNG, atau WebP." };
  }

  try {
    const userId = await requireUserId();
    const draft = await parseReceiptWithGemini(base64, mimeType, userId);
    return { ok: true, draft };
  } catch (error) {
    return {
      ok: false,
      error: formatInboxProcessingError(error),
    };
  }
}

export async function submitInboxMessageFromReceipt(input: {
  type: string;
  amount: string;
  category: string;
  description: string;
  merchant: string;
  occurredAt: string;
}): Promise<SubmitInboxMessageResult> {
  const userId = await requireUserId();
  const parsed = parseConfirmedReceiptTransaction(input);

  if (!parsed.ok) {
    throw new Error(parsed.error);
  }

  const { data } = parsed;
  const userContent = buildReceiptUserMessageContent(
    data.merchant,
    data.description,
  );

  try {
    const transaction = {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      occurredAt: data.occurredAt,
    };

    const content = await buildInboxTransactionReplyForParsed(
      userId,
      data.rawInput,
      transaction,
    );

    const { userMessage, assistantMessage, transactions } =
      await submitInboxChatTransaction({
        userId,
        rawInput: data.rawInput,
        userContent,
        transaction,
        assistantContent: content,
      });

    revalidateAfterTransactionMutation(userId);
    revalidatePath("/");
    revalidatePath("/journal");
    revalidatePath("/payplan");

    return {
      ok: true,
      content,
      transaction: transactions[0],
      transactions,
      userMessage,
      assistantMessage,
    };
  } catch (error) {
    const content = formatInboxProcessingError(error);

    const { userMessage, assistantMessage } = await submitInboxChatFailure({
      userId,
      rawInput: data.rawInput,
      assistantContent: content,
    });

    return {
      ok: false,
      content,
      userMessage: {
        ...userMessage,
        content: userContent,
      },
      assistantMessage,
    };
  }
}

interface UpdateInboxMessageFromReceiptSuccess {
  ok: true;
  transaction: ParsedTransaction;
  userMessage: SubmitInboxMessageResult["userMessage"];
  assistantMessage: SubmitInboxMessageResult["assistantMessage"];
}

interface UpdateInboxMessageFromReceiptFailure {
  ok: false;
  error: string;
}

export type UpdateInboxMessageFromReceiptResult =
  | UpdateInboxMessageFromReceiptSuccess
  | UpdateInboxMessageFromReceiptFailure;

export async function updateInboxMessageFromReceipt(input: {
  userMessageId: string;
  assistantMessageId: string;
  transactionId: string;
  type: string;
  amount: string;
  category: string;
  description: string;
  merchant: string;
  occurredAt: string;
}): Promise<UpdateInboxMessageFromReceiptResult> {
  const userId = await requireUserId();
  const parsed = parseConfirmedReceiptTransaction(input);

  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const { data } = parsed;
  const userContent = buildReceiptUserMessageContent(
    data.merchant,
    data.description,
  );

  try {
    const entry = await updateJournalTransaction(userId, input.transactionId, {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      rawInput: data.rawInput,
      occurredAt: new Date(data.occurredAt),
    });

    const transaction: ParsedTransaction = {
      id: entry.id,
      type: entry.type,
      amount: entry.amount,
      category: normalizeCategory(entry.category),
      description: entry.description,
      occurredAt: entry.occurredAt.toISOString(),
    };

    const assistantContent = await buildInboxTransactionReplyForParsed(
      userId,
      data.rawInput,
      transaction,
    );

    const userMessage = await updateInboxMessage(userId, input.userMessageId, {
      content: userContent,
    });
    const assistantMessage = await updateInboxMessage(
      userId,
      input.assistantMessageId,
      { content: assistantContent },
    );

    revalidateAfterTransactionMutation(userId);
    revalidatePath("/");
    revalidatePath("/journal");
    revalidatePath("/payplan");

    return {
      ok: true,
      transaction,
      userMessage: {
        ...userMessage,
        content: userContent,
      },
      assistantMessage: {
        ...assistantMessage,
        content: assistantContent,
        transaction,
        transactions: [transaction],
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Gagal memperbarui struk.",
    };
  }
}
