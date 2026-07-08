"use client";

import { useState } from "react";

import { JournalEntryDetailDialog } from "@/components/journal/journal-entry-detail-dialog";
import { JournalEntryRow } from "@/components/journal/journal-entry-row";
import { JournalListSectionHeader } from "@/components/journal/journal-list-section-header";
import {
  JOURNAL_DESKTOP_LIST_CONTAINER,
  JOURNAL_DESKTOP_LIST_FRAME,
  JOURNAL_DESKTOP_LIST_SCROLL,
} from "@/config/journal-desktop";
import {
  JOURNAL_EMPTY_STATE_MOBILE,
  JOURNAL_LIST_CONTAINER_MOBILE,
  JOURNAL_LIST_FRAME_MOBILE,
  JOURNAL_MOBILE_SOLID_DIVIDER,
  JOURNAL_MOBILE_SOLID_SURFACE,
} from "@/config/journal-mobile";
import {
  JOURNAL_EMPTY_STATE,
  JOURNAL_LIST_CONTAINER,
  JOURNAL_LIST_DIVIDER,
  JOURNAL_LIST_FRAME,
  JOURNAL_LIST_GROUP,
  JOURNAL_LIST_SCROLL,
  JOURNAL_LIST_SECTION,
} from "@/config/journal-table";
import { groupJournalEntriesByDay } from "@/lib/journal/group-journal-entries";
import { cn } from "@/lib/utils";
import type { JournalEntry } from "@/types/journal";

interface JournalTableProps {
  items: JournalEntry[];
  onAdd?: () => void;
}

export function JournalTable({ items, onAdd }: JournalTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function openEntryDetail(entry: JournalEntry) {
    setSelectedEntry(entry);
    setDetailOpen(true);
  }

  if (items.length === 0) {
    return (
      <div className={cn(JOURNAL_EMPTY_STATE, JOURNAL_EMPTY_STATE_MOBILE)}>
        <p className="text-sm font-medium">Belum ada transaksi</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Tambah transaksi manual atau catat lewat inbox.
        </p>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="mt-4 text-sm font-medium text-primary transition-opacity active:opacity-70"
          >
            Tambah transaksi
          </button>
        ) : null}
      </div>
    );
  }

  const groups = groupJournalEntriesByDay(items);

  return (
    <>
      <div
        className={cn(
          JOURNAL_LIST_CONTAINER,
          JOURNAL_LIST_CONTAINER_MOBILE,
          JOURNAL_DESKTOP_LIST_CONTAINER,
        )}
      >
        <div
          className={cn(
            JOURNAL_LIST_FRAME,
            JOURNAL_LIST_FRAME_MOBILE,
            JOURNAL_DESKTOP_LIST_FRAME,
          )}
        >
          <div className={cn(JOURNAL_LIST_SCROLL, JOURNAL_DESKTOP_LIST_SCROLL)}>
            {groups.map((group) => (
              <section key={group.dayKey} className={JOURNAL_LIST_SECTION}>
                <JournalListSectionHeader
                  label={group.label}
                  totalIncome={group.totalIncome}
                  totalExpense={group.totalExpense}
                />
                <div
                  className={cn(JOURNAL_LIST_GROUP, JOURNAL_MOBILE_SOLID_SURFACE)}
                >
                  {group.items.map((item, index) => (
                    <div key={item.id}>
                      <JournalEntryRow
                        item={item}
                        onClick={() => openEntryDetail(item)}
                      />
                      {index < group.items.length - 1 ? (
                        <div
                          className={cn(
                            JOURNAL_LIST_DIVIDER,
                            JOURNAL_MOBILE_SOLID_DIVIDER,
                          )}
                          aria-hidden
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <JournalEntryDetailDialog
        open={detailOpen}
        entry={selectedEntry}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
