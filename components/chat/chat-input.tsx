"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatCalculatorSheet } from "@/components/chat/chat-calculator-sheet";
import { ChatCategoryMentionMenu } from "@/components/chat/chat-category-mention-menu";
import { ChatInputHintBadges } from "@/components/chat/chat-input-hint-badges";
import { ChatSlashMenu } from "@/components/chat/chat-slash-menu";
import { ChatWalletMentionMenu } from "@/components/chat/chat-wallet-mention-menu";
import { useOptionalInboxSearch } from "@/components/inbox/inbox-search-context";
import { useUserCategoryCatalog } from "@/components/providers/user-category-catalog-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryMentionOption } from "@/config/category-mentions";
import { RECEIPT_ACCEPT_ATTRIBUTE } from "@/config/receipt";
import { CONTROL_GAP } from "@/config/spacing";
import { UI_LABEL_SEARCH_MESSAGES } from "@/config/ui-labels";
import {
  detectCategoryMentionRange,
  filterCategoryMentionOptions,
  insertCategoryMention,
} from "@/lib/chat/category-mentions";
import {
  buildWalletMentionOptions,
  detectWalletMentionRange,
  filterWalletMentionOptions,
  insertWalletMention,
  type WalletMentionOption,
} from "@/lib/chat/wallet-mentions";
import {
  ArrowUpIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ReceiptIcon,
} from "@/lib/icons";
import { filterUnpaidPayPlanChatItems } from "@/lib/planner/unpaid-payplan-chat";
import { filterActivePlanChatItems } from "@/lib/plans/active-plan-chat";
import { filterActiveSavingsChatItems } from "@/lib/savings/active-savings-chat";
import { cn } from "@/lib/utils";
import type {
  ActivePlanChatItem,
  ActiveSavingsChatItem,
  ChatSlashEntry,
  UnpaidPayPlanChatItem,
} from "@/types/chat";

/** Frosted layer — separate from overflow clipping so Safari keeps backdrop-filter. */
const CHAT_INPUT_GLASS_LAYER =
  "pointer-events-none absolute inset-0 glass-backdrop bg-[var(--glass-fill)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]";

interface ChatInputProps {
  onSubmit: (text: string) => Promise<void>;
  onReceiptFile?: (file: File) => Promise<void>;
  onPayPlan?: (item: UnpaidPayPlanChatItem) => Promise<void>;
  onMarkPlanDone?: (item: ActivePlanChatItem) => Promise<void>;
  onCheckSavings?: (item: ActiveSavingsChatItem) => Promise<void>;
  unpaidPayPlanItems?: UnpaidPayPlanChatItem[];
  activePlanItems?: ActivePlanChatItem[];
  activeSavingsItems?: ActiveSavingsChatItem[];
  walletOptions?: Array<{ id: string; name: string }>;
  disabled?: boolean;
  draftText?: string | null;
  onDraftTextApplied?: () => void;
  onSlashMenuOpenChange?: (open: boolean) => void;
}

