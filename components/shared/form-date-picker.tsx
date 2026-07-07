"use client";

import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FORM_FIELD_DATE } from "@/config/form-dialog";
import {
  dateInputFromCalendarDate,
  parseDayKey,
} from "@/lib/finance/day-range";
import { formatJournalDate } from "@/lib/finance/format-datetime";
import { CalendarBlankIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface FormDatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

function dateFromInputValue(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  return parseDayKey(value);
}

export function FormDatePicker({
  id,
  name,
  value,
  onChange,
  required,
  disabled,
  placeholder = "Pilih tanggal",
  className,
}: FormDatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = dateFromInputValue(value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          type="button"
          disabled={disabled}
          className={cn(FORM_FIELD_DATE, className)}
        >
          <span
            className={cn(
              "min-w-0 truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected ? formatJournalDate(selected) : placeholder}
          </span>
          <CalendarBlankIcon className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              onChange(dateInputFromCalendarDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value} required={required} />
    </>
  );
}
