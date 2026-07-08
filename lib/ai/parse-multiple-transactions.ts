import { isGeminiConfigured } from "@/lib/ai/gemini-client";
import {
  parseTransaction,
  parseTransactionLocally,
} from "@/lib/ai/parse-transaction";
import { parseTransactionWithGemini } from "@/lib/ai/parse-transaction-gemini";
import { TransactionParseError } from "@/lib/ai/transaction-parse-error";
import type { ParsedTransaction } from "@/types/transaction";

/** Split inbox chat into candidate transaction segments (comma / newline / "dan"). */
export function splitTransactionSegments(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(/[,;\n]+|\s+dan\s+/i)
    .map((segment) => segment.trim())
    .filter(Boolean);
}

async function tryParseLocally(
  segment: string,
  userId?: string,
): Promise<ParsedTransaction | null> {
  try {
    return await parseTransactionLocally(segment, userId);
  } catch {
    return null;
  }
}

/**
 * Parse one or more transactions from a single chat message.
 * Local-first; Gemini only for single-segment fallback (same as parseTransaction).
 */
export async function parseMultipleTransactions(
  text: string,
  userId?: string,
): Promise<ParsedTransaction[]> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: makan warteg 15K",
    );
  }

  const segments = splitTransactionSegments(trimmed);

  if (segments.length <= 1) {
    const single = await parseTransaction(trimmed, userId);
    return [single];
  }

  const parsed: ParsedTransaction[] = [];
  for (const segment of segments) {
    const local = await tryParseLocally(segment, userId);
    if (local) {
      parsed.push(local);
      continue;
    }

    if (isGeminiConfigured()) {
      try {
        parsed.push(await parseTransactionWithGemini(segment, userId));
      } catch {
        // Skip segment that still cannot be parsed.
      }
    }
  }

  if (parsed.length === 0) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: parkir 5rb, kopi 20rb",
    );
  }

  return parsed;
}

/** Local-only helper (tests / callers that do not need Gemini). */
export async function parseMultipleTransactionsLocally(
  text: string,
  userId?: string,
): Promise<ParsedTransaction[]> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: makan warteg 15K",
    );
  }

  const segments = splitTransactionSegments(trimmed);

  if (segments.length <= 1) {
    return [await parseTransactionLocally(trimmed, userId)];
  }

  const parsed: ParsedTransaction[] = [];
  for (const segment of segments) {
    const local = await tryParseLocally(segment, userId);
    if (local) {
      parsed.push(local);
    }
  }

  if (parsed.length === 0) {
    throw new TransactionParseError(
      "Nominal tidak ditemukan. Coba format seperti: parkir 5rb, kopi 20rb",
    );
  }

  return parsed;
}
