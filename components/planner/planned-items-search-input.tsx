"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { PAYPLAN_LABEL_SEARCH_SCHEDULE } from "@/config/payplan-labels";
import { SEPARATED_CONTROL } from "@/config/shape";
import { buildPlannedItemsManageParams } from "@/lib/validations/planned-items-manage";
import { cn } from "@/lib/utils";
import type { PlannedItemsFilters, PlannerManageLayout } from "@/types/planner";

interface PlannedItemsSearchInputProps {
  filters: PlannedItemsFilters;
  layout: PlannerManageLayout;
  className?: string;
}

export function PlannedItemsSearchInput({
  filters,
  layout,
  className,
}: PlannedItemsSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(filters.q);

  useEffect(() => {
    setQ(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (q.trim() === filters.q.trim()) {
      return;
    }

    const handle = window.setTimeout(() => {
      const params = buildPlannedItemsManageParams(
        { ...filters, q },
        layout,
        new URLSearchParams(searchParams.toString()),
      );

      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => window.clearTimeout(handle);
  }, [q, filters, layout, pathname, router, searchParams]);

  return (
    <Input
      value={q}
      onChange={(event) => setQ(event.target.value)}
      placeholder={PAYPLAN_LABEL_SEARCH_SCHEDULE}
      aria-label={PAYPLAN_LABEL_SEARCH_SCHEDULE}
      className={cn(SEPARATED_CONTROL, "h-8 w-36 sm:w-44", className)}
    />
  );
}
