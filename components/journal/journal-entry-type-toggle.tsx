import { FORM_SEGMENT, FORM_SEGMENTED } from "@/config/form-dialog";
import { ArrowDownIcon, ArrowUpIcon, type Icon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

const TYPE_OPTIONS: Array<{
  type: TransactionType;
  label: string;
  icon: Icon;
  activeClassName: string;
  inactiveClassName: string;
  iconActiveClassName: string;
  iconInactiveClassName: string;
}> = [
  {
    type: "expense",
    label: "Keluar",
    icon: ArrowUpIcon,
    activeClassName:
      "border border-[#FF6B6B]/25 bg-[#FF6B6B]/12 text-[#E85555] shadow-sm dark:text-[#FF6B6B]",
    inactiveClassName:
      "text-muted-foreground hover:bg-[#FF6B6B]/6 hover:text-[#E85555]/85 dark:hover:bg-[#FF6B6B]/10 dark:hover:text-[#FF6B6B]/80",
    iconActiveClassName: "text-[#FF6B6B]",
    iconInactiveClassName: "text-[#FF6B6B]/55 dark:text-[#FF6B6B]/45",
  },
  {
    type: "income",
    label: "Masuk",
    icon: ArrowDownIcon,
    activeClassName:
      "border border-[#34C759]/25 bg-[#34C759]/12 text-[#2FAE52] shadow-sm dark:text-[#34C759]",
    inactiveClassName:
      "text-muted-foreground hover:bg-[#34C759]/6 hover:text-[#2FAE52]/85 dark:hover:bg-[#34C759]/10 dark:hover:text-[#34C759]/80",
    iconActiveClassName: "text-[#34C759]",
    iconInactiveClassName: "text-[#34C759]/55 dark:text-[#34C759]/45",
  },
];

interface JournalEntryTypeToggleProps {
  value: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function JournalEntryTypeToggle({
  value,
  onChange,
}: JournalEntryTypeToggleProps) {
  return (
    <fieldset className="border-0 px-4 py-3">
      <legend className="sr-only">Jenis transaksi</legend>
      <div className={FORM_SEGMENTED}>
        {TYPE_OPTIONS.map((option) => {
          const isActive = value === option.type;
          const IconComponent = option.icon;

          return (
            <button
              key={option.type}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.type)}
              className={cn(
                FORM_SEGMENT,
                "gap-1.5",
                isActive ? option.activeClassName : option.inactiveClassName,
              )}
            >
              <IconComponent
                className={cn(
                  "size-3.5 shrink-0",
                  isActive
                    ? option.iconActiveClassName
                    : option.iconInactiveClassName,
                )}
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
