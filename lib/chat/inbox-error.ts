import { isTransactionParseError } from "@/lib/ai/transaction-parse-error";
import type { ChatMessage } from "@/types/chat";

const GENERIC_INBOX_ERROR = "Gagal memproses pesan. Coba lagi.";

export function formatInboxProcessingError(error: unknown): string {
  if (isTransactionParseError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes("API key")) {
      return "Gemini belum dikonfigurasi. Tambahkan GEMINI_API_KEY di .env.local.";
    }

    if (error.message.includes("DATABASE_URL")) {
      return "Database belum dikonfigurasi. Cek DATABASE_URL di .env.";
    }

    if (error.message.length > 0 && error.message.length <= 160) {
      return error.message;
    }
  }

  return GENERIC_INBOX_ERROR;
}

export function isRetryableInboxFailure(content: string): boolean {
  if (content.includes("tercatat ·")) {
    return false;
  }

  if (content.includes("ditandai sudah dibayar")) {
    return false;
  }

  if (content.startsWith("Ringkasan harian")) {
    return false;
  }

  return true;
}

export function getInboxRetryContext(
  messages: ChatMessage[],
  index: number,
): { userContent: string; assistantMessageId: string } | null {
  const message = messages[index];

  if (message.role !== "assistant" || message.transaction) {
    return null;
  }

  const previous = messages[index - 1];

  if (!previous || previous.role !== "user") {
    return null;
  }

  if (previous.content.startsWith("Bayar ")) {
    return null;
  }

  if (!isRetryableInboxFailure(message.content)) {
    return null;
  }

  return {
    userContent: previous.content,
    assistantMessageId: message.id,
  };
}
