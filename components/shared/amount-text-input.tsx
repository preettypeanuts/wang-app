"use client";

import { useEffect, useState } from "react";

import { FORM_FIELD_INPUT } from "@/config/form-dialog";
import {
  extractAmountDigits,
  formatAmountInput,
} from "@/lib/finance/format-amount-input";
import { cn } from "@/lib/utils";

interface AmountTextInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "inputMode" | "onInput" | "onChange" | "name"
  > {
  className?: string;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
}

function toDisplayValue(
  value: string | number | readonly string[] | undefined,
) {
  return formatAmountInput(String(value ?? ""));
}

export function AmountTextInput({
  className,
  autoComplete = "off",
  spellCheck = false,
  value,
  defaultValue,
  name,
  onChange,
  onInput,
  required,
  ...props
}: AmountTextInputProps) {
  const isControlled = value !== undefined;
  const [displayValue, setDisplayValue] = useState(() =>
    toDisplayValue(defaultValue ?? value),
  );

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    setDisplayValue(toDisplayValue(value));
  }, [isControlled, value]);

  function notifyChange(
    event: React.ChangeEvent<HTMLInputElement>,
    rawDigits: string,
  ) {
    event.currentTarget.value = rawDigits;

    onChange?.(event);
    onInput?.(event as unknown as React.FormEvent<HTMLInputElement>);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const rawDigits = extractAmountDigits(event.target.value);
    const formatted = formatAmountInput(rawDigits);
    setDisplayValue(formatted);
    notifyChange(event, rawDigits);
  }

  const rawDigits = extractAmountDigits(displayValue);

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        value={displayValue}
        onChange={handleChange}
        required={required}
        className={cn(FORM_FIELD_INPUT, "tabular-nums", className)}
        {...props}
      />
      {name ? <input type="hidden" name={name} value={rawDigits} /> : null}
    </>
  );
}
