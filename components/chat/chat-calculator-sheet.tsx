"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SEPARATED_CONTROL, SEPARATED_SURFACE } from "@/config/shape";
import {
  applyCalculatorKey,
  createCalculatorState,
  getCalculatorAmount,
  getCalculatorExpression,
  getCalculatorScreen,
  type CalculatorKey,
  type CalculatorState,
} from "@/lib/finance/calculator";
import { formatIdr } from "@/lib/finance/format-currency";
import { cn } from "@/lib/utils";

interface ChatCalculatorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseAmount: (amount: number) => void;
}

const KEYPAD: Array<
  Array<{ key: CalculatorKey; label: string; variant?: "muted" | "accent" }>
> = [
  [
    { key: "clear", label: "C", variant: "muted" },
    { key: "backspace", label: "⌫", variant: "muted" },
    { key: "÷", label: "÷", variant: "accent" },
    { key: "×", label: "×", variant: "accent" },
  ],
  [
    { key: "7", label: "7" },
    { key: "8", label: "8" },
    { key: "9", label: "9" },
    { key: "-", label: "−", variant: "accent" },
  ],
  [
    { key: "4", label: "4" },
    { key: "5", label: "5" },
    { key: "6", label: "6" },
    { key: "+", label: "+", variant: "accent" },
  ],
  [
    { key: "1", label: "1" },
    { key: "2", label: "2" },
    { key: "3", label: "3" },
    { key: "=", label: "=", variant: "accent" },
  ],
  [
    { key: "0", label: "0" },
    { key: "00", label: "00" },
  ],
];

export function ChatCalculatorSheet({
  open,
  onOpenChange,
  onUseAmount,
}: ChatCalculatorSheetProps) {
  const [state, setState] = useState<CalculatorState>(createCalculatorState);

  useEffect(() => {
    if (open) {
      setState(createCalculatorState());
    }
  }, [open]);

  const amount = getCalculatorAmount(state);
  const expression = getCalculatorExpression(state);
  const canUse = amount > 0 && !state.error;

  function handleKey(key: CalculatorKey) {
    setState((current) => applyCalculatorKey(current, key));
  }

  function handleUse() {
    if (!canUse) {
      return;
    }

    onUseAmount(amount);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className={cn(
          SEPARATED_SURFACE,
          "mx-auto max-w-md gap-0 rounded-t-3xl p-0",
        )}
      >
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle>Kalkulator</SheetTitle>
          <SheetDescription>
            Hitung nominal, lalu masukkan ke chat.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-5 py-4">
          <div
            className={cn(SEPARATED_SURFACE, "bg-muted/50 px-4 py-3 text-right")}
          >
            <p className="truncate text-xs text-muted-foreground">
              {expression ?? "Nominal"}
            </p>
            <p
              className={cn(
                "truncate text-3xl font-semibold tabular-nums tracking-tight",
                state.error && "text-destructive",
              )}
            >
              {getCalculatorScreen(state)}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground tabular-nums">
              {state.error ? "—" : formatIdr(amount)}
            </p>
          </div>

          <div className="grid gap-2">
            {KEYPAD.map((row) => (
              <div
                key={row.map((item) => item.key).join("-")}
                className={cn(
                  "grid gap-2",
                  row.length === 2 ? "grid-cols-2" : "grid-cols-4",
                )}
              >
                {row.map((item) => (
                  <Button
                    key={item.key}
                    type="button"
                    variant={
                      item.variant === "accent"
                        ? "secondary"
                        : item.variant === "muted"
                          ? "outline"
                          : "ghost"
                    }
                    className={cn(
                      SEPARATED_CONTROL,
                      "h-12 text-base font-medium tabular-nums",
                    )}
                    onClick={() => handleKey(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="border-t border-border/60 px-5 py-4">
          <Button
            type="button"
            disabled={!canUse}
            className={cn(SEPARATED_CONTROL, "w-full")}
            onClick={handleUse}
          >
            Gunakan {canUse ? formatIdr(amount) : "nominal"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
