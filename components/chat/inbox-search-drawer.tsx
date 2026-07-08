"use client";

import { useEffect, useRef, useState } from "react";

import { searchInboxMessagesAction } from "@/app/actions/inbox";
import { JournalEntryDetailDialog } from "@/components/journal/journal-entry-detail-dialog";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogHeader,
} from "@/components/shared/responsive-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryLabel } from "@/config/categories";
import { formatIdr } from "@/lib/finance/format-currency";
import { formatDateTime } from "@/lib/finance/format-datetime";
import { MagnifyingGlassIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/chat";
import type { JournalEntry } from "@/types/journal";
import type { ParsedTransaction } from "@/types/transaction";

const SEARCH_DEBOUNCE_MS = 300;

function transactionToJournalEntry(tx: ParsedTransaction): JournalEntry | null {
  if (!tx.id) {
    return null;
  }

  return {
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    rawInput: tx.description,
    occurredAt: new Date(tx.occurredAt),
  };
}

function pickMatchedTransaction(
  message: ChatMessage,
  query: string,
): ParsedTransaction | undefined {
  const q = query.trim().toLowerCase();
  const list = message.transactions?.length
    ? message.transactions
    : message.transaction
      ? [message.transaction]
      : [];

  if (!q || list.length === 0) {
    return list[0];
  }

  return (
    list.find(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        String(tx.amount).includes(q),
    ) ?? list[0]
  );
}

function snippet(content: string, max = 96): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

interface InboxSearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loadedMessageIds: Set<string>;
  onScrollToMessage: (messageId: string) => void;
}

export function InboxSearchDrawer({
  open,
  onOpenChange,
  loadedMessageIds,
  onScrollToMessage,
}: InboxSearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailEntry, setDetailEntry] = useState<JournalEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
      setResults([]);
      setLoading(false);
    }
  }, [open]);

  // Pin backdrop to layout viewport height — ignore visual viewport shrink from keyboard.
  useEffect(() => {
    if (!open) {
      document.documentElement.style.removeProperty(
        "--inbox-search-overlay-height",
      );
      return;
    }

    const lockOverlayHeight = () => {
      document.documentElement.style.setProperty(
        "--inbox-search-overlay-height",
        `${window.innerHeight}px`,
      );
    };

    lockOverlayHeight();
    window.addEventListener("orientationchange", lockOverlayHeight);

    return () => {
      window.removeEventListener("orientationchange", lockOverlayHeight);
      document.documentElement.style.removeProperty(
        "--inbox-search-overlay-height",
      );
    };
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!debouncedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    void searchInboxMessagesAction(debouncedQuery).then((messages) => {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setResults(messages);
      setLoading(false);
    });
  }, [debouncedQuery, open]);

  function handleSelect(message: ChatMessage) {
    if (loadedMessageIds.has(message.id)) {
      onOpenChange(false);
      onScrollToMessage(message.id);
      return;
    }

    const matched = pickMatchedTransaction(message, debouncedQuery);
    const entry = matched ? transactionToJournalEntry(matched) : null;

    if (entry) {
      onOpenChange(false);
      window.setTimeout(() => {
        setDetailEntry(entry);
        setDetailOpen(true);
      }, 150);
    }
  }

  return (
    <>
      <ResponsiveDialog
        bare
        open={open}
        onOpenChange={onOpenChange}
        title="Cari di Inbox"
        wide
      >
        <ResponsiveDialogHeader className="max-md:hidden">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold tracking-tight">
              Cari di Inbox
            </p>
            <p className="text-xs text-muted-foreground">
              Cari pesan atau transaksi yang pernah dicatat.
            </p>
          </div>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody
          className={cn(
            "flex min-h-0 flex-col gap-3 overflow-hidden max-md:pt-3",
            "max-md:gap-2 max-md:bg-transparent max-md:px-0 max-md:pt-0 max-md:pb-(--mobile-safe-bottom)",
          )}
        >
          <div className="relative shrink-0 max-md:px-0">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-1/2 z-10 size-4 -translate-y-1/2",
                "left-3.5 text-foreground/55",
                "max-md:left-4 max-md:size-[1.05rem] max-md:text-foreground/65",
                "max-md:dark:text-white/70",
              )}
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kopi, netflix, parkir…"
              className={cn(
                "pl-10",
                "max-md:h-11 max-md:rounded-full max-md:border-0 max-md:bg-white/70 max-md:pl-11 max-md:shadow-none max-md:backdrop-blur-xl",
                "max-md:dark:bg-black/45",
                "max-md:placeholder:text-muted-foreground/80",
                "max-md:focus-visible:border-transparent max-md:focus-visible:ring-0 max-md:focus-visible:ring-offset-0",
              )}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
            />
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]",
              "max-md:rounded-3xl max-md:bg-transparent",
            )}
          >
            {!debouncedQuery ? (
              <p className="px-1 py-4 text-center text-sm">
                Ketik kata kunci untuk mulai cari.
              </p>
            ) : loading ? (
              <ul className="flex flex-col gap-2">
                {["0", "1", "2", "3", "4"].map((key) => (
                  <li
                    key={key}
                    className="rounded-2xl border border-black/6 bg-white/40 p-3 backdrop-blur-md dark:border-white/8 dark:bg-black/30"
                  >
                    <Skeleton className="mb-2 h-3 w-24" />
                    <Skeleton className="mb-1.5 h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </li>
                ))}
              </ul>
            ) : results.length === 0 ? (
              <p className="px-1 py-4 text-center text-sm text-muted-foreground">
                Gak ketemu transaksi buat &ldquo;{debouncedQuery}&rdquo;
              </p>
            ) : (
              <ul className="flex flex-col gap-2 pb-2">
                {results.map((message) => {
                  const matched = pickMatchedTransaction(
                    message,
                    debouncedQuery,
                  );
                  const roleLabel =
                    message.role === "user" ? "Kamu" : "Asisten";

                  return (
                    <li key={message.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(message)}
                        className={cn(
                          "flex w-full flex-col gap-1.5 rounded-2xl border border-black/6 bg-black/2 p-3 text-left transition-colors",
                          "hover:bg-black/5 active:scale-[0.99]",
                          "dark:border-white/8 dark:bg-white/3 dark:hover:bg-white/6",
                          "max-md:border-white/20 max-md:bg-white/50 max-md:backdrop-blur-xl",
                          "max-md:dark:border-white/10 max-md:dark:bg-black/35",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {roleLabel}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {formatDateTime(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-[13px] leading-snug text-foreground">
                          {snippet(message.content)}
                        </p>
                        {matched ? (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                            <span
                              className={cn(
                                "font-medium",
                                matched.type === "income"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground",
                              )}
                            >
                              {matched.type === "income" ? "+" : "−"}
                              {formatIdr(matched.amount)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{getCategoryLabel(matched.category)}</span>
                          </div>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ResponsiveDialogBody>
      </ResponsiveDialog>

      <JournalEntryDetailDialog
        open={detailOpen}
        entry={detailEntry}
        onOpenChange={(next) => {
          setDetailOpen(next);
          if (!next) {
            setDetailEntry(null);
          }
        }}
      />
    </>
  );
}
