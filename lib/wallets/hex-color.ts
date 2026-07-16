function normalizeHex(hex: string): string | null {
  const trimmed = hex.trim();

  if (!trimmed.startsWith("#")) {
    return null;
  }

  const body = trimmed.slice(1);

  if (/^[0-9A-Fa-f]{3}$/.test(body)) {
    return `#${body[0]}${body[0]}${body[1]}${body[1]}${body[2]}${body[2]}`.toUpperCase();
  }

  if (/^[0-9A-Fa-f]{6}$/.test(body)) {
    return `#${body.toUpperCase()}`;
  }

  return null;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);

  if (!normalized) {
    return null;
  }

  const value = Number.parseInt(normalized.slice(1), 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toChannel = (channel: number) =>
    Math.round(Math.min(255, Math.max(0, channel)))
      .toString(16)
      .padStart(2, "0");

  return `#${toChannel(r)}${toChannel(g)}${toChannel(b)}`.toUpperCase();
}

function mixHex(base: string, target: string, weight: number): string {
  const baseRgb = hexToRgb(base);
  const targetRgb = hexToRgb(target);

  if (!baseRgb || !targetRgb) {
    return base;
  }

  const ratio = Math.min(1, Math.max(0, weight));

  return rgbToHex(
    baseRgb.r + (targetRgb.r - baseRgb.r) * ratio,
    baseRgb.g + (targetRgb.g - baseRgb.g) * ratio,
    baseRgb.b + (targetRgb.b - baseRgb.b) * ratio,
  );
}

export function lightenHex(hex: string, amount: number): string {
  return mixHex(hex, "#FFFFFF", amount);
}

export function darkenHex(hex: string, amount: number): string {
  return mixHex(hex, "#000000", amount);
}

export function buildBrandGradient(primary: string, secondary?: string): string {
  const normalizedPrimary = normalizeHex(primary);

  if (!normalizedPrimary) {
    return primary;
  }

  const normalizedSecondary = secondary ? normalizeHex(secondary) : null;
  const from = lightenHex(normalizedPrimary, 0.14);
  const via = normalizedPrimary;
  const to = normalizedSecondary
    ? darkenHex(normalizedSecondary, 0.08)
    : darkenHex(normalizedPrimary, 0.22);

  return `linear-gradient(to bottom right, ${from}, ${via}, ${to})`;
}
