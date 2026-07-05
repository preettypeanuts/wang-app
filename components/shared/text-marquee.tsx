"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TextMarqueeProps {
  text: string;
  className?: string;
  trackClassName?: string;
}

export function TextMarquee({ text, className, trackClassName }: TextMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const measure = measureRef.current;

    if (!container || !measure) {
      return;
    }

    function updateScrollState() {
      if (!container || !measure) {
        return;
      }

      setShouldScroll(measure.scrollWidth > container.clientWidth + 1);
    }

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(container);

    return () => observer.disconnect();
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={cn("relative min-w-0 overflow-hidden", className)}
    >
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute whitespace-nowrap opacity-0"
      >
        {text}
      </span>

      {shouldScroll ? (
        <div className={cn("flex w-max animate-marquee", trackClassName)}>
          <span className="whitespace-nowrap pr-8">{text}</span>
          <span className="whitespace-nowrap pr-8" aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <span className={cn("block truncate whitespace-nowrap", trackClassName)}>
          {text}
        </span>
      )}
    </div>
  );
}
