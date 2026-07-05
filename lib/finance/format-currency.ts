export function formatIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Signed delta for day-over-day comparisons, e.g. +Rp285.000 or −Rp50.000. */
export function formatSignedIdrDelta(delta: number): string {
  if (delta === 0) {
    return "Rp0";
  }

  const sign = delta > 0 ? "+" : "−";
  return `${sign}${formatIdr(Math.abs(delta))}`;
}
