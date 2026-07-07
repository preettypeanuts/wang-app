"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

export interface MobileLargeTitleScrollState {
  showBlur: boolean;
  showCompactTitle: boolean;
}

export function useMobileLargeTitleScroll(
  resolveScrollElement: () => HTMLElement | null,
  titleRef: RefObject<HTMLElement | null>,
  options?: { enabled?: boolean },
): MobileLargeTitleScrollState {
  const enabled = options?.enabled ?? true;
  const [showBlur, setShowBlur] = useState(false);
  const [showCompactTitle, setShowCompactTitle] = useState(false);
  const resolveRef = useRef(resolveScrollElement);
  resolveRef.current = resolveScrollElement;

  useEffect(() => {
    if (!enabled) {
      setShowBlur(false);
      setShowCompactTitle(false);
      return;
    }

    let scrollElement: HTMLElement | null = null;
    let frameId = 0;
    let attached = false;
    let observer: IntersectionObserver | null = null;

    const onScroll = () => {
      if (scrollElement) {
        setShowBlur(scrollElement.scrollTop > 4);
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

      const titleElement = titleRef.current;
      if (titleElement) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setShowCompactTitle(!entry.isIntersecting);
          },
          { root: scrollElement, threshold: 0 },
        );
        observer.observe(titleElement);
      }

      return true;
    };

    frameId = requestAnimationFrame(() => {
      if (!attach()) {
        requestAnimationFrame(attach);
      }
    });

    return () => {
      cancelAnimationFrame(frameId);
      observer?.disconnect();
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", onScroll);
      }
    };
  }, [enabled, titleRef]);

  return { showBlur, showCompactTitle };
}
