"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { JournalFilterFields } from "@/components/journal/journal-filter-fields";
import { JournalFiltersDrawer } from "@/components/journal/journal-filters-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GLASS_SURFACE } from "@/config/glass";
import {
  JOURNAL_FILTER_SEARCH_INPUT,
  JOURNAL_FILTER_TRIGGER,
  JOURNAL_FILTER_TRIGGER_ACTIVE,
  JOURNAL_FILTERS_BAR_MOBILE,
  JOURNAL_FILTERS_MOBILE_ROW,
} from "@/config/journal-mobile";
import { SEPARATED_CONTROL } from "@/config/shape";
import { FunnelIcon } from "@/lib/icons";
import { isJournalDateRangeActive } from "@/lib/journal/journal-date-range";
import { cn } from "@/lib/utils";
import { buildJournalSearchParams } from "@/lib/validations/journal";
import type { JournalFilters } from "@/types/journal";

interface JournalFiltersBarProps {
  filters: JournalFilters;
}

function hasActiveFilters(filters: JournalFilters): boolean {
  return (
    filters.type !== "all" ||
    filters.category !== "all" ||
    isJournalDateRangeActive(filters)
  );
}

export function JournalFiltersBar({ filters }: JournalFiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(filters.q);
  const [type, setType] = useState(filters.type);
  const [category, setCategory] = useState(filters.category);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasFilters = hasActiveFilters(filters);

  useEffect(() => {
    setQ(filters.q);
    setType(filters.type);
    setCategory(filters.category);
  }, [filters]);

  function applyFilters(next?: Partial<JournalFilters>) {
    const merged: JournalFilters = {
      q,
      type,
      category,
      page: 1,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
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

  function applyAllFilters(next: {
    dateFrom: string | null;
    dateTo: string | null;
    type: JournalFilters["type"];
    category: string;
  }) {
    setType(next.type);
    setCategory(next.category);
    applyFilters({
      dateFrom: next.dateFrom,
      dateTo: next.dateTo,
      type: next.type,
      category: next.category,
      page: 1,
    });
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
          aria-expanded={filtersOpen}
          className={cn(
            SEPARATED_CONTROL,
            JOURNAL_FILTER_TRIGGER,
            hasFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
          )}
          onClick={() => setFiltersOpen(true)}
        >
          <FunnelIcon aria-hidden className="size-4" />
        </Button>
      </div>

      <JournalFiltersDrawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        type={type}
        category={category}
        onApply={applyAllFilters}
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
          <label
            htmlFor="journal-search-desktop"
            className="text-xs font-medium"
          >
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

        <div className="grid gap-1.5">
          <span className="text-xs font-medium">Filter</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              SEPARATED_CONTROL,
              "h-9 gap-1.5",
              hasFilters && JOURNAL_FILTER_TRIGGER_ACTIVE,
            )}
            onClick={() => setFiltersOpen(true)}
          >
            <FunnelIcon aria-hidden className="size-4" />
            Tanggal & lainnya
          </Button>
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