export function ChatInput({
  onSubmit,
  onReceiptFile,
  onPayPlan,
  onMarkPlanDone,
  onCheckSavings,
  unpaidPayPlanItems = [],
  activePlanItems = [],
  activeSavingsItems = [],
  walletOptions = [],
  disabled = false,
  draftText = null,
  onDraftTextApplied,
  onSlashMenuOpenChange,
}: ChatInputProps) {
  const inboxSearch = useOptionalInboxSearch();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  const hasText = value.trim().length > 0;
  const isInputDisabled = disabled;
  const slashMatch = value.match(/^\/(.*)$/);
  const hasSlashActions = Boolean(
    onPayPlan || onMarkPlanDone || onCheckSavings,
  );
  const isSlashOpen = slashMatch !== null && hasSlashActions;
  const slashQuery = slashMatch?.[1]?.trim() ?? "";
  const walletMentionRange = useMemo(() => {
    if (isSlashOpen) {
      return null;
    }

    return detectWalletMentionRange(value, cursor);
  }, [cursor, isSlashOpen, value]);
  const isWalletMentionOpen =
    walletMentionRange !== null && walletOptions.length > 0;
  const walletMentionQuery = walletMentionRange?.query ?? "";
  const mentionRange = useMemo(() => {
    if (isSlashOpen || isWalletMentionOpen) {
      return null;
    }

    return detectCategoryMentionRange(value, cursor);
  }, [cursor, isSlashOpen, isWalletMentionOpen, value]);
  const isMentionOpen = mentionRange !== null;
  const mentionQuery = mentionRange?.query ?? "";
  const filteredPayPlanItems = useMemo(
    () => filterUnpaidPayPlanChatItems(unpaidPayPlanItems, slashQuery),
    [slashQuery, unpaidPayPlanItems],
  );
  const filteredPlanItems = useMemo(
    () => filterActivePlanChatItems(activePlanItems, slashQuery),
    [activePlanItems, slashQuery],
  );
  const filteredSavingsItems = useMemo(
    () => filterActiveSavingsChatItems(activeSavingsItems, slashQuery),
    [activeSavingsItems, slashQuery],
  );
  const slashEntries = useMemo<ChatSlashEntry[]>(
    () => [
      ...filteredPayPlanItems.map(
        (item): ChatSlashEntry => ({ kind: "payplan", item }),
      ),
      ...filteredPlanItems.map(
        (item): ChatSlashEntry => ({ kind: "plan", item }),
      ),
      ...filteredSavingsItems.map(
        (item): ChatSlashEntry => ({ kind: "savings", item }),
      ),
    ],
    [filteredPayPlanItems, filteredPlanItems, filteredSavingsItems],
  );
  const walletMentionOptions = useMemo(() => {
    const options = buildWalletMentionOptions(walletOptions);
    return filterWalletMentionOptions(walletMentionQuery, options);
  }, [walletMentionQuery, walletOptions]);
  const { getMentionOptions } = useUserCategoryCatalog();
  const mentionOptions = useMemo(() => {
    const options = getMentionOptions("expense").concat(getMentionOptions("income"));
    return filterCategoryMentionOptions(mentionQuery, options);
  }, [getMentionOptions, mentionQuery]);
  const isPickerOpen = isSlashOpen || isWalletMentionOpen || isMentionOpen;

  useEffect(() => {
    onSlashMenuOpenChange?.(isSlashOpen);
  }, [isSlashOpen, onSlashMenuOpenChange]);

  useEffect(() => {
    if (draftText === null) {
      return;
    }

    setValue(draftText);
    setCursor(draftText.length);
    onDraftTextApplied?.();

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(draftText.length, draftText.length);
      syncTextareaLayout();
    });
  }, [draftText, onDraftTextApplied]);

  function syncTextareaLayout() {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 96;
    const style = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(style.lineHeight) || 24;
    const paddingY =
      Number.parseFloat(style.paddingTop) +
      Number.parseFloat(style.paddingBottom);
    const singleLineHeight = lineHeight + paddingY;

    setIsMultiline(scrollHeight > singleLineHeight + 1);
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }

  useEffect(() => {
    syncTextareaLayout();
  }, [value]);

  function syncCursor() {
    const nextCursor = textareaRef.current?.selectionStart ?? 0;
    setCursor(nextCursor);
  }

  async function handleSubmit() {
    if (isPickerOpen) {
      return;
    }

    const text = value.trim();
    if (!text || disabled) return;

    setIsSubmitting(true);
    setValue("");
    setCursor(0);

    try {
      await onSubmit(text);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelectSlashEntry(entry: ChatSlashEntry) {
    if (isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);
    setValue("");
    setCursor(0);

    try {
      if (entry.kind === "payplan") {
        if (!onPayPlan) {
          return;
        }

        await onPayPlan(entry.item);
        return;
      }

      if (entry.kind === "plan") {
        if (!onMarkPlanDone) {
          return;
        }

        await onMarkPlanDone(entry.item);
        return;
      }

      if (!onCheckSavings) {
        return;
      }

      await onCheckSavings(entry.item);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSelectWalletMention(option: WalletMentionOption) {
    if (!walletMentionRange) {
      return;
    }

    const { nextText, nextCursor } = insertWalletMention(
      value,
      walletMentionRange,
      option.token,
    );

    setValue(nextText);
    setCursor(nextCursor);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleSelectCategoryMention(option: CategoryMentionOption) {
    if (!mentionRange) {
      return;
    }

    const { nextText, nextCursor } = insertCategoryMention(
      value,
      mentionRange,
      option.token,
    );

    setValue(nextText);
    setCursor(nextCursor);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleUseCalculatorAmount(amount: number) {
    const amountText = String(amount);
    setValue((current) => {
      const trimmed = current.trimEnd();
      return trimmed.length === 0 ? amountText : `${trimmed} ${amountText}`;
    });
    syncCursor();
  }

  async function handleReceiptFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !onReceiptFile || isInputDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onReceiptFile(file);
    } finally {
      setIsSubmitting(false);
    }
  }

  function getActivePickerLength(): number {
    if (isSlashOpen) {
      return slashEntries.length;
    }

    if (isWalletMentionOpen) {
      return walletMentionOptions.length;
    }

    return mentionOptions.length;
  }

  function handlePickerEnter() {
    if (isSlashOpen) {
      const selected = slashEntries[highlightedIndex];
      if (selected) {
        void handleSelectSlashEntry(selected);
      }
      return;
    }

    if (isWalletMentionOpen) {
      const selected = walletMentionOptions[highlightedIndex];
      if (selected) {
        handleSelectWalletMention(selected);
      }
      return;
    }

    if (isMentionOpen) {
      const selected = mentionOptions[highlightedIndex];
      if (selected) {
        handleSelectCategoryMention(selected);
      }
    }
  }

  function handlePickerArrowDown(event: React.KeyboardEvent) {
    event.preventDefault();
    const length = getActivePickerLength();
    setHighlightedIndex((current) =>
      length === 0 ? 0 : (current + 1) % length,
    );
  }

  function handlePickerArrowUp(event: React.KeyboardEvent) {
    event.preventDefault();
    const length = getActivePickerLength();
    setHighlightedIndex((current) =>
      length === 0 ? 0 : (current - 1 + length) % length,
    );
  }

  function handleInsertHint(token: string) {
    if (isInputDisabled) {
      return;
    }

    const nextText = `${value}${token}`;
    const nextCursor = nextText.length;
    setValue(nextText);
    setCursor(nextCursor);
    setHighlightedIndex(0);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isPickerOpen) {
      if (event.key === "ArrowDown") {
        handlePickerArrowDown(event);
        return;
      }

      if (event.key === "ArrowUp") {
        handlePickerArrowUp(event);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        if (isSlashOpen) {
          setValue("");
          setCursor(0);
        }
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handlePickerEnter();
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <div className="relative shrink-0">
      <input
        ref={receiptInputRef}
        type="file"
        accept={RECEIPT_ACCEPT_ATTRIBUTE}
        className="sr-only"
        onChange={(event) => void handleReceiptFileChange(event)}
      />

      {isSlashOpen ? (
        <ChatSlashMenu
          payPlanItems={filteredPayPlanItems}
          planItems={filteredPlanItems}
          savingsItems={filteredSavingsItems}
          entries={slashEntries}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onSelect={(entry) => void handleSelectSlashEntry(entry)}
        />
      ) : null}

      {isWalletMentionOpen ? (
        <ChatWalletMentionMenu
          options={walletMentionOptions}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onSelect={handleSelectWalletMention}
        />
      ) : null}

      {isMentionOpen ? (
        <ChatCategoryMentionMenu
          options={mentionOptions}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onSelect={handleSelectCategoryMention}
        />
      ) : null}

      <div className={cn("flex max-h-28 w-full items-end", CONTROL_GAP)}>
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isInputDisabled}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Menu"
                className={cn(
                  "aspect-square shrink-0 rounded-full p-0",
                  "max-md:size-10 max-md:min-h-10 max-md:[&_svg]:size-[1.05rem]",
                  "md:size-9 md:min-h-9 md:min-w-9 md:[&_svg]:size-4",
                  "glass-backdrop bg-(--glass-fill)",
                  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]",
                  "hover:bg-(--glass-fill)! dark:hover:bg-(--glass-fill)!",
                  "aria-expanded:bg-(--glass-fill)! aria-expanded:text-foreground",
                )}
              />
            }
          >
            <PlusIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            {inboxSearch ? (
              <DropdownMenuItem onClick={() => inboxSearch.open()}>
                <MagnifyingGlassIcon className="size-4" />
                {UI_LABEL_SEARCH_MESSAGES}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem onClick={() => setIsCalculatorOpen(true)}>
              <CalculatorIcon className="size-4" />
              Kalkulator
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!onReceiptFile}
              onClick={() => receiptInputRef.current?.click()}
            >
              <ReceiptIcon className="size-4" />
              Upload struk
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Input manual</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ChatCalculatorSheet
          open={isCalculatorOpen}
          onOpenChange={setIsCalculatorOpen}
          onUseAmount={handleUseCalculatorAmount}
        />

        <div
          className={cn(
            "relative max-h-28 min-w-0 flex-1 overflow-hidden rounded-[20px]",
            "max-md:min-h-10 md:min-h-9",
          )}
        >
          <span
            className={cn(CHAT_INPUT_GLASS_LAYER, "rounded-[20px]")}
            aria-hidden
          />
          <div
            className={cn(
              "relative flex max-h-28 w-full py-0",
              "max-md:min-h-10 max-md:pl-4 max-md:pr-1.5 md:min-h-9 md:pl-3 md:pr-1",
              isMultiline ? "items-end" : "items-center",
            )}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setCursor(event.target.selectionStart ?? 0);
                setHighlightedIndex(0);
                requestAnimationFrame(syncTextareaLayout);
              }}
              onSelect={syncCursor}
              onClick={syncCursor}
              onKeyUp={syncCursor}
              onKeyDown={handleKeyDown}
              placeholder="Catat transaksi..."
              disabled={isInputDisabled}
              rows={1}
              className={cn(
                "max-h-24 flex-1 resize-none overflow-y-auto rounded-lg border-0 bg-transparent px-0 py-0 shadow-none",
                "max-md:min-h-10 max-md:py-[8px]! max-md:text-base max-md:leading-6",
                "md:min-h-9 md:text-sm md:leading-9",
                "placeholder:text-gray-500/60 dark:placeholder:text-gray-200/60",
                "focus-visible:border-0 focus-visible:ring-0 no-scrollbar",
              )}
            />

            {hasText && !isPickerOpen ? (
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isInputDisabled}
                aria-label="Kirim pesan"
                className={cn(
                  "max-md:size-8 max-md:[&_svg]:size-2.5 md:size-7",
                  isMultiline ? "mb-[6px] self-end" : "self-center",
                  "-mr-px h-[29px] max-h-[29px] w-9! max-w-9! shrink-0 rounded-full md:hidden",
                )}
              >
                <ArrowUpIcon aria-hidden="true" weight={1} />
              </Button>
            ) : !isPickerOpen ? (
              <ChatInputHintBadges
                disabled={isInputDisabled}
                showSlash={hasSlashActions}
                showWallet={walletOptions.length > 0}
                onInsert={handleInsertHint}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
