"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

import {
  isMobileTopBlurActive,
  type MobileTopBlurScrollAnchor,
} from "@/lib/mobile/is-mobile-top-blur-active";

export function useMobileTopBlurScroll(
  resolveScrollElement: () => HTMLElement | null,
  options?: { enabled?: boolean; anchor?: MobileTopBlurScrollAnchor },
): boolean {
  const enabled = options?.enabled ?? true;
  const anchor = options?.anchor ?? "top";
  const [showBlur, setShowBlur] = useState(false);
  const resolveRef = useRef(resolveScrollElement);
  resolveRef.current = resolveScrollElement;

  useEffect(() => {
    if (!enabled) {
      setShowBlur(false);
      return;
    }

    let scrollElement: HTMLElement | null = null;
    let frameId = 0;
    let attached = false;

    const onScroll = () => {
      if (scrollElement) {
        setShowBlur(isMobileTopBlurActive(scrollElement, anchor));
      }
    };

    const attach = () => {
      scrollElement = resolveRef.current();
      if (!scrollElement || attached) {
        return Boolean(scrollElement);
      }

      attached = true;
      onScroll();
      scrollElement.addEventListener("scroll", onScroll, { passive: true });
      return true;
    };

    frameId = requestAnimationFrame(() => {
      if (!attach()) {
        requestAnimationFrame(attach);
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", onScroll);
      }
    };
  }, [anchor, enabled]);

  return showBlur;
}
