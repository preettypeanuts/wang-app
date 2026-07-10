"use client";

import {
  Children,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { SIDEBAR_DOCK_ICON_SIZE } from "@/config/sidebar";
import { getDockScale } from "@/lib/sidebar/dock-scale";
import { cn } from "@/lib/utils";

const ITEM_GAP_PX = 9;

interface SidebarDockContextValue {
  mouseY: number | null;
  isPointerInside: boolean;
  highlightedIndex: number | null;
}

const SidebarDockContext = createContext<SidebarDockContextValue>({
  mouseY: null,
  isPointerInside: false,
  highlightedIndex: null,
});

const DockItemIndexContext = createContext<number | null>(null);

function getItemCenterY(index: number): number {
  return (
    SIDEBAR_DOCK_ICON_SIZE / 2 + index * (SIDEBAR_DOCK_ICON_SIZE + ITEM_GAP_PX)
  );
}

function getHighlightedIndex(
  mouseY: number | null,
  itemCount: number,
): number | null {
  if (mouseY === null || itemCount <= 0) {
    return null;
  }

  let highlightedIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < itemCount; index += 1) {
    const distance = Math.abs(mouseY - getItemCenterY(index));
    if (distance < closestDistance) {
      closestDistance = distance;
      highlightedIndex = index;
    }
  }

  return highlightedIndex;
}

function isPointerInsideRect(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}

interface SidebarDockProps {
  children: ReactNode;
  className?: string;
}

export function SidebarDock({ children, className }: SidebarDockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseY, setMouseY] = useState<number | null>(null);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const itemCount = Children.count(children);

  const resetPointer = useCallback(() => {
    setMouseY(null);
    setIsPointerInside(false);
  }, []);

  const syncPointer = useCallback(
    (clientX: number, clientY: number) => {
      const node = containerRef.current;
      if (!node) {
        resetPointer();
        return;
      }

      const rect = node.getBoundingClientRect();
      if (!isPointerInsideRect(clientX, clientY, rect)) {
        resetPointer();
        return;
      }

      setIsPointerInside(true);
      setMouseY(clientY - rect.top);
    },
    [resetPointer],
  );

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      syncPointer(event.clientX, event.clientY);
    },
    [syncPointer],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      syncPointer(event.clientX, event.clientY);
    },
    [syncPointer],
  );

  const handlePointerLeave = useCallback(() => {
    resetPointer();
  }, [resetPointer]);

  useEffect(() => {
    if (!isPointerInside) {
      return;
    }

    function handleGlobalPointerMove(event: PointerEvent) {
      syncPointer(event.clientX, event.clientY);
    }

    function handleGlobalReset() {
      resetPointer();
    }

    window.addEventListener("pointermove", handleGlobalPointerMove);
    window.addEventListener("blur", handleGlobalReset);
    window.addEventListener("pointercancel", handleGlobalReset);
    document.addEventListener("visibilitychange", handleGlobalReset);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("blur", handleGlobalReset);
      window.removeEventListener("pointercancel", handleGlobalReset);
      document.removeEventListener("visibilitychange", handleGlobalReset);
    };
  }, [isPointerInside, resetPointer, syncPointer]);

  const highlightedIndex = useMemo(
    () => (isPointerInside ? getHighlightedIndex(mouseY, itemCount) : null),
    [isPointerInside, itemCount, mouseY],
  );

  const value = useMemo(
    () => ({
      mouseY: isPointerInside ? mouseY : null,
      isPointerInside,
      highlightedIndex,
    }),
    [highlightedIndex, isPointerInside, mouseY],
  );

  return (
    <SidebarDockContext.Provider value={value}>
      <div
        ref={containerRef}
        className={cn("flex flex-col items-center overflow-visible", className)}
        style={{ gap: ITEM_GAP_PX }}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
      >
        {children}
      </div>
    </SidebarDockContext.Provider>
  );
}

interface SidebarDockItemProps {
  index: number;
  children: ReactNode;
  className?: string;
}

export function SidebarDockItem({
  index,
  children,
  className,
}: SidebarDockItemProps) {
  const { mouseY, isPointerInside } = useContext(SidebarDockContext);

  const centerY = getItemCenterY(index);
  const scale = getDockScale(isPointerInside ? mouseY : null, centerY);

  return (
    <DockItemIndexContext.Provider value={index}>
      <div
        className={cn(
          "flex origin-left items-center justify-center will-change-transform",
          className,
        )}
        style={{
          height: SIDEBAR_DOCK_ICON_SIZE,
          width: SIDEBAR_DOCK_ICON_SIZE,
          transform: `scale(${scale})`,
          marginBlock: `${((scale - 1) * SIDEBAR_DOCK_ICON_SIZE) / 2}px`,
          transition: isPointerInside
            ? "transform 45ms linear, margin 45ms linear"
            : "transform 200ms cubic-bezier(0.22, 1, 0.36, 1), margin 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {children}
      </div>
    </DockItemIndexContext.Provider>
  );
}

export function useSidebarDockTooltipVisible(): boolean {
  const itemIndex = useContext(DockItemIndexContext);
  const { highlightedIndex, isPointerInside } = useContext(SidebarDockContext);

  if (itemIndex === null || !isPointerInside || highlightedIndex === null) {
    return false;
  }

  return itemIndex === highlightedIndex;
}
