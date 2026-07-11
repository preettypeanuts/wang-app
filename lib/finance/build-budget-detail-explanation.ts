import { formatIdr } from "@/lib/finance/format-currency";
import type { BudgetStatus } from "@/types/budget";

function formatDayCount(count: number): string {
  return count === 1 ? "1 hari" : `${count} hari`;
}

export function buildBudgetDetailExplanation(status: BudgetStatus): string {
  const { pace } = status;
  const spentLabel = formatIdr(status.spent);
  const remainingLabel = formatIdr(Math.max(0, status.remaining));
  const limitLabel = formatIdr(status.totalLimit);
  const overLabel = formatIdr(Math.abs(status.remaining));

  if (status.remaining < 0) {
    return `Budget kategori ini sudah melebihi limit bulanan sebesar ${overLabel}. Total terpakai ${spentLabel} dari limit ${limitLabel}. Pertimbangkan menaikkan limit atau mengurangi pengeluaran sampai bulan depan.`;
  }

  if (pace.isFutureMonth) {
    const plannedLabel = formatIdr(pace.plannedDailyBudget ?? 0);
    return `Budget untuk bulan ini belum dimulai. Target harian sekitar ${plannedLabel}/hari dengan total limit ${limitLabel} untuk ${formatDayCount(status.dayCount)}.`;
  }

  if (pace.isPastMonth) {
    if (status.remainingPercent <= 20) {
      return `Bulan ini sudah selesai. Terpakai ${spentLabel} dari limit ${limitLabel}, sisa ${remainingLabel} (${status.remainingPercent}% dari limit). Pengeluaran cukup ketat di akhir periode.`;
    }

    return `Bulan ini sudah selesai. Terpakai ${spentLabel} dari limit ${limitLabel}, sisa ${remainingLabel} (${status.remainingPercent}% dari limit).`;
  }

  if (pace.elapsedDays <= 0 || pace.plannedDailyBudget === null) {
    return `Belum ada pengeluaran tercatat bulan ini. Limit ${limitLabel}${pace.plannedDailyBudget !== null ? ` dengan target ${formatIdr(pace.plannedDailyBudget)}/hari` : ""}.`;
  }

  const avgLabel = formatIdr(pace.avgDailySpent ?? 0);
  const plannedLabel = formatIdr(pace.plannedDailyBudget);
  const elapsedLabel = formatDayCount(pace.elapsedDays);

  if (status.remainingPercent <= 20 && pace.remainingDays > 0) {
    const adjustedPart =
      pace.adjustedDailyBudget !== null
        ? ` Untuk ${formatDayCount(pace.remainingDays)} tersisa, batas aman sekitar ${formatIdr(pace.adjustedDailyBudget)}/hari.`
        : "";

    return `Budget hampir habis — sisa ${remainingLabel} (${status.remainingPercent}% dari limit). Sudah terpakai ${spentLabel} dengan rata-rata ${avgLabel}/hari selama ${elapsedLabel}.${adjustedPart}`;
  }

  if (
    pace.paceStatus === "fast" &&
    pace.adjustedDailyBudget !== null &&
    pace.dailyDelta !== null &&
    pace.dailyDelta < 0
  ) {
    const adjustedLabel = formatIdr(pace.adjustedDailyBudget);
    const deltaLabel = formatIdr(Math.abs(pace.dailyDelta));

    return `Sudah terpakai ${spentLabel} selama ${elapsedLabel}, rata-rata ${avgLabel}/hari — lebih tinggi dari target ${plannedLabel}/hari. Sisa ${remainingLabel} untuk ${formatDayCount(pace.remainingDays)} lagi, jadi batas harian aman sekarang sekitar ${adjustedLabel}/hari (${deltaLabel}/hari di bawah rencana awal). Kalau tetap ${plannedLabel}/hari, budget bisa habis sebelum akhir bulan.`;
  }

  if (pace.paceStatus === "fast") {
    return `Pengeluaran lebih cepat dari rencana. Rata-rata ${avgLabel}/hari selama ${elapsedLabel}, di atas target ${plannedLabel}/hari. Sisa ${remainingLabel} (${status.remainingPercent}% dari limit).`;
  }

  if (
    pace.paceStatus === "slow" &&
    pace.adjustedDailyBudget !== null &&
    pace.dailyDelta !== null &&
    pace.dailyDelta > 0
  ) {
    return `Pengeluaran lebih pelan dari rencana. Rata-rata ${avgLabel}/hari selama ${elapsedLabel}, di bawah target ${plannedLabel}/hari. Sisa ${remainingLabel} untuk ${formatDayCount(pace.remainingDays)} — kamu masih bisa ~${formatIdr(pace.adjustedDailyBudget)}/hari tanpa melewati limit.`;
  }

  if (pace.paceStatus === "on_track") {
    const adjustedPart =
      pace.adjustedDailyBudget !== null && pace.remainingDays > 0
        ? ` Batas harian aman untuk sisa bulan: ~${formatIdr(pace.adjustedDailyBudget)}/hari.`
        : "";

    return `Pengeluaran masih sesuai rencana. Rata-rata ${avgLabel}/hari selama ${elapsedLabel}, mendekati target ${plannedLabel}/hari. Sisa ${remainingLabel} (${status.remainingPercent}% dari limit).${adjustedPart}`;
  }

  if (pace.remainingDays <= 0) {
    return `Hari terakhir periode budget ini. Sudah terpakai ${spentLabel} dari limit ${limitLabel}, sisa ${remainingLabel}.`;
  }

  return `Sudah terpakai ${spentLabel} dari limit ${limitLabel}. Sisa ${remainingLabel} untuk ${formatDayCount(pace.remainingDays)} dengan target awal ${plannedLabel}/hari.`;
}
