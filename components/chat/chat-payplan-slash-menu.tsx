import { ReceiptIcon } from "@/lib/icons";

import {
  CHAT_SLASH_MENU,
  CHAT_SLASH_MENU_ITEM,
  CHAT_SLASH_MENU_ITEM_ACTIVE,
} from "@/config/chat-layout";
import { getCategoryLabel } from "@/config/categories";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";
import type { UnpaidPayPlanChatItem } from "@/types/chat";

interface ChatPayPlanSlashMenuProps {
  items: UnpaidPayPlanChatItem[];
  highlightedIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (item: UnpaidPayPlanChatItem) => void;
}

export function ChatPayPlanSlashMenu({
  items,
  highlightedIndex,
  onHighlight,
  onSelect,
}: ChatPayPlanSlashMenuProps) {
  return (
    <div className={CHAT_SLASH_MENU} role="listbox" aria-label="PayPlan belum dibayar">
      <div className="border-b border-black/6 px-3 py-2 dark:border-white/8">
        <p className="text-xs font-semibold text-foreground/90">PayPlan belum dibayar</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Pilih tagihan untuk ditandai sudah dibayar.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-4 text-center text-xs text-muted-foreground">
          Tidak ada tagihan belum dibayar.
        </p>
      ) : (
        items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={index === highlightedIndex}
            className={cn(
              CHAT_SLASH_MENU_ITEM,
              index === highlightedIndex && CHAT_SLASH_MENU_ITEM_ACTIVE,
            )}
            onMouseEnter={() => onHighlight(index)}
            onClick={() => onSelect(item)}
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#FF9500]/15 text-[#FF9500] dark:bg-[#FF9500]/20">
              <ReceiptIcon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-foreground/90">
                  {item.name}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatIdr(item.amount)}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                {getCategoryLabel(item.category)} · {item.statusLabel}
              </span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}
