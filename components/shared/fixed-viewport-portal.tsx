"use client";

import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface FixedViewportPortalProps {
  children: React.ReactNode;
}

/**
 * Renders fixed UI on document.body — iOS PWA treats position:fixed inside
 * overflow:hidden ancestors as scrolling content.
 */
export function FixedViewportPortal({ children }: FixedViewportPortalProps) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(children, document.body);
}
