"use client";

import { useState } from "react";

import { getQuickCorrectCategories } from "@/config/transaction-quick-correct";
import { CHAT_BUBBLE_STYLES } from "@/config/chat-bubbles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { isUncertainTransactionType } from "@/lib/chat/low-confidence-transaction";
import { cn } from "@/lib/utils";
import type { ParsedTransaction, TransactionType } from "@/types/transaction";

const QUICK_CORRECT_SHELL = cn(
  SEPARATED_SURFACE,
  CHAT_BUBBLE_STYLES.assistant.surface,
  "flex flex-col gap-2 p-3",
);

const QUICK_CORRECT_CHIP = [
  "rounded-full border border-black/8 bg-black/4 px-3 py-1.5",
  "text-[11px] font-medium text-foreground transition-colors",
  "hover:bg-black/8 active:scale-[0.98]",
  "disabled:pointer-events-none disabled:opacity-40",
  "dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/12",
  "max-md:py-2 max-md:text-xs",
].join(" ");

const QUICK_CORRECT_CHIP_ACTIVE = [
  "border-primary/40 bg-primary/15 text-primary",
  "dark:border-primary/50 dark:bg-primary/20",
].join(" ");

interface TransactionQuickCorrectProps {
  transaction: ParsedTransaction;
  userInput: string;
  disabled?: boolean;
  onCorrect: (input: {
    category: string;
    type: TransactionType;
  }) => void;
}

export function TransactionQuickCorrect({
  transaction,
  userInput,
  disabled = false,
  onCorrect,
}: TransactionQuickCorrectProps) {
  const [pendingType, setPendingType] = useState<TransactionType>(transaction.type);
  const showTypeToggle = isUncertainTransactionType(userInput);
  const categories = getQuickCorrectCategories(pendingType, transaction.category);

  function handleTypeSelect(type: TransactionType) {
    setPendingType(type);
  }

  function handleCategorySelect(category: string) {
    onCorrect({ category, type: pendingType });
  }

  return (
    <div className={cn("mt-1.5 max-w-[85%]", QUICK_CORRECT_SHELL)}>
      {showTypeToggle ? (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleTypeSelect("expense")}
            className={cn(
              QUICK_CORRECT_CHIP,
              pendingType === "expense" && QUICK_CORRECT_CHIP_ACTIVE,
            )}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleTypeSelect("income")}
            className={cn(
              QUICK_CORRECT_CHIP,
              pendingType === "income" && QUICK_CORRECT_CHIP_ACTIVE,
            )}
          >
            Pemasukan
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            disabled={disabled}
            onClick={() => handleCategorySelect(category.id)}
            className={QUICK_CORRECT_CHIP}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}
