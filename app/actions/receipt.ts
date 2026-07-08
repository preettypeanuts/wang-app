"use server";

import { revalidatePath } from "next/cache";
import type { SubmitInboxMessageResult } from "@/app/actions/inbox";
import { buildInboxTransactionReplyForParsed } from "@/lib/ai/build-inbox-transaction-reply";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { parseReceiptWithGemini } from "@/lib/ai/parse-receipt-gemini";
import { requireUserId } from "@/lib/auth/session";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import { formatInboxProcessingError } from "@/lib/chat/inbox-error";
import {
  submitInboxChatFailure,
  submitInboxChatTransaction,
} from "@/lib/db/inbox-submit";
import { isReceiptMimeType } from "@/lib/receipt/image-file";
import {
  buildReceiptUserMessageContent,
  parseConfirmedReceiptTransaction,
} from "@/lib/validations/receipt-transaction";
import type { ParseReceiptResult } from "@/types/receipt";

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
