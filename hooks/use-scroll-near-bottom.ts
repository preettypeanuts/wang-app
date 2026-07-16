"use client";

import { type RefObject, useEffect, useState } from "react";

const DEFAULT_THRESHOLD_PX = 96;

function findScrollableParent(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null;

  while (node) {
    const { overflowY } = getComputedStyle(node);

    if (overflowY === "auto" || overflowY === "scroll") {
      return node;
    }

    node = node.parentElement;
  }

  return null;
}

function isNearScrollBottom(
  scrollElement: HTMLElement,
  thresholdPx: number,
): boolean {
  const remaining =
    scrollElement.scrollHeight -
    scrollElement.scrollTop -
    scrollElement.clientHeight;

  return remaining <= thresholdPx;
}

/** True when the scroll container is scrolled near its bottom (or cannot scroll). */
export function useScrollNearBottom(
  anchorRef: RefObject<HTMLElement | null>,
  thresholdPx = DEFAULT_THRESHOLD_PX,
): boolean {
  const [nearBottom, setNearBottom] = useState(false);

  useEffect(() => {
    const anchor = anchorRef.current;

    if (!anchor) {
      return;
    }

    const scrollElement = findScrollableParent(anchor);

    if (!scrollElement) {
      setNearBottom(true);
      return;
    }

    function update() {
      setNearBottom(isNearScrollBottom(scrollElement!, thresholdPx));
    }

    update();

    scrollElement.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(scrollElement);

    return () => {
      scrollElement.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [anchorRef, thresholdPx]);

  return nearBottom;
}
