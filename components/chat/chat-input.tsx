"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChatCalculatorSheet } from "@/components/chat/chat-calculator-sheet";
import { ChatCategoryMentionMenu } from "@/components/chat/chat-category-mention-menu";
import { ChatInputHintBadges } from "@/components/chat/chat-input-hint-badges";
import { ChatSlashMenu } from "@/components/chat/chat-slash-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryMentionOption } from "@/config/category-mentions";
import {
  CHAT_INPUT_CONTROL_MIN_HEIGHT,
  CHAT_INPUT_FIELD,
  CHAT_INPUT_MENU_BUTTON,
  CHAT_INPUT_SEND_BUTTON,
  CHAT_INPUT_TEXTAREA,
} from "@/config/chat-input-mobile";
import { GLASS_SURFACE } from "@/config/glass";
import { RECEIPT_ACCEPT_ATTRIBUTE } from "@/config/receipt";
import { CONTROL_GAP } from "@/config/spacing";
import {
  detectCategoryMentionRange,
  filterCategoryMentionOptions,
  insertCategoryMention,
} from "@/lib/chat/category-mentions";
import {
  ArrowUpIcon,
  CalculatorIcon,
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

/** Min height shared by menu btn & input — keep in sync with config/chat-input-mobile.ts */
const CONTROL_MIN_HEIGHT = CHAT_INPUT_CONTROL_MIN_HEIGHT;

interface ChatInputProps {
  onSubmit: (text: string) => Promise<void>;
  onReceiptFile?: (file: File) => Promise<void>;
  onPayPlan?: (item: UnpaidPayPlanChatItem) => Promise<void>;
  onMarkPlanDone?: (item: ActivePlanChatItem) => Promise<void>;
  onCheckSavings?: (item: ActiveSavingsChatItem) => Promise<void>;
  unpaidPayPlanItems?: UnpaidPayPlanChatItem[];
  activePlanItems?: ActivePlanChatItem[];
  activeSavingsItems?: ActiveSavingsChatItem[];
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
  disabled = false,
  draftText = null,
  onDraftTextApplied,
  onSlashMenuOpenChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const hasText = value.trim().length > 0;
  const isInputDisabled = disabled || isSubmitting;
  const slashMatch = value.match(/^\/(.*)$/);
  const hasSlashActions = Boolean(
    onPayPlan || onMarkPlanDone || onCheckSavings,
  );
  const isSlashOpen = slashMatch !== null && hasSlashActions;
  const slashQuery = slashMatch?.[1]?.trim() ?? "";
  const mentionRange = useMemo(() => {
    if (isSlashOpen) {
      return null;
    }

    return detectCategoryMentionRange(value, cursor);
  }, [cursor, isSlashOpen, value]);
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
  const mentionOptions = useMemo(
    () => filterCategoryMentionOptions(mentionQuery),
    [mentionQuery],
  );
  const isPickerOpen = isSlashOpen || isMentionOpen;

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
  }, [draftText, onDraftTextApplied]);

  function syncCursor() {
    const nextCursor = textareaRef.current?.selectionStart ?? 0;
    setCursor(nextCursor);
  }

  async function handleSubmit() {
    if (isPickerOpen) {
      return;
    }

    const text = value.trim();
    if (!text || isSubmitting || disabled) return;

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

  function handlePickerEnter() {
    if (isSlashOpen) {
      const selected = slashEntries[highlightedIndex];
      if (selected) {
        void handleSelectSlashEntry(selected);
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
    const length = isSlashOpen ? slashEntries.length : mentionOptions.length;
    setHighlightedIndex((current) =>
      length === 0 ? 0 : (current + 1) % length,
    );
  }

  function handlePickerArrowUp(event: React.KeyboardEvent) {
    event.preventDefault();
    const length = isSlashOpen ? slashEntries.length : mentionOptions.length;
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
                  CONTROL_MIN_HEIGHT,
                  CHAT_INPUT_MENU_BUTTON,
                  GLASS_SURFACE,
                  "shrink-0 rounded-full p-0",
                )}
              />
            }
          >
            <PlusIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
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
            CONTROL_MIN_HEIGHT,
            CHAT_INPUT_FIELD,
            GLASS_SURFACE,
            "flex max-h-28 min-w-0 flex-1 items-center overflow-hidden rounded-full py-0",
          )}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setCursor(event.target.selectionStart ?? 0);
              setHighlightedIndex(0);
            }}
            onSelect={syncCursor}
            onClick={syncCursor}
            onKeyUp={syncCursor}
            onKeyDown={handleKeyDown}
            placeholder="Catat transaksi..."
            disabled={isInputDisabled}
            rows={1}
            className={cn(
              CONTROL_MIN_HEIGHT,
              CHAT_INPUT_TEXTAREA,
              "max-h-24 flex-1 resize-none overflow-y-auto rounded-full border-0 bg-transparent px-0 py-0 shadow-none focus-visible:border-0 focus-visible:ring-0",
            )}
          />

          {hasText && !isPickerOpen ? (
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isInputDisabled}
              aria-label="Kirim pesan"
              className={cn(
                CHAT_INPUT_SEND_BUTTON,
                "-mr-0.5 flex-1 rounded-full w-10 max-w-10",
              )}
            >
              <ArrowUpIcon aria-hidden="true"  weight={1} />
            </Button>
          ) : !isPickerOpen ? (
            <ChatInputHintBadges
              disabled={isInputDisabled}
              showSlash={hasSlashActions}
              onInsert={handleInsertHint}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
