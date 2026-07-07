"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JournalFilterFields } from "@/components/journal/journal-filter-fields";
import { JournalFiltersDialog } from "@/components/journal/journal-filters-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  JOURNAL_FILTER_SEARCH_INPUT,
  JOURNAL_FILTER_TRIGGER,
  JOURNAL_FILTER_TRIGGER_ACTIVE,
  JOURNAL_FILTERS_BAR_MOBILE,
  JOURNAL_FILTERS_MOBILE_ROW,
} from "@/config/journal-mobile";
import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_CONTROL } from "@/config/shape";
import { buildJournalSearchParams } from "@/lib/validations/journal";
import { FunnelIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { isDefaultJournalDateRange } from "@/lib/finance/journal-period";
import type { JournalFilters } from "@/types/journal";

interface JournalFiltersBarProps {
  filters: JournalFilters;
}

export function JournalFiltersBar({ filters }: JournalFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(filters.q);
  const [type, setType] = useState(filters.type);
  const [category, setCategory] = useState(filters.category);
  const [dialogOpen, setDialogOpen] = useState(false);

  const hasRichFilters =
    type !== "all" ||
    category !== "all" ||
    !isDefaultJournalDateRange({ from: filters.from, to: filters.to });

  useEffect(() => {
    setQ(filters.q);
    setType(filters.type);
    setCategory(filters.category);
  }, [filters]);

  function applyFilters(next?: Partial<JournalFilters>) {
    const merged: JournalFilters = {
      ...filters,
      q,
      type,
      category,
      page: 1,
      ...next,
    };

    const params = buildJournalSearchParams(merged, 1);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function resetFilters() {
    setQ("");
    setType("all");
    setCategory("all");
    router.push(pathname);
  }

  return (
    <>
      <div className={JOURNAL_FILTERS_MOBILE_ROW}>
        <Input
          id="journal-search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applyFilters();
            }
          }}
          placeholder="Cari transaksi..."
          aria-label="Cari transaksi"
          className={cn(SEPARATED_CONTROL, JOURNAL_FILTER_SEARCH_INPUT)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Buka filter"
          aria-expanded={dialogOpen}
          className={cn(
            SEPARATED_CONTROL,
            JOURNAL_FILTER_TRIGGER,
            hasRichFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
          )}
          onClick={() => setDialogOpen(true)}
        >
          <FunnelIcon aria-hidden className="size-4" />
        </Button>
      </div>

      <JournalFiltersDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={type}
        category={category}
        onTypeChange={setType}
        onCategoryChange={setCategory}
        onApply={() => applyFilters()}
        onReset={resetFilters}
      />

      <div
        className={cn(
          "hidden md:flex",
          SEPARATED_CONTROL,
          GLASS_SURFACE,
          JOURNAL_FILTERS_BAR_MOBILE,
          "flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-end",
        )}
      >
        <div className="grid min-w-0 flex-1 gap-1.5">
          <label htmlFor="journal-search-desktop" className="text-xs font-medium">
            Cari
          </label>
          <Input
            id="journal-search-desktop"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
            placeholder="Deskripsi, pesan inbox..."
            className={cn(SEPARATED_CONTROL, "h-9 w-full")}
          />
        </div>

        <JournalFilterFields
          type={type}
          category={category}
          onTypeChange={setType}
          onCategoryChange={setCategory}
          onApply={() => applyFilters()}
          onReset={resetFilters}
          layout="inline"
        />
      </div>
    </>
  );
}
