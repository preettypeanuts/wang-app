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

export function parseAmount(text: string): number | null {
  for (const { pattern, multiplier } of AMOUNT_PATTERNS) {
    const match = text.match(pattern);
    if (!match?.[1]) continue;

    const amount = normalizeNumber(match[1]) * multiplier;
    if (Number.isFinite(amount) && amount > 0) return Math.round(amount);
  }

  return null;
}
