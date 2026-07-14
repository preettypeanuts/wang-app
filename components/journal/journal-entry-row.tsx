"use client";

import { JournalAdjustmentIcon } from "@/components/journal/journal-adjustment-icon";
import { JournalCategoryIcon } from "@/components/journal/journal-category-icon";
import { JournalTransferIcon } from "@/components/journal/journal-transfer-icon";
import { JournalWalletBadge } from "@/components/journal/journal-wallet-badge";
import { useUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import {
  JOURNAL_LIST_AMOUNT_EXPENSE,
  JOURNAL_LIST_AMOUNT_INCOME,
  JOURNAL_LIST_AMOUNT_TRANSFER,
  JOURNAL_LIST_ROW,
  JOURNAL_LIST_ROW_BUTTON,
  JOURNAL_LIST_ROW_AMOUNT,
  JOURNAL_LIST_ROW_CONTENT,
  JOURNAL_LIST_ROW_META,
  JOURNAL_LIST_ROW_TITLE,
} from "@/config/journal-table";
import { formatJournalTime } from "@/lib/finance/format-datetime";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types/journal";

interface JournalEntryRowProps {
  item: JournalEntry;
  onClick?: () => void;
}

export function JournalEntryRow({ item, onClick }: JournalEntryRowProps) {
  const { getLabel } = useUserCategoryCatalog();
  const isTransfer = item.type === "transfer";
  const isAdjustment = item.type === "adjustment";
  const isIncome = item.type === "income";
  const title = item.rawInput.trim() || item.description;

  const metaLabel = isTransfer
    ? `Transfer · ${formatJournalTime(item.occurredAt)}`
    : isAdjustment
      ? `Penyesuaian saldo · ${formatJournalTime(item.occurredAt)}`
      : `${isIncome ? "Pemasukan" : "Pengeluaran"} · ${getLabel(item.category)} · ${formatJournalTime(item.occurredAt)}`;

  const amountSign =
    isTransfer || isAdjustment
      ? item.amount < 0
        ? "−"
        : "+"
      : isIncome
        ? "+"
        : "-";
  const amountClass =
    isTransfer || isAdjustment
      ? JOURNAL_LIST_AMOUNT_TRANSFER
      : isIncome
        ? JOURNAL_LIST_AMOUNT_INCOME
        : JOURNAL_LIST_AMOUNT_EXPENSE;

  const content = (
    <>
      {isTransfer ? (
        <JournalTransferIcon />
      ) : isAdjustment ? (
        <JournalAdjustmentIcon />
      ) : (
        <JournalCategoryIcon category={item.category} type={item.type} />
      )}

      <div className={JOURNAL_LIST_ROW_CONTENT}>
        <p className={JOURNAL_LIST_ROW_TITLE}>{title}</p>
        <span className={cn(JOURNAL_LIST_ROW_META, "flex items-center gap-1.5")}>
          <span className="truncate">{metaLabel}</span>
          {item.walletName ? (
            <JournalWalletBadge name={item.walletName} />
          ) : null}
        </span>
      </div>

      <p className={cn(JOURNAL_LIST_ROW_AMOUNT, amountClass)}>
        {amountSign}
        {formatIdr(Math.abs(item.amount))}
      </p>
    </>
  );

  if (!onClick) {
    return <article className={JOURNAL_LIST_ROW}>{content}</article>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(JOURNAL_LIST_ROW, JOURNAL_LIST_ROW_BUTTON)}
    >
      {content}
    </button>
  );
}
