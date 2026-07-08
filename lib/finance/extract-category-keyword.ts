const STOPWORDS = new Set([
  "beli",
  "bayar",
  "buat",
  "lagi",
  "di",
  "ke",
  "untuk",
  "dari",
  "dengan",
  "sama",
  "dan",
  "atau",
  "ada",
  "sudah",
  "mau",
  "gak",
  "ga",
  "ya",
  "deh",
  "aku",
  "gue",
  "gw",
  "saya",
  "kamu",
  "kita",
  "nih",
  "tuh",
  "dong",
  "lah",
  "punya",
  "sebagai",
  "via",
  "pakai",
  "pake",
  "oleh",
  "kepada",
  "siang",
  "pagi",
  "malam",
  "hari",
  "kemarin",
  "lalu",
]);

const AMOUNT_PATTERN =
  /\d+(?:[.,]\d+)?(?:\s*(?:rb|ribu|k|jt|juta|m|b|miliar|mil)\b)?|\b(?:rb|ribu|k|jt|juta)\b/gi;

/** Extract a short keyword from a transaction description for category memory. */
export function extractCategoryKeyword(description: string): string {
  const normalized = description
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(AMOUNT_PATTERN, " ");

  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !STOPWORDS.has(token))
    .filter((token) => !/^\d+$/.test(token));

  if (tokens.length === 0) {
    return "";
  }

  return tokens[tokens.length - 1] ?? "";
}
