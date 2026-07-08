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
      // Open detail after drawer close animation starts.
      window.setTimeout(() => {
        setDetailEntry(entry);
        setDetailOpen(true);
      }, 150);
      return;
    }

    // Message not loaded and no linked transaction — keep drawer open.
  }

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Cari di Inbox"
        wide
      >
        <ResponsiveDialogHeader>
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold tracking-tight">
              Cari di Inbox
            </p>
            <p className="text-xs text-muted-foreground">
              Cari pesan atau transaksi yang pernah dicatat.
            </p>
          </div>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex min-h-0 flex-col gap-3 overflow-hidden">
          <div className="relative shrink-0">
            <MagnifyingGlassIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground max-md:text-muted-foreground/70"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari kopi, netflix, parkir…"
              className={[
                // Keep desktop spacing (pl-9) unchanged; apply iOS styling only on mobile.
                "pl-9",
                // iOS-like search field: pill, no visible border, subtle frosted background.
                "max-md:rounded-full max-md:border-0 max-md:bg-white/70 max-md:shadow-sm max-md:backdrop-blur",
                "max-md:dark:bg-black/20 max-md:dark:shadow-none",
                // Keep placeholder softer.
                "max-md:placeholder:text-muted-foreground/80",
                // iOS doesn't show a heavy focus ring; keep focus purely visual.
                "max-md:focus-visible:border-transparent max-md:focus-visible:ring-0 max-md:focus-visible:ring-offset-0",
              ].join(" ")}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            {!debouncedQuery ? (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                Ketik kata kunci untuk mulai cari.
              </p>
            ) : loading ? (
              <ul className="flex flex-col gap-2">
                {["0", "1", "2", "3", "4"].map((key) => (
                  <li
                    key={key}
                    className="rounded-2xl border border-black/6 p-3 dark:border-white/8"
                  >
                    <Skeleton className="mb-2 h-3 w-24" />
                    <Skeleton className="mb-1.5 h-4 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </li>
                ))}
              </ul>
            ) : results.length === 0 ? (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
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
