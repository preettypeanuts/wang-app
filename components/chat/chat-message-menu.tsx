"use client";

import {
  ArrowUUpLeftIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
} from "@/lib/icons";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GLASS_BACKDROP,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_HIGHLIGHT,
} from "@/config/glass";
import { SEPARATED_CONTROL } from "@/config/shape";
import { cn } from "@/lib/utils";

const LONG_PRESS_MS = 480;

const MENU_TRIGGER_GLASS = cn(
  GLASS_BACKDROP,
  GLASS_BORDER,
  GLASS_FILL,
  GLASS_HIGHLIGHT,
);

interface ChatMessageMenuProps {
  children: React.ReactNode;
  disabled?: boolean;
  receiptMenu?: boolean;
  showEdit?: boolean;
  onEdit: () => void;
  onUndo: () => void;
  onOpenChange?: (open: boolean) => void;
}

export function ChatMessageMenu({
  children,
  disabled = false,
  receiptMenu = false,
  showEdit = true,
  onEdit,
  onUndo,
  onOpenChange,
}: ChatMessageMenuProps) {
  const [open, setOpen] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  function clearLongPressTimer() {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    pointerStartRef.current = null;
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function openMenu() {
    handleOpenChange(true);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || event.pointerType === "mouse") {
      return;
    }

    clearLongPressTimer();
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      pointerStartRef.current = null;
      openMenu();
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    clearLongPressTimer();
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointerStartRef.current || longPressTimerRef.current === null) {
      return;
    }

    const deltaX = Math.abs(event.clientX - pointerStartRef.current.x);
    const deltaY = Math.abs(event.clientY - pointerStartRef.current.y);

    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer();
    }
  }

  function handleContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!disabled) {
      openMenu();
    }
  }

  return (
    <div
      className="group/bubble-menu relative ml-auto w-fit max-w-[85%] select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onContextMenu={handleContextMenu}
    >
      {children}

      <div className="absolute top-1/2 right-full z-10 flex -translate-y-1/2 items-center pr-2">
        <DropdownMenu open={open} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger
            disabled={disabled}
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={receiptMenu ? "Menu struk" : "Menu pesan"}
                className={cn(
                  SEPARATED_CONTROL,
                  "size-7 text-foreground transition-[background-color,box-shadow,opacity]",
                  receiptMenu
                    ? cn(
                        "bg-transparent opacity-100 shadow-none ring-0",
                        "hover:shadow-sm data-popup-open:shadow-sm",
                        "hover:ring-1 data-popup-open:ring-1 hover:ring-border/60 data-popup-open:ring-border/60",
                        "hover:bg-[var(--glass-fill)] data-popup-open:bg-[var(--glass-fill)]",
                        "hover:glass-backdrop data-popup-open:glass-backdrop",
                        "active:bg-[var(--glass-fill)] active:glass-backdrop",
                      )
                    : cn(
                        MENU_TRIGGER_GLASS,
                        "opacity-0 shadow-sm ring-1 ring-border/60",
                        "group-hover/bubble-menu:opacity-100 data-popup-open:opacity-100",
                        "focus-visible:opacity-100",
                      ),
                )}
              />
            }
          >
            <DotsThreeIcon className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="left" align="center" sideOffset={6}>
            {showEdit ? (
              <DropdownMenuItem
                disabled={disabled}
                onClick={() => {
                  handleOpenChange(false);
                  onEdit();
                }}
              >
                <PencilSimpleIcon className="size-4" />
                {receiptMenu ? "Perbaiki struk" : "Edit"}
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              variant="destructive"
              disabled={disabled}
              onClick={() => {
                handleOpenChange(false);
                onUndo();
              }}
            >
              <ArrowUUpLeftIcon className="size-4" />
              Batalkan kirim
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
