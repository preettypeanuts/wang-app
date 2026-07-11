import { formatIdr } from "@/lib/finance/format-currency";
import type { BudgetStatus } from "@/types/budget";

export type BudgetExplanationTone = "amount" | "warning" | "danger" | "success";

export interface BudgetExplanationSegment {
  text: string;
  tone?: BudgetExplanationTone;
}

function seg(text: string): BudgetExplanationSegment {
  return { text };
}

function highlight(
  text: string,
  tone: BudgetExplanationTone,
): BudgetExplanationSegment {
  return { text, tone };
}

function formatDayCount(count: number): string {
  return count === 1 ? "1 hari" : `${count} hari`;
}

function perDay(
  amountLabel: string,
  tone?: BudgetExplanationTone,
): BudgetExplanationSegment {
  return highlight(`${amountLabel}/hari`, tone ?? "amount");
}

export function buildBudgetDetailExplanation(
  status: BudgetStatus,
): BudgetExplanationSegment[] {
  const { pace } = status;
  const spentLabel = formatIdr(status.spent);
  const remainingLabel = formatIdr(Math.max(0, status.remaining));
  const limitLabel = formatIdr(status.totalLimit);
  const overLabel = formatIdr(Math.abs(status.remaining));

  if (status.remaining < 0) {
    return [
      seg("Budget kategori ini sudah melebihi limit bulanan sebesar "),
      highlight(overLabel, "danger"),
      seg(". Total terpakai "),
      highlight(spentLabel, "amount"),
      seg(" dari limit "),
      highlight(limitLabel, "amount"),
      seg(
        ". Pertimbangkan menaikkan limit atau mengurangi pengeluaran sampai bulan depan.",
      ),
    ];
  }

  if (pace.isFutureMonth) {
    const plannedLabel = formatIdr(pace.plannedDailyBudget ?? 0);
    return [
      seg("Budget untuk bulan ini belum dimulai. Target harian sekitar "),
      perDay(plannedLabel),
      seg(" dengan total limit "),
      highlight(limitLabel, "amount"),
      seg(` untuk ${formatDayCount(status.dayCount)}.`),
    ];
  }

  if (pace.isPastMonth) {
    const base: BudgetExplanationSegment[] = [
      seg("Bulan ini sudah selesai. Terpakai "),
      highlight(spentLabel, "amount"),
      seg(" dari limit "),
      highlight(limitLabel, "amount"),
      seg(", sisa "),
      highlight(remainingLabel, "amount"),
      seg(` (${status.remainingPercent}% dari limit).`),
    ];

    if (status.remainingPercent <= 20) {
      base.push(seg(" Pengeluaran cukup ketat di akhir periode."));
    }

    return base;
  }

  if (pace.elapsedDays <= 0 || pace.plannedDailyBudget === null) {
    const segments: BudgetExplanationSegment[] = [
      seg("Belum ada pengeluaran tercatat bulan ini. Limit "),
      highlight(limitLabel, "amount"),
    ];

    if (pace.plannedDailyBudget !== null) {
      segments.push(seg(" dengan target "));
      segments.push(perDay(formatIdr(pace.plannedDailyBudget)));
      segments.push(seg("."));
    } else {
      segments.push(seg("."));
    }

    return segments;
  }

  const avgLabel = formatIdr(pace.avgDailySpent ?? 0);
  const plannedLabel = formatIdr(pace.plannedDailyBudget);
  const elapsedLabel = formatDayCount(pace.elapsedDays);

  if (status.remainingPercent <= 20 && pace.remainingDays > 0) {
    const segments: BudgetExplanationSegment[] = [
      seg("Budget hampir habis — sisa "),
      highlight(remainingLabel, "warning"),
      seg(` (${status.remainingPercent}% dari limit). Sudah terpakai `),
      highlight(spentLabel, "amount"),
      seg(" dengan rata-rata "),
      perDay(avgLabel, "warning"),
      seg(` selama ${elapsedLabel}.`),
    ];

    if (pace.adjustedDailyBudget !== null) {
      segments.push(
        seg(
          ` Untuk ${formatDayCount(pace.remainingDays)} tersisa, batas aman sekitar `,
        ),
        perDay(formatIdr(pace.adjustedDailyBudget), "warning"),
        seg("."),
      );
    }

    return segments;
  }

  if (
    pace.paceStatus === "fast" &&
    pace.adjustedDailyBudget !== null &&
    pace.dailyDelta !== null &&
    pace.dailyDelta < 0
  ) {
    const adjustedLabel = formatIdr(pace.adjustedDailyBudget);
    const deltaLabel = formatIdr(Math.abs(pace.dailyDelta));

    return [
      seg("Sudah terpakai "),
      highlight(spentLabel, "amount"),
      seg(` selama ${elapsedLabel}, rata-rata `),
      perDay(avgLabel, "warning"),
      seg(" — lebih tinggi dari target "),
      perDay(plannedLabel),
      seg(". Sisa "),
      highlight(remainingLabel, "amount"),
      seg(
        ` untuk ${formatDayCount(pace.remainingDays)} lagi, jadi batas harian aman sekarang sekitar `,
      ),
      perDay(adjustedLabel, "warning"),
      seg(` (${deltaLabel}/hari di bawah rencana awal). Kalau tetap `),
      perDay(plannedLabel),
      seg(", budget "),
      highlight("bisa habis sebelum akhir bulan", "warning"),
      seg("."),
    ];
  }

  if (pace.paceStatus === "fast") {
    return [
      seg("Pengeluaran lebih cepat dari rencana. Rata-rata "),
      perDay(avgLabel, "warning"),
      seg(` selama ${elapsedLabel}, di atas target `),
      perDay(plannedLabel),
      seg(". Sisa "),
      highlight(remainingLabel, "amount"),
      seg(` (${status.remainingPercent}% dari limit).`),
    ];
  }

  if (
    pace.paceStatus === "slow" &&
    pace.adjustedDailyBudget !== null &&
    pace.dailyDelta !== null &&
    pace.dailyDelta > 0
  ) {
    return [
      seg("Pengeluaran lebih pelan dari rencana. Rata-rata "),
      perDay(avgLabel, "success"),
      seg(` selama ${elapsedLabel}, di bawah target `),
      perDay(plannedLabel),
      seg(". Sisa "),
      highlight(remainingLabel, "amount"),
      seg(` untuk ${formatDayCount(pace.remainingDays)} — kamu masih bisa ~`),
      perDay(formatIdr(pace.adjustedDailyBudget), "success"),
      seg(" tanpa melewati limit."),
    ];
  }

  if (pace.paceStatus === "on_track") {
    const segments: BudgetExplanationSegment[] = [
      seg("Pengeluaran masih sesuai rencana. Rata-rata "),
      perDay(avgLabel),
      seg(` selama ${elapsedLabel}, mendekati target `),
      perDay(plannedLabel),
      seg(". Sisa "),
      highlight(remainingLabel, "amount"),
      seg(` (${status.remainingPercent}% dari limit).`),
    ];

    if (pace.adjustedDailyBudget !== null && pace.remainingDays > 0) {
      segments.push(seg(" Batas harian aman untuk sisa bulan: ~"));
      segments.push(perDay(formatIdr(pace.adjustedDailyBudget)));
      segments.push(seg("."));
    }

    return segments;
  }

  if (pace.remainingDays <= 0) {
    return [
      seg("Hari terakhir periode budget ini. Sudah terpakai "),
      highlight(spentLabel, "amount"),
      seg(" dari limit "),
      highlight(limitLabel, "amount"),
      seg(", sisa "),
      highlight(remainingLabel, "amount"),
      seg("."),
    ];
  }

  return [
    seg("Sudah terpakai "),
    highlight(spentLabel, "amount"),
    seg(" dari limit "),
    highlight(limitLabel, "amount"),
    seg(". Sisa "),
    highlight(remainingLabel, "amount"),
    seg(` untuk ${formatDayCount(pace.remainingDays)} dengan target awal `),
    perDay(plannedLabel),
    seg("."),
  ];
}

export function formatBudgetDetailExplanationPlain(
  segments: BudgetExplanationSegment[],
): string {
  return segments.map((segment) => segment.text).join("");
}
