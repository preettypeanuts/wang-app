import { Type } from "@google/genai";

import {
  buildGeminiCategoryInstruction,
  isTransactionCategory,
  normalizeCategory,
  resolveCategoryForType,
} from "@/config/categories";
import {
  GEMINI_MODEL,
  GEMINI_RECEIPT_FALLBACK_MODEL,
  GEMINI_RECEIPT_MAX_OUTPUT_TOKENS,
} from "@/config/gemini";
import { GEMINI_WANG_APP_CONTEXT } from "@/config/gemini-locale";
import type { ReceiptMimeType } from "@/config/receipt";
import { getGeminiClient } from "@/lib/ai/gemini-client";
import {
  formatGeminiApiError,
  isGeminiQuotaErrorMessage,
} from "@/lib/ai/format-gemini-api-error";
import { TransactionParseError } from "@/lib/ai/transaction-parse-error";
import { resolveTransactionCategoryAsync } from "@/lib/finance/resolve-transaction-category";
import type { ReceiptDraft } from "@/types/receipt";
import type { TransactionType } from "@/types/transaction";

const VALID_TYPES: TransactionType[] = ["income", "expense"];

interface GeminiReceiptPayload {
  success?: boolean;
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string;
  merchant?: string;
  occurredAt?: string;
  message?: string;
}

const RECEIPT_SYSTEM_INSTRUCTION = [
  "Kamu OCR + analis struk keuangan untuk app Wang (Indonesia).",
  "",
  GEMINI_WANG_APP_CONTEXT,
  "",
  buildGeminiCategoryInstruction(),
  "",
  "Tugas: baca foto struk/nota/bukti bayar dan ekstrak transaksi keuangan.",
  "",
  "Aturan nominal:",
  "- Ambil TOTAL akhir yang dibayar (GRAND TOTAL, TOTAL, TOTAL BAYAR, JUMLAH, AMOUNT DUE).",
  "- Jangan pakai subtotal, PPN terpisah, atau kembalian — kecuali itu satu-satunya angka jelas.",
  "- Semua amount integer Rupiah tanpa desimal.",
  "- Abaikan titik pemisah ribuan saat membaca angka.",
  "",
  "Aturan merchant & deskripsi:",
  "- merchant: nama toko/resto/platform (Indomaret, Alfamart, Starbucks, Grab, dll.).",
  "- description: ringkas Bahasa Indonesia, contoh: Belanja Indomaret, Makan siang Warung Padang.",
  "",
  "Aturan tanggal:",
  "- occurredAt: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) jika tanggal/waktu terbaca di struk.",
  "- Jika hanya tanggal tanpa jam, pakai 12:00 WIB hari itu.",
  "- Jika tanggal tidak terbaca, kosongkan string occurredAt.",
  "",
  "Aturan jenis:",
  "- expense untuk belanja, makan, transport, tagihan, dll.",
  "- income hanya jika struk jelas pemasukan (refund besar, slip gaji, bukti terima uang).",
  "",
  "Jika struk buram/tidak terbaca → success=false dengan message Bahasa Indonesia yang helpful.",
].join("\n");

function parseGeminiPayload(raw: string): GeminiReceiptPayload {
  try {
    return JSON.parse(raw) as GeminiReceiptPayload;
  } catch {
    throw new TransactionParseError(
      "Respons AI struk tidak valid. Coba foto ulang dengan pencahayaan lebih baik.",
    );
  }
}

function parseReceiptOccurredAt(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return new Date().toISOString();
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  const now = new Date();
  const yearDelta = now.getFullYear() - parsed.getFullYear();

  if (yearDelta > 1 || yearDelta < -1) {
    parsed.setFullYear(now.getFullYear());
  }

  if (parsed.getTime() > now.getTime() + 86_400_000) {
    parsed.setFullYear(now.getFullYear());
  }

  return parsed.toISOString();
}

function buildReceiptRawInput(
  merchant: string,
  description: string,
  amount: number,
): string {
  const merchantLabel = merchant.trim() || "Struk";
  const descriptionLabel = description.trim() || merchantLabel;
  return `[Struk] ${merchantLabel} — ${descriptionLabel} (${amount})`;
}

async function toReceiptDraft(
  payload: GeminiReceiptPayload,
  userId?: string,
): Promise<ReceiptDraft> {
  const type = payload.type;
  const amount = payload.amount;
  const merchant = payload.merchant?.trim() ?? "";
  const description =
    payload.description?.trim() || merchant || "Transaksi dari struk";

  if (!type || !VALID_TYPES.includes(type)) {
    throw new TransactionParseError(
      "Jenis transaksi pada struk tidak dikenali.",
    );
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isInteger(amount)
  ) {
    throw new TransactionParseError(
      "Total struk tidak terbaca. Pastikan angka TOTAL terlihat jelas.",
    );
  }

  const category = await resolveTransactionCategoryAsync(
    payload.category,
    type,
    `${merchant} ${description}`,
    userId,
  );

  if (!isTransactionCategory(category)) {
    throw new TransactionParseError("Kategori struk tidak dikenali.");
  }

  const resolvedCategory = resolveCategoryForType(
    normalizeCategory(category),
    type,
  );

  const occurredAt = parseReceiptOccurredAt(payload.occurredAt);

  return {
    type,
    amount,
    category: resolvedCategory,
    description,
    merchant,
    occurredAt,
    rawInput: buildReceiptRawInput(merchant, description, amount),
  };
}

function isGeminiQuotaError(error: unknown): boolean {
  const formatted = formatGeminiApiError(error);
  return formatted ? isGeminiQuotaErrorMessage(formatted) : false;
}

async function requestReceiptExtraction(
  base64: string,
  mimeType: ReceiptMimeType,
  model: string,
): Promise<string> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      {
        text: [
          "Baca struk/nota/bukti bayar pada gambar.",
          "Ekstrak transaksi keuangan utama dari struk ini.",
          "Prioritaskan akurasi nominal total dan nama merchant.",
        ].join("\n"),
      },
    ],
    config: {
      systemInstruction: RECEIPT_SYSTEM_INSTRUCTION,
      maxOutputTokens: GEMINI_RECEIPT_MAX_OUTPUT_TOKENS,
      temperature: 0,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: { type: Type.BOOLEAN },
          type: { type: Type.STRING, enum: VALID_TYPES },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          merchant: { type: Type.STRING },
          occurredAt: { type: Type.STRING },
          message: { type: Type.STRING },
        },
        required: ["success", "message"],
      },
    },
  });

  const raw = response.text?.trim();

  if (!raw) {
    throw new TransactionParseError(
      "AI tidak bisa membaca struk. Coba foto ulang.",
    );
  }

  return raw;
}

export async function parseReceiptWithGemini(
  base64: string,
  mimeType: ReceiptMimeType,
  userId?: string,
): Promise<ReceiptDraft> {
  let raw: string;

  try {
    raw = await requestReceiptExtraction(base64, mimeType, GEMINI_MODEL);
  } catch (error) {
    if (!isGeminiQuotaError(error)) {
      throw error;
    }

    raw = await requestReceiptExtraction(
      base64,
      mimeType,
      GEMINI_RECEIPT_FALLBACK_MODEL,
    );
  }

  const payload = parseGeminiPayload(raw);

  if (!payload.success) {
    throw new TransactionParseError(
      payload.message?.trim() ||
        "Struk tidak terbaca. Pastikan foto fokus dan tidak blur.",
    );
  }

  return toReceiptDraft(payload, userId);
}
