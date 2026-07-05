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
import { SEPARATED_CONTROL } from "@/config/shape";
import { cn } from "@/lib/utils";

const LONG_PRESS_MS = 480;

interface ChatMessageMenuProps {
  children: React.ReactNode;
  disabled?: boolean;
  onEdit: () => void;
  onUndo: () => void;
}

export function ChatMessageMenu({
  children,
  disabled = false,
  onEdit,
  onUndo,
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

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || event.pointerType === "mouse") {
      return;
    }

    clearLongPressTimer();
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTimerRef.current = null;
      pointerStartRef.current = null;
      setOpen(true);
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
      setOpen(true);
    }
  }

  return (
    <div
      className="group/bubble-menu relative inline-flex max-w-[85%] select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onContextMenu={handleContextMenu}
    >
      {children}

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Menu pesan"
              className={cn(
                SEPARATED_CONTROL,
                "absolute top-1/2 right-full z-10 mr-1.5 size-7 -translate-y-1/2",
                "bg-background/90 text-foreground shadow-sm ring-1 ring-border/60",
                "opacity-0 transition-opacity",
                "group-hover/bubble-menu:opacity-100 data-popup-open:opacity-100",
                "focus-visible:opacity-100",
              )}
            />
          }
        >
          <DotsThreeIcon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="left" align="center" sideOffset={6}>
          <DropdownMenuItem
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <PencilSimpleIcon className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={disabled}
            onClick={() => {
              setOpen(false);
              onUndo();
            }}
          >
            <ArrowUUpLeftIcon className="size-4" />
            Batalkan kirim
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
