import { PWA_STANDALONE_VIEWPORT_CONTENT } from "@/config/pwa";

/** Detect iOS / installed PWA standalone mode. */
export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

/** Standalone PWA must use 100vh — dvh/svh exclude the Dynamic Island band on cold start. */
export function applyStandaloneAppHeight(): void {
  if (!isStandalonePwa()) {
    return;
  }

  document.documentElement.dataset.standalone = "true";
  document.documentElement.style.setProperty("--app-height", "100vh");
}

/** Lock zoom in standalone PWA — native apps don't pinch-zoom. */
export function applyStandaloneZoomLock(): void {
  if (!isStandalonePwa()) {
    return;
  }

  const viewportMeta = document.querySelector('meta[name="viewport"]');

  if (!viewportMeta) {
    return;
  }

  viewportMeta.setAttribute("content", PWA_STANDALONE_VIEWPORT_CONTENT);
}

function applyStandaloneChrome(): void {
  if (!isStandalonePwa()) {
    return;
  }

  applyStandaloneAppHeight();
  applyStandaloneZoomLock();
}

/** Inline bootstrap — runs before first paint in root layout. */
export const PWA_STANDALONE_BOOTSTRAP_SCRIPT = `
(function () {
  var standalone =
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  if (!standalone) return;
  document.documentElement.dataset.standalone = "true";
  document.documentElement.style.setProperty("--app-height", "100vh");
  var viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.setAttribute(
      "content",
      ${JSON.stringify(PWA_STANDALONE_VIEWPORT_CONTENT)},
    );
  }
})();
`.trim();

export { applyStandaloneChrome };
