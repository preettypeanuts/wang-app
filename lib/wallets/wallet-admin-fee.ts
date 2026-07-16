import {
  clampDateOnlyDay,
  getDateOnlyParts,
  parseDayKey,
  startOfDay,
  toDayKey,
} from "@/lib/finance/day-range";

function addMonthsDateOnly(
  value: Date,
  months: number,
  anchorDay: number,
): Date {
  const { year, month } = getDateOnlyParts(value);
  const targetMonth = month + months;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  return clampDateOnlyDay(targetYear, normalizedMonth, anchorDay);
}

/** First billing date on or after referenceDate for a monthly admin fee. */
export function buildWalletAdminFeeStartAt(
  billingDay: number,
  referenceDate: Date = new Date(),
): Date {
  const { year, month } = getDateOnlyParts(referenceDate);
  const thisMonthDue = clampDateOnlyDay(year, month, billingDay);

  if (thisMonthDue.getTime() >= startOfDay(referenceDate).getTime()) {
    return thisMonthDue;
  }

  return addMonthsDateOnly(thisMonthDue, 1, billingDay);
}

export const WALLET_ADMIN_FEE_DAY_MIN = 1;
export const WALLET_ADMIN_FEE_DAY_MAX = 28;

export function isValidWalletAdminFeeDay(day: number): boolean {
  return (
    Number.isInteger(day) &&
    day >= WALLET_ADMIN_FEE_DAY_MIN &&
    day <= WALLET_ADMIN_FEE_DAY_MAX
  );
}

export function buildWalletAdminFeePlanName(walletName: string): string {
  return `Biaya admin ${walletName.trim()}`;
}

export function buildWalletAdminFeePlanNote(walletId: string): string {
  return `[wallet-admin-fee:${walletId}]`;
}

export function clampWalletAdminFeeDay(day: number): number {
  return Math.min(
    WALLET_ADMIN_FEE_DAY_MAX,
    Math.max(WALLET_ADMIN_FEE_DAY_MIN, day),
  );
}

/** Calendar value for billing-day picker (uses current month as anchor). */
export function billingDayToDateInput(
  day: number,
  referenceDate: Date = new Date(),
): string {
  const { year, month } = getDateOnlyParts(referenceDate);
  const clampedDay = clampWalletAdminFeeDay(day);
  return toDayKey(clampDateOnlyDay(year, month, clampedDay));
}

export function dateInputToBillingDay(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return WALLET_ADMIN_FEE_DAY_MIN;
  }

  const parsed = parseDayKey(value);
  if (Number.isNaN(parsed.getTime())) {
    return WALLET_ADMIN_FEE_DAY_MIN;
  }

  return clampWalletAdminFeeDay(getDateOnlyParts(parsed).day);
}

export function isBillingDayDisabled(date: Date): boolean {
  const day = getDateOnlyParts(date).day;
  return day < WALLET_ADMIN_FEE_DAY_MIN || day > WALLET_ADMIN_FEE_DAY_MAX;
}
