/**
 * Explicit wallet mention detection for chat input, e.g.
 * "bayar pakai gopay 20rb" → wallet named "GoPay".
 *
 * Two tiers, mirroring how category keywords are matched:
 * 1. Full wallet name found in text (word-boundary, case-insensitive).
 * 2. A single word of a multi-word wallet name found in text
 *    ("pakai bca" → "BCA Utama"), tokens shorter than 3 chars ignored.
 *
 * A lower tier is only consulted when the higher tier has no match. Multiple
 * wallets tying within the winning tier means the mention is ambiguous.
 */

interface WalletNameEntry {
  id: string;
  name: string;
}

const MIN_TOKEN_LENGTH = 3;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsAsWord(text: string, phrase: string): boolean {
  if (!phrase) {
    return false;
  }

  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(phrase)}(?![\\p{L}\\p{N}])`,
    "iu",
  );

  return pattern.test(text);
}

function scoreWalletMatch(text: string, name: string): number {
  const normalizedName = name.trim().toLowerCase();

  if (!normalizedName) {
    return 0;
  }

  if (containsAsWord(text, normalizedName)) {
    // Full-name tier — always outranks any token match.
    return 1_000 + normalizedName.length;
  }

  const tokens = normalizedName
    .split(/\s+/)
    .filter((token) => token.length >= MIN_TOKEN_LENGTH);

  let best = 0;
  for (const token of tokens) {
    if (containsAsWord(text, token) && token.length > best) {
      best = token.length;
    }
  }

  return best;
}

/** All wallets tied for the best match — length > 1 means ambiguous mention. */
export function detectWalletCandidates<T extends WalletNameEntry>(
  text: string,
  wallets: T[],
): T[] {
  const normalizedText = text.toLowerCase();
  let bestScore = 0;
  let candidates: T[] = [];

  for (const wallet of wallets) {
    const score = scoreWalletMatch(normalizedText, wallet.name);

    if (score === 0 || score < bestScore) {
      continue;
    }

    if (score > bestScore) {
      bestScore = score;
      candidates = [wallet];
      continue;
    }

    candidates.push(wallet);
  }

  return candidates;
}

/**
 * Wallet explicitly mentioned in the text, or null when nothing matches or
 * the mention is ambiguous — caller falls back to the user's default wallet.
 */
export function detectWalletFromText<T extends WalletNameEntry>(
  text: string,
  wallets: T[],
): T | null {
  const candidates = detectWalletCandidates(text, wallets);
  return candidates.length === 1 ? candidates[0] : null;
}
