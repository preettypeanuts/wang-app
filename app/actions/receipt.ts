"use server";

import { revalidatePath } from "next/cache";
import type { SubmitInboxMessageResult } from "@/app/actions/inbox";
import { buildInboxTransactionReplyForParsed } from "@/lib/ai/build-inbox-transaction-reply";
import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import { parseReceiptWithGemini } from "@/lib/ai/parse-receipt-gemini";
import { requireUserId } from "@/lib/auth/session";
import { revalidateAfterTransactionMutation } from "@/lib/cache/revalidate-user-data";
import { formatInboxProcessingError } from "@/lib/chat/inbox-error";
import { createInboxMessage } from "@/lib/db/inbox-messages";
import { createTransaction } from "@/lib/db/transactions";
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
    const draft = await parseReceiptWithGemini(base64, mimeType);
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

  const userMessage = await createInboxMessage({
    userId,
    role: "user",
    content: userContent,
  });

  try {
    const transaction = {
      type: data.type,
      amount: data.amount,
      category: data.category,
      description: data.description,
      occurredAt: data.occurredAt,
    };

    const savedTransaction = await createTransaction({
      userId,
      rawInput: data.rawInput,
      transaction,
    });

    const content = await buildInboxTransactionReplyForParsed(
      userId,
      data.rawInput,
      transaction,
    );

    const assistantMessage = await createInboxMessage({
      userId,
      role: "assistant",
      content,
      transactionId: savedTransaction.id,
    });

    revalidateAfterTransactionMutation(userId);
    revalidatePath("/");
    revalidatePath("/journal");
    revalidatePath("/payplan");

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
      userId,
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
