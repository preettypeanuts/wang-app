import { CHAT_BUBBLE_STYLES } from "@/config/chat-bubbles";
import { SEPARATED_SURFACE } from "@/config/shape";
import { CATEGORY_LABELS } from "@/lib/finance/categories";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { ParsedTransaction } from "@/types/transaction";

interface TransactionPreviewProps {
  transaction: ParsedTransaction;
}

const assistantBubble = CHAT_BUBBLE_STYLES.assistant;

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function TransactionPreview({ transaction }: TransactionPreviewProps) {
  const typeLabel = transaction.type === "income" ? "Pemasukan" : "Pengeluaran";
  const categoryLabel = CATEGORY_LABELS[transaction.category] ?? "Lainnya";

  return (
    <div
      className={cn(
        "mt-2 p-4 text-xs",
        SEPARATED_SURFACE,
        assistantBubble.surface,
        assistantBubble.text,
      )}
    >
      <dl className="grid gap-1.5">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground dark:text-neutral-300">Jenis</dt>
          <dd className="font-medium">{typeLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground dark:text-neutral-300">Nominal</dt>
          <dd className="font-medium">{formatIdr(transaction.amount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground dark:text-neutral-300">Kategori</dt>
          <dd className="font-medium">{categoryLabel}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground dark:text-neutral-300">Waktu</dt>
          <dd className="font-medium">{formatTime(transaction.occurredAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground dark:text-neutral-300">Catatan</dt>
          <dd className="max-w-[60%] text-right font-medium">
            {transaction.description}
          </dd>
        </div>
      </dl>
    </div>
  );
}
