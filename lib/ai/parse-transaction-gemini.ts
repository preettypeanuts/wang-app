import { Type } from "@google/genai";

import {
  buildGeminiCategoryInstruction,
  isTransactionCategory,
} from "@/config/categories";
import {
  buildGeminiInboxParseSystemInstruction,
} from "@/config/gemini-locale";
import { GEMINI_MAX_OUTPUT_TOKENS, GEMINI_MODEL } from "@/config/gemini";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import { TransactionParseError } from "@/lib/ai/transaction-parse-error";
import { resolveTransactionCategoryAsync } from "@/lib/finance/resolve-transaction-category";
import type { ParsedTransaction, TransactionType } from "@/types/transaction";

const VALID_TYPES: TransactionType[] = ["income", "expense"];

interface GeminiTransactionPayload {
  success?: boolean;
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
  message?: string;
}

const SYSTEM_INSTRUCTION = buildGeminiInboxParseSystemInstruction(
  buildGeminiCategoryInstruction(),
);

function buildUserPrompt(text: string): string {
  return [
    "Pesan user (Bahasa Indonesia):",
    text.trim(),
    "",
    "Ekstrak transaksi keuangan dari pesan di atas.",
  ].join("\n");
}

function parseGeminiPayload(raw: string): GeminiTransactionPayload {
  try {
    return JSON.parse(raw) as GeminiTransactionPayload;
  } catch {
    throw new TransactionParseError(
      "Respons AI tidak valid. Coba ulangi pesanmu.",
    );
  }
}

async function toParsedTransaction(
  payload: GeminiTransactionPayload,
  fallbackDescription: string,
): Promise<ParsedTransaction> {
  const type = payload.type;
  const amount = payload.amount;
  const description = payload.description?.trim() || fallbackDescription;

  if (!type || !VALID_TYPES.includes(type)) {
    throw new TransactionParseError("Tipe transaksi tidak dikenali.");
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isInteger(amount)
  ) {
    throw new TransactionParseError(
      "Nominal tidak valid. Contoh: makan warteg 15K",
    );
  }

  const category = await resolveTransactionCategoryAsync(
    payload.category,
    type,
    description,
  );

  if (!isTransactionCategory(category)) {
    throw new TransactionParseError("Kategori transaksi tidak dikenali.");
  }

  return {
    type,
    amount,
    category,
    description,
    occurredAt: new Date().toISOString(),
  };
}

export async function parseTransactionWithGemini(
  text: string,
): Promise<ParsedTransaction> {
  const description = text.trim();
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildUserPrompt(description),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: { type: Type.BOOLEAN },
          type: { type: Type.STRING, enum: VALID_TYPES },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          message: { type: Type.STRING },
        },
        required: ["success", "message"],
      },
    },
  });

  const raw = response.text?.trim();

  if (!raw) {
    throw new TransactionParseError("AI tidak memberi respons. Coba lagi.");
  }

  const payload = parseGeminiPayload(raw);

  if (!payload.success) {
    throw new TransactionParseError(
      payload.message?.trim() ||
        "Transaksi tidak dikenali. Contoh: makan warteg 15K",
    );
  }

  return toParsedTransaction(payload, description);
}
