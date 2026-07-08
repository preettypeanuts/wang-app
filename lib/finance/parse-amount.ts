const AMOUNT_PATTERNS: Array<{ pattern: RegExp; multiplier: number }> = [
  { pattern: /setengah\s*(jt|juta|m)\b/i, multiplier: 500_000 },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(miliar|mil)\b/i, multiplier: 1_000_000_000 },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(jt|juta)\b/i, multiplier: 1_000_000 },
  { pattern: /(\d+(?:[.,]\d+)?)\s*m\b/i, multiplier: 1_000_000 },
  { pattern: /(\d+(?:[.,]\d+)?)\s*b\b/i, multiplier: 1_000_000_000 },
  { pattern: /(\d+(?:[.,]\d+)?)\s*(rb|ribu|k)\b/i, multiplier: 1_000 },
  { pattern: /(\d{1,3}(?:\.\d{3})+)/, multiplier: 1 },
  { pattern: /(\d+(?:[.,]\d+)?)/, multiplier: 1 },
];

function normalizeNumber(value: string): number {
  if (value.includes(".") && value.includes(",")) {
    return Number.parseFloat(value.replace(/\./g, "").replace(",", "."));
  }

  if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) {
    return Number.parseFloat(value.replace(/\./g, ""));
  }

  if (value.includes(",")) {
    return Number.parseFloat(value.replace(",", "."));
  }

  return Number.parseFloat(value);
}

const EXPLICIT_AMOUNT_UNIT_PATTERN =
  /setengah\s*(jt|juta|m)\b|(\d+(?:[.,]\d+)?)\s*(miliar|mil|jt|juta|m\b|b\b|rb|ribu|k)\b/i;

/** True when amount was parsed from a bare number without rb/jt/k-style units. */
export function isPlainAmountInput(text: string): boolean {
  if (EXPLICIT_AMOUNT_UNIT_PATTERN.test(text)) {
    return false;
  }

  if (/\d{1,3}(?:\.\d{3})+(?!\d)/.test(text)) {
    return false;
  }

  return /\d+(?:[.,]\d+)?/.test(text);
}

export function parseAmount(text: string): number | null {
  for (const { pattern, multiplier } of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const amount = normalizeNumber(match[1]) * multiplier;
    if (Number.isFinite(amount) && amount > 0) return Math.round(amount);
  }

  return null;
}
