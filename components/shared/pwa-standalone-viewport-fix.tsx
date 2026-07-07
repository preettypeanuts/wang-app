"use client";

import { useEffect } from "react";

import { applyStandaloneChrome } from "@/lib/pwa/standalone-viewport";

/** Keeps standalone PWA viewport + zoom lock after resume / rotation. */
export function PwaStandaloneViewportFix() {
  useEffect(() => {
    applyStandaloneChrome();

    const onViewportChange = () => {
      applyStandaloneChrome();
    };

    window.addEventListener("resize", onViewportChange);
    window.visualViewport?.addEventListener("resize", onViewportChange);

    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
    };
  }, []);

  return null;
}
