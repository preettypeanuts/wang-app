"use client";

import { ArrowUpIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { ChatPayPlanSlashMenu } from "@/components/chat/chat-payplan-slash-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { GLASS_SURFACE } from "@/config/glass";
import { CONTROL_GAP } from "@/config/spacing";
import { filterUnpaidPayPlanChatItems } from "@/lib/planner/unpaid-payplan-chat";
import { cn } from "@/lib/utils";
import type { UnpaidPayPlanChatItem } from "@/types/chat";

/** Min height shared by menu btn & input — keep in sync. */
const CONTROL_MIN_HEIGHT = "min-h-9";

interface ChatInputProps {
  onSubmit: (text: string) => Promise<void>;
  onPayPlan?: (item: UnpaidPayPlanChatItem) => Promise<void>;
  unpaidPayPlanItems?: UnpaidPayPlanChatItem[];
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  onPayPlan,
  unpaidPayPlanItems = [],
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const hasText = value.trim().length > 0;
  const isInputDisabled = disabled || isSubmitting;
  const slashMatch = value.match(/^\/(.*)$/);
  const isSlashOpen = slashMatch !== null && Boolean(onPayPlan);
  const slashQuery = slashMatch?.[1]?.trim() ?? "";
  const filteredItems = useMemo(
    () => filterUnpaidPayPlanChatItems(unpaidPayPlanItems, slashQuery),
    [slashQuery, unpaidPayPlanItems],
  );

  useEffect(() => {
    setHighlightedIndex(0);
  }, [slashQuery, filteredItems.length]);

  async function handleSubmit() {
    if (isSlashOpen) {
      return;
    }

    const text = value.trim();
    if (!text || isSubmitting || disabled) return;

    setIsSubmitting(true);
    setValue("");

    try {
      await onSubmit(text);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelectPayPlan(item: UnpaidPayPlanChatItem) {
    if (!onPayPlan || isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);
    setValue("");

    try {
      await onPayPlan(item);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isSlashOpen) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((current) =>
          filteredItems.length === 0
            ? 0
            : (current + 1) % filteredItems.length,
        );
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((current) =>
          filteredItems.length === 0
            ? 0
            : (current - 1 + filteredItems.length) % filteredItems.length,
        );
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setValue("");
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const selected = filteredItems[highlightedIndex];

        if (selected) {
          void handleSelectPayPlan(selected);
        }

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
      {isSlashOpen ? (
        <ChatPayPlanSlashMenu
          items={filteredItems}
          highlightedIndex={highlightedIndex}
          onHighlight={setHighlightedIndex}
          onSelect={(item) => void handleSelectPayPlan(item)}
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
                  GLASS_SURFACE,
                  "size-9 shrink-0 rounded-full p-0",
                )}
              />
            }
          >
            <PlusIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            <DropdownMenuItem>Upload struk</DropdownMenuItem>
            <DropdownMenuItem>Input manual</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div
          className={cn(
            CONTROL_MIN_HEIGHT,
            GLASS_SURFACE,
            "flex max-h-28 min-w-0 flex-1 items-center overflow-hidden rounded-full py-0 pl-3 pr-1",
          )}
        >
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik transaksi... atau / untuk PayPlan"
            disabled={isInputDisabled}
            rows={1}
            className={cn(
              CONTROL_MIN_HEIGHT,
              "max-h-24 flex-1 resize-none overflow-y-auto rounded-full border-0 bg-transparent px-0 py-0 text-sm leading-9 shadow-none focus-visible:border-0 focus-visible:ring-0",
            )}
          />

          {hasText && !isSlashOpen ? (
            <Button
              type="button"
              size="icon-xs"
              onClick={() => void handleSubmit()}
              disabled={isInputDisabled}
              aria-label="Kirim pesan"
              className="mr-0.5 size-7 shrink-0 rounded-full"
            >
              <ArrowUpIcon className="size-3.5" weight="bold" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
