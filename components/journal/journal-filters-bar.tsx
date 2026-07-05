"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOURNAL_CATEGORY_OPTIONS,
  JOURNAL_TYPE_OPTIONS,
} from "@/config/journal";
import { GLASS_SURFACE } from "@/config/glass";
import { SEPARATED_CONTROL } from "@/config/shape";
import { CONTROL_GAP } from "@/config/spacing";
import { buildJournalSearchParams } from "@/lib/validations/journal";
import { cn } from "@/lib/utils";
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

  function applyFilters(next?: Partial<JournalFilters>) {
    const merged: JournalFilters = {
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
    <div
      className={cn(
        SEPARATED_CONTROL,
        GLASS_SURFACE,
        "flex flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-end",
      )}
    >
      <div className="grid min-w-0 flex-1 gap-1.5">
        <label htmlFor="journal-search" className="text-xs font-medium">
          Cari
        </label>
        <Input
          id="journal-search"
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

      <div className="grid gap-1.5 sm:w-40">
        <span className="text-xs font-medium">Tipe</span>
        <Select
          value={type}
          onValueChange={(value) =>
            setType((value as JournalFilters["type"] | null) ?? "all")
          }
        >
          <SelectTrigger className={cn(SEPARATED_CONTROL, "h-9 w-full")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOURNAL_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5 sm:w-44">
        <span className="text-xs font-medium">Kategori</span>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? "all")}
        >
          <SelectTrigger className={cn(SEPARATED_CONTROL, "h-9 w-full")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOURNAL_CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={cn("flex shrink-0", CONTROL_GAP)}>
        <Button
          type="button"
          size="sm"
          className={SEPARATED_CONTROL}
          onClick={() => applyFilters()}
        >
          Terapkan
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={SEPARATED_CONTROL}
          onClick={resetFilters}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
